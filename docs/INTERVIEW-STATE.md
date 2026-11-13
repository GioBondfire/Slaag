# Slaag PRD — Deep Interview State (Checkpoint)

> Checkpoint only. The interview is **still in progress**: it has not been concluded and the PRD is not approved.
> Draft PRD: [PRD.md](PRD.md). Machine state: `.omc/state/deep-interview-state.json` (git-ignored, kept as is).

## Progress & Phase
| Item | Value |
|---|---|
| Interview ID | b7e4c2a1-5f3d-4e8a-9c61-2d0f8a7b3e15 |
| Type | Greenfield |
| Threshold | 20% (source: default) |
| Rounds completed | Round 0 (topology) + 13 scored rounds |
| Current ambiguity | **18%** (Goal 0.87 · Constraints 0.80 · Criteria 0.77). Below the threshold. |
| Challenge rounds used | Contrarian (R4), Simplifier (R6), Ontologist (R8): all used |
| Phase | **Phase 2, refinement.** A spec was written after R13, and at the Phase 5 approval step you chose **"Refine further"**. Round 14 was asked, but the session was interrupted before an answer was recorded. |
| Soft limit | Past 10 rounds; the hard cap is 20 rounds (6 left) |

## Topology (locked 2026-11-10)
**Active:** Accounts & Family Setup · Content & Question Bank · Test/Exam Planner · Prep Session Engine · Parent Oversight & Alerts · Child Experience & Gamification.
**Deferred:** Schools/teachers/tutors · English-speaking users · Non-education extensions.
*(Native/hybrid store apps were first deferred, then brought into year 1 in R3.)*

| Part | Goal | Constraints | Criteria |
|---|---|---|---|
| Accounts & Family Setup | 0.90 | 0.85 | 0.70 |
| Content & Question Bank | 0.70 | 0.80 | 0.70 |
| Test/Exam Planner | 0.90 | 0.55 | 0.75 |
| Prep Session Engine | 0.80 | 0.50 | 0.75 |
| Parent Oversight & Alerts | 0.85 | 0.70 | 0.85 |
| Child Experience & Gamification | 0.80 | 0.85 | 0.85 |

## Confirmed Requirements & Decisions
- **Market:** Afrikaans families in SA, year 1 only; parents of Grade 4–7 learners preparing for tests (during term) and exams (end of term).
- **Platform:** a TanStack Start responsive web app, wrapped with Capacitor into store apps (Android priority, plus iOS). Push notifications for parents and children; email for parents. **No WhatsApp.**
- **Parent auth:** Google, Microsoft or Apple only; no local password.
- **Billing:** one **flat fee per family, up to 3 children**. **PayFast** onsite checkout; pro-rata first charge, then billing on the 2nd; card update started from Slaag and completed on PayFast. The fee amount is a config value.
- **Children:** parent-owned accounts; only a name is required, plus grade and province; a textbook confirmed per subject; subjects turned on one at a time. Sign-in by social login or username/password; a "Who's studying?" PIN switcher on shared devices; parent re-authenticates for parent areas; parent can reset PIN/password; no email links.
- **Content:** hybrid model, with a CAPS-topic question bank, per-textbook page→topic maps, and per-textbook wording overrides. AI drafts from textbook copies Slaag owns; every item is teacher-approved before learners see it.
- **Launch coverage:** Gr 4–7 Natuurwetenskappe & Tegnologie (NS in Gr 7), Sosiale Wetenskappe (Geskiedenis + Aardrykskunde), EBW (Gr 7); the 2–3 most-used textbooks for each; all 4 terms.
- **Planner:** parent or child adds a test or exam with date and scope (content tree or page ranges). Parent is alerted and can edit everything. Slaag suggests **one next session** at a time, which the child or parent accepts or changes. The child can start sessions manually and create ad-hoc ones. After the test, the child rates it tough/ok/good and can optionally enter a mark.
- **Engine:** **all techniques in the first release**: diagnostic, adaptive learning, knowledge tracing, mastery progression, retrieval practice, spaced repetition, error remediation, interleaving. **Each test or exam stands alone**, with mastery tracked per assessment. Marks tune per-child engine behaviour only. Written answers are graded by an inexpensive LLM classifier, and the model answer is shown straight away.
- **Engine bars:** diagnostic ≤15 min; sessions 10–20 min; grader ≥90% agreement with teachers; every concept covered ≥1× and every weak concept ≥2× before the test.
- **Oversight:** alerts within 5 min on test add/edit and session completion; session-time push; a session counts as missed after 2 h without starting; Sunday digest email; per-child dashboard; per-channel mute.
- **Gamification:** in-app credits only (no money value, no shop); levels, badges, cosmetics and streaks; a parent-visible credit table; optional reward goals set by parents.
- **Child UX:** Afrikaans at a Grade 4 reading level; no shaming language; celebration at the end of each session; smooth on 2 GB RAM Android; <5 MB per 15-min session; POPIA consent recorded at registration.

