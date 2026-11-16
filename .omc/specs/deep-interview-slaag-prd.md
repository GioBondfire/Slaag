# Deep Interview Spec: Slaag — Year-1 PRD (Afrikaans Test & Exam Prep for Grades 4–7)

## Metadata
- Interview ID: b7e4c2a1-5f3d-4e8a-9c61-2d0f8a7b3e15
- Rounds: 20 (plus Round 0 topology); hard cap reached
- Final Ambiguity Score: 12%
- Type: greenfield
- Generated: 2026-11-14T00:40:22Z (first version 2026-11-13 after Round 13; refined through Rounds 14–20)
- Threshold: 0.2
- Threshold Source: default
- Initial Context Summarized: no
- Status: APPROVED (2026-11-14T00:45:29Z); amended 2026-11-16 (Amendment 1: child access; Amendment 2: language-driven experience; Amendment 3: multi-brand platform; Amendment 4: prep strategies by lead time; see Amendments)

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.90 | 0.40 | 0.360 |
| Constraint Clarity | 0.89 | 0.30 | 0.267 |
| Success Criteria | 0.83 | 0.30 | 0.249 |
| **Total Clarity** | | | **0.876** |
| **Ambiguity** | | | **0.124** |

## Topology
Confirmed in Round 0 (2026-11-10). Platform note: native store apps were first deferred, then brought into year-1 scope in Round 3 as hybrid apps.

| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|-------------|--------------------------|
| Accounts & Family Setup | active | Parent social login, family subscription via PayFast (web-only checkout), parent-owned child accounts, school/grade/province/textbooks, account lifecycle | AC-A1…A20 |
| Content & Question Bank | active | Hybrid CAPS-topic bank + per-textbook page maps and overrides; AI-drafted, teacher-approved through a back office | AC-C1…C11 |
| Test/Exam Planner | active | Add test/exam (date + scope), parent review/edit, rule-based next-session suggestion, post-test rating and marks | AC-P1…P12 |
| Prep Session Engine | active | Full adaptive engine with every technique; two-step grading of written answers | AC-E1…E12 |
| Parent Oversight & Alerts | active | Email + push alerts, missed-session detection, weekly digest, per-child dashboard | AC-O1…O7 |
| Child Experience & Gamification | active | Fun, low-stress Afrikaans UX; in-app credits, levels, badges, streaks, cosmetics; parent reward goals | AC-G1…G9 |
| Schools / teachers / tutors | deferred | Group subscriptions, flipped classroom, pre/post quizzes, tutor assessment | Deferred by user in Round 0 (2026-11-10): long-term opportunity, not year 1. (Schools are captured as **reference data** only; see AC-A18.) |
| English-speaking users | deferred | Expansion beyond Afrikaans communities | Deferred by user in Round 0 (2026-11-10): year 1 is 100% Afrikaans. Per Amendment 2, the platform is built to support languages from day 1 (AC-X1…X8), so English can later be switched on without rework. Per Amendment 3, English may launch as a **separate brand on its own domain** on the same platform. |
| Non-education extensions | deferred | Other Slaag Group businesses for Afrikaner households | Deferred by user in Round 0 (2026-11-10) |

## Goal
Slaag ("pass/succeed") is the first business of Slaag Group, a platform for Afrikaans-speaking families in South Africa. In year 1, Slaag helps parents of Grade 4–7 children prepare their children for school **tests** (small, during term) and **exams** (end of term, consolidated), replacing last-minute, stressful manual quizzing from the textbook.

A parent subscribes on the web (PayFast) and enrols up to 3 children with their school, grade, province and the textbook for each subject. The parent or child adds an upcoming test or exam with its date and scope (content-tree selection or page ranges). Slaag suggests the next prep session one at a time. An adaptive engine diagnoses gaps and drills the child towards mastery, using multiple-choice and written questions graded instantly against teacher-approved model answers. Parents get honest visibility into planned, missed and completed sessions and readiness. Children get a fun, encouraging, gamified experience. Content is produced through an AI-drafting, teacher-review back office. The closed pilot is in **January 2027** and the production launch in **February 2027**.

## Constraints
**Platform & tech**
- Single codebase: a **TanStack Start** web app, responsive for laptop and mobile browsers, wrapped with **Capacitor** into store apps (Google Play priority, plus Apple App Store).
- Push notifications to parents and children come through the store apps; parents also get email. **No WhatsApp.**
- Runs smoothly on 2 GB RAM Android phones; a 15-min session uses < 5 MB of data.
- Learner data is **hosted in South Africa** (a local cloud region).

