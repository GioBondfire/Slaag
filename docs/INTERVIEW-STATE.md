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

## Amendments After Approval
| Date | Change |
|---|---|
| 2026-11-16 | **Amendment 1: child access by device linking.** Children have no sign-in details. The parent links a device with a one-time code or QR (single use, 15-minute expiry, one child per code) from the web or Android app. Later sessions open straight into the child's profile; on shared devices a name picker appears with no password. The same applies on the web, per browser. The parent can remove linked devices. Replaces the Round 9 PIN flow; PRD AC-A6, A8–A12 updated. |
| 2026-11-16 | **Amendment 2: language-driven experience.** Every surface, from ad and landing page through sign-up to app, emails and support, is driven by a language setting. Year 1 enables only `af`; `en` is supported but switched off. Language is resolved as explicit choice > entry point > default `af` and saved per family. Content is tagged by language. PayFast and OAuth screens are explained around in Afrikaans. PRD AC-X1–X8 added. |
| 2026-11-16 | **Amendment 3: multi-brand platform.** A brand is a configuration record (name, look, domain, apps, OAuth, push, PayFast merchant, languages), resolved by domain or app. Separate store apps per brand from one codebase. **One parent sign-in across brands**; subscriptions and experience per brand. Shared engine and content. Year 1 has only Slaag, with nothing hard-coded. PRD AC-B1–B8 added. Open: children shared across brands; language stored per brand membership; POPIA wording for a shared identity. |
| 2026-11-16 | **Amendment 4: prep strategies by lead time.** An internal runway ratio (prep days ÷ weighted scope) picks a pluggable strategy: **Incremental** (study and prep portion by portion, parent progress after each portion, final interleaved review), **Standard**, or **Last-minute**. Slaag suggests; the parent **or the child** can switch (parent's choice wins, parent alerted). Outcomes are recorded for per-child tuning. Slaag doesn't teach content in year 1. PRD AC-E13–E20 added, AC-E1 and AC-O7 amended. |