## Questions Already Answered
| R | Part | Question | Answer |
|---|---|---|---|
| 0 | — | Top-level parts | 6 active, 3 deferred (above) |
| 1 | Content | Content source? | AI draft + teacher approval |
| 2 | Engine | Smaller launch engine? | No, all techniques |
| 3 | Oversight | Alert channels? | Email + push via Capacitor apps; no WhatsApp |
| 4 | Content (Contrarian) | Textbook-specific vs CAPS? | Hybrid |
| 5 | Engine | Launch bars? | Accepted |
| 6 | Child UX (Simplifier) | What are credits? | In-app only + parent reward goals |
| 7 | Content | Launch coverage? | Gr 4–7 content subjects, 2–3 textbooks |
| 8 | Planner (Ontologist) | Lasting mastery as the core? | No, each test stands alone |
| 9 | Accounts | Shared-device child access? | PIN switcher flow accepted |
| 10 | Oversight | Alert and dashboard rules? | Accepted |
| 11 | Accounts | Pricing and payments? | Flat family fee, ≤3 kids, PayFast |
| 12 | Planner | Scheduling rules? | Simpler: one suggestion at a time |
| 13 | Child UX | Child UX criteria? | Accepted |

## Outstanding Questions & Ambiguities
1. **Store billing:** checkout only on the web, with no purchase buttons or links in the iOS/Android apps? *(Round 14, pending.)*
2. **Failed payment:** a 7-day grace period, then child access paused and data kept? *(Assumed, not confirmed.)*
3. **"JEV" grader:** what you meant by it; which classifier or model; the cost per graded answer.
4. **Textbook copyright:** whether AI-drafting from textbook copies Slaag owns is allowed (legal review needed).
5. **Province:** what it changes in the product (e.g. term calendars, exam dates), or whether it's only for analytics.
6. **Fee amount:** the rand price for each family (business decision).

## Topics Still to Explore
- **Prep Session Engine constraints (0.50, weakest):** delivery risk of building every technique for the first release; engine fallback while there's no data; LLM cost limits per session.
- **Test/Exam Planner constraints (0.55):** how "scope size vs days left" sets the suggested time; what happens when a test is tomorrow or the date has passed; editing scope after sessions have started.
- **Content operations:** number of teacher reviewers and turnaround; how corrections reported by learners or parents are handled.
- **Launch plan:** pilot vs full launch, a target date, and first-year business KPIs (subscribers, retention).
- **Admin tooling:** a content-review back office and support/admin views.
- **Data and privacy detail:** data retention when a subscription lapses; account deletion; where data is hosted.

## Exact Next Question (Round 14)
**Round 14 | Part: Accounts & Family Setup | Targeting: Constraints (0.85) | Why now: store billing is the open assumption with real rejection risk; Apple and Google can reject apps that sell digital subscriptions outside their own billing | Ambiguity: 18%**

> Should the iOS and Android apps contain no purchase buttons, prices or links to payment? A new parent would download the app, sign in, and see a neutral line such as "Your account isn't active yet". Subscribing and updating cards would happen only on the Slaag website through PayFast. This "reader app" approach avoids the 15–30% store fees but makes sign-up in the app a little clumsier.

Options:
1. **Yes, web-only checkout (Recommended):** PayFast on the website only; the apps sign people in but never sell.
2. **Store billing in apps too:** Apple/Google in-app subscriptions as well as PayFast on the web; 15–30% fee and two billing systems to keep in sync.
3. **Android only at launch:** ship Android first and defer the Apple decision.
