> **APPROVED** as the Slaag year-1 PRD on 2026-11-14T00:45:29Z; revised 2026-11-16 (see Revision History). Deep Interview: 20 rounds, 12% ambiguity.

# Slaag — Year-1 PRD (Afrikaans Test & Exam Prep for Grades 4–7)

## Metadata
- Interview ID: b7e4c2a1-5f3d-4e8a-9c61-2d0f8a7b3e15
- Rounds: 20 (plus Round 0 topology); hard cap reached
- Final Ambiguity Score: 12%
- Type: greenfield
- Generated: 2026-11-14T00:40:22Z (first version 2026-11-13 after Round 13; refined through Rounds 14–20)
- Threshold: 0.2
- Threshold Source: default
- Initial Context Summarized: no
- Status: APPROVED (2026-11-14T00:45:29Z); revised 2026-11-16 (child device linking, language-driven experience, multi-brand platform, prep strategies)

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.90 | 0.40 | 0.360 |
| Constraint Clarity | 0.89 | 0.30 | 0.267 |
| Success Criteria | 0.83 | 0.30 | 0.249 |
| **Total Clarity** | | | **0.876** |
| **Ambiguity** | | | **0.124** |

## Topology
Confirmed in Round 0 (2026-11-10). Platform note: native store apps were first deferred, then brought into year-1 scope in Round 3; on 2026-11-16 year 1 was narrowed to the **Android app + responsive web app** (no iOS app). Cross-cutting platform requirements (language: AC-X1…X8; multi-brand: AC-B1…B8) apply to all six parts.

| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|-------------|--------------------------|
| Accounts & Family Setup | active | Parent social login, family subscription via PayFast (web-only checkout), web account and subscription management, webhook-driven billing lifecycle, parent-owned child accounts, school/grade/province/textbooks, partner campaigns with time-limited member discounts | AC-A1…A37 |
| Content & Question Bank | active | Ingestion of photographed textbook PDFs into reviewed, importance-weighted facts (verbatim + paraphrased), indexed to the textbook and cross-referenced to CAPS; curator-initiated question generation; risk-based review | AC-C1…C28 |
| Test/Exam Planner | active | Add test/exam (date + scope), parent review/edit, rule-based next-session suggestion, post-test rating and marks | AC-P1…P12 |
| Prep Session Engine | active | Full adaptive engine with every technique; strategy layer (Incremental / Standard / Last-minute) chosen by runway ratio; language-model-based grading of written answers against rubrics | AC-E1…E24 |
| Parent Oversight & Alerts | active | Email + push alerts, missed-session detection, weekly digest, per-child dashboard | AC-O1…O7 |
| Child Experience & Gamification | active | Fun, low-stress Afrikaans UX; in-app credits, levels, badges, streaks, cosmetics; parent reward goals | AC-G1…G9 |
| Schools / teachers / tutors | deferred | Group subscriptions, flipped classroom, pre/post quizzes, tutor assessment | Deferred by user in Round 0 (2026-11-10): long-term opportunity, not year 1. (Schools are captured as **reference data** only; see AC-A18.) |
| English-speaking users | deferred | Expansion beyond Afrikaans communities | Deferred by user in Round 0 (2026-11-10): year 1 is 100% Afrikaans. The platform is built to support languages from day 1 (AC-X1…X8), so English can later be switched on without rework. English may launch as a **separate brand on its own domain** on the same platform. |
| Non-education extensions | deferred | Other Slaag Group businesses for Afrikaner households | Deferred by user in Round 0 (2026-11-10) |
| iOS app | deferred | Native iPhone/iPad app on the Apple App Store | Deferred by user on 2026-11-16: year 1 is the Android app + responsive web app; iPhone users use the web app |

## Goal
Slaag ("pass/succeed") is the first business of Slaag Group, a platform for Afrikaans-speaking families in South Africa. In year 1, Slaag helps parents of Grade 4–7 children prepare their children for school **tests** (small, during term) and **exams** (end of term, consolidated), replacing last-minute, stressful manual quizzing from the textbook.

A parent subscribes on the web (PayFast) and enrols up to 3 children with their school, grade, province and the textbook for each subject. The parent or child adds an upcoming test or exam with its date and scope (content-tree selection or page ranges). Slaag suggests the next prep session one at a time. An adaptive engine diagnoses gaps and drills the child towards mastery, using multiple-choice and written questions graded instantly against teacher-approved model answers and marking rubrics (correct / partial / incorrect). Parents get honest visibility into planned, missed and completed sessions and readiness. Children get a fun, encouraging, gamified experience. Content is produced through an AI-drafting, teacher-review back office. The closed pilot is in **January 2027** and the production launch in **February 2027**. When a test is added early enough, Slaag can offer an incremental strategy (learn and prep portion by portion, with earlier progress to the parent). The platform is language-driven (Afrikaans only in year 1, English ready) and multi-brand, so a future English offering can run under its own brand and domain on the same engine. **Partnerships are a key distribution channel:** civic organisations such as AfriForum, Solidariteit and OUTA can run long-running campaigns that give their members a discounted subscription for a fixed period, after which the price reverts to standard automatically.

## Constraints
**Platform & tech**
- Two client surfaces: a **web app**, responsive for laptop and mobile browsers, and an **Android app on Google Play** with the same features for parents and children. Technology and framework choices are defined in a separate architecture document. **No iOS app in year 1**: iPhone and iPad users, parents and children alike, use the web app in their browser, which must work well on mobile and desktop.
- Push notifications to parents and children come through the Android app; parents also get email. Web-only users (e.g. iPhone) receive **email** (parents) and in-app reminders when they open the web app. **No WhatsApp.**
- Runs smoothly on 2 GB RAM Android phones; a 15-min session uses < 5 MB of data.
- **Hosting may be in South Africa or international** (no South African data-residency requirement). If personal information, including children's data, is stored or processed outside South Africa, the transfer must meet POPIA's cross-border conditions (section 72): the hosting provider is bound by adequate data-protection law (e.g. GDPR) or a binding agreement (a data processing agreement), and the privacy notice says where data is held and lists the processors.

