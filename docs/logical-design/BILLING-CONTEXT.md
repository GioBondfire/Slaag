# Billing Context

Logical design only: technology-neutral. Components are named by role; technology choices live in [../TECH-STACK.md](../TECH-STACK.md). Requirements: [../PRD.md](../PRD.md) (AC-A3–A5, A13–A17, A21–A41, AC-M4–M6). Decisions and rationale: [ARCHITECTURE.md](ARCHITECTURE.md) (Bounded Contexts, Paths that must not race, Decision Log).

This document is the **inventory** of the Billing context: from a parent starting checkout to a product being paid for and **access** being granted, through failures, suspension, cancellation, reactivation, refunds and fee changes. It covers the context's model, lifecycles, use cases, ports, inbound and outbound adapters, and the published interface. Points still open are listed in [Open points](#11-open-points).

---

## 0. Roles

| Role | May do |
|---|---|
| **Parent** (any User with the Parent role in the account) | Check out, see the Account & subscription page, start a card update, cancel, resume, reactivate |
| **System administrator** | Everything staff can do: record refunds, resolve billing flags, schedule standard fee changes, (after launch) manage offers |
| **Payment provider** (system actor) | Sends payment notifications; answers status queries |
| **Scheduler** (system actor) | Runs Billing's jobs (expire checkouts, reconcile, complete cancellations, amount changes, notices) |

A separate **billing support** staff permission is a later option; in year 1 only system administrators act on billing in the back office.

## 1. Scope

| In scope | Out of scope (other contexts or later) |
|---|---|
| Products and their standard fees per brand; billing accounts, payment mandates and payment standing; subscriptions per product and their lifecycle; charges and refunds; checkout, card update, cancellation, resumption, reactivation; payment failure episodes; amount changes at the provider (fee changes; offers after launch); **Access per product**; lifecycle and billing-notice events; the payment-provider translation layer and reconciliation | Sending emails and in-app notices (Notifications, from Billing's events); attribution and ad-platform events (Marketing, from Billing's events); partners and landing links (Marketing); account, members and consent (Account); sign-in and email verification (Identity & Access); data erasure in other contexts. **Later:** offers and discounts (D8), selling a second product and consolidated multi-line charges (D9), Slaag tax invoices (O-B6) |

---

## 2. Model at a glance

Three ideas carry the design (decisions 2026-11-26):

1. **A subscription is per product and lives for ever.** An account holds, per brand, at most one `Subscription` per `Product`. Year 1 has one product per brand (**Prep**, the test and exam preparation offering), but nothing assumes there is only one. A subscription is never replaced: reactivation reuses it.
2. **Who pays, and how, is the billing account.** One `BillingAccount` per account per brand owns the **payment mandate**, the billing day and the **payment standing**. Every subscription of that account and brand is collected through it, so a parent with two products gets **one charge, one transaction fee, one card**. Consolidation stops at the brand, because each brand has its own merchant account at the payment provider.
3. **A payment mandate is one standing authority at the provider.** A `PaymentMandate` is one recurring-billing agreement at the payment provider, created by one successful checkout: the card, the billing day and the recurring amount. A billing account has **at most one live mandate** and keeps its past ones. Card updates and amount changes act on the live mandate; reactivation creates a new one and ends the old one.

```
Account ──(per brand)── BillingAccount ── PaymentMandate (live) + past mandates
                              │            payment standing: Good | Overdue | Suspended
                              │
                              ├── Subscription (product = Prep)     status, fee, offer, history
                              ├── Subscription (product = …later)
                              │
                              └── Charge ── ChargeLine per subscription   (append-only)
```

**Access** to a product = that product's subscription is **Active** or **Cancelling**. The billing account's standing drives subscriptions into and out of **Suspended**, so Access is decided by the subscription alone and read live (no-race invariant 14).

What the parent sees as one status on the Account & subscription page (AC-A21) combines the two: **Overdue** = subscription Active while the standing is Overdue; otherwise the subscription's own status.

---

## 3. Layers and code shape

