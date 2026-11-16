# Slaag PRD — Deep Interview State

> The interview has **finished** and the spec was **APPROVED** on 2026-11-14T00:45:29Z. Spec: [PRD.md](PRD.md) (copy of `.omc/specs/deep-interview-slaag-prd.md`). Machine state: `.omc/state/deep-interview-state.json`.

## Progress & Phase
| Item | Value |
|---|---|
| Interview ID | b7e4c2a1-5f3d-4e8a-9c61-2d0f8a7b3e15 |
| Threshold | 20% (source: default) |
| Rounds | Round 0 (topology) + **20 scored rounds**: hard cap reached |
| Final ambiguity | **12%** (Goal 0.90 · Constraints 0.89 · Criteria 0.83) |
| Challenge rounds | Contrarian (R4), Simplifier (R6), Ontologist (R8): all used |
| Phase | **Done: spec approved as PRD (2026-11-14T00:45:29Z).** Building it is a separate request. |

## Next Step
The PRD is approved. Next: settle the open assumptions below, then start planning or building when you ask for it.

## Decisions Added Since the Last Checkpoint (Rounds 14–20)
| R | Part | Decision |
|---|---|---|
| 14 | Accounts | Web-only checkout via PayFast; no purchase buttons, prices or payment links in the store apps |
| 15 | Engine | Two-step grader: cheap similarity check first, small LLM only for borderline answers; tolerates spelling slips; cost cap per session; undecided answers marked "close" |
| 16 | Planner | Next-session time = the time of the child's last completed session, otherwise a parent-set default; sessions spread evenly with ≥1-day gaps; last-minute mode for a test today or tomorrow; scope edits handled; suggestions stop after the test date |
| 17 | Launch | Closed pilot **January 2027**; production **February 2027**; parent NPS ≥ 40 |
| 18 | Accounts | 7-day grace after failed payment; access to the end of the paid month on cancellation; 12-month data retention with a 30-day warning; self-service deletion; hosted in SA |
| 19 | Content | Web back office: upload → AI draft → teacher review queue → versioned publishing; problem reports, with auto-hide at 3 or more |
| 20 | Accounts | The parent picks the child's **school** from ~2,000 preloaded schools, or enters a new school name |

All earlier decisions (Rounds 1–13) are recorded in [PRD.md](PRD.md).

## Open Assumptions & Risks (not confirmed by the user)
1. ⚠️ **Delivery risk:** about 11 weeks to the February 2027 launch with the full engine, apps, billing, back office and content.
2. **Province:** assumed reporting-only, with the national school calendar.
3. **Custom school names:** assumed flagged for staff to add to the master list.
4. **School list source:** e.g. the Department of Basic Education school list filtered to Afrikaans/dual-medium schools.
5. **KPIs other than NPS:** ≥60% of tests with a completed session, ≥70% month-2 retention, paying-family target.
6. **Pilot pricing:** assumed free.
7. **Textbook copyright:** legal review needed.
8. **Fee amount:** business decision.