**Accounts & billing**
- Parents sign in **only** with **Google** or **email and password**. Microsoft and Apple sign-in are not offered. **Children have no sign-in details of their own** (no social login, password or PIN). A child gets in only through a **device the parent has linked** with a one-time code or QR code.
- **Flat fee per family, up to 3 children**; the rand amount is a config value.
- **PayFast** onsite checkout; first charge pro-rata, then recurring billing on the **2nd**; card update started from Slaag.
- **Checkout is web-only** (the "reader app" approach): the Android app shows no purchase buttons, prices or payment links.
- Lifecycle is **driven by PayFast webhooks**. PayFast may notify Slaag of **every** failed collection attempt, so Slaag works out first vs final failure from its own subscription status plus the subscription status reported by PayFast. The first failure moves an Active subscription to **Overdue**, with one email saying there was a problem and PayFast will retry; child access continues. Later failed attempts are only logged, with no email. When PayFast reports the subscription paused after its final retry, Slaag sets **Suspended**: child access is blocked and the parent is emailed a deep link to reactivate. Reactivation is a **new web checkout** (card details entered again) that reactivates the subscription at PayFast. Cancellation is a **guided journey with a reason**; access continues to the end of the paid month. Suspended or cancelled accounts keep their data **12 months**, then it is deleted after a **30-day warning email**. A parent can delete the whole family account themselves at any time.
- **Partner campaigns:** members of partner organisations (e.g. AfriForum, Solidariteit, OUTA) who sign up during a campaign window (e.g. 3 months) get a discounted fee for a fixed period (e.g. 12 months), which then **reverts automatically** to the standard fee after a notice email. Discounts don't stack. Campaign prices are shown only on the web.
- Parents manage their account and subscription **on the web**: status, next billing date, card on file, card-expiry warnings, card update, cancel and reactivate.
- **POPIA**: the parent's consent for processing children's data is recorded at registration.

**Content**
- Launch coverage: **Grades 4–7**, Natuurwetenskappe & Tegnologie (NS in Gr 7), Sosiale Wetenskappe (Geskiedenis + Aardrykskunde), EBW (Gr 7); the 2–3 most-used Afrikaans textbooks for each; all 4 terms.
- **Source documents are typed;** textbooks are the first type. Content comes from **PDFs of phone photos** of textbook sections (no text layer), uploaded by Slaag content staff in a web-only back office.
- **Facts are the base layer.** OCR + AI break each page into small, typed **facts**, each stored **verbatim** with **1–2 linked paraphrased statements** as a buffer against copyright issues. Questions are built from facts, mastery is tracked per fact, and page ranges resolve to facts. Every fact carries an **importance tier and weight** (Core / Supporting / Peripheral) and **typed links** to related facts, so prep concentrates on what tests are most likely to ask, above all the explicit keywords defined in the margins.
- **Dual indexing:** every fact is indexed to the **textbook's own index** (term, topic, subtopic, page), which is the **primary** structure used in the day-to-day experience, and cross-referenced to the **CAPS** breakdown. Questions are generally textbook-specific.
- **Two review gates:** contracted Afrikaans teachers review every fact (Gate 1); question review is risk-based (Gate 2).
- **Question generation is curator-initiated,** with default options the curator can override, and can be repeated ("generate more questions").
- A preloaded list of **~2,000 schools** is maintained as reference data.

**Engine**
- **All** techniques in the first release. Adaptive Learning (paradigm), Knowledge Tracing (learner model) and Spaced Retrieval (reinforcement) are kept distinct.
- Each test or exam stands alone: mastery is tracked per assessment. Marks tune per-child engine behaviour only.
- **Language-model-based grader** for written answers: every answer goes **straight to a language-model evaluation** against the question's teacher-approved rubric (no keyword or similarity pre-check). The evaluation reports how confident it is; below a configurable confidence threshold a second, more capable language model re-assesses the answer. Every answer is marked **correct**, **partial** or **incorrect**. It tolerates children's Afrikaans spelling slips and has a per-session cost cap.
- **Prep strategies:** a pluggable strategy layer picks how to prepare from an internal **runway ratio** (prep days remaining ÷ difficulty-weighted scope size). Launch strategies are **Incremental** (plenty of time: learn and prep portion by portion, with progress after each portion and a final interleaved review), **Standard** (full-scope diagnostic + adaptive plan) and **Last-minute**. Slaag suggests the strategy; **the parent or the child** can switch it. Cut-offs and portion sizes are settings, tuned per child from outcomes. In year 1, "learn" means studying the child's own textbook pages; Slaag does not teach content.

**Language**
- The whole experience, from social-media ad and landing page through sign-up to ongoing use, emails and support, is driven by a **language setting**; no user-facing text is hard-coded.
- Year 1 ships **Afrikaans only**. English is supported by the platform but **switched off** by a configuration flag.
- Language is decided in this order: **explicit parent choice → entry point (campaign link / landing-page path such as `/af` vs `/en`, or a campaign tag) → default Afrikaans**. It carries through the funnel and is saved on the family at registration.
- **One language per family within each brand**, set by the parent and used by the children; the parent can change it in settings.
- Content is **tagged by language**. English content would be a separate content set built from English textbooks, not machine-translated.
- Third-party screens (PayFast payment window; Google sign-in) may appear in English; Slaag keeps these steps short and explains them in Afrikaans around them.

**Multi-brand**
- **One platform, several brands.** A brand is a **configuration record**, not separate code: name, logo, colours, mascot and tone, domain(s), email sender and domain, app store listings and app IDs, OAuth app registrations, push settings, **PayFast merchant account**, legal pages, and allowed languages plus default.
- Slaag is brand #1 (Afrikaans). A future English brand would be brand #2 on its own domain.
- **Brand is decided by where the user arrives** (the domain, or which app). Language is then chosen within that brand. Brand and language are separate settings.
- **A separate Android app per brand**, built from the same codebase with different branding and IDs.
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
- In-app purchases through Google Play billing.
- An iOS app (iPhone/iPad users use the web app).
- Persistent cross-assessment mastery.
- Multi-slot study plans or parent-defined study windows.
- Real-world prizes, vouchers or a credit shop.
- More than 3 children per subscription.
- Province-specific behaviour (content, calendar). Province is stored for reporting only (assumed; see open assumptions).

## Acceptance Criteria