**Accounts & billing**
- Parents sign in **only** with Google, Microsoft or Apple. **Children have no sign-in details of their own** (no social login, password or PIN). A child gets in only through a **device the parent has linked** with a one-time code or QR code (Amendment 1).
- **Flat fee per family, up to 3 children**; the rand amount is a config value.
- **PayFast** onsite checkout; first charge pro-rata, then recurring billing on the **2nd**; card update started from Slaag.
- **Checkout is web-only** (the "reader app" approach): the store apps show no purchase buttons, prices or payment links.
- Lifecycle: failed payment → email + retries, a **7-day grace period**, then child access paused (data kept). Cancellation → access to the end of the paid month, then paused. Paused accounts keep their data **12 months**, then it is deleted after a **30-day warning email**. A parent can delete the whole family account themselves at any time.
- **POPIA**: the parent's consent for processing children's data is recorded at registration.

**Content**
- Launch coverage: **Grades 4–7**, Natuurwetenskappe & Tegnologie (NS in Gr 7), Sosiale Wetenskappe (Geskiedenis + Aardrykskunde), EBW (Gr 7); the 2–3 most-used Afrikaans textbooks for each; all 4 terms.
- Hybrid model: a shared CAPS-topic bank, plus per-textbook page→topic maps, plus per-textbook overrides of definitions and model answers.
- AI drafts from textbook copies Slaag owns; contracted Afrikaans teachers approve every item in a web-only back office.
- A preloaded list of **~2,000 schools** is maintained as reference data.

**Engine**
- **All** techniques in the first release. Adaptive Learning (paradigm), Knowledge Tracing (learner model) and Spaced Retrieval (reinforcement) are kept distinct.
- Each test or exam stands alone: mastery is tracked per assessment. Marks tune per-child engine behaviour only.
- **Two-step grader** for written answers: a cheap keyword/semantic-similarity check decides clear cases; only borderline answers go to a small, low-cost LLM using the teacher's rubric. It tolerates children's Afrikaans spelling slips and has a per-session cost cap.
- **Prep strategies (Amendment 4):** a pluggable strategy layer picks how to prepare from an internal **runway ratio** (prep days remaining ÷ difficulty-weighted scope size). Launch strategies are **Incremental** (plenty of time: learn and prep portion by portion, with progress after each portion and a final interleaved review), **Standard** (full-scope diagnostic + adaptive plan) and **Last-minute**. Slaag suggests the strategy; **the parent or the child** can switch it. Cut-offs and portion sizes are settings, tuned per child from outcomes. In year 1, "learn" means studying the child's own textbook pages; Slaag does not teach content.

**Language (Amendment 2)**
- The whole experience, from social-media ad and landing page through sign-up to ongoing use, emails and support, is driven by a **language setting**; no user-facing text is hard-coded.
- Year 1 ships **Afrikaans only**. English is supported by the platform but **switched off** by a configuration flag.
- Language is decided in this order: **explicit parent choice → entry point (campaign link / landing-page path such as `/af` vs `/en`, or a campaign tag) → default Afrikaans**. It carries through the funnel and is saved on the family at registration.
- **One language per family**, set by the parent and used by the children; the parent can change it in settings.
- Content is **tagged by language**. English content would be a separate content set built from English textbooks, not machine-translated.
- Third-party screens (PayFast payment window; Google/Microsoft/Apple sign-in) may appear in English; Slaag keeps these steps short and explains them in Afrikaans around them.

**Multi-brand (Amendment 3)**
- **One platform, several brands.** A brand is a **configuration record**, not separate code: name, logo, colours, mascot and tone, domain(s), email sender and domain, app store listings and app IDs, OAuth app registrations, push settings, **PayFast merchant account**, legal pages, and allowed languages plus default.
- Slaag is brand #1 (Afrikaans). A future English brand would be brand #2 on its own domain.
- **Brand is decided by where the user arrives** (the domain, or which app). Language is then chosen within that brand (Amendment 2). Brand and language are separate settings.
- **Separate store apps per brand**, built from the same codebase with different branding and IDs.
- **One parent sign-in works across brands.** The parent identity (and their children) is shared; subscriptions, billing, emails, support and the look and feel are **per brand**. A family uses each brand only under that brand's look and domain.
- **Shared behind the scenes:** engine, content back office and infrastructure. Content sets are tagged by language and can be offered by any brand that allows that language.
- **Year 1:** only the Slaag brand exists, but no code may assume "Slaag". Adding a brand requires configuration plus building its apps, with no other code changes.

**Delivery**
- **Closed pilot: January 2027. Production launch: February 2027.**

## Non-Goals (Year 1)
- Schools as customers, group subscriptions, teachers in the classroom, tutors.
- English switched on for users (the platform supports it from day 1, but it stays off in year 1).
- Non-education Slaag Group products.
- Wiskunde, home and additional language subjects, Lewensvaardigheid/LO.
- WhatsApp notifications.
- In-app purchases through Apple or Google billing.
- Persistent cross-assessment mastery.
- Multi-slot study plans or parent-defined study windows.
- Real-world prizes, vouchers or a credit shop.
- More than 3 children per subscription.
- Province-specific behaviour (content, calendar). Province is stored for reporting only (assumed; see open assumptions).

## Acceptance Criteria

