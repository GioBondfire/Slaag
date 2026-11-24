# Architecture

Logical design only: technology-neutral. Components are named by role; technology choices live in [../TECH-STACK.md](../TECH-STACK.md). Requirements: [../PRD.md](../PRD.md). Content context inventory (modules, layers, use cases, ports, adapters): [CONTENT-CONTEXT.md](CONTENT-CONTEXT.md).

## System Context

**What the system does.** A multi-brand, multi-language platform that helps parents of Grade 4–7 children prepare them for school tests and exams. A parent subscribes per **account** on the web and adds up to 3 children with their textbooks. A parent or child adds a test with a date and scope. An adaptive engine drills the child towards mastery of teacher-reviewed, importance-weighted facts from the child's own textbook. Content is produced in a back office where AI drafts and teachers review. Marketing campaigns per school term bring families in and are measured end to end. Year 1 runs one brand with Afrikaans only. No code may assume a particular brand or language.

**Actors.** Parent (a User with the Parent role in an Account; web, Android), child (a User with the Child role; linked device or the parent's app; no credentials), content curator and teacher reviewer (back office, web only), staff (partners, offers, marketing campaigns, support).

**Delivery channels.** Responsive web app, Android app (through a versioned mobile API), back office.

**Outbound integrations (by role).**
| Role | Used by | Purpose |
|---|---|---|
| Payment provider | Billing | Checkout, recurring billing, card update, amount change, status webhooks; one merchant account per brand |
| Ad platform (Meta in year 1) | Marketing | **Marketing API:** weekly import of spend and results per ad campaign, ad set and ad. **Conversions API:** server-side conversion and lifecycle events. **Custom Audiences API:** hashed Parent-user emails per audience segment |
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

**Data crossing boundaries.** Plain request/response models only. The data store's records, provider payloads and channel request objects never cross inward. Use cases return **message keys**, never text; presenters localise them to the account's language and brand.

**Request context.** Brand, language and actor (parent, or child on a linked device) are resolved at the edge and passed inward as plain IDs/keys.

**Between modules.** A module calls another module's published use cases, or reacts to its domain events. It never reads or writes another module's data.

**Modules = bounded contexts** (Phase 2; see below): Prep · Content · Account · Billing · Marketing · Identity & Access · Rewards · Notifications · Platform Config. The provisional Planner and Prep Engine modules from Phase 1 were merged into **Prep**. A context may be divided into **internal packages** (e.g. Marketing's Campaigns, Acquisition, Ad platforms, Reporting); a package is not a module and has no published interface of its own.

### Boundary map
| Part likely to change | Boundary | Why |
|---|---|---|
| Inbound adapters (web, mobile API v1/v2, back office) | Full: one thin inbound adapter per entry point + presenters | Three channels already; the mobile API is versioned |
| Transactional data store | Full: repository port per module | Core testable without the store; data outlives code |
| Payment provider | Full + anti-corruption translator (`BillingGateway`, webhook translator) | Unusual states and webhooks; one merchant per brand; highest vendor risk |
| Ad platform (Meta) | Full + anti-corruption translators: `AdInsightsSource` (inbound import), `ConversionSink` (outbound events), `AudienceSink` (outbound customer lists) | API versions change often; Meta's terms (ad set, fbclid, event names) must never pass into Marketing's model; a second ad platform must be an adapter, not a redesign |
| AI content provider | Full: `ContentAI` port | Models and providers change fast; expensive work |
| LLM grader | Full: `AnswerEvaluator` port with two steps | Cost cap and "close" fallback; the core engine depends on it |
| Email + push | Partial: one `Notifier` port, a strategy per channel | Simple; a new channel must not touch business rules |
| Sign-in / identity provider | Partial: the identity module exposes only `UserId` | The provider's sign-in flow stays at the edge |
| Object storage | Partial: `MediaStore` port | Used only by Content |
| Clock, scheduled triggers | Partial: `Clock` port + trigger adapter | All date logic testable |
| Brand and language | Resolved at the edge into the request context; the core sees IDs/keys only | PRD AC-B1: no code may assume a brand |
| Prep strategies | Plug-in boundary inside the core | PRD AC-E20: add strategies without changing planner, grader or runner |
| Plain reference data (school list, credit table) | Collapsed: inbound adapter → repository | No business rules to protect |

### First feature layered: "Add a test → suggest the next session"
PRD AC-P1–P4, P9–P10, C11, E13–E14, O1.

1. **Inbound adapter:** the web or mobile-API endpoint resolves the request context and builds `AddAssessmentRequest { child, actor, type, subject, date, scope (index nodes | page ranges) }`.
2. **Use case `AddAssessment` (Prep, planning module):**
   - Access (whether this actor may act for this child) is already settled by the **request-context resolver** at the edge (Phase 5, S9); the use case asks Account's published interface whether the subject is active with a confirmed textbook on the child's `LearnerProfile`.
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
| **Account** | Accounts (the customer: holder, members with roles), learner profiles of Child members (name, grade, school, subjects with textbook), brand memberships (language, consent, entry point), school reference data | Supporting |
| **Billing** | Subscription lifecycle per brand membership, fee, **offers** (discount, discount period, sign-up window, cap), membership numbers, fee reversion; publishes Access and the subscription lifecycle events | Supporting (payment processing itself is generic, behind a translation layer) |
| **Marketing** | **Marketing campaigns** per school term with phases and budgets, **partners** and landing links (codes, QR codes), **touchpoints** and attribution, ad-platform integration (spend import, conversion and lifecycle events, audiences), marketing and sales-ops reporting. Internal packages: **Campaigns**, **Acquisition**, **Ad platforms**, **Reporting** | Supporting (ad platforms are generic, behind translation layers) |
| **Identity & Access** | **Users** (sign-in identity shared across brands; a child is a User without credentials), identity linking, staff permissions, device-link codes, linked devices | Generic; device linking is supporting |
| **Rewards** | Credit ledger, levels, badges, cosmetics, streaks, parent reward goals | Supporting |
| **Notifications** | Alert preferences (mutes per type and channel), push and email delivery, weekly digest | Generic |
| **Platform Config** | Brands, allowed and default languages, language resolution, message catalogues | Supporting |

Parent dashboard, readiness views, partner and marketing reports and content coverage are **read models** built from these contexts, not contexts of their own (Phase 4).

**Account vs User.** An **Account** is the customer: a higher-order construct whose **holder** is an individual today and may be a company later. **Users** (Identity & Access) are people; they belong to an Account as **members** with a **role** (Parent, Child; later e.g. Teacher). The word "account" means only the customer account; Identity & Access speaks of Users and identity linking.

### Context map
```
                  Platform Config  (upstream to all: brand + language lookup)
                         │
  Identity & Access ──► Account ──► Prep ◄── Content (published catalogue)
         ▲                ▲           │            │
         │             Billing        │            ├─ ACL ─► AI content provider
         │   (publishes Access +      │            └─ problem reports ◄── Prep
         │    lifecycle events)       ├─ ACL ─► LLM grading provider
         │          │   │  └─ ACL ─► payment provider
         │          │   ▼
         │          │  Marketing ── ACL ─► ad platform (Meta: insights in; events + audiences out)
         │          │   events
         └──────────┴─────────── Notifications, Rewards (react to Prep/Billing/Account events)
```

| Upstream → Downstream | Pattern | What crosses |
|---|---|---|
| Content → Prep | Open Host Service + Published Language (**content catalogue**) | Approved, live versions only: scope → fact-set resolution; fact references with their **in-scope anchors** (anchor ID, page number, index node) and **effective importance** (`effectiveImportance`, defined once in the catalogue contract), difficulty, links and lineage; live questions with their **anchor IDs**, model answer and rubric. Never pages, verbatim text, drafts or review state (PRD AC-C24) |
| Content → Prep | Domain events (Published Language) | `FactsMerged {from[], into}`, `FactSplit {from, into[]}`: Prep carries mastery over (see [Content: facts, anchors and lineage](#content-facts-anchors-and-lineage)) |
| Prep → Content | Customer–Supplier | Problem reports on a question (AC-C21) |
| Billing → all | Published Language | **Access** per brand membership (`AccessGranted` / `AccessSuspended`), read live for authorisation |
| Billing → Marketing (and any subscriber) | Published Language (domain events) | **Subscription lifecycle facts:** `SubscriptionStarted` (first successful payment activates it; carries fee charged, currency, offer ID if any), `SubscriptionCancelled` (with reason), `SubscriptionSuspended`, `SubscriptionReactivated`; plus `CheckoutStarted`. The lifecycle **state machine** and provider terms stay private to Billing |
| Marketing → Billing | Customer–Supplier | A landing link or code refers to an **Offer** by ID; Billing validates and applies it at checkout |
| Payment provider → Billing | Anti-Corruption Layer | Provider subscriptions and webhooks translated into Billing events; provider terms never pass the translator |
| Marketing ↔ ad platform | Anti-Corruption Layer (both directions) | **In:** spend and results per ad translated into `AdSpend` records. **Out:** Billing lifecycle facts → conversion events (`SubscriptionStarted` → `Subscribe`; cancelled, suspended, reactivated → custom events of the same name); audience segments → hashed Parent-user emails. Meta's terms never pass the translators |
| Account → Marketing | Customer–Supplier | Parent-role members' `UserId`s per account and the account's marketing consent; Marketing fetches emails from Identity & Access for audience uploads only, hashed in the adapter |
| AI content provider → Content | Anti-Corruption Layer | Page reading, extraction, generation results as Content drafts |
| LLM grading provider → Prep | Anti-Corruption Layer | Borderline-answer evaluation as a Verdict proposal against the rubric |
| Identity & Access → Account, Prep, Rewards, Notifications, Marketing | Customer–Supplier | `UserId`, `DeviceId`; an authenticated actor; a User's email for Notifications and Marketing audience uploads |
| Account → Prep, Rewards, Notifications | Customer–Supplier | Members and roles; a Child member's grade and active subjects with textbook; account language per brand |
| Prep → Notifications, Rewards | Domain events (Published Language) | `AssessmentAdded`, `AssessmentChanged` (with actor), `SessionScheduled`, `SessionMissed`, `SessionCompleted`, `PortionCompleted`, `StrategySwitched`, `ResultRecorded` |
| Account → all | Domain event | `AccountErasureDue`: every context erases its own data (AC-A16–A17); Marketing also removes the account's users from every uploaded audience |
| Account → Marketing | Domain event | `MarketingConsentWithdrawn`: stop sending the account's events and remove its users from audiences |
| Platform Config → all | Open Host Service; downstream conformist | Brand record, allowed/default languages, message lookup |

### Aggregates and invariants
Other aggregates are referenced by ID only; consistency between aggregates is eventual.

| Context | Aggregate (root) | Invariants |
|---|---|---|
| Prep | **Assessment** | Holds the scope as selected plus the resolved fact set; exactly one active strategy, with history (parent's choice beats child's); portions are ordered and cover the scope; at most **one** suggested next session; after the date it stops suggesting and accepts one **Result** |
| Prep | **PrepSession** | Scheduled → Started → Completed, or **Missed** 2 h after the scheduled time; holds its responses; LLM grading spend within the per-session cost cap |
| Prep | **AssessmentMastery** | One estimate per fact per assessment, never carried over to another assessment; changes only through graded responses, or through **fact lineage** (a split fact's children inherit its estimate; a merged fact takes the **lower** of its parents' estimates); a **Close** Verdict is neutral (no change; the fact is asked again later); an elaborating fact is drilled only after its keyword is mastered, **when the keyword fact is in the assessment's fact set**. Kept apart from Assessment because it is written on every answer |
| Prep | **LearnerTuning** | One per child: strategy cut-offs and portion sizes |
| Content | **Textbook** | Index tree confirmed once |
| Content | **Page** | Identified by (source document, printed page number); each upload of it creates a **PageVersion** with its own pipeline state (see [Content: ingestion pipeline](#content-ingestion-pipeline)); a newer version supersedes the old one, and each anchor on the old version is re-matched to the new one (lightweight review, keeping its `AnchorId`) or left for a teacher to resolve |
| Content | **Fact** | Stable `FactId`; the **fact core**: one canonical statement, 1–2 paraphrases, type, key terms; versioned and reviewed on its own, independently of its anchors; its typed links live in a separate `FactLinkSet`; a merge or split creates new `FactId`s and records lineage, and a merged fact keeps every anchor of the facts it replaces; only approved facts feed generation; created only by approving a `FactCandidate` |
| Content | **SourceAnchor** | Its own aggregate, referencing one `FactId`; stable `AnchorId`; source document, page version, section, region, verbatim text, index and CAPS references, position type, signal, **tier and weight**; versioned and reviewed on its own, so one source can go live while another is still in review; re-anchoring, importance edits and region corrections create new anchor versions. A fact with no live anchor is in no scope |
| Content | **FactCandidate** | Extraction output, reviewed at Gate 1; has no `FactId`. Carries a proposed statement, paraphrases, anchor (source, verbatim text, position type, signal, importance) and links, plus the reconciliation proposal (new fact / re-anchor an existing anchor / additional anchor on an existing fact). Resolved exactly once: approved as a new `Fact`, accepted as a match (anchor added to or moved on the existing fact), combined with other candidates, or rejected |
| Content | **Question** | Records the **anchor(s)** it was written from; **live only while** its own approved version, the live core of each of its facts and **the anchors it was written from** are live (anchors in other sources don't matter); can't go live without an approved model answer and rubric, versioned together; ≥3 open problem reports hide it; re-pointed to the new fact and sent back through Gate 2 when its fact is merged or split |
| Content | **FactLinkSet** | One per fact: its outgoing typed links (elaborates / part of with a position / related) to other facts by `FactId`; versioned and lightly reviewed as one item, apart from the fact core and anchors; no "duplicates" link (a restatement is another anchor on the same fact). A link is live only while both its facts are live (computed) |
| Content | **GenerationRun** | Started only by a curator; a **fact selection** across any source documents (ready for questions, approved since, by structure, hand-picked); mode **generate more** or **regenerate**; options; urgency (batch or real time); logs who, when, selection, options, counts created / dropped as duplicate / dropped as invalid, model, prompt version, cost |
| Content | **ReviewBatch** | One per **generation run and source document**: that run's mechanical-type questions for that source; ~10% sample with ≥95% pass, otherwise review the whole batch; none of them go live until the batch passes |
| Billing | **Subscription** | One per brand membership; lifecycle state machine; each provider event applied exactly once and late events never move it to a wrong state; at most one overdue email and one suspension email per failure episode; at most one discount, an offer discount once per account per brand; fee history; publishes `SubscriptionStarted` **exactly once** (first successful payment) and `SubscriptionReactivated` (never a second `SubscriptionStarted`) for later activations |
| Billing | **Offer** | Discount (percentage or rand amount), discount period, sign-up window and cap; optionally tied to a Partner (by ID); pausing or ending stops new sign-ups only |
| Marketing | **MarketingCampaign** | One per brand and school term; ordered **phases** (holiday, warm-up, base, ramp, push) with date ranges that don't overlap and a planned budget each; key messages; channels |
| Marketing | **Partner** | Belongs to one brand; recorded permission to use its name and logo; optional membership-number format |
| Marketing | **LandingLink** | A trackable entry point (URL with tags, code, QR) belonging to a campaign and/or partner; may refer to an Offer by ID; stable once published |
| Marketing | **Touchpoint** | One recorded arrival: landing link or UTM tags, ad click ID, landing page, time; linked to a `BrandMembership` by ID at sign-up, never changed afterwards |
| Marketing | **AdSpend** | One per ad-platform ad per day: spend, impressions, clicks, platform-reported results; written only by the import, idempotent by (platform, ad, day) |
| Account | **Account** | One **holder** (an individual today; an organisation later); at least one member with the Parent role; **at most 3 members with the Child role** |
| Account | **LearnerProfile** | One per Child member: grade, school, subjects; a subject is active only with a confirmed textbook. Kept apart from Account so school edits don't serialize the whole account |
| Account | **BrandMembership** | Language within the brand's allowed languages; consent timestamps recorded (product terms, and **marketing measurement** for ad-platform events and audiences) |
| Identity | **User** | One User per verified email, whatever the sign-in method; a Child user has no credentials and acts only through a linked device or a parent's app |
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
| Fact | A small, self-contained statement of one idea, held as one canonical statement and found in one or more sources; the unit of mastery | `Fact` (Content), `FactRef` (Prep) |
| Canonical statement | The fact's one authoritative wording, normally its primary anchor's verbatim text | `canonicalStatement` |
| Source anchor | Where a fact appears: source document (with its metadata), page version, section and page region, with the verbatim text there, index node, CAPS node, position type, importance signal and importance | `SourceAnchor`, `AnchorId` |
| Re-anchoring | Matching an existing anchor to a replaced page version, or adding an anchor in another source; reviewed lightly | `reanchor()` |
| Fact lineage | Which retired facts a fact was merged or split from | `FactLineage` |
| Effective importance | The importance of a fact within a scope: its strongest anchor in scope, or the strongest anchor of a preferred type | `effectiveImportance()` |
| Anchor preference | An optional filter on anchor types for a prep or generation run (e.g. keywords only) | `AnchorPreference` |
| Paraphrase | One of 1–2 restatements of a fact that keep its key terms | `Paraphrase` |
| Importance tier / weight | Core, Supporting or Peripheral, plus a weight within the tier; held **per anchor** | `ImportanceTier`, `weight` |
| Fact link | A typed relation between facts, independent of any source: elaborates (adds detail to a keyword fact's concept), part of (with a position), related. Restatements are anchors, not links | `FactLink`, `FactLinkSet` |
| Version state | Draft → In review → Approved (live) → Superseded, or Rejected; per version | `VersionState` |
| Hold | A reason an item is kept out of the catalogue (≥3 problem reports; material edit awaiting Gate 2) | `Hold` |
| Fact candidate | A draft fact from extraction, awaiting Gate 1; has no fact ID until approved | `FactCandidate` |
| Fact core | A fact's statement, paraphrases, type and key terms; versioned apart from its anchors | `FactCore` |
| Minor / material edit | How an approved fact-core edit affects its questions: minor keeps them live (queued for Gate 2), material takes them out until Gate 2 | `EditImpact` |
| Question | An item generated from fact(s) and written from specific anchor(s), with a model answer and rubric | `Question` (Content), `LiveQuestion` (Prep) |
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
| User | A person known to the system (Identity & Access): a parent who signs in, or a child without credentials | `User`, `UserId` |
| Account | The customer: holder plus members with roles; owns brand memberships and subscriptions. Never used for a sign-in identity | `Account`, `AccountId` |
| Account holder | Who the account belongs to: an individual today, an organisation later | `AccountHolder` |
| Member / role | A User in an Account with a role: **Parent** (manages and pays) or **Child** (the learner); later e.g. Teacher | `Member`, `MemberRole` |
| Child | A User with the Child role; in Prep, the learner | `UserId` (role Child) |
| Learner profile | A Child member's grade, school and subjects with textbooks | `LearnerProfile` |
| Subscription | An account's paid plan for one brand, with its lifecycle (Billing only) | `Subscription` |
| Sign-up | The first successful payment that activates a subscription; the campaign's unit of success | `SubscriptionStarted` |
| Subscription lifecycle events | Billing's published facts: started, cancelled, suspended, reactivated; the state machine itself stays private | `SubscriptionStarted`, `SubscriptionCancelled`, `SubscriptionSuspended`, `SubscriptionReactivated` |
| Provider subscription | The payment provider's own record; only inside the translation layer | `ProviderSubscription` |
| Access | Whether a brand membership's children may use the product; read live for authorisation | `Access` |
| Brand | A configuration record for one branded offering | `Brand` |
| Brand membership | An account's relationship with one brand: language, consent, entry point, subscription | `BrandMembership` |
| Offer | A discount for sign-ups in a window: discount, discount period, cap; optionally for a partner's members (Billing) | `Offer` |
| Partner | An organisation whose members may get an Offer; never a brand (Marketing) | `Partner` |
| Marketing campaign | One school term's marketing: phases, budget per phase, key messages, channels. Never an ad-platform campaign and never an offer | `MarketingCampaign` |
| Phase | A slice of a marketing campaign with its own intensity and call to action: holiday, warm-up, base, ramp, push | `CampaignPhase` |
| Landing link | A trackable entry point (tagged URL, code, QR) for a campaign or partner | `LandingLink` |
| Touchpoint | One recorded arrival through a landing link, tags or ad click, linked to a brand membership at sign-up | `Touchpoint` |
| Ad campaign / ad set / ad | The ad platform's own objects; only inside the Ad platforms translators and Reporting read models | `AdRef` |
| Ad spend | Imported spend and results per ad per day | `AdSpend` |
| Audience segment | A set of Parent users defined by subscription status (active, cancelled, suspended) for upload to an ad platform | `AudienceSegment` |
| Device link | Authorising a device for one child with a one-time code or QR | `DeviceLinkCode`, `LinkedDevice` |
| Device credential | Long-lived secret a linked device holds; used only to obtain access tokens | `DeviceCredential` |
| Access token | Short-lived (30 min) proof that a linked device may act for its child; verified without a store lookup | `DeviceAccessToken` |
| Sign-in | A parent authenticating; never called a "session" | `SignIn` |

## Data & Consistency Decisions

### Ownership and logical data shape
One system of record, **partitioned logically by context**. Each context owns its part: no context writes another's data, and write paths never join across contexts. Only the read models below may read across contexts.

| Context | Logical shape (by access pattern) | Notes |
|---|---|---|
| Identity & Access | Relational: users, sign-in methods, linked devices, link codes | Unique on normalised email |
| Account | Relational: account → members (user, role); learner profile → subject enrolments; account × brand memberships | Children shared across brands |
| Billing | Relational, plus **append-only** status, discount and fee histories, plus an **inbox of provider events** for deduplication; offers | AC-A26, A37 |
| Marketing | Relational: campaigns → phases; partners, landing links; **append-only touchpoints**; **ad spend per ad per day** (idempotent import); an **outbox of ad-platform deliveries** (event ID = source domain event ID) | Ad-platform IDs live only in the adapter's mapping table |
| Content | Relational + **trees** (index tree) + **shallow typed links** (one hop; no graph store needed); **append-only versions**, published versions immutable | Longest-lived, most valuable data; not hard-deleted except for legal reasons |
| Prep | `Assessment` as a self-contained aggregate (scope, portions, strategy history); **append-only response log** per session; **mastery** keyed by (assessment, fact), updated per answer | Hottest writes |
| Rewards | **Append-only credit ledger**; balance derived | |
| Notifications | Preferences + delivery log | |
| Platform Config | Small, read-mostly configuration | Cached |

**Traceability:** every learner response records the exact **question version and rubric version** used (AC-C22; grader-vs-teacher agreement, AC-E9).

### Fact set of an assessment: re-resolved live
The `Assessment` keeps the scope as selected. Its fact set is re-resolved from the **current published catalogue** each time a session is planned. Mastery is keyed by a **fact ID that is stable across versions and re-anchoring**: an edited or re-anchored fact keeps its mastery; a split or merged fact gets new IDs and **carries its mastery over** (children of a split inherit the parent's estimate; a merged fact takes the lower of its parents' estimates); a removed fact drops out; a newly approved fact enters as unmastered (AC-C28, AC-C29, AC-P12).

### Content: facts, anchors and lineage
Adopted 2026-11-22.

```
Fact (aggregate; stable FactId; merge or split creates new IDs and records lineage)
 ├─ core: canonical statement, 1–2 paraphrases, type, key terms   (versioned)
 ├─ links
 └─ lineage: mergedFrom[] / splitFrom (retired FactIds)

SourceAnchor (aggregate; stable AnchorId; references one FactId; versioned)
      ├─ source: source document (+ metadata), page version, section, page region
      ├─ verbatim text as it appears there
      ├─ index node + CAPS cross-reference
      ├─ position type + importance signal
      └─ importance: tier + weight
```

- **A fact doesn't belong to a page; its anchors do.** Scope resolution goes scope → anchors on those pages or index nodes → their facts. Traceability (AC-C22) goes question → anchor(s) → fact → page version → upload → source document.
- **Fact candidates:** extraction never creates facts. It creates `FactCandidate`s, and Gate 1 resolves each one: approve as a new fact (mints a `FactId`), accept the proposed match (re-anchor or additional anchor on an existing fact), combine with other candidates, or reject. Rejected candidates never get a `FactId`, and combining candidates is not a merge (no lineage, no mastery). Paraphrases live inside the `Fact`, reviewed and versioned with it.
- **Two aggregates, two version streams:** the fact core and each anchor are versioned and reviewed independently. What is live for a fact is its live core version plus its live anchors. A draft never takes a live version offline: the previous approved version stays live until a new one is approved; only retiring or hiding removes it.
- **What a candidate matched to an existing fact can propose:** a new or moved anchor (light review: verbatim text, region, index node, importance); a change to the fact core (full Gate 1); or, unmatched, a new fact (full Gate 1).
- **Question live rule:** a question is live while its own approved version, the live core of each of its facts and the anchors it was written from are live. Work on another source never takes it offline.
- **Minor vs material fact-core edits:** whoever approves a fact-core edit marks it **minor** (its questions stay live and are queued for Gate 2) or **material** (its questions come out of the catalogue until Gate 2 clears them).
- **Links describe knowledge, not layout:** all link types are between facts and hold in every source. Page layout (body text repeating a margin keyword) is only the extraction signal for proposing *elaborates*. How a source presents a fact (e.g. as a margin keyword) lives on its anchor. Prep applies the elaborates gate only when the keyword fact is in the assessment's fact set.
- **No "duplicates" link:** where the same knowledge appears twice, it is one fact with two anchors.
- **Publishing is per item:** a fact, question or edit goes live as soon as its version is approved; there are no catalogue releases. Prep sees it from the next session plan; caches stay keyed by item version.
- **Page replaced:** extraction of the new page produces candidates; reconciliation (AI proposes, a teacher confirms) matches each to an existing anchor, which moves to the new page version and keeps its `AnchorId` and `FactId`. This **re-anchoring** gets a lightweight "confirm match" review; a changed canonical statement goes through full Gate 1, and its questions through Gate 2. Unmatched candidates become new facts; an old anchor with no match is resolved by a teacher (retire it, or re-anchor elsewhere); a fact left with no anchor is retired.
- **Additional source:** a new anchor is attached to the existing fact instead of creating a second fact (lightweight review).
- **Merge:** creates a new `FactId` that takes over **every anchor** of the merged facts; the old facts are retired with `mergedInto`. A merge or split counts as a **material** edit by default (its questions are held until Gate 2), unless the teacher marks it minor. **Split:** creates new `FactId`s; the teacher assigns or divides the anchors. Both publish lineage events, and the catalogue exposes lineage as the source of truth if an event is missed.
- **Mastery carry-over** (owned by `Mastery` in Prep, idempotent, for every active assessment holding the old facts): a split fact's children **inherit** its estimate; a merged fact takes the **lower** of its parents' estimates.
- **Effective importance** is defined once, in the catalogue's published contract: `effectiveImportance(fact, scope, anchorPreference?) → { anchor, tier, weight }`. With no preference, the **strongest anchor in scope** wins; with a preference (e.g. margin keywords only), the strongest anchor of that type wins, and a fact with no such anchor in scope drops out. Content uses it for generation defaults (AC-C13); Prep uses it for prep plans.
- **Questions record the anchor(s) they were written from.** Prep only uses questions whose anchors are in the source document the child is enrolled with for that subject. When a fact is merged or split, its questions are re-pointed to the new fact and go back through Gate 2.
- **Merge and split rewire links:** a merged fact takes the links of every merged fact, re-pointed to its new ID, and links between the merged facts are dropped; on a split, the teacher assigns each link to one of the new facts.
- **Coverage** includes, per source document, the facts in scope that have **no live question anchored in that document**; generation for that document closes the gap.

### Content: ingestion pipeline
Adopted 2026-11-22. Everything from upload to Gate 1 runs **automatically**; only question generation is curator-initiated (AC-C12).

```
0. Textbook setup   RegisterSourceDocument → UploadTableOfContents
                    → [AI] ProposeIndexTree (+ CAPS mapping) → ConfirmIndexTree
1. Intake           RegisterUpload(sourceFileId, revision, tags) → RenderPages
2. Reading          [AI] ReadPage → layout blocks + printed page number(s) + quality
3. Quality & place  PageQualityPolicy → Read | FlaggedForRephoto;  page number → index node
4. Extraction       [AI] ExtractCandidates → FactCandidates (anchor, importance signal, links)
5. Reconciliation   [search + AI] ProposeMatches → new / re-anchor / additional anchor
6. Gate 1           Review & Versioning
```

**PageVersion states**
```
Registered → Rendered → Reading → Read ─┬→ Placed → Extracting → Extracted → Reconciled → InReview → Resolved
                                        └→ FlaggedForRephoto (blur, skew, glare, cut-off)
any step → Failed (retried with backoff; after N attempts, a curator alert)
newer PageVersion of the same page → Superseded (unfinished AI work discarded)
```

- **Intake** is idempotent per (source file ID, revision). Pages are rendered to images in `MediaStore` (content-hashed) for reviewers and diagram crops; the AI reads the **original PDF pages**.
- **Page identity:** reading detects the printed page number(s). A photo of a **spread** is split into two page versions; a page whose number is unclear goes to a curator **"assign page number"** queue.
- **Index tree not a gate:** pages are read, extracted and reconciled before the index tree is confirmed. `IndexTreeConfirmed` (and every later tree correction) triggers **`PlacePages`** for all read page versions of that textbook: page → index node from the tree's page ranges; anchor → index node from its page and region, splitting a page at the headings captured during reading when a subtopic changes mid-page (an anchor spanning two pages goes by its start); the anchor's CAPS cross-reference comes from its node unless a teacher set one. Placement creates a new anchor version that is **auto-approved** (derived from a confirmed tree), or fills in a draft anchor. Unclear cases (no heading to split on, an anchor between nodes) and pages outside every range go to a curator **"unplaced"** queue, counted in coverage. **Anchors can go live before they are placed:** page-range scopes include them at once, index-node scopes once placed; Prep picks this up at the next session plan.
- **Extraction** runs per page with the neighbouring pages' transcripts as context; an anchor's region may span **two consecutive pages**.
- **Reconciliation** looks for a match first among the anchors on the superseded version of the same page, then among existing facts in the **same language and subject, across all grades** (`SimilarityIndex`), with an AI `MatchJudgement` proposing new / same / same with a core change. A teacher always confirms at Gate 1.
- **`ContentAI` port:** `submit(task, urgency) → TaskRef` and `collect() → [(TaskRef, Done(result) | Failed(reason))]`, for `IndexProposal`, `PageReading`, `CandidateExtraction`, `MatchJudgement`. The adapter picks batch or real-time from `urgency`, batches tasks, and translates results into Content types; prompts and provider IDs stay inside it.
- **Out-of-order results:** a collector job hands each result to its `Record…` use case. Each page version advances independently; recording is idempotent per (page version, task kind, attempt); results for a superseded page version are ignored.
- **Provenance:** every AI output records model, prompt version and cost, so pages can be re-extracted with better prompts (through the same reconciliation path) and cost is known per textbook.

### Content: question generation
Adopted 2026-11-23. Generation is decoupled from uploads: a run selects **approved facts**, however and whenever they were approved.

```
StartGenerationRun(selection, mode, options, urgency)        ← curator only (AC-C12)
  → resolve: approved facts with live anchors in the selected sources
  → defaults: effectiveImportance + fact type → GenerationDefaultsPolicy
  → curator overrides (counts per fact, types, basis, anchor preference)
  → [AI] QuestionGeneration tasks via ContentAI (Batch API for large runs, real time for small or urgent ones)
  → RecordGeneratedQuestions: validate → model-answer check → derive mechanical rubrics → duplicate check
  → draft Questions → Gate 2 (judgement types: full queue; mechanical: the run's ReviewBatch per source document)
```

- **Fact selection** (any source documents): **ready for questions** (approved facts with a live anchor that has no questions yet), **approved since** a date or the last run, **by structure** (source documents, index nodes, page ranges), or **hand-picked**. Facts still in Gate 1 are skipped and picked up by a later run.
- **Per anchor:** questions are written from anchors, so a fact with anchors in two selected sources gets questions for each.
- **Units:** single facts (definitions, multiple choice, true/false, fill in the blank, "why"); **fact groups** for ordering and missing-step questions (one *part of* group) and paragraph questions (several linked facts). Every fact in a group needs a live anchor in the same source.
- **Basis:** paraphrase (default) or **verbatim, meaning the anchor's verbatim text** (the wording in that textbook), not the canonical statement.
- **Draft question** carries type, proposed difficulty, fact IDs, **anchor IDs**, basis, model answer citing its facts, and rubric in the catalogue contract's format.
- **Checks:** schema validation; a second AI pass checks **every** model answer contains nothing beyond its source facts (AC-C15a), failures dropped and counted; **mechanical rubrics are derived by code** from the question (correct option, sequence, blank, partial credit for ordering), never written by the AI.
- **Duplicates:** existing questions on the same facts, **including rejected ones**, are sent to the AI as "avoid these"; afterwards a `SimilarityIndex` check drops anything too close, and logs it.
- **Modes:** **generate more** keeps existing questions and adds new ones (AC-C16); **regenerate** creates new drafts for the selected facts and **retires the old questions only once their replacements pass Gate 2**, so a fact is never left without live questions (use after a material edit, a better prompt or a rubric format change).

### Content: the live catalogue
Adopted 2026-11-23. Content is **ready for consumption** when it is in the live catalogue.

- **A stored projection** (read model) inside Content, updated from `VersionApproved`, `ItemHeld`, `ItemReleased` and `ItemRetired`, and rebuildable from scratch. It **stores liveness**: on every change, the dependent items are recalculated, so Prep reads a plain live set.
- **Liveness rules:** a fact is live while its core version is approved and it is not held or retired; an anchor while its own version is approved and its fact is live; a link while both its facts are live; a question while its own approved version is not held or retired, its facts' cores are live and the anchors it was written from are live.
- **Published interface:**
```
resolveScope(sourceDocument, scope, anchorPreference?)
  → FactRef[] { factId, effectiveImportance {anchorId, tier, weight},
                anchors in scope {anchorId, page number, index node}, links, lineage }

sessionBundle(sourceDocument, factIds, constraints)
  → LiveQuestion[] { questionId, version, type, prompt, options, diagram crop URL,
                     modelAnswer, rubric + rubricVersion, factIds, anchorIds, difficulty }

lineage(factIds) → mergedInto / splitInto
reportProblem(questionId, version, reason)
```
- **Never returned:** verbatim text, page images, drafts or review state (AC-C24). **Page numbers and index nodes are returned**, so Prep can point a child to their own textbook pages (Incremental "learn").
- **Caching:** approved versions never change, so items are cached by (ID, version) with no invalidation; scope resolution queries the projection directly (about 180k facts).

### Content: review and versioning
Adopted 2026-11-22. One general **Review & Versioning** module (consolidation S10) serves every versioned item: the **fact core**, each **source anchor**, each fact's **link set**, and each **question** (with its model answer and rubric versioned together). A `FactCandidate` is not versioned; it is resolved once.

| State | Values | Kept |
|---|---|---|
| **Version state** (per version) | Draft → In review → Approved, or Rejected; an approved version becomes Superseded when a newer one is approved | Stored, append-only |
| **Item availability** (per item) | Live; **Held** with a reason (≥3 open problem reports; material edit awaiting Gate 2); **Retired** | Holds and retirement stored; whether dependencies are live is **computed** in the catalogue projection |

```
propose(item, content, basedOn: version) → draft version
submit(version)                          → enters the queue its policy chooses
approve(version, reviewer, edits?, editImpact?)
reject(version, reviewer, reason)
hold(item, reason) / release(item, reason) / retire(item, reason)
liveVersion(item)
```

- **Policies per item type** decide review depth, the reviewer role and what approval triggers: **Gate 1** (full) for fact cores and new facts; **light review** for anchors and link sets; **Gate 2** for questions (judgement types fully reviewed; mechanical types in one `ReviewBatch` per generation run and source document, sampled).
- **One draft at a time per item.** A further edit joins the open draft or waits. Approving a draft based on version N when N+1 is live is refused; the editor rebases.
- **Reviewers may approve their own edits** made while reviewing (AC-C10). Edits made outside review (e.g. by a curator) go to a reviewer's queue.
- **Minor / material** applies to fact-core and link-set edits: material (e.g. adding or removing a step in a *part of* group) holds the affected questions until Gate 2; minor keeps them live and queues them for Gate 2.
- **A draft never takes a live version offline;** only a hold or retirement does. Rolling back approves a new version copying an old one.
- **Every transition is logged** (who, when, from, to, reason).
- The module publishes `VersionApproved`, `ItemHeld`, `ItemReleased`, `ItemRetired`; the catalogue projection and its per-version cache update from them.

### Marketing: campaigns, attribution and ad platforms
Added 2026-11-24. Campaign strategy: [../marketing/CAMPAIGN-PLAN.md](../marketing/CAMPAIGN-PLAN.md).

**Internal packages** (one bounded context, one published interface):
| Package | Owns | Notes |
|---|---|---|
| **Campaigns** | `MarketingCampaign` with its phases, budgets, key messages and channels | One campaign per school term; phases follow the term (holiday → warm-up → base → ramp → push, ending at the assessment deadline) |
| **Acquisition** | `Partner`, `LandingLink`, `Touchpoint`; attribution of a sign-up to its touchpoints | A visit's tags and ad click ID are captured first-party at the landing page and stored with the touchpoint; linked to the `BrandMembership` at registration |
| **Ad platforms** | Translators `AdInsightsSource`, `ConversionSink`, `AudienceSink`; mapping table of platform IDs | Only package that knows Meta's terms |
| **Reporting** | Read models: cost per sign-up by campaign, phase, channel and ad; landing-page conversion; checkout drop-off; weekly report | Built from Marketing's own data plus Billing's lifecycle events; partner reports live here too |

**Signals to the ad platform** (user decisions, 2026-11-24):
| Moment | Source | Ad-platform event | Path |
|---|---|---|---|
| Checkout started (redirect to the payment provider) | Billing `CheckoutStarted` | `InitiateCheckout` | **Server** (`ConversionSink`); no browser tag anywhere |
| First successful payment activates the subscription | Billing `SubscriptionStarted` | `Subscribe` (value = fee charged, ZAR) | **Server** (`ConversionSink`) |
| Cancelled | Billing `SubscriptionCancelled` | custom `SubscriptionCancelled` | Server |
| Suspended | Billing `SubscriptionSuspended` | custom `SubscriptionSuspended` | Server |
| Reactivated | Billing `SubscriptionReactivated` | custom `SubscriptionReactivated` (**never** a second `Subscribe`) | Server |
| Audience segments (active / cancelled / suspended) | Marketing, from Account + Billing | Customer-list upload of **every Parent user's email on the account**, hashed (SHA-256, normalised) in the adapter | Server, daily sync; removals on erasure or withdrawn consent |

**Rules.**
- **No child data ever leaves the system:** only Parent users' hashed emails (and phone, if held) and the account's ID as `external_id`.
- Events and uploads are sent **only for accounts with marketing-measurement consent** on the brand membership; a privacy-notice line explains it (POPIA). Withdrawal or erasure removes the account's users from every audience.
- Each delivery uses the source domain event's ID as the ad platform's `event_id`, so retried deliveries are removed by the platform; deliveries go through an outbox like every other cross-context effect.
- The **spend import** is a scheduled batch (daily, the previous 7 days re-imported to absorb late corrections), idempotent by (platform, ad, day).
- **No ad-platform browser tag** (no Meta Pixel) on any page, in line with [TECH-STACK.md](../TECH-STACK.md) "no third-party analytics SDK on any screen" (user decision 2026-11-24). Every ad-platform event is sent from Slaag's server. Matching uses the ad click ID captured first-party on the `Touchpoint` (sent as the platform's click identifier, e.g. `fbc` built from `fbclid`), the Parent user's hashed email, the account ID as `external_id`, and the request's IP address and user agent recorded with the event. Landing-page views are measured from touchpoints, not sent to the ad platform.

### Paths that must not race (serialized writes)
Every rule is enforced **explicitly**, by a conditional update, a uniqueness rule or a per-aggregate version check. None relies on the store's default isolation level.

| # | Invariant | Race | Enforcement |
|---|---|---|---|
| 1 | ≤ 3 Child members per account | Two concurrent "add child" requests each see 2 | Writes to the `Account` aggregate are serialized |
| 2 | Link code single use | Two devices redeem at once | Conditional update unused → used |
| 3 | One User per verified email | Concurrent sign-ups with different methods | Uniqueness on normalised email |
| 4 | Each provider event applied once; no backward moves | Repeated or out-of-order webhooks | Event ID recorded in the same transaction as the state change; writes to each `Subscription` serialized; reconciled against the provider-reported status |
| 5 | One overdue + one suspension email per episode | Retried webhook sends a second email | Email intent recorded in the same transaction as the status change (outbox), sent with an idempotency key |
| 6 | Offer sign-up cap | Last places taken twice | Conditional increment on the offer |
| 7 | Offer discount once per account per brand | Concurrent checkouts | Uniqueness on (account, brand) |
| 8 | One suggested next session; parent's strategy choice wins | Parent and child edit at once | Version check on `Assessment` |
| 9 | Missed vs Started | Child starts while the missed-session job runs | Conditional Scheduled → Missed only if not started |
| 10 | Each answer counted once in mastery | Background answer sync retries | Client-generated response ID; response and mastery update in one transaction |
| 11 | LLM cost cap per session | Two borderline answers at once | Conditional increment on the session's spend |
| 12 | Credits once per activity | Redelivered event | Triggering event ID is the ledger entry key |
| 13 | A revoked device can't obtain a new access token | A refresh races the revocation | Refresh is a conditional check against the `LinkedDevice` record (only non-revoked devices get a token). Requests themselves are verified from the 30-minute access token alone, with no store lookup, so a revoked device keeps working for **at most 30 minutes** |
| 14 | Suspension blocks children immediately | Stale copy of Access | Access read from Billing's published query at request time; never copied |
| 15 | `SubscriptionStarted` once per subscription; reactivation never counts as a sign-up | First payment webhook redelivered, or a reactivation payment | Flag "has started" set in the same transaction as the event in the outbox; later activations publish `SubscriptionReactivated` |
| 16 | Each lifecycle event sent to the ad platform once | Outbox redelivery | Delivery keyed by the source event ID; the same ID sent as the platform's `event_id` |

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
| Partner reports, marketing reports (cost per sign-up, conversion, checkout drop-off) | Scheduled batch, daily, after the ad-spend import (Marketing › Reporting) | ≤ 24 h |
| Audience segments uploaded to the ad platform | Scheduled batch, daily; removals within 24 h | ≤ 24 h |
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
| Content | `ContentCatalogue` (see [Content: the live catalogue](#content-the-live-catalogue)): resolve scope (facts with in-scope anchors and `effectiveImportance`), session bundle (questions anchored in the child's source document), fact lineage, report a problem; back office: upload, review, re-anchor, generate, publish | AI pipeline, versioning, review gates, page reading, reconciliation, image storage |
| Billing | checkout (optionally with an offer), handle provider event, cancel, reactivate, start card update, `access(membership)`; offers in the back office; publishes lifecycle events | Lifecycle state machine, provider quirks, discounts, reversion |
| Marketing | record touchpoint, attribute sign-up, campaign/partner/landing-link management (back office), reporting queries; handlers for Billing and Account events; scheduled spend import and audience sync | Ad-platform APIs and terms, hashing, delivery retries, attribution rules |
| Identity & Access | sign-in flows, issue/redeem link code, refresh device access token, revoke device, authenticate request | Provider sign-in, credentials, token issuing and verification, rate limits |
| Account | register, add member (Parent or Child), enrol subject, set consent, directory queries | Consent, memberships, roles, schools |
| Notifications | `notify(recipient, alertType, payload)` + event handlers, set mutes | Channels, devices, templates, digest |
| Rewards | event handlers, set goal, balance/goal queries | Credit table, levels, streaks |
| Platform Config | resolve brand, resolve language, `Messages.render(messageKey, params, {brand, language})` | Brand records, fallback rules, message catalogues |

### Consolidations
| # | Smell avoided | Where | Design |
|---|---|---|---|
| S1 | Planning split into steps by time, as thin classes sharing the same knowledge | Prep | One deep **`PrepPlan`**: `plan(assessment, mastery, today) → decision {strategy, portion, nextSession, messageKeys}`; strategies are plug-ins inside it (AC-E20); runway never leaves it |
| S2 | Grading knowledge leaking through the rubric format between Content and Prep | Content ↔ Prep | One **`Marking`** module in Prep: `mark(liveQuestion, answer, sessionBudget) → Verdict` for all question types; the rubric format is defined once, versioned, in the content catalogue's published contract |
| S3 | Importance semantics duplicated across runway, selection, spacing, last-minute exclusion, readiness, weak keywords | Prep (+ catalogue contract) | Choosing which anchor's importance applies is **`effectiveImportance`**, defined once in the catalogue contract and used by both Content (generation defaults) and Prep. One **`Importance`** policy in Prep turns the effective tier + weight into priority, spacing and readiness weight; Content only assigns tiers and weights per anchor |
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
| `ConversionSink`, `AudienceSink` (ad platform, outbound) | Marketing | 2 (needed before the first campaign) |
| `AdInsightsSource` (ad platform, inbound) | Marketing | 3 (repo script bridges until built) |
| `SourceRepository` (source PDFs by file ID + revision) | Content | 2 |
| `SimilarityIndex` (meaning-based search: reconciliation, duplicate questions) | Content | 2 |

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
| New ad platform (e.g. Google Ads) | Marketing › Ad platforms adapters only | Ad-platform contract tests |
| New member role (e.g. Teacher) | Account (role + invariants) + authorisation at the edge | Role contract tests |

## v1 Scope & Staging
Signed off 2026-11-16 (Phase 8). The time is fixed (pilot January 2027, launch February 2027); scope was cut to fit, never the expensive-to-reverse decisions.

**Never cut (expensive to reverse; all in v1):** brand and language resolved at the edge, with no hard-coded text or brand; one parent identity across brands with per-brand memberships; stable fact and anchor IDs, fact lineage with mastery carry-over, immutable content versions, responses recording question and rubric versions; outbox, idempotency and the 16 no-race invariants; Access plus the four subscription lifecycle facts as Billing's only published language; device linking; POPIA consent (including marketing-measurement consent) and self-service account deletion; outcomes (Results, strategy history) recorded from day 1; touchpoints and lifecycle events recorded from the first campaign.

| Stage | In scope |
|---|---|
| **Before the first marketing campaign (target 5 January 2027, moves with product readiness)** | Marketing minimum: `Touchpoint` capture on landing pages and at registration; `SubscriptionStarted` / `Cancelled` / `Suspended` / `Reactivated` published by Billing and delivered as ad-platform events through `ConversionSink`; `CheckoutStarted` published by Billing and sent as `InitiateCheckout` from the server; daily audience sync of Parent users' hashed emails through `AudienceSink`; marketing-measurement consent and privacy-notice line. The weekly spend import runs as a repo script until `AdInsightsSource` is built |
| **Pilot (January 2027)** | Parent sign-in and identity linking; accounts, members and roles, learner profiles, schools, subjects; device linking. **Full billing lifecycle** (pilot is paid): checkout, webhooks, Overdue → Suspended → reactivation, cancellation, card update and expiry warnings. **Content pipeline** for the **most-used textbook per subject per grade, Term 1**, including the **AI index-tree proposal** from the table-of-contents photo and **meaning-based duplicate detection** for "generate more questions"; simple back-office tools (one-by-one importance edits, coverage as a table of counts). **Prep:** all three strategies (Incremental, Standard, Last-minute), every technique, a **simple mastery rule** behind `Mastery`, the two-step grader. Per-event alerts, missed-session detection, parent dashboard. **Full gamification** (credits, celebration, streaks, levels, badges, cosmetics, parent reward goals). Brand and language seams |
| **Launch (February 2027)** | The other launch textbooks (Term 1). **Landing links and codes** (Marketing): managed `LandingLink`s with tagged URLs, codes and QR codes, recorded as touchpoints and attributed to sign-ups (tagged URLs alone already work from the first campaign). **Weekly digest**. *Partners, offers, discounts, membership numbers, fee reversion and partner reporting moved after launch (D8, 2026-11-24).* |
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
| D8 | Partners and offers: `Partner`, `Offer`, discounts at checkout, membership numbers, **automatic fee reversion** (AC-A33), partner reporting (AC-A35) | `Offer` and `Partner` aggregates designed; `LandingLink` can refer to an Offer by ID; `SubscriptionStarted` carries an optional offer ID; subscription fee history append-only | First partner agreement signed, or a decision to run an offer | User | P2 |

## Decision Log
| Date | Decision | Why | Alternatives rejected |
|---|---|---|---|
| 2026-11-16 | **Modular monolith:** one deployable codebase and one system of record, with strict module boundaries; background work may run as a separate process from the same codebase | One small team; no proven context seams yet; keeps refactoring across modules cheap | Separate services (e.g. Content and Prep Engine deployed alone): operational load for one team, and a distributed monolith if seams are wrong |
| 2026-11-16 | **Dependency Rule enforced through ports owned by use cases;** full boundaries at inbound adapters, data store, payment provider, AI content provider and LLM grader; partial at notifications, identity, object storage and clock; collapsed for plain reference data | Full boundaries go where change or vendor risk is likely; the rest avoids ceremony | Collapse the data-store boundary (core not testable without the store); full boundaries everywhere (ceremony with no protection) |
| 2026-11-16 | **Brand and language resolved at the edge;** the core handles IDs and message keys only | Multi-brand and multi-language from day 1 without code changes (PRD AC-B1, X1) | Brand/language checks inside use cases (leaks "Slaag" and language assumptions inward) |
| 2026-11-16 | **Modules interact only through published use cases and domain events** | Keeps future service seams open; prevents a shared-data monolith | Shared access to tables across modules |
| 2026-11-16 | **Eight bounded contexts:** Prep, Content, Family, Billing & Campaigns, Identity & Access, Rewards, Notifications, Platform Config. *Revised 2026-11-24: nine contexts; Family → Account, Billing & Campaigns → Billing, new Marketing (see below).* | Each has its own language and changes for its own reasons | One unified model (contradictory "Child", "Subscription", "Fact") |
| 2026-11-16 | **Planner and Prep Engine merged into one Prep context** | They share Assessment, Session, Mastery, Strategy and Portion with one meaning; splitting forces a shared kernel | Two contexts with a shared Assessment/Mastery model |
| 2026-11-16 | **Content is one context exposing a published content catalogue** of approved live versions | Prep must never see drafts or pages; one context keeps versioning and publishing together | Separate Authoring and Catalogue contexts (more moving parts for one team) |
| 2026-11-16 | **Core domain = Prep + Content's fact model** (importance, links, model answers, rubrics); ingestion/review workflow, Family, Billing, Rewards, Platform Config are supporting; sign-in, payment processing, email/push, AI providers are generic | The engine is only as good as the facts it drills | Prep alone as core (under-invests in fact quality) |
| 2026-11-16 | **Billing publishes only Access;** subscription states and provider terms stay inside Billing behind a translation layer. *Revised 2026-11-24: Billing also publishes four lifecycle facts (see below); the state machine and provider terms still stay inside.* | Keeps provider quirks (failed-attempt webhooks, paused status) out of every other context | Other contexts reading subscription status |
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
| 2026-11-16 | **In the pilot by user choice:** all three strategies, full gamification, AI index-tree proposal, meaning-based duplicate detection; **by launch:** fee reversion, full partner reporting, campaigns, weekly digest. *Revised 2026-11-24: partner and offer features moved after launch (D8).* | User decisions | Deferring these to launch or after launch |
| 2026-11-16 | **Not built for v1 (deferred with triggers):** per-child tuning, statistical knowledge tracing, "label the diagram" questions, retention deletion job, second-brand rehearsal, bulk importance edit, full coverage dashboard; see [Debt Ledger](#debt-ledger) | No data, no users or no deadline needs them before launch; each keeps its seam | Building them before the pilot |
| 2026-11-16 | **Mastery starts as a simple, explainable rule** behind the `Mastery` interface | Nothing to fit a statistical model to before the pilot; the interface doesn't change when it is swapped | Statistical knowledge tracing before the pilot |
| 2026-11-16 | **No circuit breaker:** if pilot readiness is at risk, the pilot date moves rather than scope | User decision | Pre-agreed order of cuts from pilot to launch |
| 2026-11-22 | **Facts have one or more source anchors;** a source is a source document with its metadata, page version, section and region; each anchor holds its own verbatim text and its own importance; the fact holds one canonical statement. See [Content: facts, anchors and lineage](#content-facts-anchors-and-lineage) | Fact IDs (and mastery) survive re-photographed pages and additional sources; importance can differ by source and be chosen at consumption | Facts owned by one page (re-upload resets mastery); importance per fact (loses source-specific signals) |
| 2026-11-22 | **Re-anchoring keeps fact and anchor IDs and gets a lightweight review;** a changed canonical statement still gets full Gate 1 | Teacher time goes to real changes | Full Gate 1 for every fact on a replaced page |
| 2026-11-22 | **Merge and split create new fact IDs, record lineage and carry mastery over:** split children inherit, a merge takes the lower estimate; a merged fact keeps all anchors of the facts it replaces | Mastery continuity is crucial (user decision); the lower estimate never overstates readiness | Starting fresh (replaces the 2026-11-16 rule); keeping one old ID on merge |
| 2026-11-22 | **`effectiveImportance` is defined in the catalogue contract:** strongest anchor in scope, or strongest anchor of a preferred type | One rule shared by question generation and prep | Separate rules in Content and Prep |
| 2026-11-22 | **Questions record their anchors; prep only uses questions anchored in the child's enrolled source document** | Questions stay textbook-specific while facts and mastery are shared across sources | Questions tied only to facts |
| 2026-11-22 | **`SourceAnchor` is its own aggregate,** versioned and reviewed apart from the fact core; a question is live while its own version, its facts' cores and the anchors it was written from are live | One source can go live while another is in review; teachers on different sources of one fact don't conflict | Anchors inside the `Fact` aggregate (a draft anchor would make the whole fact a draft) |
| 2026-11-22 | **Fact-core edits are marked minor or material** when approved: minor keeps its questions live (queued for Gate 2), material takes them out until Gate 2 | A typo fix shouldn't pull questions; a changed meaning must | Always keep live; always take out |
| 2026-11-22 | **Ingestion runs automatically from upload to Gate 1,** per page version, through `ContentAI` submit/collect; results are recorded idempotently in any order and carry model, prompt version and cost. See [Content: ingestion pipeline](#content-ingestion-pipeline) | Batch results arrive out of order and hours later; teachers shouldn't wait on each other; re-extraction with better prompts stays possible | Curator-triggered steps; request/response AI calls |
| 2026-11-22 | **Pipeline rules:** spreads are split and unclear page numbers go to a curator queue; extraction sees neighbouring pages and an anchor may span two consecutive pages; reconciliation searches the same language and subject across all grades; pages are read and extracted before the index tree is confirmed and placed once it is; rendered page images for people, original PDF pages for the AI | User decisions | Blocking uploads on the index tree; per-grade matching; AI reading rendered images |
| 2026-11-23 | **Content open points resolved** ([CONTENT-CONTEXT.md › Open points](CONTENT-CONTEXT.md#11-open-points)): merge/split is material by default (questions held until Gate 2) unless marked minor; regenerated questions retire the old ones per fact once one replacement is approved and the run's drafts for that fact are resolved; teacher reviewers retire facts and resolve orphaned anchors, teachers and curators may retire questions; index tree corrections re-run placement | A changed fact's questions aren't drilled unchecked; a fact never loses its live questions; retiring knowledge stays with teachers | Always keep questions live; retire old questions as soon as one replacement is approved |
| 2026-11-23 | **The live catalogue is a stored projection** inside Content, updated from Review & Versioning events and rebuildable; liveness is stored and recalculated for dependants on each change; Prep gets page numbers and index nodes, never verbatim text or page images. See [Content: the live catalogue](#content-the-live-catalogue) | Simple, fast reads on the hot path; Incremental needs "study pages 12–14" | Liveness computed per query; index nodes only |
| 2026-11-23 | **Question generation runs take a fact selection across any sources,** decoupled from uploads; Gate 2 batches per run and source document; modes generate more and regenerate (old questions retired only after replacements pass Gate 2); verbatim means the anchor's text; rejected questions count as duplicates; mechanical rubrics derived by code; every model answer AI-checked. See [Content: question generation](#content-question-generation) | Curation takes weeks across many PDFs; sampling stays meaningful per textbook; facts never lose their live questions; exact, repeatable mechanical marking | Runs tied to uploads or one source; one batch per run; regenerate that retires old questions first |
| 2026-11-23 | **Placement is a separate, repeatable step** run when the index tree is confirmed or corrected; it splits pages at headings, is auto-approved, sends unclear cases to a curator queue, and anchors may go live before they are placed | Uploads and Gate 1 never wait for the tree; a person already confirmed the tree, so re-reviewing derived placement adds nothing | Blocking uploads or approvals on the tree; reviewing each placement |
| 2026-11-22 | **Review & Versioning:** one draft at a time per item; one Gate 2 batch per generation run (refined 2026-11-23: per run and source document); reviewers may approve their own edits made while reviewing; version state stored, dependency liveness computed. See [Content: review and versioning](#content-review-and-versioning) | No silent overwrites; a run is already one scope in one textbook; matches how Gate 1 works (AC-C10) | Parallel drafts with merging; batches per textbook; four-eyes on every edit |
| 2026-11-22 | **Fact links get their own version stream** (one `FactLinkSet` per fact, light review, minor/material applies) and stay **between facts**, independent of source; layout is only the extraction signal for *elaborates* | Link edits don't disturb wording; links describe knowledge, anchors describe presentation | Links inside the fact core; unversioned links; *elaborates* between anchors |
| 2026-11-22 | **Publish per item:** each fact, question or edit goes live as soon as its version is approved | Content reaches children as fast as teachers approve it; caching stays per item version | Catalogue releases per textbook |
| 2026-11-22 | **Extraction produces `FactCandidate`s;** a `Fact` and its `FactId` exist only after Gate 1 approval; paraphrases sit inside the `Fact` | Rejected drafts never consume IDs; reconciliation proposals have a natural home; the core fact model holds only approved knowledge | Draft facts in a draft state (IDs for rejected drafts, review state inside the core model) |
| 2026-11-22 | **The "duplicates" fact link is dropped;** restatements become additional anchors on one fact | One fact, one mastery record; no link semantics to share | Keeping a duplicates link alongside anchors |
| 2026-11-24 | **Family → Account.** An Account is the customer, a higher-order construct whose holder is an individual today and may be an organisation later; Users belong to it as members with a role (Parent, Child; later e.g. Teacher); at most 3 Child members. A Child member's grade, school and subjects live in a separate `LearnerProfile` aggregate | Generic enough for companies, schools and tutors later; roles instead of fixed "parent/child" types; school edits don't serialize the account | "Family" (household-only); grade and subjects inside the Account aggregate |
| 2026-11-24 | **Identity & Access speaks of Users;** "account" means only the customer account; account linking → identity linking; staff roles → permissions | One meaning per word across contexts | "Account" for both sign-in identity and customer |
| 2026-11-24 | **New Marketing bounded context** with internal packages Campaigns, Acquisition, Ad platforms and Reporting. Owns marketing campaigns per school term (phases), partners, landing links, touchpoints, attribution, ad-platform integration and marketing/sales-ops reporting | A new language (spend, touchpoint, attribution, phase) that changes for its own reasons; a context is named after its capability, not one entity | "Campaign" as the context name (collides with ad-platform campaigns and organic acquisition has no campaign); attribution inside Family or Billing |
| 2026-11-24 | **Billing & Campaigns → Billing; its `Campaign` becomes `Offer`.** Partners, landing links, codes and partner reporting move to Marketing; the discount, discount period and fee reversion stay in Billing; Marketing refers to an Offer by ID | "Campaign" meant three things; *where families come from* (Marketing) is separate from *what they pay* (Billing) | Keep partners in Billing; move discounts to Marketing |
| 2026-11-24 | **Billing publishes subscription lifecycle facts:** `SubscriptionStarted` (exactly once, first successful payment), `SubscriptionCancelled`, `SubscriptionSuspended`, `SubscriptionReactivated`; plus `CheckoutStarted` for funnel reporting | `AccessGranted` doesn't equal a sign-up (it also fires on reactivation); the ad platform and reporting need explicit facts | Inferring sign-ups from `AccessGranted`; exposing subscription status |
| 2026-11-24 | **Ad-platform signals (Meta, Conversions API):** `Subscribe` on `SubscriptionStarted`; custom `SubscriptionCancelled` / `Suspended` / `Reactivated` from day one; `InitiateCheckout` on `CheckoutStarted`; **all sent from Slaag's server, no browser tag (no Pixel)**; daily upload of **every Parent user's hashed email** per audience segment. Never child data; only with marketing-measurement consent | Optimise ads on real sign-ups; retarget checkout drop-offs; lifecycle data ready for future targeted campaigns; exclude active subscribers | Paid ad-management connector; optimising on clicks; account-holder email only |
| 2026-11-24 | **Partners and offers move after launch (D8); landing links and codes stay in the launch** | Partners are no longer a key channel and Term 1 runs with no offer; frees build time before February and removes the riskiest billing step (recurring amount change) from the launch path, while the campaign keeps tracked links and codes | Build all partner and offer features by launch; drop landing links too |
| 2026-11-24 | **Free ad-platform Marketing API** for the spend import (weekly report), first as a repo script, later as `AdInsightsSource` | No connector fee; the money goes to ad spend (user decision) | Paid connector (~$49/month); manual CSV export |
| 2026-11-22 | **"Inbound adapters" and "outbound adapters"** name the two halves of the adapter ring; our own apps go through inbound adapters like any outside caller, as one thin translation step | Names the direction of each edge; the Android app runs on untrusted devices with old versions in use, and several channels share one set of use cases | "Delivery" (doesn't say inbound), "driving/driven adapters" (less obvious), "interface layer" (clashes with TypeScript `interface`), "gateway" (usually means outbound) |
