# Deep Interview Spec: Slaag — Year-1 PRD (Afrikaans Test & Exam Prep for Grades 4–7)

## Metadata
- Interview ID: b7e4c2a1-5f3d-4e8a-9c61-2d0f8a7b3e15
- Rounds: 13 (plus Round 0 topology)
- Final Ambiguity Score: 18%
- Type: greenfield
- Generated: 2026-11-13T01:44:59Z
- Threshold: 0.2
- Threshold Source: default
- Initial Context Summarized: no
- Status: PASSED — pending approval

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.87 | 0.40 | 0.348 |
| Constraint Clarity | 0.80 | 0.30 | 0.240 |
| Success Criteria | 0.77 | 0.30 | 0.231 |
| **Total Clarity** | | | **0.819** |
| **Ambiguity** | | | **0.181** |

## Topology
Confirmed in Round 0 (2026-11-10). Platform note: native store apps were initially deferred, but brought into year-1 scope in Round 3 as hybrid apps.

| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|-------------|--------------------------|
| Accounts & Family Setup | active | Parent social login, family subscription via PayFast, parent-owned child accounts, child profile (grade, province, textbook per subject) | AC-A1…A12 |
| Content & Question Bank | active | Hybrid CAPS-topic question bank + per-textbook page maps and wording overrides; AI-drafted, teacher-approved | AC-C1…C7 |
| Test/Exam Planner | active | Add test/exam (date + scope), parent review/edit, single next-session suggestion, post-test rating and marks | AC-P1…P8 |
| Prep Session Engine | active | Full adaptive engine: diagnostic, adaptive learning, knowledge tracing, mastery progression, retrieval practice, spaced repetition, remediation, interleaving; LLM-graded written answers | AC-E1…E10 |
| Parent Oversight & Alerts | active | Email + push alerts, missed-session detection, weekly digest, per-child dashboard | AC-O1…O7 |
| Child Experience & Gamification | active | Fun, low-stress Afrikaans UX; in-app credits, levels, badges, streaks, cosmetics; parent reward goals | AC-G1…G9 |
| Schools / teachers / tutors | deferred | Group subscriptions, flipped classroom, pre/post quizzes, tutor assessment | Deferred by user in Round 0 (2026-11-10): long-term opportunity, not year 1 |
| English-speaking users | deferred | Expansion beyond Afrikaans communities | Deferred by user in Round 0 (2026-11-10): year 1 is 100% Afrikaans |
| Non-education extensions | deferred | Other Slaag Group businesses for Afrikaner households | Deferred by user in Round 0 (2026-11-10) |

## Goal
Slaag ("pass/succeed") is the first business of Slaag Group, a platform for Afrikaans-speaking families in South Africa. In year 1, Slaag helps parents of Grade 4–7 children prepare their children for school **tests** (small, during term) and **exams** (end of term, consolidated), replacing last-minute, stressful manual quizzing from the textbook.

A parent subscribes and sets up up to 3 children with their grade, province and the textbook per subject. The parent or child adds an upcoming test/exam with its date and scope (content-tree selection or page ranges). Slaag then suggests prep sessions, where an adaptive engine diagnoses gaps and drills the child until mastery using multiple-choice and written definition/paragraph questions graded instantly by an inexpensive LLM classifier against teacher-approved model answers. Parents get honest visibility into planned, missed and completed sessions and readiness, so the "I studied, I promise" problem disappears. Children get a fun, encouraging, gamified experience.

## Constraints
**Platform & tech**
- Single codebase: a **TanStack Start** web application, responsive for laptop and mobile browsers, wrapped with **Capacitor** into hybrid apps published to the app stores (Google Play and Apple App Store; Android is the priority, as ~10% of parents use Apple and many Gr 6–7 kids have their own Android phone).
- Push notifications to parents and children come through the hybrid apps; parents also get email. **No WhatsApp.**
- Must run smoothly on low-end Android phones (2 GB RAM) and be data-frugal (a 15-min session uses < 5 MB).

**Accounts & billing**
- Parents sign in **only** with Google, Microsoft or Apple. Parent accounts have no local username/password.
- Child accounts are created and owned by the parent. A child can sign in with Google/Microsoft/Apple **or** a username/password. Only a name is required for a child.
- Pricing is **one flat fee per family, for up to 3 children**. The rand amount is a configurable business value.
- Payment is by card through **PayFast**, with onsite checkout. The first charge is pro-rata, with recurring billing on the **2nd of each month**. Parents can start a card update from within Slaag, which hands off to PayFast.
- Registration and payment are available on the web app.

