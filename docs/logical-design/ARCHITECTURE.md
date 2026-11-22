# Architecture

Logical design only: technology-neutral. Components are named by role; technology choices live in [../TECH-STACK.md](../TECH-STACK.md). Requirements: [../PRD.md](../PRD.md).

## System Context

**What the system does.** A multi-brand, multi-language platform that helps parents of Grade 4–7 children prepare them for school tests and exams. Parents subscribe per family on the web and enrol up to 3 children with their textbooks. A parent or child adds a test with a date and scope. An adaptive engine drills the child towards mastery of teacher-reviewed, importance-weighted facts from the child's own textbook. Content is produced in a back office where AI drafts and teachers review. Year 1 runs one brand with Afrikaans only. No code may assume a particular brand or language.

**Actors.** Parent (web, Android), child (linked device or the parent's app; no credentials), content curator and teacher reviewer (back office, web only), staff (partners, campaigns, support).

**Delivery channels.** Responsive web app, Android app (through a versioned mobile API), back office.

**Outbound integrations (by role).**
| Role | Used by | Purpose |
|---|---|---|
| Payment provider | Billing & Campaigns | Checkout, recurring billing, card update, amount change, status webhooks; one merchant account per brand |
| Social identity provider | Identity & Access | Parent sign-in (alongside email + password) |
| Transactional email provider | Notifications | Parent emails, digests, billing notices |
| Push notification provider | Notifications | Parent and child push on Android |
| AI document-reading and content-generation provider | Content | Page reading, fact extraction, paraphrases, index/curriculum tagging, question + model answer + rubric generation |
| LLM grading provider | Prep Engine | Second step of the grader for borderline written answers, cost-capped |
| Object storage | Content | Page images, diagram crops |

**Load reality.** Medium: 1,000–10,000 families in year 1 (≈2,000–20,000 children). Peaks are on weekday afternoons and before exams.

### Back-of-envelope sizing (Phase 3)
Sized for the top of the range (10,000 families) in exam season. Assumptions, to check in the pilot: ~1.7 children/family; ~50% of children active on an exam-season school day (~10,000), ~3,000 parents active; ~1.5 sessions per active child per day (~15,000 sessions/day); ~30 answers + ~10 other requests per session; ~30% of answers written, ~20% of those borderline → ~6% of all answers go to the LLM grader.

| Measure | Estimate | Derivation |
|---|---|---|
| Requests/day | ~660,000 | 15,000 × 40 (children) + 3,000 × 20 (parents) |
| Average requests/s | ~8 | ÷ 86,400 |
| Afternoon peak | ~50/s | ~70% of traffic falls 15:00–20:00 |
| **Burst when sessions are due** | **~200/s** | Suggested times cluster (AC-P9: last session's time, else a default such as 16:00); 30% of sessions starting in the same 15 min: 4,500 × 40 ÷ 900 s |
| Push fan-out in the burst | ~9,000 in 1–2 min | Child + parent push at the scheduled time (AC-O2) |
| LLM grading calls | ~27,000/day; ~9/s in the burst, ~25 in flight | 6% of answers; 1–3 s each |
| Similarity checks (grader step 1) | ~45/s in the burst | Every written answer |
| Answers stored | ~66M/year, ~40 GB with indexes | ~180k/day averaged over the year × ~300 B |
| Mastery estimates | ~60M/year, ~6 GB | ~400k assessments/year × ~150 facts in scope |
| Content | ~9,000 pages, ~180k facts, ~450k questions; ~1 GB text with versions; ~25 GB page images | ~35 textbooks × ~250 pages |
| Egress | ≤75 GB/day worst case | 15,000 sessions × 5 MB cap (AC-G8); mostly images |

**Conclusion:** a single, well-indexed system of record on one vertically sized server carries year 1 (< ~100 GB/year, at most a few hundred writes/s). Raw load is not the risk. The risk is the burst when sessions are due, and the LLM grader inside that burst.

**First bottlenecks, in order:** (1) the session-due burst: push fan-out and many session starts at once; (2) synchronous LLM grading in the burst: provider latency, rate limits, cost; (3) the per-answer write path (save the response + update mastery), the hottest write; (4) catalogue reads for session bundles. These are immutable per version, so they cache well.

**Availability and data-safety targets (year 1):** 99.5% monthly (≤ ~3.6 h downtime), with planned maintenance outside 14:00–21:00 SAST; **RPO 15 min**; **RTO 4 h**. A single primary server with continuous backups and a tested restore meets this; no standby needed in year 1.

## Layer Map & Dependency Rule

Source-code dependencies point inward only. Nothing in an inner ring names anything in an outer ring.

| Ring (inner → outer) | Contains | May depend on |
|---|---|---|
| 1. Domain | Entities and pure policies per module (e.g. `Assessment`, `PrepPlan` with its `PrepStrategy` plug-ins, `Importance`, `Mastery`, `Marking`) | Nothing outside the domain |
| 2. Application | One use case per operation (e.g. `AddAssessment`, `RecalculateRunway`); request/response models; **ports** owned by the use case (repositories, gateways, `Clock`, `Notifier`, event publisher) | Domain |
| 3. Adapters | **Inbound adapters** (the outside calling in): web, mobile-API-per-version and back-office endpoints with their presenters; job, event and scheduled-trigger handlers. **Outbound adapters** (use cases calling out): repository implementations; provider gateways and translators; `MediaStore`, `Notifier` and publisher implementations | Application, Domain |
| 4. Drivers | Frameworks, the data store, provider SDKs, the job runner; the **composition root** that wires every concrete implementation | Everything |

**Data crossing boundaries.** Plain request/response models only. The data store's records, provider payloads and channel request objects never cross inward. Use cases return **message keys**, never text; presenters localise them to the family's language and brand.

**Request context.** Brand, language and actor (parent, or child on a linked device) are resolved at the edge and passed inward as plain IDs/keys.

**Between modules.** A module calls another module's published use cases, or reacts to its domain events. It never reads or writes another module's data.

**Modules = bounded contexts** (Phase 2; see below): Prep · Content · Family · Billing & Campaigns · Identity & Access · Rewards · Notifications · Platform Config. The provisional Planner and Prep Engine modules from Phase 1 were merged into **Prep**.

### Boundary map
| Part likely to change | Boundary | Why |
|---|---|---|
| Inbound adapters (web, mobile API v1/v2, back office) | Full: one thin inbound adapter per entry point + presenters | Three channels already; the mobile API is versioned |
| Transactional data store | Full: repository port per module | Core testable without the store; data outlives code |
| Payment provider | Full + anti-corruption translator (`BillingGateway`, webhook translator) | Unusual states and webhooks; one merchant per brand; highest vendor risk |
| AI content provider | Full: `ContentAI` port | Models and providers change fast; expensive work |
| LLM grader | Full: `AnswerEvaluator` port with two steps | Cost cap and "close" fallback; the core engine depends on it |
| Email + push | Partial: one `Notifier` port, a strategy per channel | Simple; a new channel must not touch business rules |
| Sign-in / identity provider | Partial: the identity module exposes only `ParentId` / `ChildId` | The provider's sign-in flow stays at the edge |
| Object storage | Partial: `MediaStore` port | Used only by Content |
| Clock, scheduled triggers | Partial: `Clock` port + trigger adapter | All date logic testable |
| Brand and language | Resolved at the edge into the request context; the core sees IDs/keys only | PRD AC-B1: no code may assume a brand |
| Prep strategies | Plug-in boundary inside the core | PRD AC-E20: add strategies without changing planner, grader or runner |
| Plain reference data (school list, credit table, partner records) | Collapsed: inbound adapter → repository | No business rules to protect |

### First feature layered: "Add a test → suggest the next session"
PRD AC-P1–P4, P9–P10, C11, E13–E14, O1.

1. **Inbound adapter:** the web or mobile-API endpoint resolves the request context and builds `AddAssessmentRequest { child, actor, type, subject, date, scope (index nodes | page ranges) }`.
2. **Use case `AddAssessment` (Prep, planning module):**
   - Access (whether this actor may act for this child) is already settled by the **request-context resolver** at the edge (Phase 5, S9); the use case asks Family's published interface whether the subject is active with a confirmed textbook.
   - **`ContentCatalogue`** (Content's published interface): scope → approved fact references with tier, weight, difficulty.
   - `Assessment` entity enforces its invariants (date today or later; scope resolves to at least one fact).
   - **`PrepPlan.plan(assessment, mastery, today)`** (Phase 5, S1): works out runway, picks the `PrepStrategy` plug-in using the child's `LearnerTuning` (internal to Prep), and suggests the next session.
   - `AssessmentRepository` saves; `Clock` supplies "today"; the domain event `AssessmentAdded` is published.
   - Returns `AssessmentPlanned { assessmentId, strategyKey, suggestedSlot, messageKeys }`.
3. **Reactions:** Notifications handles `AssessmentAdded` (actor = child) → parent alert within 5 minutes. A daily trigger invokes `RecalculateRunway`.
4. **Test seam:** steps 1–2 run in memory with fake ports and a fixed clock.

| Violation | Location | Fix | Status |
|---|---|---|---|
| _(none: greenfield)_ | | | |

## Bounded Contexts & Context Map

### Contexts and subdomain types
| Context | Owns | Subdomain |
|---|---|---|
| **Prep** | Assessments, scope, runway and strategy, portions, next-session suggestion, prep sessions, grading policy, mastery and readiness, per-child tuning | **Core** |
| **Content** | Textbooks, index tree + curriculum cross-reference, uploads/pages, facts (paraphrases, importance, links), questions (model answer, rubric), generation runs, review gates, versions, problem reports | **Core fact model** (importance tiers, fact links, model answers, rubrics); ingestion and review workflow are supporting |
| **Family** | Household, children (name, grade, school, subjects with textbook), brand memberships (language, consent, entry point), school reference data | Supporting |
| **Billing & Campaigns** | Subscription lifecycle per brand membership, fee and discount, partners, campaigns, membership numbers, fee reversion | Supporting (payment processing itself is generic, behind a translation layer) |
| **Identity & Access** | Parent sign-in identity shared across brands, account linking, staff and reviewer roles, device-link codes, linked devices | Generic; device linking is supporting |
| **Rewards** | Credit ledger, levels, badges, cosmetics, streaks, parent reward goals | Supporting |
| **Notifications** | Alert preferences (mutes per type and channel), push and email delivery, weekly digest | Generic |
| **Platform Config** | Brands, allowed and default languages, language resolution, message catalogues | Supporting |

Parent dashboard, readiness views, partner reports and content coverage are **read models** built from these contexts, not contexts of their own (Phase 4).

### Context map
```
                  Platform Config  (upstream to all: brand + language lookup)
                         │
  Identity & Access ──► Family ──► Prep ◄── Content (published catalogue)
         ▲                ▲          │            │
         │      Billing & Campaigns  │            ├─ ACL ─► AI content provider
         │       (publishes Access)  │            └─ problem reports ◄── Prep
         │                │          ├─ ACL ─► LLM grading provider
         │                └─ ACL ─► payment provider
         │                           │ events
         └────────────────────── Notifications, Rewards (react to Prep/Billing/Family events)
```

| Upstream → Downstream | Pattern | What crosses |
|---|---|---|
| Content → Prep | Open Host Service + Published Language (**content catalogue**) | Approved, live versions only: fact references (tier, weight, difficulty, links), live questions with model answer and rubric, scope → fact-set resolution. Never pages, drafts or review state (PRD AC-C24) |
| Prep → Content | Customer–Supplier | Problem reports on a question (AC-C21) |
| Billing & Campaigns → all | Published Language | **Access** per brand membership (`AccessGranted` / `AccessSuspended`). Subscription states never leave Billing |
| Payment provider → Billing | Anti-Corruption Layer | Provider subscriptions and webhooks translated into Billing events; provider terms never pass the translator |
| AI content provider → Content | Anti-Corruption Layer | Page reading, extraction, generation results as Content drafts |
| LLM grading provider → Prep | Anti-Corruption Layer | Borderline-answer evaluation as a Verdict proposal against the rubric |
| Identity & Access → Family, Prep, Rewards, Notifications | Customer–Supplier | `ParentId`, `ChildId`, `DeviceId`; an authenticated actor |
| Family → Prep, Rewards, Notifications | Customer–Supplier | Child grade, active subjects with textbook, family language per brand |
| Prep → Notifications, Rewards | Domain events (Published Language) | `AssessmentAdded`, `AssessmentChanged` (with actor), `SessionScheduled`, `SessionMissed`, `SessionCompleted`, `PortionCompleted`, `StrategySwitched`, `ResultRecorded` |
| Family → all | Domain event | `FamilyErasureDue`: every context erases its own data (AC-A16–A17) |
| Platform Config → all | Open Host Service; downstream conformist | Brand record, allowed/default languages, message lookup |

### Aggregates and invariants
Other aggregates are referenced by ID only; consistency between aggregates is eventual.

| Context | Aggregate (root) | Invariants |
|---|---|---|
| Prep | **Assessment** | Holds the scope as selected plus the resolved fact set; exactly one active strategy, with history (parent's choice beats child's); portions are ordered and cover the scope; at most **one** suggested next session; after the date it stops suggesting and accepts one **Result** |
| Prep | **PrepSession** | Scheduled → Started → Completed, or **Missed** 2 h after the scheduled time; holds its responses; LLM grading spend within the per-session cost cap |
| Prep | **AssessmentMastery** | One estimate per fact per assessment, never carried over; changes only through graded responses; a **Close** Verdict is neutral (no change; the fact is asked again later); duplicate facts share an estimate; an elaborating fact is drilled only after its keyword is mastered. Kept apart from Assessment because it is written on every answer |
| Prep | **LearnerTuning** | One per child: strategy cut-offs and portion sizes |
| Content | **Textbook** | Index tree confirmed once |
| Content | **Page** | Re-upload replaces the page and sends its facts back to Gate 1 |
| Content | **Fact** | 1–2 paraphrases; exactly one tier with a weight; typed links (elaborates / duplicates / part of / related) by fact ID; only approved facts feed generation |
| Content | **Question** | Can't go live without an approved model answer and rubric, versioned together; ≥3 open problem reports hide it |
| Content | **ReviewBatch** | Gate 2 sampling: ~10% sample with ≥95% pass, otherwise review the whole batch |
| Billing | **Subscription** | One per brand membership; lifecycle state machine; each provider event applied exactly once and late events never move it to a wrong state; at most one overdue email and one suspension email per failure episode; at most one discount, a campaign discount once per family per brand; fee history |
| Billing | **Campaign** | Sign-up window and cap; pausing or ending stops new sign-ups only |
| Billing | **Partner** | Belongs to one brand |
| Family | **Family** | At most 3 children |
| Family | **Child** | A subject is active only with a confirmed textbook |
| Family | **BrandMembership** | Language within the brand's allowed languages; consent timestamp recorded |
| Identity | **ParentIdentity** | One account per verified email, whatever the sign-in method |
| Identity | **DeviceLinkCode** | Single use, one child, valid 15 minutes |
| Identity | **LinkedDevice** | Holds a long-lived device credential used only to obtain **30-minute access tokens**; once revoked, it can't obtain a new access token, so it stops working within 30 minutes |
| Rewards | **CreditLedger** | One per child; credits only from credit-table activities |
| Rewards | **Streak**, **RewardGoal** | One streak per child; goal progress derived from the ledger |

## Domain Glossary (Ubiquitous Language)
| Term | Meaning | Code name |
|---|---|---|
| Assessment | A test or exam a child prepares for: type, subject, date, scope | `Assessment` |
| Scope | What the user selected for an assessment: index nodes or page ranges | `Scope` |
| Fact set | The approved facts a scope resolves to | `FactSet` |
| Fact | A small, self-contained, verbatim statement from a textbook page; the unit of mastery | `Fact` (Content), `FactRef` (Prep) |
| Paraphrase | One of 1–2 restatements of a fact that keep its key terms | `Paraphrase` |
| Importance tier / weight | Core, Supporting or Peripheral, plus a weight within the tier | `ImportanceTier`, `weight` |
| Fact link | A typed relation: elaborates, duplicates, part of, related | `FactLink` |
| Question | An item generated from fact(s), with a model answer and rubric | `Question` (Content), `LiveQuestion` (Prep) |
| Model answer | The answer written only from the source fact(s), shown after answering | `ModelAnswer` |
| Rubric | Criteria defining Correct / Partial / Incorrect for a question | `Rubric` |
| Verdict | The grader's outcome for one answer: Correct, Partial, Incorrect or Close (undecided) | `Verdict` |
| Mark (verb) | What the grader does to an answer | `mark()` |
| Result | After the test date: the child's rating (tough / ok / good) and optional score | `Result` |
| Grade | The child's school grade (4–7) only | `Grade` |
| Mastery | Estimate that a child knows one fact, per assessment | `Mastery` |
| Readiness | Importance-weighted mastery of an assessment's Core facts | `Readiness` |
| Runway | Prep days remaining ÷ importance- and difficulty-weighted scope size; never shown to users | `Runway` |
| Strategy | How to prepare: Incremental, Standard or Last-minute | `PrepStrategy` |
| Portion | An ordered slice of the scope under Incremental, with a study-by date | `Portion` |
| Session | A prep session only (diagnostic, system, ad-hoc, last-minute, portion, cumulative review) | `PrepSession` |
| Missed session | A scheduled session not started within 2 hours | `SessionMissed` |
| Subscription | A family's paid plan for one brand, with its lifecycle (Billing only) | `Subscription` |
| Provider subscription | The payment provider's own record; only inside the translation layer | `ProviderSubscription` |
| Access | Whether a brand membership's children may use the product; all other contexts see only this | `Access` |
| Brand | A configuration record for one branded offering | `Brand` |
| Brand membership | A family's relationship with one brand: language, consent, entry point, subscription | `BrandMembership` |
| Partner | An organisation that runs campaigns within a brand; never a brand | `Partner` |
| Campaign | A partner offer: sign-up window, discount, discount period | `Campaign` |
| Device link | Authorising a device for one child with a one-time code or QR | `DeviceLinkCode`, `LinkedDevice` |
| Device credential | Long-lived secret a linked device holds; used only to obtain access tokens | `DeviceCredential` |
| Access token | Short-lived (30 min) proof that a linked device may act for its child; verified without a store lookup | `DeviceAccessToken` |
| Sign-in | A parent authenticating; never called a "session" | `SignIn` |

## Data & Consistency Decisions

### Ownership and logical data shape
One system of record, **partitioned logically by context**. Each context owns its part: no context writes another's data, and write paths never join across contexts. Only the read models below may read across contexts.

| Context | Logical shape (by access pattern) | Notes |
|---|---|---|
| Identity & Access | Relational: identities, sign-in methods, linked devices, link codes | Unique on normalised email |
| Family | Relational: family → children → subject enrolments; family × brand memberships | Children shared across brands |
| Billing & Campaigns | Relational, plus **append-only** status, discount and fee histories, plus an **inbox of provider events** for deduplication | AC-A26, A37 |
| Content | Relational + **trees** (index tree) + **shallow typed links** (one hop; no graph store needed); **append-only versions**, published versions immutable | Longest-lived, most valuable data; not hard-deleted except for legal reasons |
| Prep | `Assessment` as a self-contained aggregate (scope, portions, strategy history); **append-only response log** per session; **mastery** keyed by (assessment, fact), updated per answer | Hottest writes |
| Rewards | **Append-only credit ledger**; balance derived | |
| Notifications | Preferences + delivery log | |
| Platform Config | Small, read-mostly configuration | Cached |

**Traceability:** every learner response records the exact **question version and rubric version** used (AC-C22; grader-vs-teacher agreement, AC-E9).

### Fact set of an assessment: re-resolved live
The `Assessment` keeps the scope as selected. Its fact set is re-resolved from the **current published catalogue** each time a session is planned. Mastery is keyed by a **fact ID that is stable across versions**: an edited fact keeps its mastery; a split or merged fact gets new IDs and starts fresh; a removed fact drops out; a newly approved fact enters as unmastered (AC-C28, AC-P12).

### Paths that must not race (serialized writes)
Every rule is enforced **explicitly**, by a conditional update, a uniqueness rule or a per-aggregate version check. None relies on the store's default isolation level.

| # | Invariant | Race | Enforcement |
|---|---|---|---|
| 1 | ≤ 3 children per family | Two concurrent "add child" requests each see 2 | Writes to the `Family` aggregate are serialized |
| 2 | Link code single use | Two devices redeem at once | Conditional update unused → used |
| 3 | One account per verified email | Concurrent sign-ups with different methods | Uniqueness on normalised email |
| 4 | Each provider event applied once; no backward moves | Repeated or out-of-order webhooks | Event ID recorded in the same transaction as the state change; writes to each `Subscription` serialized; reconciled against the provider-reported status |
| 5 | One overdue + one suspension email per episode | Retried webhook sends a second email | Email intent recorded in the same transaction as the status change (outbox), sent with an idempotency key |
| 6 | Campaign sign-up cap | Last places taken twice | Conditional increment on the campaign |
| 7 | Campaign discount once per family per brand | Concurrent checkouts | Uniqueness on (family, brand) |
| 8 | One suggested next session; parent's strategy choice wins | Parent and child edit at once | Version check on `Assessment` |
| 9 | Missed vs Started | Child starts while the missed-session job runs | Conditional Scheduled → Missed only if not started |
| 10 | Each answer counted once in mastery | Background answer sync retries | Client-generated response ID; response and mastery update in one transaction |
| 11 | LLM cost cap per session | Two borderline answers at once | Conditional increment on the session's spend |
| 12 | Credits once per activity | Redelivered event | Triggering event ID is the ledger entry key |
| 13 | A revoked device can't obtain a new access token | A refresh races the revocation | Refresh is a conditional check against the `LinkedDevice` record (only non-revoked devices get a token). Requests themselves are verified from the 30-minute access token alone, with no store lookup, so a revoked device keeps working for **at most 30 minutes** |
| 14 | Suspension blocks children immediately | Stale copy of Access | Access read from Billing's published query at request time; never copied |

### Consistency between contexts
- Domain events use a **transactional outbox**: an event is saved in the same transaction as its state change and delivered **at least once** through the work queue. **Every handler is idempotent**, keyed by event ID. Delay is seconds, inside the 5-minute alert limits (AC-O1, O4).
- **Fee reversion** (AC-A33) is a multi-step process with confirmation: request the amount change at the provider → wait for the provider to confirm → flag staff if unconfirmed before the next billing date.

### Derived data (rebuildable from the system of record)
| Read model | Sync | Staleness |
|---|---|---|
| Parent dashboard, session log | Computed on read from Prep's published queries | None |
| Readiness % | Maintained by Prep in the same transaction as mastery | None |
| Content coverage | Computed on read inside Content | None |
| Weekly digest | Scheduled batch, Sunday evening | Weekly |
| Partner & campaign reports | Scheduled batch, daily | ≤ 24 h |
| Per-child tuning | Batch after each Result is recorded | Per assessment |

### Hot keys
None expected at year-1 scale; the session-due burst spreads across children. The hot read path (catalogue bundles) is cached by version (Phase 3).

## Module Design (Deep Modules)
Phase 5 review of the Phase 1–4 module set (2026-11-16). All consolidations were adopted before any code was written, so they are part of the design, not debt.

### Published interfaces per context
Each context exposes one small published interface that hides a lot behind it; ports exist only for outside services and storage.

| Context | Published interface (in short) | Hides |
|---|---|---|
| Prep | add/change assessment, switch strategy, start/finish session, submit answer, record result, dashboard queries | Planning, strategies, importance, mastery, marking, LLM grading, cost cap |
| Content | `ContentCatalogue`: resolve scope, session bundle, report a problem; back office: upload, review, generate, publish | AI pipeline, versioning, review gates, page reading, image storage |
| Billing & Campaigns | checkout, handle provider event, cancel, reactivate, start card update, `access(membership)` | Lifecycle state machine, provider quirks, discounts, reversion |
| Identity & Access | sign-in flows, issue/redeem link code, refresh device access token, revoke device, authenticate request | Provider sign-in, credentials, token issuing and verification, rate limits |
| Family | register, add child, enrol subject, directory queries | Consent, memberships, schools |
| Notifications | `notify(recipient, alertType, payload)` + event handlers, set mutes | Channels, devices, templates, digest |
| Rewards | event handlers, set goal, balance/goal queries | Credit table, levels, streaks |
| Platform Config | resolve brand, resolve language, `Messages.render(messageKey, params, {brand, language})` | Brand records, fallback rules, message catalogues |

### Consolidations
| # | Smell avoided | Where | Design |
|---|---|---|---|
| S1 | Planning split into steps by time, as thin classes sharing the same knowledge | Prep | One deep **`PrepPlan`**: `plan(assessment, mastery, today) → decision {strategy, portion, nextSession, messageKeys}`; strategies are plug-ins inside it (AC-E20); runway never leaves it |
| S2 | Grading knowledge leaking through the rubric format between Content and Prep | Content ↔ Prep | One **`Marking`** module in Prep: `mark(liveQuestion, answer, sessionBudget) → Verdict` for all question types; the rubric format is defined once, versioned, in the content catalogue's published contract |
| S3 | Importance semantics duplicated across runway, selection, spacing, last-minute exclusion, readiness, weak keywords | Prep | One **`Importance`** policy turns tier + weight into priority, spacing and readiness weight; Content only assigns tiers and weights |
| S4 | Fact-link semantics re-implemented in several places | Prep | Hidden inside one **`Mastery`** module (`record`, `estimate`, `readiness`); Content only stores typed links |
| S5 | One port per need between contexts → thin pass-throughs | All contexts | **One published interface per context** (table above); `LearnerTuning` internal to Prep |
| S6 | Brand/language lookup and fallback repeated in every channel | All channels | One **`Messages`** module (Platform Config) used by every presenter and template |
| S7 | Alert routing spread across producers | Notifications | One **`notify()`**; the event-to-alert mapping lives only in Notifications |
| S8 | Provider statuses interpreted in both the webhook translator and `Subscription` | Billing | Translator emits only **provider-neutral facts** (`PaymentFailed {providerStillActive}`, `ProviderPaused`, `PaymentSucceeded`, `CardExpiring`); every lifecycle decision lives only in `Subscription` |
| S9 | "May this request proceed?" spanning three contexts, checked differently per endpoint | Edge | One **request-context resolver**: brand, language, actor and access worked out once per request, before any use case |
| S10 | Draft → review → approve → publish → hide built separately for each content item type | Content | One general **`Review & Versioning`** module for any content item; Gate 1 and Gate 2 are policies on it |
| S11 | Scheduled jobs holding domain rules | Several | Jobs are **thin triggers** calling use cases; rules stay in aggregates |
| S12 | Settings scattered | Prep | One **`PrepSettings`** with decided defaults; per-child tuning overrides |

**Deliberately not merged:** Marking stays out of Content; Rewards and Notifications stay out of Prep (separate knowledge, separate reasons to change).

## Design Conventions
Adopted 2026-11-16 (Phase 5); apply in every code review.

- [ ] **Domain names only.** Name modules, types, methods and events after [glossary](#domain-glossary-ubiquitous-language) concepts. Never `Manager`, `Helper`, `Util`, `Processor`. A name that resists is a design signal: raise it, don't work around it.
- [ ] **Behaviour lives in aggregates;** use cases only coordinate (load, call, save, publish). No business rule in inbound adapters, presenters, handlers or jobs.
- [ ] **One module per piece of knowledge.** If a change forces edits in two modules in lockstep, merge them or extract the shared knowledge.
- [ ] **Interface comments first.** Before implementing a module or published interface, write what it promises (inputs, outputs, invariants, failure behaviour), not how it works.
- [ ] **Settings have decided defaults in one place** (e.g. `PrepSettings`); no new configuration parameter without a default and a reason.
- [ ] **Jobs and event handlers are thin triggers** that call a use case, and are idempotent (see [Data & Consistency Decisions](#data--consistency-decisions)).
- [ ] **Code in English, using the glossary's code names;** user-facing text only through `Messages`.
- [ ] **Inbound and outbound adapters.** Everything that calls into a context goes through an **inbound adapter**: our own web app, Android app and back office included, since "external" means outside the core, not a third party. Everything a use case calls out to goes through a port implemented by an **outbound adapter**. Inbound adapters do one translation step only: validate input, resolve the request context, call one use case (or one query service), and present the result. No controller → handler → use-case stacks; in TanStack Start the server function *is* the inbound adapter. Calls between contexts in the same process go straight to the other context's published interface, with no serialisation. Commands go through use cases; screens that only read may call a query service over a read model directly. Don't name anything "delivery" or "mediator".
- [ ] **Every outside service sits behind an interface we own** (table below). Provider IDs, prompts and payload formats live only in the adapter; the domain never stores a provider's own identifiers. Forking-road test: any provider can be swapped within a week.
- [ ] **One source per contract:** the mobile API contract, domain event schemas, the rubric format and settings are each defined once; server and Android types are generated from that one source.
- [ ] **Design by contract:** aggregates assert their invariants and fail immediately and loudly; every request is validated against its contract at the edge.
- [ ] **Orthogonality check in review:** ask "if this requirement changed dramatically, how many modules would change?"; the expected answers are in the change-impact table below.

### Owned interfaces for outside services
| Port | Context | Build order |
|---|---|---|
| `AnswerEvaluator` (LLM step of `Marking`) | Prep | 1 (riskiest; used by the grader spike) |
| `ContentAI` (reading, extraction, generation) | Content | 1 |
| `PaymentGateway` + provider-event translator | Billing | 1 |
| `PushSender`, `EmailSender` (behind `notify`) | Notifications | 2 (tracer bullet) |
| `Clock`, `EventPublisher` (outbox), `FeatureFlags` | All | 2 (tracer bullet) |
| `IdentityProvider` (social sign-in) | Identity & Access | 2 |
| `MediaStore` | Content | 3 |

### Change impact (orthogonality)
| Change | Modules touched | Guard |
|---|---|---|
| New brand | Configuration only (+ per-brand app build) | Static check: no hard-coded brand (AC-B1) |
| New language | Message catalogues + content set | Static check: no hard-coded text (AC-X1) |
| New prep strategy | `PrepPlan` plug-in only | Strategy contract test |
| New alert type | Notifications mapping + message keys | — |
| Swap a provider | One adapter | Adapter contract tests |
| Rubric format change | Catalogue contract version + `Marking` | Rubric version contract tests |
| **New question type** | Content generation + `Marking` + client rendering (3 places; inherent to the problem) | Question type defined once in the catalogue contract; clients render from it |
| Mobile API change | Mobile-API inbound adapter; versions N and N-1 supported | Mobile API contract tests (N, N-1) |

## v1 Scope & Staging
Signed off 2026-11-16 (Phase 8). The time is fixed (pilot January 2027, launch February 2027); scope was cut to fit, never the expensive-to-reverse decisions.

**Never cut (expensive to reverse; all in v1):** brand and language resolved at the edge, with no hard-coded text or brand; one parent identity across brands with per-brand memberships; stable fact IDs, immutable content versions, responses recording question and rubric versions; outbox, idempotency and the 14 no-race invariants; Access as Billing's only published state; device linking; POPIA consent and self-service family deletion; outcomes (Results, strategy history) recorded from day 1.

| Stage | In scope |
|---|---|
| **Pilot (January 2027)** | Parent sign-in and account linking; family, children, schools, subjects; device linking. **Full billing lifecycle** (pilot is paid): checkout, webhooks, Overdue → Suspended → reactivation, cancellation, card update and expiry warnings. **Content pipeline** for the **most-used textbook per subject per grade, Term 1**, including the **AI index-tree proposal** from the table-of-contents photo and **meaning-based duplicate detection** for "generate more questions"; simple back-office tools (one-by-one importance edits, coverage as a table of counts). **Prep:** all three strategies (Incremental, Standard, Last-minute), every technique, a **simple mastery rule** behind `Mastery`, the two-step grader. Per-event alerts, missed-session detection, parent dashboard. **Full gamification** (credits, celebration, streaks, levels, badges, cosmetics, parent reward goals). Brand and language seams |
| **Launch (February 2027)** | The other launch textbooks (Term 1). **Partner campaigns:** partners, campaigns, co-branded landing pages, codes, membership numbers, discounts, **automatic fee reversion**, **full partner reporting** (AC-A35). **Weekly digest** |
| **After launch** | The Debt Ledger below (D1–D7), each with its revisit trigger |

**No circuit breaker:** if pilot readiness is at risk, nothing moves from pilot to launch; the pilot date moves instead (user decision, 2026-11-16).

**Schedule risks:** the paid billing lifecycle (riskiest integration on the pilot's critical path; payment-sandbox contract tests and Safety Net Map #4 must be green before the pilot), Incremental, full gamification, the AI index-tree proposal and meaning-based duplicate detection all land in the ~7 weeks before the pilot.

## Debt Budget & Broken-Windows Policy
Adopted 2026-11-16 (Phase 7).

- [ ] **Broken windows:** fix in the same change, or **board up**: a tracked ticket **plus** a [Debt Ledger](#debt-ledger) row with owner and revisit trigger. No untracked TODOs; review rejects new debt without a ticket. (Owner: team, P1)
- [ ] **Debt budget:** **10% of each iteration** for design improvement and debt until the February 2027 launch, then **20%**. (Owner: team, P1)
- [ ] **Review question on every change:** "does this make the system simpler?", alongside "does it work?". (Owner: team, P1)

## Debt Ledger
Deliberately deferred work (Phase 8, 2026-11-16). Each keeps its seam from day 1, so adding it later is additive. Boarded-up broken windows are added here too (see policy above).

| # | Deferred | Seam kept from day 1 | Revisit trigger | Owner | Priority |
|---|---|---|---|---|---|
| D1 | Per-child tuning of strategy cut-offs and portion sizes (AC-E20, E24) | Results and strategy history recorded; defaults in `PrepSettings` | ≥ 3 Results for ~30% of active children | Team | P2 |
| D2 | Statistical knowledge-tracing model | `Mastery` interface; simple, explainable rule behind it | Pilot data shows the rule's readiness disagrees with test Results | Team | P2 |
| D3 | "Label the diagram" question type (AC-C9, C13) | Diagram facts extracted and reviewed; question type defined once in the catalogue contract | Core question types stable in production and grader agreement ≥ 90% | Team | P3 |
| D4 | Automated 12-month retention deletion with 30-day warning (AC-A16) | Suspension and cancellation dates recorded; self-service deletion (AC-A17) live | December 2027 (2 months before the earliest possible warning) | Team | P1 when triggered |
| D5 | Test second-brand rehearsal (AC-B8) | Brand resolved at the edge from a config record; static check against hard-coded brand | Decision to start brand #2 | User | P2 |
| D6 | Bulk importance edit per index node (AC-C28 bulk) | Tier and weight editable per fact, versioned | Curators spend > 2 h/week on one-by-one edits | Team | P3 |
| D7 | Full content coverage dashboard (AC-C6) | Table of counts per textbook | Curator or staff request after launch | Team | P3 |

## Decision Log
| Date | Decision | Why | Alternatives rejected |
|---|---|---|---|
| 2026-11-16 | **Modular monolith:** one deployable codebase and one system of record, with strict module boundaries; background work may run as a separate process from the same codebase | One small team; no proven context seams yet; keeps refactoring across modules cheap | Separate services (e.g. Content and Prep Engine deployed alone): operational load for one team, and a distributed monolith if seams are wrong |
| 2026-11-16 | **Dependency Rule enforced through ports owned by use cases;** full boundaries at inbound adapters, data store, payment provider, AI content provider and LLM grader; partial at notifications, identity, object storage and clock; collapsed for plain reference data | Full boundaries go where change or vendor risk is likely; the rest avoids ceremony | Collapse the data-store boundary (core not testable without the store); full boundaries everywhere (ceremony with no protection) |
| 2026-11-16 | **Brand and language resolved at the edge;** the core handles IDs and message keys only | Multi-brand and multi-language from day 1 without code changes (PRD AC-B1, X1) | Brand/language checks inside use cases (leaks "Slaag" and language assumptions inward) |
| 2026-11-16 | **Modules interact only through published use cases and domain events** | Keeps future service seams open; prevents a shared-data monolith | Shared access to tables across modules |
| 2026-11-16 | **Eight bounded contexts:** Prep, Content, Family, Billing & Campaigns, Identity & Access, Rewards, Notifications, Platform Config | Each has its own language and changes for its own reasons | One unified model (contradictory "Child", "Subscription", "Fact") |
| 2026-11-16 | **Planner and Prep Engine merged into one Prep context** | They share Assessment, Session, Mastery, Strategy and Portion with one meaning; splitting forces a shared kernel | Two contexts with a shared Assessment/Mastery model |
| 2026-11-16 | **Content is one context exposing a published content catalogue** of approved live versions | Prep must never see drafts or pages; one context keeps versioning and publishing together | Separate Authoring and Catalogue contexts (more moving parts for one team) |
| 2026-11-16 | **Core domain = Prep + Content's fact model** (importance, links, model answers, rubrics); ingestion/review workflow, Family, Billing, Rewards, Platform Config are supporting; sign-in, payment processing, email/push, AI providers are generic | The engine is only as good as the facts it drills | Prep alone as core (under-invests in fact quality) |
| 2026-11-16 | **Billing publishes only Access;** subscription states and provider terms stay inside Billing behind a translation layer | Keeps provider quirks (failed-attempt webhooks, paused status) out of every other context | Other contexts reading subscription status |
| 2026-11-16 | **Terms fixed:** Verdict (answer outcome), Result (post-test rating + score), Grade (school grade only), Access, Session (prep only), Scope vs fact set, Mastery vs Readiness | Removes the PRD's double meanings of "grade", "mark", "subscription", "session" | Keep PRD wording as is |
| 2026-11-16 | **AssessmentMastery is its own aggregate,** separate from Assessment | Written on every answer; keeps Assessment small and avoids write contention | Mastery inside Assessment |
| 2026-11-16 | **Scale up one system of record vertically; no replicas, shards or regions in year 1** | Estimates show < ~100 GB/year and at most a few hundred writes/s at 10,000 families | Read replicas or sharding up front (operational cost with no load to justify it) |
| 2026-11-16 | **Adopt now: async work queue** for push/email fan-out, the AI content pipeline and scheduled jobs (missed-session check, daily runway recalculation, weekly digest, retention/erasure, fee reversion) | Absorbs the session-due burst and keeps slow or bulk work out of user requests | Doing fan-out and jobs inside requests |
| 2026-11-16 | **Adopt now: prefetch each session's question bundle; send answers in the background** | Absorbs the long round trip from users to the server and the session-due burst | Fetch one question at a time |
| 2026-11-16 | **Adopt now: cache published content by version** (inside the app) **and an edge cache** for static files, page images and diagram crops | Published versions never change, so cache invalidation is trivial; images dominate egress | Shared cache cluster (deferred) |
| 2026-11-16 | **Borderline answers are graded synchronously; the child waits for the Verdict.** The LLM call has a strict timeout and a cap on concurrent calls; on timeout, cap or cost cap the Verdict is **Close** (AC-E11–E12) | Simplest experience for the child; ~25 calls in flight at peak is manageable | Model answer first, Verdict delivered later through the queue |
| 2026-11-16 | **Targets: 99.5% availability, RPO 15 min, RTO 4 h;** single primary with continuous backups | Fits one small team; at most 15 minutes of a child's progress can be lost | 99.9% with a standby and automatic failover (more to run); 99% with nightly backups (a lost day before an exam hurts trust) |
| 2026-11-16 | **Deferred, with triggers:** vertical upsize when the store's CPU stays above 60% or writes exceed 1,000/s; read replica when reporting queries slow the answer path; shared cache when there is more than one app instance *and* catalogue reads are hot; sharding above ~1 TB or beyond one server's writes; multi-region above a contracted 99.9%; services when a context's load or release pace clearly diverges | Each move waits for the number that justifies it | Building for 100k families at launch |
| 2026-11-16 | **One system of record, partitioned logically by context;** no cross-context writes or write-path joins | One team, one backup/restore; seams kept clean for a later split | Separate stores per context (multi-step processes across contexts; more backups) |
| 2026-11-16 | **Assessment fact sets are re-resolved live** from the published catalogue at each session plan; mastery keyed by stable fact ID | Content corrections and importance changes reach children from the next session (AC-C28, P12) | Fixed snapshot at creation (ignores corrections) |
| 2026-11-16 | **Responses record the exact question and rubric version** | Traceability and grader validation survive content changes | Reference the question only |
| 2026-11-16 | **14 invariants enforced explicitly** (conditional updates, uniqueness, per-aggregate version checks), never by default isolation | Write skew passes single-user tests and fails under load | Rely on the store's default isolation |
| 2026-11-16 | **Transactional outbox + at-least-once delivery + idempotent handlers** for all cross-context events and outbound emails | No lost or doubled alerts, credits or billing emails | Publish after commit (events lost on crash); distributed transactions |
| 2026-11-16 | **Derived views computed on read or by scheduled batch;** readiness % maintained with mastery | Enough at this scale; nothing extra to keep in sync | Event-driven projections for every view |
| 2026-11-16 | **Access and device revocation read live** from the system of record on every request. *Device-revocation part superseded 2026-11-16 by the 30-minute access-token decision below; Access is still read live.* | Suspension and revocation must apply on the next request (AC-A12, A15) | Cached copies in other contexts |
| 2026-11-16 | **Linked devices use 30-minute access tokens,** verified without a store lookup and refreshed with the long-lived device credential; revocation blocks the next refresh, so **a revoked device stops working within 30 minutes** | Checking the device record on every request costs too much load on the system of record (user decision) | Immediate revocation by checking the device on every request |
| 2026-11-16 | **Deep modules over pipelines** (Phase 5): `PrepPlan`, `Importance`, `Mastery`, `Marking`, `PrepSettings` in Prep; one general `Review & Versioning` in Content; one `notify()`; one `Messages.render()`; one request-context resolver at the edge; one published interface per context. Details: [Module Design](#module-design-deep-modules) | Each piece of knowledge in one module; small interfaces hiding a lot | Per-step policy classes and one port per need (classitis, information leakage) |
| 2026-11-16 | **The rubric format is part of the content catalogue's published contract,** defined once and versioned; `Marking` is its only interpreter | Stops grading knowledge leaking between Content and Prep | Each side keeps its own view of the rubric |
| 2026-11-16 | **Every outside service has a timeout, circuit breaker, separate capacity and fallback** (Phase 6); see [RELIABILITY.md](RELIABILITY.md) | A slow dependency must never freeze learner traffic | Defaults with no timeouts; shared pools |
| 2026-11-16 | **LLM grader: 4 s total budget, ≤30 concurrent calls, no retry; fallback Verdict Close.** Close is **neutral for mastery** and the fact is re-asked later | The child is never blocked or penalised by a provider problem | Partial credit for Close (overstates mastery) |
| 2026-11-16 | **Feature flags per brand and family cohort, with kill switches** (LLM grading, each strategy, campaigns, each language); rollback within 10 min; expand-contract migrations | Release separately from deploy; switch off a misbehaving part without deploying | Deploy straight to everyone, rollback only |
| 2026-11-16 | **Before the pilot: load test at 3× burst, 24 h soak, one GameDay** (non-production); no production chaos testing in year 1 | Failure handling proven before real families depend on it | Load test only |
| 2026-11-16 | **Tracer bullet: "child on a linked device adds a test → one suggested session → parent alerted"** as production code and the first CI gate (Phase 7); see [TESTING.md](TESTING.md) | Passes through every ring, both channels, the outbox, queue and Notifications | "Answer one question" first (skips the event path) |
| 2026-11-16 | **Throwaway grader spike (3–5 days) before building `Marking`;** the teacher-marked evaluation set is kept as the grader's regression test | Afrikaans grading accuracy (AC-E9) is the riskiest unknown; find out before the pilot | Measure agreement only in the pilot |
| 2026-11-16 | **Owned interface for every outside service; one source per contract; contract tests shared by fakes and real adapters** | Any provider swappable within a week; fakes cannot drift | Calling provider SDKs from use cases |
| 2026-11-16 | **Debt budget 10% until launch, then 20%; broken windows fixed or boarded up with a ticket + Debt Ledger row** | Pre-launch crunch without letting entropy start | Fixed 15% or 20% throughout |
| 2026-11-16 | **v1 staged as pilot (Jan 2027) / launch (Feb 2027) / after launch** (Phase 8); see [v1 Scope & Staging](#v1-scope--staging) | Fixed time, flexible scope; no expensive-to-reverse decision cut | Everything at once; open-ended scope |
| 2026-11-16 | **Pilot is paid;** the full billing lifecycle is on the pilot's critical path | User decision; settles the PRD's open "pilot pricing" assumption | Free pilot with billing by launch |
| 2026-11-16 | **In the pilot by user choice:** all three strategies, full gamification, AI index-tree proposal, meaning-based duplicate detection; **by launch:** fee reversion, full partner reporting, campaigns, weekly digest | User decisions | Deferring these to launch or after launch |
| 2026-11-16 | **Not built for v1 (deferred with triggers):** per-child tuning, statistical knowledge tracing, "label the diagram" questions, retention deletion job, second-brand rehearsal, bulk importance edit, full coverage dashboard; see [Debt Ledger](#debt-ledger) | No data, no users or no deadline needs them before launch; each keeps its seam | Building them before the pilot |
| 2026-11-16 | **Mastery starts as a simple, explainable rule** behind the `Mastery` interface | Nothing to fit a statistical model to before the pilot; the interface doesn't change when it is swapped | Statistical knowledge tracing before the pilot |
| 2026-11-16 | **No circuit breaker:** if pilot readiness is at risk, the pilot date moves rather than scope | User decision | Pre-agreed order of cuts from pilot to launch |
| 2026-11-22 | **"Inbound adapters" and "outbound adapters"** name the two halves of the adapter ring; our own apps go through inbound adapters like any outside caller, as one thin translation step | Names the direction of each edge; the Android app runs on untrusted devices with old versions in use, and several channels share one set of use cases | "Delivery" (doesn't say inbound), "driving/driven adapters" (less obvious), "interface layer" (clashes with TypeScript `interface`), "gateway" (usually means outbound) |