### Accounts & Family Setup
- [ ] AC-A1: A parent can register and sign in only through Google, Microsoft or Apple; no password form exists for parents.
- [ ] AC-A2: Registration records the parent's POPIA consent for processing their children's data (timestamped).
- [ ] AC-A3: Checkout uses PayFast onsite payment; the first charge is pro-rata to the 2nd of the next month, and recurring charges run on the 2nd.
- [ ] AC-A4: A parent can start a card update from Slaag, which completes on PayFast.
- [ ] AC-A5: A parent with an active subscription can create up to 3 child accounts; a 4th is blocked with a clear message.
- [ ] AC-A6: Creating a child requires only a short name (typically the first name), used to identify the child in reports; grade (4–7) and province are captured during child setup.
- [ ] AC-A7: For each subject, the parent can confirm the textbook and turn the subject on, now or later. Subjects without a confirmed textbook stay inactive.
- [ ] AC-A8: Child accounts have no sign-in details: no Google/Microsoft/Apple, username/password or PIN. A child can use Slaag only on a device the parent has linked, or through the parent's own signed-in app (AC-A11).
- [ ] AC-A9: From the web app or phone app, the parent picks a child and taps "Link a device". Slaag shows a one-time **code (~8 characters) and a QR code**, valid **once**, for **that child only**, expiring after **15 minutes**.
- [ ] AC-A10: Entering the code or scanning the QR on the child's Android app or web browser adds that child's profile to the device. It stays signed in until the parent removes the device, and later sessions open straight into the child's profile.
- [ ] AC-A11: When 2 or more children are linked to one device, the app shows their names and the child taps their own, with no password. On the parent's own phone, the parent can switch to a child profile without linking; getting back to parent screens needs the parent to sign in again or use the phone's biometrics.
- [ ] AC-A12: The parent can see each child's linked devices (or browsers) and remove any of them; removal takes effect on the device's next request. Web links apply only to that browser on that device. Expired, used or wrong codes are rejected with a friendly message. No email-link login exists.
- [ ] AC-A13: The iOS and Android apps contain no purchase buttons, prices or payment links. An app user without an active subscription sees a neutral "account not active" message.
- [ ] AC-A14: Failed payment: the parent is emailed and payment is retried. After 7 days without success, child access is paused and all data kept.
- [ ] AC-A15: Cancellation: access continues to the end of the paid month, then pauses.
- [ ] AC-A16: A paused account's data is kept for 12 months. A warning email goes out 30 days before deletion, and the data is then deleted.
- [ ] AC-A17: A parent can permanently delete the whole family account, children's data included, from settings.
- [ ] AC-A18: When enrolling a child, the parent selects the child's **school** from a searchable list of about 2,000 preloaded schools.
- [ ] AC-A19: If the school isn't listed, the parent can enter a new school name, which is saved on the child's profile.
- [ ] AC-A20: Province is stored for reporting and does not change content, scheduling or term dates at launch.

### Content & Question Bank
- [ ] AC-C1: Every in-scope grade/subject has a CAPS-topic tree with questions for all 4 terms.
- [ ] AC-C2: Every launch textbook has a chapter/page → CAPS-topic map, so a page range like `56-67, 88-95` resolves to topics.
- [ ] AC-C3: Per-textbook overrides replace shared definitions and model answers where the wording differs.
- [ ] AC-C4: Question types: multiple choice, short keyword definition, and paragraph answer; written types always have a model answer and rubric.
- [ ] AC-C5: No question reaches a learner unless a teacher reviewer has approved it (approval status and reviewer recorded).
- [ ] AC-C6: AI-drafted items are traceable to the source textbook and pages they came from.
- [ ] AC-C7: Launch readiness means 100% of in-scope topics for the launch textbooks have approved questions.
- [ ] AC-C8: In the web-only back office, staff upload textbook pages, and the AI drafts the topic map, questions, model answers and overrides.
- [ ] AC-C9: Teacher reviewers work through a queue to approve, edit or reject items and set difficulty and topic weight.
- [ ] AC-C10: Every content change is versioned; only approved versions are live.
- [ ] AC-C11: Parents and children can "report a problem" on any question. The report sends the item back to the review queue, and an item with 3 or more open reports is hidden automatically until reviewed.

### Test/Exam Planner
- [ ] AC-P1: The parent or the child can add a test or exam with a type, subject, date and scope.
- [ ] AC-P2: Scope can be set by selecting from the textbook's content tree **or** by entering page ranges.
- [ ] AC-P3: When a child adds or edits a test or exam, the parent is alerted and can view and edit every detail, including the prep session date and time.
- [ ] AC-P4: Slaag suggests **one** next prep session date and time; the child or parent accepts it or changes it.
- [ ] AC-P5: A child can start a system session manually at any time and create ad-hoc sessions on a subset of the scope.
- [ ] AC-P6: After a session, Slaag suggests the next step based on the time remaining and the results.
- [ ] AC-P7: After the test date, the child is asked to rate it **tough / ok / good** and can optionally enter a % or mark.
- [ ] AC-P8: Ratings and marks are stored as a per-child performance record and feed per-child engine tuning.
- [ ] AC-P9: The suggested time is the same time of day as the child's last completed session, otherwise a default the parent can set (e.g. 16:00), on the next suitable day.
- [ ] AC-P10: The sessions still needed are estimated from the concepts not yet mastered and spread evenly over the days left, with at least 1 day between sessions when time allows.
- [ ] AC-P11: If the test is today or tomorrow, Slaag offers a short last-minute session on weak and high-weight topics, with a calm, no-panic message.
- [ ] AC-P12: Editing scope mid-plan adds new topics to the next session and drops removed topics from the plan. After the test date, suggestions stop and the rating prompt appears.