> **Staging and deferrals:** these criteria describe the full product. Which capabilities ship in the January 2027 pilot, by the February 2027 launch, or later (deferred with revisit triggers) is defined in the architecture document: [v1 Scope & Staging](logical-design/ARCHITECTURE.md#v1-scope--staging) and the [Debt Ledger](logical-design/ARCHITECTURE.md#debt-ledger). Criteria affected by a deferral carry a *Staging* note. Where the two differ on timing, the architecture document wins; the requirement itself stays here.

### Accounts & Family Setup
- [ ] AC-A1: A parent can register and sign in only with **Google** or with **email and password**. No other sign-in methods are offered.
- [ ] AC-A1a: Email-and-password registration requires email verification before the account can subscribe, a minimum password strength, and a self-service "forgot password" reset by emailed link. Repeated failed sign-ins are rate-limited. Passwords are stored only as strong salted hashes.
- [ ] AC-A1b: A parent who registered with email and password can later sign in with Google using the same verified email address (and the reverse), and ends up in the same account rather than a duplicate.
- [ ] AC-A2: Registration records the parent's POPIA consent for processing their children's data (timestamped).
- [ ] AC-A3: Checkout uses PayFast onsite payment; the first charge is pro-rata to the 2nd of the next month, and recurring charges run on the 2nd.
- [ ] AC-A4: A parent can start a card update from Slaag, which completes on PayFast.
- [ ] AC-A5: A parent with an active subscription can create up to 3 child accounts; a 4th is blocked with a clear message.
- [ ] AC-A6: Creating a child requires only a short name (typically the first name), used to identify the child in reports; grade (4–7) and province are captured during child setup.
- [ ] AC-A7: For each subject, the parent can confirm the textbook and turn the subject on, now or later. Subjects without a confirmed textbook stay inactive.
- [ ] AC-A8: Child accounts have no sign-in details: no Google sign-in, email/password, username/password or PIN. A child can use Slaag only on a device the parent has linked, or through the parent's own signed-in app (AC-A11).
- [ ] AC-A9: From the web app or phone app, the parent picks a child and taps "Link a device". Slaag shows a one-time **code (~8 characters) and a QR code**, valid **once**, for **that child only**, expiring after **15 minutes**.
- [ ] AC-A10: Entering the code or scanning the QR on the child's Android app or web browser adds that child's profile to the device. It stays signed in until the parent removes the device, and later sessions open straight into the child's profile.
- [ ] AC-A11: When 2 or more children are linked to one device, the app shows their names and the child taps their own, with no password. On the parent's own phone, the parent can switch to a child profile without linking; getting back to parent screens needs the parent to sign in again or use the phone's biometrics.
- [ ] AC-A12: The parent can see each child's linked devices (or browsers) and remove any of them; removal takes effect on the device's next request. Web links apply only to that browser on that device. Expired, used or wrong codes are rejected with a friendly message. No email-link login exists.
- [ ] AC-A13: The Android app contains no purchase buttons, prices or payment links. An app user without an active subscription sees a neutral "account not active" message.
- [ ] AC-A14: On a failed-payment notification, Slaag compares its local subscription status with the status PayFast reports. If the subscription is **Active** locally and still active at PayFast, it is the **first failure**: Slaag sets **Overdue** and emails the parent **once** that there was a problem with the payment and that it will be retried a few times. Child access continues while Overdue.
- [ ] AC-A15: If the subscription is already **Overdue** and PayFast reports it still active, the attempt is logged with **no email**. If PayFast reports the subscription **paused** (its final retry failed), Slaag sets **Suspended**, blocks all child access on every linked device with a friendly message, and emails the parent **once** with a **deep link** to reactivate. The parent never receives more than one overdue email and one suspension email per billing failure episode. A successful payment while Overdue returns the subscription to Active with no further email.
- [ ] AC-A16: A suspended or cancelled account's data is kept for 12 months. A warning email goes out 30 days before deletion, and the data is then deleted. ***Staging:** the automated 12-month deletion job and its 30-day warning are deferred after v1 (D4); retention dates are recorded from day 1. See [Architecture → Debt Ledger](logical-design/ARCHITECTURE.md#debt-ledger).*
- [ ] AC-A17: A parent can permanently delete the whole family account, children's data included, from settings.
- [ ] AC-A18: When enrolling a child, the parent selects the child's **school** from a searchable list of about 2,000 preloaded schools.
- [ ] AC-A19: If the school isn't listed, the parent can enter a new school name, which is saved on the child's profile.
- [ ] AC-A20: Province is stored for reporting and does not change content, scheduling or term dates at launch.
- [ ] AC-A21: The parent web app has an **Account & subscription** page showing plan, status (Active / Overdue / Suspended / Cancelling / Cancelled), next billing date and amount, the card on file (masked) and its expiry, plus actions: update card, cancel, reactivate.
- [ ] AC-A22: **Cancellation journey:** the parent confirms their intent, picks a reason (**not being used**, **not getting the benefit I expected**, **can't afford it**, **other** with free text), and confirms. Slaag cancels the subscription at PayFast, sets it to **Cancelling** until the end of the paid month and then **Cancelled**, and emails a confirmation. The reason is stored for reporting.
- [ ] AC-A23: **Reactivation:** from the Suspended email deep link, or from the account page when Suspended or Cancelled, the parent signs in on the web and goes through a **new PayFast checkout**, entering card details again. On success, the subscription is active again at PayFast, Slaag sets it to **Active**, child access resumes on the existing linked devices, and all data is restored.
- [ ] AC-A24: When PayFast reports that the **card is close to expiry**, Slaag emails the parent a link to the PayFast card-update journey for that subscription.
- [ ] AC-A25: While a card-expiry warning is open, the parent web app shows a **"card expiring soon"** notice on the account page and dashboard, with an action that starts the same PayFast card-update journey. The notice clears once PayFast confirms the update.
- [ ] AC-A26: PayFast webhooks are checked for authenticity (signature and source checks) and processed idempotently; repeated or out-of-order callbacks never move a subscription to the wrong status. Every status change is logged with its triggering event.
- [ ] AC-A27: All subscription emails (overdue, suspended, reactivated, cancellation confirmation, card expiring) follow the family's brand and language.

#### Partner campaigns
- [ ] AC-A28: Staff manage **partners** in the back office: civic society organisations such as AfriForum, Solidariteit and OUTA. Each partner has a name, logo, a recorded permission to use its name and logo, contact details, and an optional membership-number format for validation. A partner belongs to a brand; a partner is not a brand.
- [ ] AC-A29: Staff create **campaigns** per partner. Each has a name, a **sign-up window** (start and end date, e.g. 3 months), a **discount** (a percentage or a fixed rand amount off the family fee), a **discount period** in months (e.g. 12), an optional sign-up cap, terms text, and its own landing page link and campaign code. A partner can have several campaigns over time. Staff can pause or end a campaign early; that only stops new sign-ups.
- [ ] AC-A30: Each campaign has a co-branded **landing page** in the brand's language, with its own link and QR code for the partner's newsletters, emails, social media and events. Members can also enter the **campaign code** at web checkout. The campaign is recorded as the family's acquisition entry point.
- [ ] AC-A31: **Membership check (year 1):** during sign-up, the parent confirms they are a member of the partner and enters their membership number (checked against the partner's format, if set). Staff can export a campaign's sign-ups with membership numbers for the partner to verify. If a number is confirmed invalid, staff can remove the discount; the parent is emailed and the standard fee applies from the next billing date.
- [ ] AC-A32: **The discount is locked in at sign-up.** A family that subscribes during the window keeps the discount for the full discount period, even after the campaign ends. The period starts from the first charge, and the pro-rata first charge is also discounted. Checkout and the account page show the discounted fee, the standard fee, and the date the discount ends.
- [ ] AC-A33: **Automatic reversion:** when the discount period ends, the subscription fee reverts to the standard family fee then in force, with no action by the parent. Slaag emails the parent **30 days before** with the new amount and its start date, and shows the same notice on the account page. Slaag changes the recurring amount at PayFast, confirms it, and flags any failure to staff before the next billing date.
- [ ] AC-A34: **One discount per subscription:** campaign discounts don't stack with each other or with other offers, and a family can use a campaign discount once per brand. If a discounted subscription is suspended or cancelled and then reactivated within the discount period, the discount applies for the months that remain. After the period ends, reactivation is at the standard fee.
- [ ] AC-A35: **Partner reporting:** per partner and campaign, staff see landing-page visits, sign-ups, conversion, active discounted subscriptions, upcoming and completed reversions, cancellations around reversion, and revenue. Reports can be exported to share with partners and to calculate any commission or revenue share, whose terms are agreed outside the product.
- [ ] AC-A36: Campaign landing pages, prices and offers appear only on the web, in line with web-only checkout; the Android app shows no prices or offers. Campaign pages and emails follow the brand and language rules (AC-X, AC-B).
- [ ] AC-A37: Every discount applied, removed or expired, and every fee change, is recorded in the subscription's history with the campaign and the reason.

### Content & Question Bank

#### Textbooks & upload
- [ ] AC-C1: Source documents have a **type**; "textbook" is the first. A textbook record holds title, publisher, edition/ISBN, grade, subject, language and cover image.
- [ ] AC-C2: Before content is uploaded, the curator uploads a photo PDF of the textbook's **table of contents**. Slaag proposes the textbook's **index tree** (term > topic > subtopic, with page ranges) and a suggested **CAPS mapping** for each node; a person confirms or corrects it once.
- [ ] AC-C3: The curator uploads **PDFs of phone photos** (no text layer) and tags each upload with **grade** and **textbook**, plus optional **section and page range(s)**. Pages are placed in the textbook's index tree automatically.
- [ ] AC-C4: Each page is read by OCR (Afrikaans and English) and kept linked to its page image. Pages that read poorly (blur, skew, glare, cut-off text) are **flagged for re-photographing**.
- [ ] AC-C5: **Re-uploading a page replaces it entirely.** All facts from the old version go back through Gate 1, and questions built on them go back through Gate 2.
- [ ] AC-C6: Each textbook shows coverage in the back office: pages uploaded, flagged, extracted, facts approved, and questions generated and live. ***Staging:** v1 shows a table of counts per textbook; the full coverage dashboard is deferred (D7). See [Architecture → Debt Ledger](logical-design/ARCHITECTURE.md#debt-ledger).*

#### Facts
- [ ] AC-C7: AI extracts **facts**: short, self-contained statements, one idea each, **verbatim** in the textbook's wording. Each has a **type** (definition, fact, list item, process step, cause and effect, date or event, diagram/table label), **key terms** (bold or keyword terms flagged), its **source** (textbook, page, area of the page image), the **textbook index** (term, topic, subtopic, page), the **CAPS cross-reference**, its **position type on the page** (margin keyword/definition box, body text, heading, summary or "remember" box, caption, example or enrichment box, activity), and **links** to related facts.
- [ ] AC-C8: For each verbatim fact, AI generates **1–2 linked paraphrased statements** with the same meaning in different words, keeping the textbook's key terms intact.
- [ ] AC-C9: Diagrams and tables become labelled facts; the cropped image is stored and can be shown in questions. ***Staging:** diagram facts and crops are extracted and reviewed in v1; "label the diagram" questions are deferred (D3). See [Architecture → Debt Ledger](logical-design/ARCHITECTURE.md#debt-ledger).*
- [ ] AC-C10: **Gate 1:** a teacher reviews **every** fact and its paraphrases next to the page photo, and can approve, edit, merge, split or reject. They also confirm or change the fact's importance and links (AC-C25–C28). Only approved facts can be used to generate questions.

#### Fact importance & relationships
- [ ] AC-C25: Every fact has an **importance tier**: **Core** (must know; likely to be tested), **Supporting** (useful detail) or **Peripheral** (very unlikely to need memorising), plus a numeric **weight** within its tier, for fine ranking.
- [ ] AC-C26: During extraction, AI **proposes** each fact's tier and weight from textbook signals, and records the signal used:
  - **explicit keywords and definitions in the side margins** (keyword boxes) → **Core, highest weight**
  - bold or highlighted terms, headings, summary or "remember" boxes, and facts covered by end-of-chapter questions → Core or Supporting
  - ordinary body text → Supporting
  - examples, anecdotes, "did you know" and enrichment boxes → Peripheral
- [ ] AC-C27: Facts are linked with **typed relationships**:
  - **elaborates**: a body-text fact that repeats a margin keyword and adds detail links to that keyword fact
  - **duplicates**: restates the same knowledge; linked or merged so it isn't drilled twice
  - **part of**: the steps of a process or the items of a list
  - **related**

  The keyword fact stays the anchor; elaborating facts get their own tier, usually lower.
- [ ] AC-C28: Teachers can adjust tier, weight and links per fact at Gate 1, and curators can bulk-adjust them for a whole index node (e.g. mark an enrichment section Peripheral). Changes are versioned and take effect in prep plans from the next session. ***Staging:** per-fact edits are in v1; bulk adjustment per index node is deferred (D6). See [Architecture → Debt Ledger](logical-design/ARCHITECTURE.md#debt-ledger).*
- [ ] AC-C11: A test scope given as page ranges or index-tree selections resolves to the approved facts on those pages or nodes.

#### Question generation
- [ ] AC-C12: Question generation is **started by the curator**, for a selected scope (textbook, index node(s) or page range) of approved facts. It never runs automatically.
- [ ] AC-C13: The generation dialog is **pre-filled with defaults**, scaled by importance: around 4 questions per Core fact, 2 per Supporting fact, and 0–1 per Peripheral fact, with types chosen by fact type (definition → define the term / match term to definition / fill in the keyword; fact or date → multiple choice / true-false with correction / fill in the blank; process or list → put steps in order / name the missing step; cause and effect → short written "why"; diagram → label the image; some multi-fact paragraph questions). The curator can **override** the number per fact and which types are included. ***Staging:** the diagram-labelling question type is deferred (D3). See [Architecture → Debt Ledger](logical-design/ARCHITECTURE.md#debt-ledger).*
- [ ] AC-C14: The curator chooses whether questions and model answers are based on the **paraphrased** statements (default) or the **verbatim** fact (e.g. where exact textbook wording of a definition is examined).
- [ ] AC-C15: Each question gets an easy, medium or hard rating and stays linked to its source fact(s).
- [ ] AC-C15a: Generation **explicitly produces a model answer for every question**, written from the source fact(s) (verbatim or paraphrase, per AC-C14) and citing the fact(s) it comes from. The model answer contains nothing that isn't in the source facts.
- [ ] AC-C15b: Generation also produces a **marking rubric** for every question, so marking is systematic and repeatable. The rubric defines three outcomes:
  - **Correct:** the required key points (e.g. the keyword and its defining idea) are all present; acceptable alternative wordings and synonyms are listed.
  - **Partial:** which subset of key points earns partial credit (e.g. the right term but an incomplete definition, 2 of 3 steps in the right order, most labels correct).
  - **Incorrect:** missing or wrong key points, plus known misconceptions and wrong answers that must never be marked correct.
  For mechanical types the rubric is derived automatically (the correct option, sequence or blank; partial credit rules for ordering, matching and labelling). For written types it lists key points with their weight.
- [ ] AC-C15c: Reviewers see and can edit the model answer and rubric together with the question at Gate 2. A question can't go live without an approved model answer and rubric, and rubric edits are versioned with the question (AC-C20).
- [ ] AC-C16: The curator can return to any scope later and **"generate more questions"**. New questions are added to the existing ones, avoid duplicating questions already generated, and go through Gate 2.
- [ ] AC-C17: Every generation run is logged (who, when, scope, options used, number of questions created).

#### Question review & quality
- [ ] AC-C18: **Gate 2, risk-based:** questions of mechanical types (multiple choice, true/false, fill in the blank, step ordering) go live after a teacher reviews a random **~10% sample per textbook** and **≥ 95%** pass. If the sample fails, the whole batch is reviewed. Judgement types (written definitions, "why" answers, paragraph questions, diagram labelling) are **always fully reviewed**.
- [ ] AC-C19: Teacher reviewers work through queues for facts and questions: approve, edit or reject, and set difficulty and topic weight.
- [ ] AC-C20: Every content change is versioned; only approved versions are live.
- [ ] AC-C21: Parents and children can "report a problem" on any question. The report sends the item back to review, and an item with 3 or more open reports is hidden automatically until reviewed.
- [ ] AC-C22: Content is traceable end to end: question → fact(s) → page → upload → textbook.
- [ ] AC-C23: Launch content is staged: Term 1 content for the launch textbooks is finished first.
- [ ] AC-C24: Textbook page photos and verbatim text are visible only to Slaag staff and reviewers; learners see questions, model answers and diagram crops only.

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
- [ ] AC-P10: The sessions still needed are estimated from the facts not yet mastered and spread evenly over the days left, with at least 1 day between sessions when time allows.
- [ ] AC-P11: If the test is today or tomorrow, Slaag offers a short last-minute session on weak **Core** facts (margin keywords first), with a calm, no-panic message.
- [ ] AC-P12: Editing scope mid-plan adds new topics to the next session and drops removed topics from the plan. After the test date, suggestions stop and the rating prompt appears.

### Prep Session Engine
- [ ] AC-E1: Under the Standard strategy, the first session for an assessment is an adaptive **diagnostic** that takes **≤ 15 minutes** for one test scope. Under Incremental, a diagnostic runs per portion, within the same time limit.
- [ ] AC-E2: A regular prep session lasts **10–20 minutes**.
- [ ] AC-E3: Knowledge tracing keeps a mastery estimate **per fact**, scoped to the assessment, rolled up to subtopic and topic for reporting.
- [ ] AC-E4: Mastery-based progression: a fact counts as mastered only when its estimate passes a configurable threshold.
- [ ] AC-E5: Adaptive learning changes content, questions and difficulty based on demonstrated proficiency.
- [ ] AC-E6: The engine uses retrieval practice, spaced repetition at increasing intervals, error-based remediation, and interleaving.
- [ ] AC-E7: Before the test date, the plan covers every in-scope **Core and Supporting** fact **at least once** and every weak **Core** fact **at least twice**. Peripheral facts are included only when the runway allows.
- [ ] AC-E8: Written answers are assessed **directly by a language model** against the question's model answer and rubric, which marks each answer **correct**, **partial** or **incorrect** with a confidence level. There is no keyword or similarity pre-check. When confidence is below a configurable threshold, a second, more capable language model re-assesses the answer with the same rubric. The grade records which rubric criteria were met or missed. The model answer is always shown straight away. Partial answers earn partial mastery credit (configurable).
- [ ] AC-E9: The grader's correct / partial / incorrect mark agrees with a teacher marking with the same rubric **≥ 90%** of the time on a reviewed sample (validated in the pilot).
- [ ] AC-E10: Results of ad-hoc sessions are included in the next system-generated session.
- [ ] AC-E11: Grading respects a configurable cost cap per session. Once the cap is reached, low-confidence answers are not escalated and are marked "close".
- [ ] AC-E12: Children's Afrikaans spelling slips don't by themselves make an answer wrong. Answers the grader can't decide are marked **"close"**, never wrong, and are queued for a teacher to mark with the rubric during the pilot.

#### Prep strategies
- [ ] AC-E13: The runway ratio (prep days remaining ÷ count of Core and Supporting facts in the scope, weighted by importance and difficulty) is calculated when an assessment is added and recalculated whenever its date or scope changes or a day passes. It is never shown to users as a number.
- [ ] AC-E14: The engine picks a strategy using configurable cut-offs: **Incremental** above the upper cut-off, **Standard** between them, **Last-minute** below the lower cut-off (today or tomorrow always counts as Last-minute, per AC-P11).
- [ ] AC-E15: Incremental splits the scope into ordered **portions** along CAPS topic and textbook page boundaries. Each portion has a study instruction ("study pages 56–61 by Wednesday") followed by prep sessions on that portion only. Remaining portions are spread across the runway, and the last part of the runway is kept for a cumulative, interleaved review of all portions.
- [ ] AC-E16: When the child completes a portion, the parent receives a progress update (push + email, per AC-O rules) showing the portion's mastery and what comes next.
- [ ] AC-E17: The next-session suggestion stays one session at a time (AC-P4); the active strategy decides that session's portion and focus.
- [ ] AC-E18: The parent and the child can each switch the strategy (e.g. Incremental → Standard). If the child switches, the parent is alerted; if both change it, the parent's choice wins.
- [ ] AC-E19: If the runway shrinks (missed sessions, a moved date, a bigger scope), the engine re-plans and can move to a more compressed strategy, explaining this in a calm message to the child and parent.
- [ ] AC-E20: For every assessment, the strategy used, any switches, the per-portion results and the outcome (rating and mark) are recorded. Per-child tuning adjusts that child's cut-offs and portion sizes, and new strategies can be added as plug-ins without changing the planner, the grader or the session runner. ***Staging:** recording strategies, switches and outcomes is in v1; per-child tuning is deferred (D1). See [Architecture → Debt Ledger](logical-design/ARCHITECTURE.md#debt-ledger).*

#### Importance-weighted prep
- [ ] AC-E21: Question selection, spacing and repetition are **proportional to importance**: Core facts (above all margin keywords and definitions) are asked first, more often, and reviewed at shorter spaced intervals; Supporting facts less often; Peripheral facts only when time allows, and never in Last-minute sessions.
- [ ] AC-E22: A fact linked as **elaborating** a keyword is only drilled after the keyword itself is mastered. A fact linked as a **duplicate** shares mastery with the fact it duplicates and is not drilled separately.
- [ ] AC-E23: An assessment counts as "ready" when the weighted mastery of its Core facts reaches a configurable threshold. Readiness % shown to parents is weighted by importance, so Peripheral facts barely affect it.
- [ ] AC-E24: Importance tiers and weights are inputs that later per-child and outcome-based tuning (AC-E20) can learn from, e.g. which facts appeared to matter in tests children rated "tough". ***Staging:** deferred with per-child tuning (D1). See [Architecture → Debt Ledger](logical-design/ARCHITECTURE.md#debt-ledger).*

### Parent Oversight & Alerts
- [ ] AC-O1: Push + email **within 5 minutes** when a child adds or edits a test or exam.
- [ ] AC-O2: At the scheduled session time, a push goes to the child and the parent.
- [ ] AC-O3: If no session is started within **2 hours** of the scheduled time, it is logged as **missed** and the parent is alerted.
- [ ] AC-O4: Push + email **within 5 minutes** when a session is completed, with the score, weak topics and the suggested next step.
- [ ] AC-O5: A weekly digest email is sent every Sunday evening.
- [ ] AC-O6: The per-child dashboard shows upcoming tests and exams, readiness % per test (importance-weighted, AC-E23), weak topics and weak keywords, credits and reward goal, and a full log of planned, missed, completed and ad-hoc sessions.
- [ ] AC-O7: The parent can mute any alert type for each channel (email/push), including portion-progress and strategy-switch alerts.

### Child Experience & Gamification
- [ ] AC-G1: All child-facing text is in Afrikaans, at a reading level suitable for Grade 4.
- [ ] AC-G2: Wrong answers never produce negative or shaming language; the child sees an encouraging line plus the model answer. For a partial answer, the child sees what they got right and which key point was missing.
- [ ] AC-G3: Every completed session ends with a celebration animation, praise, and the credits earned.
- [ ] AC-G4: Credits are earned only in the app (no money value, no shop), for adding a test, completing a session, finishing early, keeping a streak and entering a post-test mark, according to a parent-visible credit table.
- [ ] AC-G5: Credits unlock levels, badges and cosmetic items.
- [ ] AC-G6: A parent can optionally set a real-life reward at a credit target. Slaag tracks progress towards it; the parent provides the reward.
- [ ] AC-G7: Animations run smoothly on a 2 GB RAM Android device.
- [ ] AC-G7a: Every parent and child journey works in the web app on current mobile browsers (Chrome on Android, Safari on iPhone) and desktop browsers (Chrome, Edge, Safari, Firefox), with layouts that suit phone and desktop screens.
- [ ] AC-G8: A 15-minute session uses < 5 MB of mobile data.
- [ ] AC-G9: Streaks are visible to the child and shown on the parent dashboard.

### Language
- [ ] AC-X1: Every user-facing string (web, apps, emails, push, digest, help pages, praise and humour, grader feedback) comes from per-language resources; an automated check finds no hard-coded user-facing text.
- [ ] AC-X2: Supported languages are `af` and `en`; only `af` is enabled in year 1, and enabling `en` is a configuration change, not a code change.
- [ ] AC-X3: The language is resolved as explicit choice > entry point (landing-page path or campaign tag) > default `af`, and the result stays the same from the landing page through sign-up and the first app session.
- [ ] AC-X4: At registration the resolved language is saved on the family; all children in the family use it; the parent can change it in settings, and the change applies to the UI, emails and push.
- [ ] AC-X5: Every textbook, index node, fact, paraphrase, question and model answer has a language tag; a child only ever sees content in the family's language.
- [ ] AC-X6: Landing pages, app store listings and notification templates exist for each enabled language.
- [ ] AC-X7: Before the PayFast payment window and the Google sign-in screen, Slaag shows a short Afrikaans explanation of the step.
- [ ] AC-X8: Grader feedback and the model answers shown are in the family's language.

### Multi-brand
- [ ] AC-B1: Brand name, logo, colours, mascot, tone and copy, domains, email sender, legal pages, store IDs, OAuth clients, push settings, PayFast merchant and allowed/default languages all come from a brand configuration record; an automated check finds no hard-coded "Slaag" in user-facing code or templates.
- [ ] AC-B2: Requests are resolved to a brand by domain (web) or app ID (apps); an unknown domain is rejected.
- [ ] AC-B3: Language is resolved **within** the brand (AC-X3) and limited to that brand's allowed languages.
- [ ] AC-B4: Each brand ships its own Android app from the same codebase, using per-brand build config.
- [ ] AC-B5: A parent who signs in with the same Google account or email and password on a second brand is recognised as the same person. They can use that brand after subscribing to it; each brand's subscription is billed by that brand's PayFast merchant.
- [ ] AC-B6: Every message, email, page and screen shown to a user carries only the branding of the brand they're currently using.
- [ ] AC-B7: The engine and content back office are shared; a content set can be enabled for any brand that allows its language.
- [ ] AC-B8: A test (non-production) second brand with its own domain can be set up purely through configuration and per-brand app builds, proving AC-B1–B7 before launch. ***Staging:** the test second-brand rehearsal moves to after launch (D5); brand configuration and the hard-coded-brand check stay in v1. See [Architecture → Debt Ledger](logical-design/ARCHITECTURE.md#debt-ledger).*

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
| Native apps are a later phase | How do alerts reach people without native apps? (R3) | An Android app with push in year 1 (originally store apps for both platforms, later narrowed to Android); no WhatsApp |
| Content must be textbook-specific | Contrarian: could it be CAPS-topic-based? (R4) | Originally a hybrid (CAPS bank + per-textbook overrides); revised 2026-11-16: the textbook is the primary index, with facts cross-referenced to CAPS |
| "Credits" | Simplifier: what's the minimum? (R6) | In-app only + reward goals set by parents |
| Lasting mastery across the year | Ontologist (R8) | No: each test or exam stands alone |
| Per-child pricing | (R11) | Flat family fee, ≤ 3 children, PayFast |
| "Negotiate" a schedule | Study windows proposed (R12) | One suggestion at a time; rules in R16 |
| The apps can sell subscriptions | Store billing rules (R14) | Web-only checkout; no purchase UI in the apps |
| "JEV" grader | What is it, and what does it cost? (R15) | Two-step grader: similarity first, then a small LLM; cost cap. *Revised 2026-11-16:* language-model evaluation for every answer, escalating to a more capable model below a confidence threshold; cost cap |
| Children sign in with credentials | Revision (2026-11-16): the user wanted children's access to be effortless | Parent-authorised device linking by code or QR; a name picker on shared devices; no child credentials |
| Brand and product are Afrikaans-only forever | Revision (2026-11-16): future English audience | Language-driven from day 1; Afrikaans enabled, English switched off; language from explicit choice > entry point > default |
| One brand forever | Revision (2026-11-16): English may be a different brand on a different domain | Multi-brand platform; brand is a config record resolved by domain or app; shared parent identity, per-brand subscriptions |
| Province matters | What does it change? (R20) | User expanded scope: pick a school from ~2,000 preloaded schools; province purpose assumed reporting-only |

### Open assumptions & risks
- ⚠️ **Delivery risk (highest):** about 11 weeks from 2026-11-14 to the February 2027 production launch, with the full engine, the Android app and responsive web app, PayFast billing, the back office, and teacher-approved content across Gr 4–7 × 3–4 subjects × 2–3 textbooks × 4 terms. Planning should stage content (e.g. Term 1 topics first, since a February launch only needs Term 1 tests) and sequence the engine techniques behind a working core.
- **Province:** assumed reporting-only, with the national school calendar (the user expanded scope to school selection without stating province's purpose). The school list could fill in province automatically.
- **Custom school names:** assumed saved as entered and flagged for staff to add to the master list. Not confirmed.
- **School list source:** where the ~2,000 schools come from (e.g. Department of Basic Education school master list, filtered to Afrikaans/dual-medium) is to be confirmed.
- **KPIs other than NPS:** proposed in R17 but not explicitly confirmed (AC-L4).
- **Textbook copyright:** AI extraction from photographed copies Slaag owns needs legal review. Paraphrased statements (AC-C8, C14) are a partial buffer, not a legal clearance.
- **Importance defaults:** the tier signals (AC-C26), default weights, question counts per tier and the readiness threshold are set and tuned during the pilot.
- **Content ingestion assumptions:** only Slaag content staff upload; a textbook is identified by edition/ISBN as well as title; the quality bar for fact extraction (e.g. share of facts approved without edits) is set during the pilot.
- **Fee amount:** business decision; config value.
- **Delivery risk, wider scope:** device linking, the language system, brand configuration (including a test second brand) and the strategy layer add to the 11-week build window above.
- **Children across brands:** assumed shared with the parent identity, and can be enrolled under either brand.
- **Language per brand:** family language is stored per brand membership, so one family can use Afrikaans on Slaag and English on another brand.
- **POPIA for shared identity:** privacy notices must say that the operating company (Slaag Group) shares one sign-in across its brands; consent is recorded per brand.
- **Strategy switching:** if the child switches strategy, the parent is alerted; if both change it, the parent's choice wins.
- **Strategy cut-offs:** initial runway-ratio cut-offs and portion sizes are set during the January 2027 pilot.
- **PayFast capabilities:** the billing flow assumes PayFast notifies Slaag of failed attempts (possibly every attempt) and reports the subscription's status (active/paused) in the notification or through its API, and sends webhooks for card nearing expiry and successful payment, and supports reactivating a paused subscription through a new checkout. Check this against PayFast's subscription API early in planning.
- **Apple sign-in rule (future):** if an iOS app is added later, Apple's guideline 4.8 may require Sign in with Apple alongside Google; this must be checked then. It doesn't apply in year 1 (no iOS app).
- **Reactivation charge:** assumed to work like a first checkout, with a pro-rata charge to the next 2nd of the month.
- **Partner membership check:** year 1 assumes self-declared membership with a membership number, checked afterwards by the partner from an export. Live verification through a partner's system is future work and depends on each partner.
- **Existing subscribers:** campaigns are assumed to apply to new and returning subscribers only. Whether a family that already pays can switch to a partner discount is to be confirmed.
- **PayFast amount change:** automatic reversion assumes Slaag can change the recurring amount of an existing PayFast subscription through its API. Check this early in planning.
- **Partner agreements:** permission to use partner names and logos, any commission or revenue share, and the partner's role in promoting campaigns are business agreements outside the product. Price-change notices should be checked against consumer-protection rules.

## Technical Context
Greenfield: the repo currently contains only tooling and planning docs.
- **Clients:** a web app responsive for mobile and desktop browsers, and an Android app with native push; no iOS app in year 1. Frameworks and app architecture are specified in the separate architecture document.
- **Auth:** parents use Google OAuth or email and password (verified email, reset by emailed link, rate-limited, hashed passwords). Children use parent-authorised device linking (a one-time code/QR, 15-minute expiry, single use) that creates a long-lived device credential the parent can revoke; there is no child login.
- **Payments:** PayFast (onsite checkout, recurring billing, card update, pause and reactivate); web-only; subscription status driven by authenticated, idempotent PayFast webhooks.
- **Notifications:** email (parents), push (parents and children).
- **AI:** OCR of photographed pages (Afrikaans/English); AI fact extraction, paraphrasing, index/CAPS tagging and curator-initiated question generation, all behind teacher review gates; runtime language-model-based grader against rubrics (confidence threshold with escalation to a more capable model, cost-capped). Model and vendor choices are in the separate architecture document.
- **Learner modelling:** knowledge tracing per assessment + spaced-repetition scheduling, under a pluggable **strategy layer** (runway ratio → Incremental / Standard / Last-minute), with per-child tuning of cut-offs and portion sizes from recorded outcomes.
- **Back office:** web-only content back office with versioning and a review queue.
- **Hosting/compliance:** South African or international cloud region; POPIA, including cross-border transfer conditions (section 72) when data is held outside South Africa.
- **Multi-brand:** brand configuration records; brand resolved by domain or app ID; per-brand Android app builds, OAuth clients, push credentials, email domains and PayFast merchants; shared identity, engine and content.
- **Internationalisation:** per-language string resources for every surface; language resolved from explicit choice > entry point > default `af`; language-tagged content; per-language email/push templates, landing pages and store listings; `en` switched off by a flag.

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Brand | core domain | name, domains, visual identity, tone, email sender, store/app IDs, OAuth clients, push config, PayFast merchant, legal pages, allowed + default languages | has BrandMemberships; enables content sets by language |
| BrandMembership | supporting | parent, brand, family language, acquisition entry point, POPIA consent timestamp, joined-at | links a Parent identity to a Brand; owns that brand's Subscription |
| Parent | core domain | name, email, sign-in method (Google / email+password), email verified, password hash (identity shared across brands) | has BrandMemberships; owns Subscription per brand; owns 1–3 Child; sets ParentRewardGoal |
| Child | core domain | short name, grade (4–7), province | belongs to Parent; attends School; has Subjects with Textbooks; has Assessments; earns Credits |
| School | supporting | name, province, preloaded flag / custom-entered | attended by Child (~2,000 preloaded) |
| Partner | supporting | name, logo, logo-use permission, contact, membership-number format, brand | runs Campaigns |
| Campaign | supporting | partner, name, sign-up window, discount (% or rand), discount period (months), sign-up cap, terms, landing page, code, status | offers a discount; attributed to BrandMemberships |
| SubscriptionDiscount | supporting | campaign, membership number, starts, ends, status (active/removed/expired), reversion notice sent | belongs to Subscription; at most one |
| Subscription | core domain | brand, family flat fee, current fee, status (active/overdue/suspended/cancelling/cancelled/deleted), billing day = 2, pro-rata first charge, card expiry warning, cancellation reason, status history | belongs to BrandMembership (one per brand); billed through PayFast |
| PayFast | external system | token, subscription ID, subscription status, card-update flow, webhooks (each failed attempt, subscription paused, card expiring, payment success) | processes Subscription payments (web only); notifies Slaag through webhooks |
| Subject | supporting | name, grade, active flag | Child activates Subject with one Textbook |
| SourceDocument (Textbook) | core domain | type (textbook first), title, publisher, edition/ISBN, grade, subject, language, cover | has IndexNodes, Uploads, Pages |
| IndexNode | core domain | level (term/topic/subtopic), title, page range | belongs to SourceDocument (primary index tree); maps to CAPSNode |
| CAPSNode | supporting | grade, subject, term, topic, subtopic | cross-referenced by IndexNodes and Facts |
| Upload | supporting | PDF, grade, textbook, section, page ranges, uploaded by | produces Pages |
| Page | supporting | page number, image, OCR text, quality flag, version | belongs to SourceDocument; has Facts |
| Fact | core domain | verbatim text, type, key terms, page area, position type (margin keyword, body, summary…), importance tier (Core/Supporting/Peripheral), weight, importance signal, index node, CAPS node, review status, language | from Page; has Paraphrases; FactLinks (elaborates / duplicates / part of / related) to other Facts; source of Questions; unit of mastery |
| Paraphrase | supporting | text, review status | 1–2 per Fact |
| GenerationRun | supporting | curator, scope, options (count, types, verbatim/paraphrase), created count, time | creates Questions |
| Question | core domain | type, difficulty, review status, language, based on (verbatim/paraphrase) | generated from Fact(s) by a GenerationRun; has ModelAnswer; has ContentVersions |
| ModelAnswer | supporting | text, source fact references, based on (verbatim/paraphrase) | belongs to Question; generated with it |
| Rubric | supporting | correct / partial / incorrect criteria, weighted key points, accepted alternatives, known misconceptions, partial-credit rules | belongs to Question; applied by the grader; versioned |
| ContentVersion | supporting | version, author, status (draft/approved/hidden) | versions Facts, Paraphrases, Questions, ModelAnswers, Rubrics |
| TeacherReviewer | supporting | name, subjects | approves ContentVersions |
| ProblemReport | supporting | reporter, reason, status | raised by Parent/Child on Question; ≥3 open → auto-hide |
| Assessment (Test/Exam) | core domain | type, subject, date, scope, rating, mark, runway ratio, active strategy, strategy history | belongs to Child; has PrepSessions; has AssessmentMastery; has ScopePortions |
| PrepStrategy | supporting | key (incremental/standard/last-minute), cut-offs, portion-size rules, per-child tuning | chosen for Assessment; pluggable |
| ScopePortion | supporting | order, topics, page range, study-by date, status, mastery | belongs to Assessment (Incremental); has PrepSessions |
| PrepSession | core domain | kind (diagnostic/system/ad-hoc/last-minute/portion/cumulative review), scheduled time, status, score, duration | belongs to Assessment (and optionally a ScopePortion); contains LearnerResponses |
| LearnerResponse | core domain | answer text/choice, grade (correct/partial/incorrect, or close if undecided), rubric criteria met/missed, evaluator used, confidence | belongs to PrepSession; updates AssessmentMastery |
| AssessmentMastery | core domain | per-fact mastery estimate, rolled up to subtopic/topic | belongs to Assessment (not carried over) |
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

## Revision History
| Date | Change |
|---|---|
| 2026-11-14 | Approved after the deep interview (20 rounds, 12% ambiguity). |
| 2026-11-16 | Revised after approval, at the user's request: **child device linking** replaces child credentials and PINs (AC-A6, A8–A12); **language-driven experience**, Afrikaans only in year 1 and English ready (AC-X1–X8); **multi-brand platform** with one parent sign-in across brands (AC-B1–B8); **prep strategies chosen by lead time** (AC-E1, E13–E20, AC-O7). The interview transcript below shows the original Round 9 answer, which this revision replaces. |
| 2026-11-16 | **Subscription management and billing lifecycle:** web account and subscription page; guided cancellation with reasons; PayFast-webhook-driven Overdue → Suspended states, replacing the 7-day grace period; reactivation by new checkout; card-expiry email and in-app notice (AC-A14–A16, A21–A27). Slaag determines first vs final failure from its own status plus PayFast's reported subscription status, and emails only on the first failure and on suspension, never on each attempt. |
| 2026-11-16 | **Parent sign-in:** Google or email and password only; Microsoft and Apple sign-in removed (AC-A1, A1a, A1b, A8, X7, B5). |
| 2026-11-16 | **Platforms:** year 1 is the **Android app + responsive web app** only; iOS app deferred; iPhone users use the web app and get email alerts (AC-A13, B4, G7a). |
| 2026-11-16 | **Framework references removed:** technology and framework choices moved to a separate architecture document. |
| 2026-11-16 | **Content ingestion:** photo-PDF upload tagged with grade and textbook; OCR; facts as the base layer, verbatim plus 1–2 paraphrases; textbook index primary (built from the table of contents) with a CAPS cross-reference, replacing the CAPS-bank hybrid; Gate 1 reviews every fact; curator-initiated, overridable, repeatable question generation; risk-based Gate 2; replace-and-redo re-uploads (AC-C1–C24, E3, E4, E7, E13, P10, X5). |
| 2026-11-16 | **Fact importance:** Core/Supporting/Peripheral tiers and weights proposed by AI from textbook signals (margin keywords highest) and confirmed by teachers; typed fact links (elaborates/duplicates/part of/related); prep, question counts and readiness weighted by importance (AC-C7, C10, C13, C25–C28, E7, E13, E21–E24, P11, O6). |
| 2026-11-16 | **Model answers and marking rubrics:** question generation explicitly produces a model answer from the source fact(s) and a rubric defining correct / partial / incorrect for every question; both are reviewed and versioned at Gate 2; the grader marks correct / partial / incorrect against the rubric, with "close" kept for undecided answers (AC-C15–C15c, E8, E9, E12, G2). |
| 2026-11-16 | **Partner campaigns:** partners (e.g. AfriForum, Solidariteit, OUTA) run campaigns with a sign-up window, a percentage or rand discount and a discount period; co-branded landing pages, links and codes; self-declared membership numbers checked by the partner; discount locked in at sign-up and reverted automatically to the standard fee after a 30-day notice; no stacking; partner reporting (AC-A28–A37). |
| 2026-11-16 | **Staging and deferrals:** the PRD now refers to the architecture document (v1 Scope & Staging, Debt Ledger) for which capabilities are deferred; *Staging* notes added to AC-A16, C6, C9, C13, C28, E20, E24 and B8. |
| 2026-11-16 | **Pilot pricing:** the open assumption that the January 2027 pilot is free is removed. |
| 2026-11-16 | **Grader:** the keyword/similarity first step is removed; every written answer goes straight to language-model evaluation against the rubric, with a confidence threshold that escalates to a more capable model, and the cost cap unchanged (Constraints, AC-E8, E11, Technical Context, Ontology). |
| 2026-11-16 | **Hosting:** the South African hosting requirement (Round 18) is removed; international hosting is allowed, subject to POPIA's cross-border transfer conditions (Constraints, Technical Context). |

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
**Q:** Alert channels? **A:** Email + push via store apps; no WhatsApp. **Ambiguity:** 47%
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