The four rings from [ARCHITECTURE.md › Layer Map](ARCHITECTURE.md#layer-map--dependency-rule), applied to Billing. Dependencies point inward only.

```
billing/
  domain/                 ← ring 1: no I/O, no framework
    products/             Product, StandardFee (history)
    accounts/             BillingAccount, PaymentMandate, PaymentStanding, FailureEpisode, AmountChange
    subscriptions/        Subscription, status machine, FeeTerms, PaidThrough
    charges/              Charge, ChargeLine, Refund, allocation rule
    pricing/              ProRata, BillingCalendar, CoolingOff
    offers/               Offer, discount rules                       (after launch, D8)
    contract/             Access, lifecycle and notice event schemas (published language)
  application/            ← ring 2
    use-cases/            one file per command (section 6)
    queries/              billingOverview, access, back-office queries
    ports/                PaymentGateway, ProviderNotificationTranslator, repositories, … (section 7)
  adapters/               ← ring 3
    inbound/              parent server functions, provider-notification route, job and event handlers, back office
    outbound/             payment provider (gateway + translator), repositories
```

The **published contract** (`Access`, lifecycle events, billing-notice events) is the one piece other contexts compile against; it is defined once and versioned.

---

## 4. Domain layer

### 4.1 Aggregates

| Aggregate | Identity | Holds | Invariants |
|---|---|---|---|
| **Product** | `ProductId` (stable key, e.g. `prep`) per brand | Name message key, **standard fee history** (amount, currency, effective from billing date), active flag | At most one standard fee in force on any date; a new fee takes effect only on a billing date at least the notice period (30 days) after it is scheduled |
| **BillingAccount** | `BillingAccountId`; unique on (account, brand) | Account, brand, billing day (setting, the **2nd**), **mandates** (one live at most, plus past ones), **payment standing**, the open **failure episode**, pending **amount change**, card-expiry warning, staff flags | At most one live mandate (a second activation is ended and refunded and staff are flagged); standing moves only through the rules in section 5; at most **one overdue notice and one suspension notice per failure episode**; each provider fact applied at most once (fact ID recorded in the same transaction) and a fact older than the last one applied for the same mandate and cycle never moves the state backwards |
| **PaymentMandate** *(entity inside BillingAccount)* | `PaymentMandateId` | Opaque provider reference (the provider's own token lives only in the adapter's mapping table), state (Pending → Live → Paused → Ended, or Pending → Abandoned), checkout reference, initial amount, **recurring amount**, first billing date, masked card and expiry if the provider gives them, created/ended reasons | Ended and Abandoned are final; only a Live or Paused mandate can be charged, updated or ended at the provider |
| **Subscription** | `SubscriptionId`; unique on (billing account, product) | Product, status (section 5), **fee terms** (standard fee or, after launch, offer discount with months remaining), **paid-through date**, "has started" flag, status history with triggering fact or actor and reason, cancellation reason, suspension and cancellation dates (retention, D4) | One per billing account and product, for ever; `SubscriptionStarted` published **once** (first activation), later activations publish `SubscriptionReactivated`; Access only in Active or Cancelling; at most one offer discount per account, brand and product (after launch) |
| **Charge** | `ChargeId`; unique on the provider's payment ID | Billing account, mandate, amount, currency, date, kind (first, recurring, reactivation), **lines** (subscription, period, amount), refunds | Append-only; lines add up to the amount (otherwise an **unallocated** line and a staff flag); refunds never exceed the charge |
| **Offer** *(after launch, D8)* | `OfferId` | Product, discount (percentage or rand), discount period, sign-up window, cap, optional partner ID, terms text | Pausing or ending only stops new sign-ups; the cap is never exceeded (no-race invariant 6) |

`BillingAccount` and `Subscription` are separate aggregates: a payment fact changes the billing account in one transaction, and the effect on each subscription (Suspended, reactivated) follows through an internal domain event in its own transaction. Access is still decided only by the subscription, and both steps happen within seconds through the outbox.

### 4.2 Value objects

| Value object | Meaning |
|---|---|
| `Money` | Amount in cents + currency (ZAR in year 1) |
| `BillingDay` | Day of the month recurring charges run (the 2nd); a setting per brand with that default |
| `BillingPeriod` | From one billing date up to the day before the next |
| `PaidThrough` | Last day of the period the subscription has been paid for |
| `PaymentStanding` | Good · Overdue · Suspended (no standing before the first live mandate) |
| `FailureEpisode` | Opened by the first failed collection on a Good standing; closed by a successful payment, by suspension ending in reactivation, or by cancellation; records whether its overdue and suspension notices went out |
| `FeeTerms` | Standard (follows the product's fee) or discounted (offer, discount, months remaining; after launch) |
| `AmountChange` | New recurring amount, effective billing date, reason (fee change, offer ended, subscription added or ended), state (Scheduled → Requested → Confirmed, or Unconfirmed → flagged) |
| `CancellationReason` | Not being used · not getting the benefit I expected · can't afford it · other (free text) · cooling-off refund · account deleted · provider cancelled |
| `ProviderFact` | Provider-neutral fact from the translator (section 4.4) |
| `MaskedCard` | Last four digits, brand, expiry month and year (optional: only if the provider gives them) |

### 4.3 Domain policies and rules

| Policy / rule | Decides |
|---|---|
| **ProRata** | First charge for a new mandate: the fee × days from today to the day before the next billing date ÷ days in that billing period, rounded to the cent. On the billing day itself, the first charge is a full month. If the result is below the provider's minimum amount, the first period is folded into the next one (one full charge on the next billing date, access from today) (O-B4) |
| **Reactivation charge** | Reactivation after suspension or cancellation is a new mandate with a pro-rata first charge, exactly like a sign-up. **Arrears are not collected**: the months a subscription was Suspended or Cancelled were not used |
| **Resume while Cancelling** | A new mandate whose first collection is the next billing date (nothing charged now: the month is already paid). If the provider can't create a mandate without an initial amount, the first period is charged pro-rata from the paid-through date, which is then nil, and the decision falls back to O-B3 |
| **First vs final failure** (AC-A14, A15) | Good + failed + provider still active → **Overdue**, overdue notice once. Overdue + failed + provider still active → logged only. Mandate paused by the provider → **Suspended**, suspension notice once. Overdue + succeeded → **Good**, no notice |
| **Cancellation effect** | If paid-through is in the future → **Cancelling** until then, then **Cancelled**; otherwise (e.g. while Overdue or Suspended) → **Cancelled** at once. Cancelling the last subscription ends the live mandate at the provider **immediately** (decision 2026-11-26); cancelling one of several lowers the recurring amount (D9) |
| **Cooling-off** (AC-A38) | Within **7 days** of a subscription's first charge, a system administrator can refund that charge in full; the subscription is **Cancelled** at once (reason: cooling-off refund) and Access ends. Later refunds are a staff decision, recorded the same way, with no automatic status change |
| **Recurring amount** | Sum of the active subscriptions' current fees (after any discount) on the effective billing date. Any change goes through one **AmountChange** process (section 5) |
| **Standard fee change** (AC-A39) | Applies to **every** subscription on standard fee terms, from the first billing date at least 30 days after the notice; each affected billing account gets a notice and an amount change. Discounted subscriptions keep their discount, which after launch is calculated on the new standard fee (O-B7) |
| **Allocation** | A charge is split into lines per subscription by each subscription's fee for that period; a difference becomes an unallocated line and a staff flag |
| `BillingSettings` | Decided defaults in one place: billing day 2; cooling-off 7 days; fee-change notice 30 days; checkout expiry 60 min; amount-change lead time 5 days before the billing date; reconciliation daily at 03:00 (Africa/Johannesburg); retention 12 months; provider minimum amount |

### 4.4 Provider facts (the translator's only output)

The **provider-notification translator** verifies each notification (signature, source, the provider's validation call, amount) and turns it into **provider-neutral facts**. Every lifecycle decision lives in the aggregates (consolidation S8).

| Fact | Meaning |
|---|---|
| `MandateActivated { mandateRef, checkoutRef, firstPayment {paymentId, amount, date}, card? }` | The first payment of a checkout succeeded; the mandate is live |
| `PaymentSucceeded { mandateRef, paymentId, amount, date, cycle }` | A recurring collection succeeded |
| `PaymentFailed { mandateRef, cycle, providerStillActive }` | A collection attempt failed |
| `MandatePaused { mandateRef }` | The provider stopped collecting after its final retry |
| `MandateEndedByProvider { mandateRef }` | Ended outside Slaag (payer, bank or provider portal) |
| `CardUpdated { mandateRef, card? }` | The card on the mandate was changed |
| `CardExpiring { mandateRef, expiry }` | The card is close to expiry (O-B1) |
| `AmountChanged { mandateRef, amount, from }` | The provider confirmed a new recurring amount |
| `RefundCompleted { paymentId, amount }` | A refund went through |

Each fact carries the provider event ID (or, from reconciliation, a key derived from mandate + fact type + cycle) for deduplication, and the provider's timestamp for ordering.

### 4.5 Domain events

**Published** (contract, other contexts may subscribe):

| Event | When | Consumers |
|---|---|---|
| `CheckoutStarted { billingAccount, account, brand, product, offerId? }` | A checkout is created | Marketing (`InitiateCheckout`, drop-off) |
| `SubscriptionStarted { subscription, account, brand, product, feeCharged, currency, offerId? }` | First activation of a subscription, **once** | Marketing (`Subscribe`, attribution), Notifications |
| `SubscriptionReactivated { … }` | Any later activation (from Suspended, Cancelled or Cancelling) | Marketing, Notifications |
| `SubscriptionSuspended { … }` | Subscription moves to Suspended | Marketing, Notifications |
| `SubscriptionCancelled { …, reason }` | Subscription moves to **Cancelling**, or straight to Cancelled | Marketing, Notifications |
| `AccessChanged { account, brand, product, granted }` | Access flips | Read models, caches that must drop (none in year 1; Access is read live) |
| `BillingNoticeDue { billingAccount, account, brand, kind, data }` | A notice a Parent should get; `kind` ∈ payment overdue · suspended (with reactivation deep link) · reactivated · cancellation confirmed · card expiring (with card-update link) · fee changing (amount, date) · refund issued · discount ending (D8) | Notifications only |

Billing notices are a separate event from the lifecycle facts: they say *what to tell the parent*, never *what state the subscription is in*. The state machine stays private.

**Internal** (inside Billing): `StandingChanged`, `MandateReplaced`, `AmountChangeDue`, `ChargeRecorded`.

---

## 5. Lifecycles

**Subscription**

| From | Trigger | To | Published |
|---|---|---|---|
| — | `StartCheckout` | Pending | `CheckoutStarted` |
| Pending | First mandate live | Active | `SubscriptionStarted` (once) |
| Active | Standing → Suspended | Suspended | `SubscriptionSuspended` |
| Active | Cancel, paid-through in the future | Cancelling | `SubscriptionCancelled` |
| Active | Cooling-off refund | Cancelled | `SubscriptionCancelled` |
| Cancelling | Paid-through date passes | Cancelled | — |
| Cancelling | Resume (new mandate, first collection on the next billing date) | Active | `SubscriptionReactivated` |
| Suspended | Cancel | Cancelled | `SubscriptionCancelled` |
| Suspended, Cancelled | Reactivation (new mandate live) | Active | `SubscriptionReactivated` |

Access: **Active** and **Cancelling**. No Access: Pending, Suspended, Cancelled. An abandoned checkout leaves the subscription Pending (or as it was) so the parent can retry.

**Payment standing (per billing account)**
```
 (none) ── first mandate live ──► Good ── payment failed, provider active ──► Overdue ── mandate paused ──► Suspended
                                   ▲                                           │                             │
                                   └────────── payment succeeded ◄─────────────┘                             │
                                   └────────── new mandate live (reactivation) ◄────────────────────────────┘
```
Further failures while Overdue are logged only. Suspended → Good only through a new mandate; the paused one is ended at the provider in the same process.

**Payment mandate**
```
 Pending ──(first payment)──► Live ──(provider pauses)──► Paused
    │                          │  ▲                          │
    └─(expired/superseded)─► Abandoned                       │
                               └──(ended by Slaag or provider)──► Ended ◄──┘
```

**Amount change** (fee change now; offers and second products later)
```
 Scheduled ──(lead time before billing date)──► Requested ──(AmountChanged fact or status query)──► Confirmed
                                                   └──(not confirmed the day before the billing date)──► Unconfirmed → staff flag
```

**Checkout**
```
 Started (mandate Pending, CheckoutStarted) ─┬─► provider notification: MandateActivated → Live → subscription Active
                                             └─► 60 min without activation → Abandoned (a late activation is still accepted if no other mandate is live)
```
The return from the provider's page never changes state; the page shows "confirming your payment" and polls `billingOverview` until the notification has been applied.

---

## 6. Application layer: use cases

One use case per operation. Each loads aggregates, calls domain behaviour, saves, and publishes events through the outbox; no business rules live here.

### 6.1 Checkout and activation
| Use case | Actor | Does |
|---|---|---|
| `StartCheckout(account, brand, product, offerCode?)` | Parent | Preconditions from other contexts' published interfaces: email verified (Identity), consent recorded (Account). Creates the billing account and the subscription (Pending) if they don't exist; supersedes any pending mandate; creates a Pending mandate with the pro-rata initial amount and the recurring amount; asks `PaymentGateway.startCheckout`; publishes `CheckoutStarted` |
| `StartReactivation(account, brand, product)` | Parent (account page or suspension deep link) | Same as `StartCheckout` for a Suspended or Cancelled subscription |
| `StartResume(account, brand, product)` | Parent (while Cancelling) | Pending mandate with first collection on the next billing date |
| `ExpireCheckouts` | Scheduler | Pending mandates older than 60 min → Abandoned |

### 6.2 Provider facts
| Use case | Actor | Does |
|---|---|---|
| `ReceiveProviderNotification(raw)` | Provider (inbound route) | Verify → store in the **inbox** with its idempotency key → acknowledge. Nothing else in the request |
| `ApplyProviderFacts(inboxEntry)` | Job | Translate → for each fact, apply to the billing account (deduplicated, ordered) → record charges → publish internal and published events |
| `ApplyStandingToSubscriptions(StandingChanged)` | Internal event | Suspend or reactivate each subscription of the billing account; publish lifecycle events and `BillingNoticeDue` |
| `ReconcileMandates` | Scheduler, daily | For every Live or Paused mandate, `PaymentGateway.fetchStatus` → the same facts through `ApplyProviderFacts`; mismatches it can't explain → staff flag |

### 6.3 Parent actions
| Use case | Actor | Does |
|---|---|---|
| `StartCardUpdate(account, brand)` | Parent | `PaymentGateway.startCardUpdate(live mandate)` → link to the provider's journey |
| `CancelSubscription(account, brand, product, reason)` | Parent (guided journey) | Cancellation effect (section 4.3); ends the mandate at the provider through `EndMandate` when it was the last subscription; `SubscriptionCancelled`; notice: cancellation confirmed |
| `CompleteCancellations` | Scheduler, daily | Cancelling subscriptions past their paid-through date → Cancelled |

### 6.4 Mandate operations at the provider (background, retried)
| Use case | Actor | Does |
|---|---|---|
| `EndMandate(mandate, reason)` | Job | `PaymentGateway.endMandate`; ≤6 attempts over ~24 h, then staff flag. Used for cancellation, replaced mandates (reactivation), a second live mandate and account deletion |
| `ScheduleStandardFeeChange(product, amount, effectiveFrom)` | System administrator | Checks the notice period; creates an amount change on every affected billing account; `BillingNoticeDue(fee changing)` |
| `RequestAmountChanges` | Scheduler, daily | Amount changes due within the lead time → `PaymentGateway.changeAmount` |
| `FlagUnconfirmedAmountChanges` | Scheduler, daily | Unconfirmed the day before the billing date → staff flag (AC-A33) |

### 6.5 Staff (back office)
| Use case | Actor | Does |
|---|---|---|
| `RecordRefund(charge, amount, reason)` | System administrator | Year 1: the refund is made in the provider's own portal and recorded here; within cooling-off it also cancels the subscription at once. Later: `PaymentGateway.refund` (O-B5) |
| `ResolveBillingFlag(flag, note)` | System administrator | Closes a staff flag (unconfirmed amount change, unallocated charge, second live mandate, failed `EndMandate`, reconciliation mismatch) |
| Offers: `CreateOffer`, `PauseOffer`, `EndOffer`, `RemoveDiscount` | System administrator | After launch (D8) |

### 6.6 Account erasure
| Use case | Actor | Does |
|---|---|---|
| `EraseBillingData(AccountErasureDue)` | Event handler | Ends every live or paused mandate at the provider first (no further charges); cancels subscriptions (reason: account deleted); deletes personal data (masked card, cancellation free text); **keeps charges and refunds**, linked to a pseudonymous ID, for the financial-records retention period (O-B8) |

### 6.7 Queries
| Query | Used by | Returns |
|---|---|---|
| `access(account, brand, product)` | Request-context resolver (every request), Account (adding a child needs an active subscription, AC-A5) | `Granted` · `NotActive { reason: pending, suspended, cancelled, none }` |
| `billingOverview(account, brand)` | Account & subscription page, dashboard notice | Per subscription: product, **status as shown** (Active / Overdue / Suspended / Cancelling / Cancelled), fee, discount and its end (D8); next billing date and amount; card (masked, expiry) if known; card-expiring notice; pending fee change; available actions |
| Back office: billing account timeline, flags, charges and refunds, fee schedule | System administrator | Status and standing history with triggering facts, mandates, charges, notices sent |

---

## 7. Ports (owned by the application layer)

| Port | Operations (in short) | Boundary |
|---|---|---|
| `PaymentGateway` | `startCheckout(brand, mandateSpec {initialAmount, recurringAmount, firstBillingDate, billingDay, checkoutRef, returnUrls}) → CheckoutSession`; `startCardUpdate(mandateRef) → url`; `changeAmount(mandateRef, amount, from)`; `endMandate(mandateRef)`; `fetchStatus(mandateRef) → ProviderFact[]`; later `refund(paymentId, amount)` | Full + anti-corruption |
| `ProviderNotificationTranslator` | `verify(raw, brand) → Verified \| Rejected`; `translate(raw) → ProviderFact[]` | Full + anti-corruption |
| Repositories | `Products`, `BillingAccounts` (with mandates), `Subscriptions`, `Charges`, `ProviderInbox`, `Offers` (D8); optimistic version checks; writes per billing account and per subscription serialized | Full |
| `JobQueue` | `enqueue(job, key)`, `schedule(job, when)`; billing jobs in their own lane | Shared job service |
| `EventPublisher` | `publish(event)` in the same transaction (outbox) | Shared |
| `Clock` | `now()`, platform time zone | Partial |

The merchant credentials per brand, the provider's tokens, field names and status codes live only in the adapters.

## 8. Inbound adapters

| Inbound adapter | Driven by | Calls |
|---|---|---|
| **Parent web server functions** (web only; the Android app never calls checkout, AC-A13) | Parents | 6.1 starts, 6.3 actions, `billingOverview` |
| **Provider-notification route** | Payment provider | `ReceiveProviderNotification` |
| **Job handlers** | Job queue | `ApplyProviderFacts`, `ExpireCheckouts`, `ReconcileMandates`, `CompleteCancellations`, `EndMandate`, `RequestAmountChanges`, `FlagUnconfirmedAmountChanges` |
| **Domain event handlers** | Outbox events | `ApplyStandingToSubscriptions`, `EraseBillingData` |
| **Back-office server functions** | System administrators | 6.5, fee schedule, timelines |
| **Published interface** (in-process) | Request-context resolver, Account, read models | `access`, `billingOverview` |

## 9. Outbound adapters

| Port | Adapter role | Current choice ([TECH-STACK.md](../TECH-STACK.md)) |
|---|---|---|
| `PaymentGateway`, `ProviderNotificationTranslator` | Payment provider: onsite checkout, recurring billing, subscription API, ITN notifications | PayFast, one merchant account per brand |
| Repositories, inbox | System of record | PostgreSQL (`webhook_events` inbox) |
| `JobQueue` | Queue and scheduler | pg-boss, billing lane |
| `EventPublisher` | Transactional outbox | PostgreSQL outbox |

### 9.1 The published interface

```
access(account, brand, product) → Granted | NotActive { reason }
billingOverview(account, brand) → BillingOverview
```
plus the events in section 4.5. Never mandate references, provider statuses, payment standing or failure episodes.

---

## 10. End-to-end flows

**Sign-up (pilot)**
1. Parent (verified email, consent recorded) → `StartCheckout(prep)` → subscription Pending, mandate Pending (initial = pro-rata, recurring = R149 from the 2nd) → `CheckoutStarted` → Marketing sends `InitiateCheckout`.
2. Parent pays on the provider's onsite form; the return page polls.
3. Notification → inbox → `MandateActivated` → mandate Live, standing Good, charge recorded → subscription Active, paid-through = day before the next 2nd → `SubscriptionStarted` (once) → Marketing `Subscribe`; Access granted.

**Failure to suspension to reactivation**
1. 2nd of the month: `PaymentFailed {stillActive}` → Overdue, `BillingNoticeDue(payment overdue)`; Access continues.
2. Later attempts: logged only. A success instead → Good, no notice.
3. `MandatePaused` → Suspended → each subscription Suspended → `SubscriptionSuspended`, `BillingNoticeDue(suspended, deep link)`; children blocked on the next request.
4. Parent → `StartReactivation` → new mandate (pro-rata, no arrears) → `MandateActivated` → old mandate ended at the provider (`EndMandate`) → Good → subscription Active → `SubscriptionReactivated`, notice reactivated.

**Cancel, then change of mind**
1. Parent cancels on the 10th with a reason → mandate ended at the provider now → Cancelling until the 1st → `SubscriptionCancelled`, notice cancellation confirmed.
2. On the 20th the parent resumes → new mandate, first collection on the 2nd → subscription Active → `SubscriptionReactivated`.

**Cooling-off refund**
1. Parent asks within 7 days of the first charge; administrator refunds in the provider portal and `RecordRefund` → subscription Cancelled at once (reason: cooling-off refund), mandate ended, Access ends → notice refund issued.

**Standard fee change**
1. Administrator schedules R169 from 2 April on 20 February → every billing account on standard terms gets an amount change and a notice.
2. Five days before 2 April: `changeAmount` → `AmountChanged` confirms; anything unconfirmed on 1 April → staff flag.

**Second product (later, D9)**
1. Parent adds product B on the 15th → subscription B Pending → once-off pro-rata charge for B on the live mandate (or a short checkout if the provider can't charge ad hoc, O-B2) → B Active → amount change: recurring = A + B from the next 2nd → one charge with two lines from then on.

---

## 11. Open points

### Resolved (2026-11-26)
| # | Point | Decision |
|---|---|---|
| B1 | Reactivation: new subscription or the same one? | **The same subscription for life**; each checkout creates a new **payment mandate** under the billing account; the old paused mandate is ended at the provider |
| B2 | Name for one recurring-billing agreement at the provider | **Payment mandate** (`PaymentMandate`); replaces "provider subscription" so "subscription" has one meaning |
| B3 | Room for more products, billed together | **Split from day 1:** `Subscription` per product, `BillingAccount` per account and brand with the mandate and payment standing, `Charge` with one line per subscription; one product at launch; second products and multi-line charges deferred (D9) |
| B4 | Undo a cancellation while Cancelling | The mandate is **ended at the provider at once**; resuming is a new checkout with the first collection on the next billing date |
| B5 | Refunds and invoices | **7-day cooling-off refund** of the first charge by a system administrator (subscription cancelled at once); other refunds at staff discretion; **no Slaag invoices** in year 1, the provider's receipt is the parent's record |
| B6 | Standard fee changes | **Everyone moves** to the new fee from a billing date at least **30 days** after a notice; one amount-change process shared with offer reversion |
| B7 | Arrears on reactivation | Not collected; reactivation is a new pro-rata start |
| B8 | Who may act on billing | Any Parent member of the account; staff actions by system administrators in year 1 |

### Still open
| # | Open point | Suggested direction |
|---|---|---|
| O-B1 | **Provider behaviour to confirm in the sandbox** (pilot critical path): a notification per failed attempt; a paused status after the final retry; a card-expiry signal; masked card details; a status query for reconciliation; ending a mandate by API; changing the recurring amount by API | Spike before building the state machine; for each "no", the fallback: no card-expiry signal → AC-A24/A25 become "update card" only, without a warning; no masked card → hide the card line; no status query → reconciliation by the provider's transaction report |
| O-B2 | Ad-hoc charge on a live mandate (second product mid-month) | Check the provider's ad-hoc/tokenised charge; otherwise a short checkout for the pro-rata part. Only needed for D9 |
| O-B3 | Mandate with no initial amount (resume while Cancelling) | Check; otherwise charge a nominal pro-rata from the paid-through date |
| O-B4 | Provider minimum amount and very short first periods | Confirm the minimum; rule above folds a too-small first period into the next charge |
| O-B5 | Refund by API | Year 1 records refunds made in the provider portal; add `PaymentGateway.refund` when refunds exceed a few a month |
| O-B6 | VAT registration and tax invoices | Revisit when turnover approaches the VAT registration threshold; then add an `Invoice` per charge per brand with its own numbering |
| O-B7 | Discount after a standard fee change | Percentage discounts follow the new fee; fixed-rand discounts keep the rand amount off the new fee. Confirm with D8 |
| O-B8 | Keeping financial records after account deletion | Keep charges and refunds (amounts, dates, pseudonymous ID) for 5 years; confirm with legal advice alongside POPIA |