### Prep Session Engine
- [ ] AC-E1: Under the Standard strategy, the first session for an assessment is an adaptive **diagnostic** that takes **≤ 15 minutes** for one test scope. Under Incremental, a diagnostic runs per portion, within the same time limit.
- [ ] AC-E2: A regular prep session lasts **10–20 minutes**.
- [ ] AC-E3: Knowledge tracing keeps a mastery estimate per concept, scoped to the assessment.
- [ ] AC-E4: Mastery-based progression: a concept counts as mastered only when its estimate passes a configurable threshold.
- [ ] AC-E5: Adaptive learning changes content, questions and difficulty based on demonstrated proficiency.
- [ ] AC-E6: The engine uses retrieval practice, spaced repetition at increasing intervals, error-based remediation, and interleaving.
- [ ] AC-E7: Before the test date, the plan covers every in-scope concept **at least once** and every weak concept **at least twice**.
- [ ] AC-E8: Written answers go through the **two-step grader**. Similarity decides clear cases; borderline answers go to a small LLM using the rubric. The model answer is always shown straight away.
- [ ] AC-E9: The grader agrees with a teacher's "good enough" judgement **≥ 90%** of the time on a reviewed sample (validated in the pilot).
- [ ] AC-E10: Results of ad-hoc sessions are included in the next system-generated session.
- [ ] AC-E11: LLM grading respects a configurable cost cap per session. Once the cap is reached, borderline answers are marked "close".
- [ ] AC-E12: Children's Afrikaans spelling slips don't by themselves make an answer wrong. Answers the grader can't decide are marked **"close"**, never wrong.

#### Prep strategies (Amendment 4)
- [ ] AC-E13: The runway ratio (prep days remaining ÷ difficulty-weighted concept count of the scope) is calculated when an assessment is added and recalculated whenever its date or scope changes or a day passes. It is never shown to users as a number.
- [ ] AC-E14: The engine picks a strategy using configurable cut-offs: **Incremental** above the upper cut-off, **Standard** between them, **Last-minute** below the lower cut-off (today or tomorrow always counts as Last-minute, per AC-P11).
- [ ] AC-E15: Incremental splits the scope into ordered **portions** along CAPS topic and textbook page boundaries. Each portion has a study instruction ("study pages 56–61 by Wednesday") followed by prep sessions on that portion only. Remaining portions are spread across the runway, and the last part of the runway is kept for a cumulative, interleaved review of all portions.
- [ ] AC-E16: When the child completes a portion, the parent receives a progress update (push + email, per AC-O rules) showing the portion's mastery and what comes next.
- [ ] AC-E17: The next-session suggestion stays one session at a time (AC-P4); the active strategy decides that session's portion and focus.
- [ ] AC-E18: The parent and the child can each switch the strategy (e.g. Incremental → Standard). If the child switches, the parent is alerted; if both change it, the parent's choice wins.
- [ ] AC-E19: If the runway shrinks (missed sessions, a moved date, a bigger scope), the engine re-plans and can move to a more compressed strategy, explaining this in a calm message to the child and parent.
- [ ] AC-E20: For every assessment, the strategy used, any switches, the per-portion results and the outcome (rating and mark) are recorded. Per-child tuning adjusts that child's cut-offs and portion sizes, and new strategies can be added as plug-ins without changing the planner, the grader or the session runner.

### Parent Oversight & Alerts
- [ ] AC-O1: Push + email **within 5 minutes** when a child adds or edits a test or exam.
- [ ] AC-O2: At the scheduled session time, a push goes to the child and the parent.
- [ ] AC-O3: If no session is started within **2 hours** of the scheduled time, it is logged as **missed** and the parent is alerted.
- [ ] AC-O4: Push + email **within 5 minutes** when a session is completed, with the score, weak topics and the suggested next step.
- [ ] AC-O5: A weekly digest email is sent every Sunday evening.
- [ ] AC-O6: The per-child dashboard shows upcoming tests and exams, readiness % per test, weak topics, credits and reward goal, and a full log of planned, missed, completed and ad-hoc sessions.
- [ ] AC-O7: The parent can mute any alert type for each channel (email/push), including portion-progress and strategy-switch alerts (Amendment 4).