**Content**
- Year-1 launch coverage: **Grades 4–7**, content-heavy subjects only: Natuurwetenskappe & Tegnologie (Natuurwetenskappe in Gr 7), Sosiale Wetenskappe (Geskiedenis + Aardrykskunde), EBW (Gr 7). Covers the 2–3 most-used Afrikaans textbooks per subject/grade, for all 4 terms.
- Content model is hybrid: a shared CAPS-topic question bank per grade/subject, plus per-textbook chapter/page → topic maps, plus per-textbook overrides of definitions and model answers where wording differs.
- Content production: AI drafts content trees, questions and model answers from textbook copies Slaag owns; Afrikaans teachers review and approve every item before learners see it.

**Engine**
- **All** listed techniques are in the first release. Distinguish **Adaptive Learning** (overall paradigm), **Knowledge Tracing** (learner model) and **Spaced Retrieval** (reinforcement technique).
- Each test/exam stands alone: mastery is modelled **per assessment** and starts fresh for each one. Within an assessment, ad-hoc sessions feed the plan. Per-child tuning from post-test marks adjusts engine behaviour (e.g. pacing/difficulty), not carried concept mastery.
- Written-answer grading uses an inexpensive LLM classifier (the user referred to "JEV"; exact technology to be confirmed during planning).

**Compliance & tone**
- Children's data is handled under **POPIA**, with the parent (as competent person) giving recorded consent at registration.
- All child-facing UI is in Afrikaans; the tone is light, humorous and never shaming.

## Non-Goals (Year 1)
- Schools, group subscriptions, teachers, flipped classroom, tutors.
- English-language users or UI.
- Non-education Slaag Group products.
- Wiskunde, home and additional language subjects, Lewensvaardigheid/LO.
- WhatsApp notifications.
- Persistent cross-assessment mastery (e.g. an exam starting from earlier test mastery).
- Multi-slot study plans or parent-defined study windows. Scheduling is one suggestion at a time.
- Real-world prizes, vouchers or a credit shop. Credits have no money value.
- Families with more than 3 children on one subscription.

## Acceptance Criteria

### Accounts & Family Setup
- [ ] AC-A1: A parent can register and sign in only through Google, Microsoft or Apple; no password form exists for parents.
- [ ] AC-A2: Registration records the parent's POPIA consent for processing their children's data (timestamped).
- [ ] AC-A3: Checkout uses PayFast onsite payment. The first charge is pro-rata to the 2nd of the next month, and recurring charges run on the 2nd.
- [ ] AC-A4: A parent can start a card update from Slaag, which completes on PayFast.
- [ ] AC-A5: A parent with an active subscription can create up to 3 child accounts; a 4th is blocked with a clear message.
- [ ] AC-A6: Creating a child requires only a name; grade (4–7) and province are captured during child setup.
- [ ] AC-A7: For each subject, the parent can confirm the textbook and turn the subject on, now or later. Subjects without a confirmed textbook stay inactive.
- [ ] AC-A8: A child can sign in with Google, Microsoft, Apple, or a username/password set by the parent.
- [ ] AC-A9: On the parent's device, a "Who's studying?" switcher lets each child enter with a 4-digit PIN. Returning to parent areas requires parent re-authentication or device biometrics.
- [ ] AC-A10: Several children can share one device and switch with their PINs. On a child's own device, the child signs in once and stays signed in.
- [ ] AC-A11: A parent can reset a child's PIN or password at any time.
- [ ] AC-A12: No email-link login exists for children.

### Content & Question Bank
- [ ] AC-C1: Every in-scope grade/subject has a CAPS-topic tree with questions for all 4 terms.
- [ ] AC-C2: Every launch textbook (2–3 per subject/grade) has a chapter/page → CAPS-topic map, so a page range like `56-67, 88-95` resolves to topics.
- [ ] AC-C3: Per-textbook overrides replace shared definitions and model answers where the textbook's wording differs, and the learner sees the override.
- [ ] AC-C4: Question types: multiple choice, short keyword definition, and paragraph answer; written types always have a model answer.
- [ ] AC-C5: No question reaches a learner unless a teacher reviewer has approved it (approval status and reviewer recorded).
- [ ] AC-C6: AI-drafted items are traceable to the source textbook and pages they came from.
- [ ] AC-C7: Launch readiness means 100% of in-scope topics for the launch textbooks have approved questions.