## Revisions After Approval (now folded into PRD.md)
| Date | Change |
|---|---|
| 2026-11-16 | **Revision 1: child access by device linking.** Children have no sign-in details. The parent links a device with a one-time code or QR (single use, 15-minute expiry, one child per code) from the web or Android app. Later sessions open straight into the child's profile; on shared devices a name picker appears with no password. The same applies on the web, per browser. The parent can remove linked devices. Replaces the Round 9 PIN flow; PRD AC-A6, A8–A12 updated. |
| 2026-11-16 | **Revision 2: language-driven experience.** Every surface, from ad and landing page through sign-up to app, emails and support, is driven by a language setting. Year 1 enables only `af`; `en` is supported but switched off. Language is resolved as explicit choice > entry point > default `af` and saved per family. Content is tagged by language. PayFast and OAuth screens are explained around in Afrikaans. PRD AC-X1–X8 added. |
| 2026-11-16 | **Revision 3: multi-brand platform.** A brand is a configuration record (name, look, domain, apps, OAuth, push, PayFast merchant, languages), resolved by domain or app. Separate store apps per brand from one codebase. **One parent sign-in across brands**; subscriptions and experience per brand. Shared engine and content. Year 1 has only Slaag, with nothing hard-coded. PRD AC-B1–B8 added. Open: children shared across brands; language stored per brand membership; POPIA wording for a shared identity. |
| 2026-11-16 | **Revision 4: prep strategies by lead time.** An internal runway ratio (prep days ÷ weighted scope) picks a pluggable strategy: **Incremental** (study and prep portion by portion, parent progress after each portion, final interleaved review), **Standard**, or **Last-minute**. Slaag suggests; the parent **or the child** can switch (parent's choice wins, parent alerted). Outcomes are recorded for per-child tuning. Slaag doesn't teach content in year 1. PRD AC-E13–E20 added, AC-E1 and AC-O7 amended. |
| 2026-11-16 | **Revision 5: subscription management and billing lifecycle.** Web account and subscription page; cancellation journey with reasons; PayFast-webhook-driven Overdue → Suspended (child access blocked, reactivation deep link); reactivation by new checkout; card-expiry email and in-app notice. Folded directly into PRD.md (AC-A14–A16, A21–A27). Refined: PayFast may notify on every failed attempt; Slaag determines first vs final failure from local + PayFast status and emails only on the first failure and on suspension. |
| 2026-11-16 | **Revision 6: parent sign-in.** Google or email and password only; Microsoft and Apple removed. Email/password requires verification, password reset and rate limiting; Google and email sign-in with the same address go to the same account. Risk: Apple guideline 4.8 may still require Sign in with Apple on iOS. |
| 2026-11-16 | **Revision 7: platforms.** Year 1 is the Android app + a responsive web app for mobile and desktop. iOS app deferred; iPhone users use the web app, with email alerts for parents. Apple sign-in rule no longer applies in year 1. |
| 2026-11-16 | **Revision 8: content ingestion.** Photo-PDF upload (grade, textbook, section/pages); OCR; facts as the base layer (verbatim + 1–2 paraphrases for copyright buffer); textbook index primary (from the table of contents) with CAPS cross-reference; Gate 1 every fact; curator-initiated question generation with overridable defaults and 'generate more questions'; risk-based Gate 2; re-uploads replace and redo. Folded into PRD.md (AC-C1–C24). |
| 2026-11-16 | **Revision 9: fact importance.** Core/Supporting/Peripheral tiers with weights, proposed by AI from textbook signals (margin keywords and definitions highest) and confirmed by teachers; typed fact links (elaborates, duplicates, part of, related); prep, question counts and readiness weighted by importance. Folded into PRD.md (AC-C25–C28, E21–E24). |
| 2026-11-16 | **Revision 10: model answers and marking rubrics.** Question generation explicitly produces a model answer from the source fact(s), citing them, and a rubric defining **correct / partial / incorrect** (weighted key points, accepted alternatives, partial-credit rules, known misconceptions) for every question. Both are reviewed and versioned at Gate 2; no question goes live without them. The grader marks correct / partial / incorrect against the rubric; "close" stays for undecided answers. Folded into PRD.md (AC-C15–C15c, E8, E9, E12, G2). |
| 2026-11-16 | **Revision 11: partner campaigns.** Partnerships are a key distribution channel. Partners (e.g. AfriForum, Solidariteit, OUTA) run campaigns with a sign-up window (e.g. 3 months), a % or rand discount and a discount period (e.g. 12 months). Co-branded landing pages, links/QR and codes; self-declared membership number, checked by the partner from an export; discount locked in at sign-up; automatic reversion to the standard fee after a 30-day notice email; no stacking; per-partner reporting. Folded into PRD.md (AC-A28–A37). Open: live membership verification, existing subscribers, PayFast amount-change API. |