### Child Experience & Gamification
- [ ] AC-G1: All child-facing text is in Afrikaans, at a reading level suitable for Grade 4.
- [ ] AC-G2: Wrong answers never produce negative or shaming language; the child sees an encouraging line plus the model answer.
- [ ] AC-G3: Every completed session ends with a celebration animation, praise, and the credits earned.
- [ ] AC-G4: Credits are earned only in the app (no money value, no shop), for adding a test, completing a session, finishing early, keeping a streak and entering a post-test mark, according to a parent-visible credit table.
- [ ] AC-G5: Credits unlock levels, badges and cosmetic items.
- [ ] AC-G6: A parent can optionally set a real-life reward at a credit target. Slaag tracks progress towards it; the parent provides the reward.
- [ ] AC-G7: Animations run smoothly on a 2 GB RAM Android device.
- [ ] AC-G8: A 15-minute session uses < 5 MB of mobile data.
- [ ] AC-G9: Streaks are visible to the child and shown on the parent dashboard.

### Language (Amendment 2)
- [ ] AC-X1: Every user-facing string (web, apps, emails, push, digest, help pages, praise and humour, grader feedback) comes from per-language resources; an automated check finds no hard-coded user-facing text.
- [ ] AC-X2: Supported languages are `af` and `en`; only `af` is enabled in year 1, and enabling `en` is a configuration change, not a code change.
- [ ] AC-X3: The language is resolved as explicit choice > entry point (landing-page path or campaign tag) > default `af`, and the result stays the same from the landing page through sign-up and the first app session.
- [ ] AC-X4: At registration the resolved language is saved on the family; all children in the family use it; the parent can change it in settings, and the change applies to the UI, emails and push.
- [ ] AC-X5: Every CAPS topic, question, model answer, override and textbook map has a language tag; a child only ever sees content in the family's language.
- [ ] AC-X6: Landing pages, app store listings and notification templates exist for each enabled language.
- [ ] AC-X7: Before the PayFast payment window and the Google/Microsoft/Apple sign-in screens, Slaag shows a short Afrikaans explanation of the step.
- [ ] AC-X8: Grader feedback and the model answers shown are in the family's language.

### Multi-brand (Amendment 3)
- [ ] AC-B1: Brand name, logo, colours, mascot, tone and copy, domains, email sender, legal pages, store IDs, OAuth clients, push settings, PayFast merchant and allowed/default languages all come from a brand configuration record; an automated check finds no hard-coded "Slaag" in user-facing code or templates.
- [ ] AC-B2: Requests are resolved to a brand by domain (web) or app ID (apps); an unknown domain is rejected.
- [ ] AC-B3: Language is resolved **within** the brand (AC-X3) and limited to that brand's allowed languages.
- [ ] AC-B4: Each brand ships its own Android and iOS apps from the same codebase, using per-brand build config.
- [ ] AC-B5: A parent who signs in with the same Google/Microsoft/Apple identity on a second brand is recognised as the same person. They can use that brand after subscribing to it; each brand's subscription is billed by that brand's PayFast merchant.
- [ ] AC-B6: Every message, email, page and screen shown to a user carries only the branding of the brand they're currently using.
- [ ] AC-B7: The engine and content back office are shared; a content set can be enabled for any brand that allows its language.
- [ ] AC-B8: A test (non-production) second brand with its own domain can be set up purely through configuration and per-brand app builds, proving AC-B1–B7 before launch.

### Launch & Year-1 Success
- [ ] AC-L1: A closed pilot with Afrikaans families runs in **January 2027** and validates AC-E1, E2, E7 and E9.
- [ ] AC-L2: Production launch in **February 2027**.
- [ ] AC-L3: Parent **NPS ≥ 40**.
- [ ] AC-L4 *(assumed)*: ≥ 60% of tests added get ≥ 1 completed session; ≥ 70% of paying families renew in month 2; a paying-family target set by the business.

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| Content must exist before anything works | Where does textbook-specific content come from? (R1) | AI drafts from textbook copies Slaag owns; teachers approve every item |
| The launch engine can be a subset | Proposed an MVP of 3 techniques (R2) | User chose **all techniques** in the first release |
| Native apps are a later phase | How do alerts reach people without native apps? (R3) | Hybrid Capacitor apps with push in year 1; no WhatsApp |
| Content must be textbook-specific | Contrarian: could it be CAPS-topic-based? (R4) | Hybrid: CAPS bank + page maps + per-textbook overrides |
| "Credits" | Simplifier: what's the minimum? (R6) | In-app only + reward goals set by parents |
| Lasting mastery across the year | Ontologist (R8) | No: each test or exam stands alone |
| Per-child pricing | (R11) | Flat family fee, ≤ 3 children, PayFast |
| "Negotiate" a schedule | Study windows proposed (R12) | One suggestion at a time; rules in R16 |
| The apps can sell subscriptions | Store billing rules (R14) | Web-only checkout; no purchase UI in the apps |
| "JEV" grader | What is it, and what does it cost? (R15) | Two-step grader: similarity first, then a small LLM; cost cap |
| Children sign in with credentials | Amendment 1 (2026-11-16): the user wanted children's access to be effortless | Parent-authorised device linking by code or QR; a name picker on shared devices; no child credentials |
| Brand and product are Afrikaans-only forever | Amendment 2 (2026-11-16): future English audience | Language-driven from day 1; Afrikaans enabled, English switched off; language from explicit choice > entry point > default |
| One brand forever | Amendment 3 (2026-11-16): English may be a different brand on a different domain | Multi-brand platform; brand is a config record resolved by domain or app; shared parent identity, per-brand subscriptions |
| Province matters | What does it change? (R20) | User expanded scope: pick a school from ~2,000 preloaded schools; province purpose assumed reporting-only |