### Test/Exam Planner
- [ ] AC-P1: The parent or the child can add a test or exam with a type (test/exam), subject, date, and scope.
- [ ] AC-P2: Scope can be set by selecting items from the textbook's content tree **or** entering page ranges.
- [ ] AC-P3: When a child adds or edits a test or exam, the parent is alerted and can view and edit every detail, including the prep session date and time.
- [ ] AC-P4: Slaag weighs the scope size against the days remaining and suggests **one** next prep session date and time; the child or parent accepts it or changes it.
- [ ] AC-P5: A child can start a system prep session manually at any time, and can create an ad-hoc session on a subset of the scope.
- [ ] AC-P6: After a session, Slaag suggests the next step (e.g. another, deeper session) based on the time remaining and the session results.
- [ ] AC-P7: After the test date, the child is asked to rate it **tough / ok / good** and can optionally enter a % or mark.
- [ ] AC-P8: Ratings and marks are stored as a per-child performance record and feed per-child engine tuning.

### Prep Session Engine
- [ ] AC-E1: The first session for an assessment is an adaptive **diagnostic** that establishes proficiency and finds gaps and misconceptions in **≤ 15 minutes** for one test scope.
- [ ] AC-E2: A regular prep session lasts **10–20 minutes**.
- [ ] AC-E3: Knowledge tracing keeps a mastery estimate per concept, scoped to the assessment.
- [ ] AC-E4: Mastery-based progression: a concept counts as mastered only when its estimate passes a configurable threshold.
- [ ] AC-E5: Adaptive learning changes content, questions and difficulty based on demonstrated proficiency.
- [ ] AC-E6: Retrieval practice brings missed concepts back; spaced repetition schedules reviews at increasing intervals until the test date; error-based remediation targets weak concepts; interleaving mixes earlier concepts with new ones.
- [ ] AC-E7: Before the test date, the plan covers every in-scope concept **at least once** and every weak concept **at least twice**.
- [ ] AC-E8: Written answers are graded by an inexpensive LLM classifier against the model answer, and the model answer is shown to the child straight away.
- [ ] AC-E9: The LLM grader agrees with a teacher's "good enough" judgement **≥ 90%** of the time on a reviewed sample.
- [ ] AC-E10: Results of ad-hoc sessions are included in the next system-generated session. *(Tracked, not a launch gate: children who complete the plan rate tests ok/good more often than those who don't.)*

### Parent Oversight & Alerts
- [ ] AC-O1: Push + email **within 5 minutes** when a child adds or edits a test or exam.
- [ ] AC-O2: At the scheduled session time, a push goes to the child and the parent.
- [ ] AC-O3: If no session is started within **2 hours** of the scheduled time, it is logged as **missed** and the parent is alerted.
- [ ] AC-O4: Push + email **within 5 minutes** when a session is completed, with the score, weak topics and the suggested next step.
- [ ] AC-O5: A weekly digest email is sent every Sunday evening.
- [ ] AC-O6: The per-child parent dashboard shows upcoming tests and exams, readiness % per test, weak topics, credits and reward goal, and a full log of planned, missed, completed and ad-hoc sessions.
- [ ] AC-O7: The parent can mute any alert type for each channel (email/push).

### Child Experience & Gamification
- [ ] AC-G1: All child-facing text is in Afrikaans, at a reading level suitable for Grade 4.
- [ ] AC-G2: Wrong answers never produce negative or shaming language; the child sees an encouraging line plus the model answer.
- [ ] AC-G3: Every completed session ends with a celebration animation, praise, and the credits earned.
- [ ] AC-G4: Credits are earned only in the app (no money value, no shop), for adding a test, completing a session, finishing early, keeping a streak and entering a post-test mark, according to a parent-visible credit table.
- [ ] AC-G5: Credits unlock levels, badges and cosmetic items (avatar or mascot outfits).
- [ ] AC-G6: A parent can optionally set a real-life reward at a credit target (e.g. "300 credits = pizza night"). Slaag tracks progress towards it; the parent provides the reward.
- [ ] AC-G7: Animations run smoothly on a 2 GB RAM Android device.
- [ ] AC-G8: A 15-minute session uses < 5 MB of mobile data.
- [ ] AC-G9: Streaks are visible to the child and shown on the parent dashboard.

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| Content must exist before anything works | Where does textbook-specific content come from? (R1) | AI drafts from textbook copies Slaag owns; teachers approve every item |
| Launch engine can be a subset | Proposed an MVP of 3 techniques (R2) | User chose **all techniques** in the first release, the main schedule risk |
| Native apps are a later phase | How do alerts reach people without native apps? (R3) | Hybrid Capacitor apps with push in year 1; email for parents; no WhatsApp |
| Content must be textbook-specific | Contrarian: could it be CAPS-topic-based instead? (R4) | Hybrid: CAPS bank + page maps + per-textbook wording overrides |
| "Credits" | Simplifier: what's the minimum? (R6) | In-app only, with cosmetics; optional reward goals set by parents |
| Launch subjects | Which grades/subjects/textbooks? (R7) | Gr 4–7 content subjects; 2–3 textbooks each |
| Mastery carries across the year | Ontologist: is lasting mastery the core? (R8) | No: each test or exam stands alone |
| Children's social login on shared phones | User was unsure about the UX (R9) | PIN profile switcher; no email links |
| Per-child pricing | Proposed per-child pricing (R11) | Flat family fee, up to 3 children; PayFast |
| "Negotiate" a schedule | Proposed study windows and multi-slot plans (R12) | Simpler: one suggested next session, which the child or parent accepts or changes |

### Open assumptions to confirm during planning
- **Store billing:** checkout happens only on the web, and the store apps show no purchase buttons or payment links. This follows the "reader app" approach and avoids Apple/Google in-app billing fees. Not explicitly confirmed by the user.
- **Failed payment:** 7-day grace period, after which child access is paused and data kept. Not explicitly confirmed.
- **Monthly fee amount:** to be set by the business; stored as a config value.
- **"JEV" grader:** the user named it as an example; the exact classifier and model to be chosen during planning.
- **Textbook copyright:** whether AI-drafting from owned textbook copies is legally allowed needs legal review.
- **Province:** captured at child setup; how it affects the product (e.g. term dates) is not yet defined.

## Technical Context
Greenfield: the repo currently contains only tooling.
- **Frontend/app:** TanStack Start web app, responsive, wrapped with Capacitor for Android and iOS store apps (push notifications through the native layer).
- **Auth:** OAuth with Google, Microsoft, Apple (parent and child); username/password and PIN for children only.
- **Payments:** PayFast (onsite checkout, recurring billing, card update).
- **Notifications:** email (parents) and mobile push (parents and children).
- **AI:** LLM-assisted content drafting (offline, teacher-reviewed); an inexpensive LLM classifier for marking written answers at runtime.
- **Learner modelling:** a knowledge-tracing model per assessment, plus spaced-repetition scheduling.
- **Compliance:** POPIA (children's personal information, parental consent).

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Parent | core domain | name, email, OAuth provider, POPIA consent timestamp | owns Subscription; owns 1–3 Child; sets ParentRewardGoal |
| Child | core domain | name, grade (4–7), province, PIN, login method | belongs to Parent; has Subjects with Textbooks; has Assessments; earns Credits |
| Subscription | core domain | family flat fee, status, billing day = 2, pro-rata first charge | belongs to Parent; billed through PayFast |
| PayFast | external system | token, card-update flow | processes Subscription payments |
| Subject | supporting | name, grade, active flag | Child activates Subject with one Textbook |
| Textbook | supporting | title, publisher, grade, subject | has TextbookPageMap and TextbookOverrides |
| CAPSTopic | core domain | grade, subject, term, concept hierarchy | has Questions; mapped from TextbookPageMap |
| TextbookPageMap | supporting | chapter, page range → topic | links Textbook to CAPSTopic |
| TextbookOverride | supporting | definition/model-answer text | overrides ModelAnswer for a Textbook |
| Question | core domain | type (MCQ/definition/paragraph), difficulty, approval status, source pages | belongs to CAPSTopic; has ModelAnswer |
| ModelAnswer | supporting | text, rubric | belongs to Question; may be overridden per Textbook |
| TeacherReviewer | supporting | name, subjects | approves Questions |
| Assessment (Test/Exam) | core domain | type, subject, date, scope (topics/page ranges), post-test rating, mark | belongs to Child; has PrepSessions; has AssessmentMastery |
| PrepSession | core domain | kind (diagnostic/system/ad-hoc), scheduled time, status (planned/missed/completed), score, duration | belongs to Assessment; updates AssessmentMastery |
| AssessmentMastery | core domain | per-concept mastery estimate | belongs to Assessment (not carried between assessments) |
| Alert | supporting | type, channel (email/push), mute settings | sent to Parent/Child Devices |
| Device | supporting | push token, child profiles present | belongs to Parent and/or Child |
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
| 12 | 22 | 0 | 0 | 22 | 100% |
| 13 | 22 | 0 | 0 | 22 | 100% |

## Interview Transcript
<details>
<summary>Full Q&A (Round 0 + 13 rounds)</summary>

### Round 0 — Topology
User described Slaag Group, the year-1 parent test/exam-prep business, account and subscription mechanics, child setup with textbooks, test/exam entry with scope, prep sessions and their techniques, LLM-graded written answers, post-test ratings, parent logging, and gamification. 6 components locked; schools/teachers/tutors, English and non-education products deferred.

### Round 1
**Q:** Year-1 content source? **A:** AI drafts from textbook copies Slaag owns, approved by Afrikaans teachers, for a small launch textbook set.
**Ambiguity:** 52% (Goal 0.62, Constraints 0.45, Criteria 0.32)

### Round 2
**Q:** Limit the launch engine to diagnostic + knowledge tracing + remediation + spaced review? **A:** No, all techniques in the first release.
**Ambiguity:** 49% (Goal 0.65, Constraints 0.50, Criteria 0.32)

### Round 3
**Q:** Alert channels: WhatsApp + PWA push? **A:** No WhatsApp. Parents get email; parents and kids get push via hybrid store apps (Capacitor-wrapped TanStack Start).
**Ambiguity:** 47% (Goal 0.67, Constraints 0.56, Criteria 0.32)

### Round 4 (Contrarian)
**Q:** CAPS-topic bank + per-textbook page maps instead of fully textbook-specific content? **A:** Hybrid: CAPS bank + page maps + per-textbook wording overrides.
**Ambiguity:** 45% (Goal 0.69, Constraints 0.60, Criteria 0.32)

### Round 5
**Q:** Engine launch bars? **A:** Accepted: diagnostic ≤15 min; sessions 10–20 min; grader ≥90% agreement; coverage ≥1×/weak ≥2×; plan-completion vs rating tracked.
**Ambiguity:** 41% (Goal 0.70, Constraints 0.60, Criteria 0.42)

### Round 6 (Simplifier)
**Q:** What are credits? **A:** In-app only; levels, badges, cosmetics; optional reward goals set by parents.
**Ambiguity:** 38% (Goal 0.74, Constraints 0.63, Criteria 0.46)

### Round 7
**Q:** Launch coverage? **A:** Gr 4–7 NS&Tech/NS, SW (Geskiedenis, Aardrykskunde), EBW Gr 7; 2–3 textbooks each; all terms; teacher-approved.
**Ambiguity:** 34% (Goal 0.75, Constraints 0.67, Criteria 0.53)

### Round 8 (Ontologist)
**Q:** Is lasting per-child mastery the core, with tests as views into it? **A:** No, each test or exam stands alone.
**Ambiguity:** 32% (Goal 0.80, Constraints 0.67, Criteria 0.53)

### Round 9
**Q:** Child access on shared devices? **A:** Accepted: PIN profile switcher, one-time sign-in on own device, parent resets, no email links.
**Ambiguity:** 30% (Goal 0.83, Constraints 0.68, Criteria 0.56)

### Round 10
**Q:** Parent oversight requirements? **A:** Accepted: 5-min alerts, 2-h missed rule, completion alerts, Sunday digest, dashboard, per-channel mute.
**Ambiguity:** 27% (Goal 0.85, Constraints 0.68, Criteria 0.63)

### Round 11
**Q:** Pricing and payments? **A:** Flat fee per family, up to 3 children; PayFast onsite checkout; card update started from Slaag.
**Ambiguity:** 24% (Goal 0.86, Constraints 0.75, Criteria 0.64)

### Round 12
**Q:** Scheduling rules with study windows and multi-slot plans? **A:** Simpler: one suggested next session, which the child or parent accepts or changes.
**Ambiguity:** 21% (Goal 0.87, Constraints 0.76, Criteria 0.70)

### Round 13
**Q:** Child experience acceptance criteria? **A:** Accepted: Afrikaans Gr 4 reading level, no shaming, celebration, credit table, 2 GB Android, <5 MB per session, POPIA consent.
**Ambiguity:** 18% (Goal 0.87, Constraints 0.80, Criteria 0.77)
</details>