### Open assumptions & risks
- ⚠️ **Delivery risk (highest):** about 11 weeks from 2026-11-14 to the February 2027 production launch, with the full engine, two store apps, PayFast billing, the back office, and teacher-approved content across Gr 4–7 × 3–4 subjects × 2–3 textbooks × 4 terms. Planning should stage content (e.g. Term 1 topics first, since a February launch only needs Term 1 tests) and sequence the engine techniques behind a working core.
- **Province:** assumed reporting-only, with the national school calendar (the user expanded scope to school selection without stating province's purpose). The school list could fill in province automatically.
- **Custom school names:** assumed saved as entered and flagged for staff to add to the master list. Not confirmed.
- **School list source:** where the ~2,000 schools come from (e.g. Department of Basic Education school master list, filtered to Afrikaans/dual-medium) is to be confirmed.
- **KPIs other than NPS:** proposed in R17 but not explicitly confirmed (AC-L4).
- **Pilot pricing:** assumed free. Not confirmed.
- **Textbook copyright:** AI-drafting from owned copies needs legal review.
- **Fee amount:** business decision; config value.

## Technical Context
Greenfield: the repo currently contains only tooling and planning docs.
- **App:** TanStack Start, responsive; Capacitor for Android and iOS; native push.
- **Auth:** parents use OAuth with Google, Microsoft or Apple. Children use parent-authorised device linking (a one-time code/QR, 15-minute expiry, single use) that creates a long-lived device credential the parent can revoke; there is no child login.
- **Payments:** PayFast (onsite checkout, recurring billing, card update); web-only.
- **Notifications:** email (parents), push (parents and children).
- **AI:** offline AI drafting of content with teacher review; runtime two-step grader (similarity + small LLM, cost-capped, Afrikaans).
- **Learner modelling:** knowledge tracing per assessment + spaced-repetition scheduling, under a pluggable **strategy layer** (runway ratio → Incremental / Standard / Last-minute), with per-child tuning of cut-offs and portion sizes from recorded outcomes.
- **Back office:** web-only content back office with versioning and a review queue.
- **Hosting/compliance:** South African cloud region; POPIA.
- **Multi-brand:** brand configuration records; brand resolved by domain or app ID; per-brand Capacitor builds, OAuth clients, push credentials, email domains and PayFast merchants; shared identity, engine and content.
- **Internationalisation:** per-language string resources for every surface; language resolved from explicit choice > entry point > default `af`; language-tagged content; per-language email/push templates, landing pages and store listings; `en` switched off by a flag.

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Brand | core domain | name, domains, visual identity, tone, email sender, store/app IDs, OAuth clients, push config, PayFast merchant, legal pages, allowed + default languages | has BrandMemberships; enables content sets by language |
| BrandMembership | supporting | parent, brand, family language, acquisition entry point, POPIA consent timestamp, joined-at | links a Parent identity to a Brand; owns that brand's Subscription |
| Parent | core domain | name, email, OAuth provider (identity shared across brands) | has BrandMemberships; owns Subscription per brand; owns 1–3 Child; sets ParentRewardGoal |
| Child | core domain | short name, grade (4–7), province | belongs to Parent; attends School; has Subjects with Textbooks; has Assessments; earns Credits |
| School | supporting | name, province, preloaded flag / custom-entered | attended by Child (~2,000 preloaded) |
| Subscription | core domain | brand, family flat fee, status (active/grace/paused/deleted), billing day = 2, pro-rata first charge | belongs to BrandMembership (one per brand); billed through PayFast |
| PayFast | external system | token, card-update flow | processes Subscription payments (web only) |
| Subject | supporting | name, grade, active flag | Child activates Subject with one Textbook |
| Textbook | supporting | title, publisher, grade, subject | has TextbookPageMap and TextbookOverrides |
| CAPSTopic | core domain | grade, subject, term, concept hierarchy, weight, language | has Questions; mapped from TextbookPageMap |
| TextbookPageMap | supporting | chapter, page range → topic, language | links Textbook to CAPSTopic |
| TextbookOverride | supporting | definition/model-answer text | overrides ModelAnswer for a Textbook |
| Question | core domain | type, difficulty, approval status, source pages, language | belongs to CAPSTopic; has ModelAnswer; has ContentVersions |
| ModelAnswer | supporting | text, rubric | belongs to Question |
| ContentVersion | supporting | version, author, status (draft/approved/hidden) | versions Question/ModelAnswer/Override |
| TeacherReviewer | supporting | name, subjects | approves ContentVersions |
| ProblemReport | supporting | reporter, reason, status | raised by Parent/Child on Question; ≥3 open → auto-hide |
| Assessment (Test/Exam) | core domain | type, subject, date, scope, rating, mark, runway ratio, active strategy, strategy history | belongs to Child; has PrepSessions; has AssessmentMastery; has ScopePortions |
| PrepStrategy | supporting | key (incremental/standard/last-minute), cut-offs, portion-size rules, per-child tuning | chosen for Assessment; pluggable |
| ScopePortion | supporting | order, topics, page range, study-by date, status, mastery | belongs to Assessment (Incremental); has PrepSessions |
| PrepSession | core domain | kind (diagnostic/system/ad-hoc/last-minute/portion/cumulative review), scheduled time, status, score, duration | belongs to Assessment (and optionally a ScopePortion); contains LearnerResponses |
| LearnerResponse | core domain | answer text/choice, grade (correct/close/incorrect), grader step used | belongs to PrepSession; updates AssessmentMastery |
| AssessmentMastery | core domain | per-concept mastery estimate | belongs to Assessment (not carried over) |
| Alert | supporting | type, channel, mute settings | sent to Parent/Child Devices |
| Device | supporting | push token, platform (Android/web browser), linked child profiles, linked-at, revoked flag | belongs to Parent and/or linked to Child via DeviceLink |
| DeviceLink | supporting | one-time code, QR payload, child, expires-at (15 min), used-at | created by Parent; consumed by Device to link a Child |
| WeeklyDigest | supporting | week, summary | emailed to Parent |
| Credit | supporting | activity, amount | earned by Child |
| Badge/Level | supporting | name, unlock rule, cosmetic | unlocked by Credits |
| Streak | supporting | length, last activity | belongs to Child |
| ParentRewardGoal | supporting | description, credit target | set by Parent for Child |

## Ontology Convergence
| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 14 | 14 | - | - | - |
| 2 | 14 | 0 | 0 | 14 | 100% |
| 3 | 15 | 1 (Device) | 0 | 14 | 93% |
| 4 | 17 | 2 (TextbookPageMap, TextbookOverride) | 1 (ContentNode→CAPSTopic) | 14 | 88% |
| 5 | 17 | 0 | 0 | 17 | 100% |
| 6 | 20 | 3 (Badge/Level, Streak, ParentRewardGoal) | 0 | 17 | 85% |
| 7 | 20 | 0 | 0 | 20 | 100% |
| 8 | 20 | 0 | 1 (MasteryEstimate→AssessmentMastery) | 19 | 100% |
| 9 | 20 | 0 | 0 | 20 | 100% |
| 10 | 21 | 1 (WeeklyDigest) | 0 | 20 | 95% |
| 11 | 22 | 1 (PayFast) | 0 | 21 | 95% |
| 12–14 | 22 | 0 | 0 | 22 | 100% |
| 15 | 23 | 1 (LearnerResponse) | 0 | 22 | 96% |
| 16–18 | 23 | 0 | 0 | 23 | 100% |
| 19 | 25 | 2 (ProblemReport, ContentVersion) | 0 | 23 | 92% |
| 20 | 26 | 1 (School) | 0 | 25 | 96% |

## Amendments
### Amendment 1 — Child access by device linking (2026-11-16)
Requested by the user after approval; it replaces the Round 9 PIN/credential flow.
- When creating a child account, the parent gives only a short name (typically the first name) to identify the child in reports.
- A child's device is linked once, with the parent's authorisation: a one-time code or QR code generated from the parent's web or Android app is typed or scanned on the child's device.
- Later sessions on that device open straight into the child's profile. When several children are linked to one device, a name picker appears with no password.
- The same pattern applies to the web experience (per browser).
- Children have no credentials of their own; the parent can remove linked devices.
- Reflected in AC-A6, AC-A8…A12, Constraints, Technical Context and the Ontology (Device, DeviceLink).

### Amendment 2 — Language-driven experience (2026-11-16)
Requested by the user after approval.
- Afrikaans parents and children get a fully Afrikaans experience: social-media ad → sign-up → account creation → ongoing exam prep.
- The brand focuses on the Afrikaans community at first, but a future English experience (ad → sign-up → use → support) must be possible.
- The experience is driven by a language setting, set explicitly or inferred from the funnel entry point; one language per family; content is tagged by language.
- Reflected in Constraints (Language), Non-Goals, Topology note, AC-X1…X8, Technical Context and the Ontology.

### Amendment 3 — Multi-brand platform (2026-11-16)
Requested by the user after approval: the English version may run under an entirely different brand and domain, and the engine must cater for this.
- Brand is a configuration record, separate from language; resolved from domain or app.
- Separate store apps per brand from one codebase; per-brand PayFast merchant, emails, legal pages and look.
- **One parent sign-in across brands** (user's choice over separate per-brand accounts); subscriptions and experience per brand.
- Shared engine, content back office and infrastructure; content sets offered per language.
- Year 1: Slaag only, with nothing hard-coded to "Slaag".
- Reflected in Constraints (Multi-brand), AC-B1…B8, Topology note, Technical Context and the Ontology (Brand, BrandMembership).
- **Open assumptions this amendment creates:** (a) children are shared with the parent identity and can be enrolled under either brand; (b) family language (Amendment 2) is stored **per brand membership**, so one family can use Afrikaans on Slaag and English on brand #2; (c) POPIA consent and privacy notices must say that the operating company (Slaag Group) shares one identity across its brands. Consent is recorded per brand.

### Amendment 4 — Prep strategies chosen by lead time (2026-11-16)
Requested by the user after approval: Slaag's suggestions about what, when and how to prep must become more nuanced over time. Proactive children who add tests early (measured internally as remaining prep days ÷ scope) should be offered an incremental strategy: learn a portion, prep a portion, with earlier feedback and progress to the parent, instead of covering everything first.
- Runway ratio → pluggable strategies: Incremental / Standard / Last-minute; configurable cut-offs, tuned per child.
- Incremental: portions along CAPS topic and page boundaries; study instruction, then prep per portion; parent progress after each portion; final interleaved cumulative review.
- Slaag suggests; **the parent or the child** can switch (user's choice).
- Still one suggested session at a time; "learn" = studying the child's own textbook (Slaag doesn't teach content in year 1).
- Reflected in Constraints (Engine), AC-E1 (amended), AC-E13…E20, AC-O7, Technical Context and the Ontology (PrepStrategy, ScopePortion).
- **Open assumptions:** if the child switches, the parent is alerted and the parent's choice wins if both change it; initial cut-off values are set during the pilot.

## Interview Transcript
<details>
<summary>Full Q&A (Round 0 + 20 rounds)</summary>

### Round 0 — Topology
User described Slaag Group, the year-1 parent test/exam-prep business, accounts and subscription, child setup with textbooks, test/exam entry, prep sessions and their techniques, LLM-graded written answers, post-test ratings, parent logging and gamification. 6 parts locked; schools/teachers/tutors, English and non-education products deferred.

### Round 1
**Q:** Content source? **A:** AI draft + teacher approval. **Ambiguity:** 52%
### Round 2
**Q:** Smaller launch engine? **A:** No, all techniques. **Ambiguity:** 49%
### Round 3
**Q:** Alert channels? **A:** Email + push via Capacitor store apps; no WhatsApp. **Ambiguity:** 47%
### Round 4 (Contrarian)
**Q:** CAPS bank vs textbook-specific? **A:** Hybrid. **Ambiguity:** 45%
### Round 5
**Q:** Engine launch bars? **A:** Accepted. **Ambiguity:** 41%
### Round 6 (Simplifier)
**Q:** What are credits? **A:** In-app only + parent reward goals. **Ambiguity:** 38%
### Round 7
**Q:** Launch coverage? **A:** Gr 4–7 content subjects, 2–3 textbooks. **Ambiguity:** 34%
### Round 8 (Ontologist)
**Q:** Lasting mastery as the core? **A:** No, each test stands alone. **Ambiguity:** 32%
### Round 9
**Q:** Child access on shared devices? **A:** PIN switcher flow. **Ambiguity:** 30%
### Round 10
**Q:** Oversight rules? **A:** Accepted. **Ambiguity:** 27%
### Round 11
**Q:** Pricing and payments? **A:** Flat family fee, ≤ 3 kids, PayFast onsite + card update. **Ambiguity:** 24%
### Round 12
**Q:** Scheduling rules? **A:** Simpler: one suggestion at a time. **Ambiguity:** 21%
### Round 13
**Q:** Child UX criteria? **A:** Accepted. **Ambiguity:** 18% → spec written; user chose "Refine further".
### Round 14
**Q:** Web-only checkout, no purchase UI in the apps? **A:** Yes. **Ambiguity:** 18%
### Round 15
**Q:** Two-step grader? **A:** Yes. **Ambiguity:** 17%
### Round 16
**Q:** Next-session suggestion rules? **A:** Accepted. **Ambiguity:** 16%
### Round 17
**Q:** Pilot + launch + KPIs? **A:** Closed pilot January 2027, production February 2027; NPS ≥ 40 confirmed. **Ambiguity:** 15%
### Round 18
**Q:** Account lifecycle? **A:** Accepted. **Ambiguity:** 14%
### Round 19
**Q:** Content back office? **A:** Accepted. **Ambiguity:** 12%
### Round 20
**Q:** Province reporting-only? **A:** Expanded: the parent picks the child's school from ~2,000 preloaded schools, or enters a new name. **Ambiguity:** 12%
</details>
