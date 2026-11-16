# Design Code Architecture Plan

Logical design only: technology-neutral. Technology choices live in [../TECH-STACK.md](../TECH-STACK.md).

**No TECH-DEBT.md** (user decision, 2026-11-16): module-design findings, conventions, the debt budget and the debt ledger live in [ARCHITECTURE.md](ARCHITECTURE.md). Phases 7 and 8 extend those sections instead of creating TECH-DEBT.md.

## Context
- **Started:** 2026-11-16
- **Source:** [../PRD.md](../PRD.md) (approved 2026-11-14, revised 2026-11-16)
- **What the system does:** helps parents of Grade 4–7 children prepare them for school tests and exams. Parents subscribe per family on the web, enrol up to 3 children with their textbooks, and add tests with a date and scope. An adaptive engine drills the child towards mastery of teacher-reviewed facts taken from their own textbook. Content is produced in a back office where AI drafts and teachers review. One platform serves several brands and languages; year 1 has one brand and Afrikaans only.
- **Core differentiator:** the prep engine. It uses importance-weighted facts (margin keywords first), mastery tracked per assessment, prep strategies chosen by runway (Incremental / Standard / Last-minute), and rubric-based correct / partial / incorrect grading. It runs on teacher-reviewed facts taken from the child's own textbook.
- **Year-1 load:** medium. 1,000–10,000 families, so roughly 2,000–20,000 children. Peaks are on weekday afternoons and before exams.
- **Outbound dependencies (by role):** payment provider (checkout, recurring billing, card update, status webhooks); identity provider for social sign-in; transactional email provider; push notification provider; AI document-reading and content-generation provider; LLM grading provider (borderline answers, cost-capped); object storage for page images.
- **System of record:** the platform's transactional store (identity, families, subscriptions, content and versions, assessments, sessions, responses, mastery).
- **Second read patterns:** parent dashboard and readiness %, weekly digest, partner/campaign reporting, back-office content coverage, and outcome data for per-child tuning.
- **Validation:** the January 2027 closed pilot validates demand. Design proceeds now because production launch is in February 2027.
- **Owning teams:** one small team. The team-topologies phase is skipped.
- **Journey depth:** all 8 phases. Phases 3–4 should stay light at this load.

## Phase Status
| Phase | Skill | Status | Artifact | Date |
|---|---|---|---|---|
| 1 — Draw the boundaries | clean-architecture | done | ARCHITECTURE.md | 2026-11-16 |
| 2 — Model the domain | domain-driven-design | done | ARCHITECTURE.md | 2026-11-16 |
| 3 — Size the system | system-design | done | ARCHITECTURE.md | 2026-11-16 |
| 4 — Make logical data decisions | ddia-systems | done | ARCHITECTURE.md | 2026-11-16 |
| 5 — Keep modules deep | software-design-philosophy | done | ARCHITECTURE.md | 2026-11-16 |
| 6 — Design for failure | release-it | done | RELIABILITY.md | 2026-11-16 |
| 7 — Prove wiring, lock in habits | pragmatic-programmer | done | TESTING.md + ARCHITECTURE.md | 2026-11-16 |
| 8 — Cut scope to essential | 37signals-way | done | ARCHITECTURE.md | 2026-11-16 |
| Optional — Align teams to boundaries | team-topologies | skipped: one small team owns the system | OPERATIONS.md | 2026-11-16 |

Statuses: pending · in-progress · awaiting-evidence · done · deferred: <reason> · skipped: <reason>

## Key Decisions
| Date | Phase | Decision | Rationale |
|---|---|---|---|
| 2026-11-16 | Intake | Run all 8 phases; skip team-topologies | One small team; launch Feb 2027 makes every phase relevant |
| 2026-11-16 | Intake | Proceed without prior validation; the Jan 2027 pilot is the validation | Launch date is fixed; design for change instead |
| 2026-11-16 | 1 | Modular monolith with strict module boundaries | One small team; no proven seams; matches the approach already chosen in TECH-STACK.md |
| 2026-11-16 | 1 | Boundary map accepted: full at delivery, data store, payment provider, AI content, LLM grader; partial at notifications, identity, object storage, clock; collapsed for reference data | Boundaries where change or vendor risk is likely; ceremony avoided elsewhere |
| 2026-11-16 | 1 | First layered feature: "Add a test → suggest the next session" | Exercises Planner, Content scope resolution, strategy plug-ins and the notification reaction |
| 2026-11-16 | 2 | Planner + Prep Engine merged into one **Prep** context; 8 contexts in total | Shared language and model; splitting forces a shared kernel |
| 2026-11-16 | 2 | Content is one context exposing a published content catalogue | Prep sees approved live versions only |
| 2026-11-16 | 2 | Term fixes accepted: Verdict, Result, Grade, Access, Session, Scope vs fact set, Mastery vs Readiness | Removes PRD double meanings |
| 2026-11-16 | 2 | Core domain = Prep + Content's fact model | The engine is only as good as the facts it drills |
| 2026-11-16 | 3 | One vertically scaled system of record; adopt now: async work queue, prefetched session bundles, versioned content cache, edge cache; everything else deferred with a trigger | ~8 req/s average, ~200/s in the session-due burst, < ~100 GB/year at 10,000 families |
| 2026-11-16 | 3 | Borderline answers graded synchronously (child waits); strict timeout + concurrency cap; fallback Verdict = Close | User's choice: simplest experience for the child |
| 2026-11-16 | 3 | Targets: 99.5% availability, RPO 15 min, RTO 4 h | Fits one small team; single primary with continuous backups |
| 2026-11-16 | 4 | One system of record, partitioned logically by context | Simple for one team; seams stay clean |
| 2026-11-16 | 4 | Assessment fact sets re-resolved live; mastery keyed by stable fact ID | Corrections reach children from the next session |
| 2026-11-16 | 4 | Derived views computed on read or by scheduled batch | Enough at this scale |
| 2026-11-16 | 4 | 14 no-race invariants enforced explicitly; transactional outbox + idempotent handlers | Write skew and doubled alerts/credits/emails prevented |
| 2026-11-16 | 5 | All 12 consolidations adopted (S1–S12): PrepPlan, Marking, Importance, Mastery, PrepSettings, one interface per context, Messages, request-context resolver, notify(), provider-neutral facts, general Review & Versioning, thin jobs | Each piece of knowledge in one module |
| 2026-11-16 | 5 | 7 design conventions adopted (domain names; behaviour in aggregates; one module per knowledge; interface comments first; settings with defaults; thin jobs; English code with glossary names) | Keep modules deep as the code grows |
| 2026-11-16 | 5 | No TECH-DEBT.md; its content folded into ARCHITECTURE.md | User's choice: fewer docs |
| 2026-11-16 | 6 | Integration-point audit accepted: timeout, breaker, bulkhead, retry and fallback for every dependency | A slow dependency never freezes learner traffic |
| 2026-11-16 | 6 | LLM grader: 4 s budget, ≤30 concurrent, no retry, fallback Close; Close is neutral for mastery and re-asked | Child never blocked or penalised |
| 2026-11-16 | 6 | Feature flags per brand and cohort + kill switches; 10-min rollback; expand-contract | Release separately from deploy |
| 2026-11-16 | 6 | Before pilot: load test 3× burst, 24 h soak, one non-production GameDay | Failure handling proven before families depend on it |
| 2026-11-16 | 7 | Keep a separate TESTING.md | User's choice |
| 2026-11-16 | 7 | Tracer bullet: child on a linked device adds a test → one suggested session → parent alerted; first CI gate | Every ring, both channels, outbox, queue, Notifications |
| 2026-11-16 | 7 | Throwaway grader spike (3–5 days); keep the evaluation set | Afrikaans grading accuracy is the riskiest unknown |
| 2026-11-16 | 7 | Debt budget 10% to launch, then 20%; broken windows fixed or boarded up with ticket + Debt Ledger row | Strategic investment through the crunch |
| 2026-11-16 | 7 | Test strategy and 7 ordered CI gates accepted | Fast inner-ring tests; honest fakes; few end-to-end tests |
| 2026-11-16 | 8 | v1 staged: pilot (Jan) / launch (Feb) / after launch; signed off | Fixed time; no expensive-to-reverse decision cut |
| 2026-11-16 | 8 | Pilot is paid (full billing lifecycle for January) | User decision |
| 2026-11-16 | 8 | Kept in pilot: all three strategies, full gamification, AI index-tree proposal, meaning-based duplicate detection; by launch: campaigns, fee reversion, full partner reporting, weekly digest | User decisions |
| 2026-11-16 | 8 | Deferred with triggers (Debt Ledger D1–D7): per-child tuning, statistical knowledge tracing, diagram-labelling questions, retention deletion job, second-brand rehearsal, bulk importance edit, full coverage dashboard | Not needed before launch; seams kept |
| 2026-11-16 | 8 | No circuit breaker: the pilot date moves rather than scope | User decision |

## Journey Close (2026-11-16)
All 8 phases done; team-topologies skipped (one team). Exit checklist:
- [x] Each expensive-to-reverse decision (boundaries, contexts, data/consistency) is a Decision Log row with alternatives rejected (ARCHITECTURE.md)
- [x] Core business rules designed to run with no store, web or framework (ARCHITECTURE.md Layer Map; no violations, greenfield)
- [x] Every outbound call has a timeout, critical ones have breakers, every list is paginated (RELIABILITY.md Integration-Point Audit: all rows designed)
- [ ] A tracer-bullet slice proves the boundaries connect end-to-end and is the first CI gate (TESTING.md): **specified, awaiting build** (Next Actions)
- [x] v1 scope fixed to the time budget, deferred work in the Debt Ledger with triggers (ARCHITECTURE.md)

## Next Actions
- [ ] Update PRD on its next revision: pilot is paid (resolves "Pilot pricing" open assumption); AC-B8 second-brand proof moved to after launch (D5); per-child tuning (AC-E20, E24), diagram-labelling questions (AC-C9/C13), retention job (AC-A16), bulk importance edit (AC-C28) and full coverage dashboard (AC-C6) deferred per Debt Ledger; Term 1 pilot content limited to the most-used textbook per subject per grade (owner: user, P1)
- [ ] Billing on the pilot's critical path: payment-sandbox contract tests and Safety Net Map #4 green before the pilot (owner: team, due: before Jan 2027 pilot, P1)
- [ ] Weekly check of pilot readiness against the January date; with no circuit breaker, decide early whether the pilot date moves (owner: user, weekly, P1)
- [ ] Build the tracer bullet (TESTING.md Safety Net Map #1) and make it the first CI gate (owner: team, P1)
- [ ] Grader spike: collect ~200 teacher-marked Afrikaans written answers; run the two-step grader prototype; measure agreement (owner: user + team, 3–5 days, P1)
- [ ] Tech decision needed → docs/TECH-STACK.md: how one contract source generates server and Android types; dependency-rule checking; sandbox accounts for payment, push, email and AI providers (owner: user, P1)
- [ ] Pre-pilot testing per RELIABILITY.md: load test, soak, GameDay (owner: team, due: before Jan 2027 pilot, P1)
- [ ] Tech decision needed → docs/TECH-STACK.md: feature-flag and kill-switch mechanism; how breakers, bulkheads and per-workload connection limits are implemented; where metrics, alerts and correlation IDs go (owner: user, P1)
- [ ] Define the rubric format in the content catalogue's published contract before Marking or question generation is built (owner: user + Claude, P1)
- [ ] Tech decision needed → docs/TECH-STACK.md: confirm the store's default isolation level, and the mechanisms for the 14 serialized-write invariants and the transactional outbox (owner: user, P1)
- [ ] Define how long backups are kept, so erased family data ages out of backups within a stated period (POPIA; AC-A16–A17) (owner: user, P2)
- [ ] Tech decision needed → docs/TECH-STACK.md: check the hosting/backup setup meets RPO 15 min and RTO 4 h, and schedule a restore test before the pilot (owner: user, P1)
- [ ] Tech decision needed → docs/TECH-STACK.md: confirm how grader step 1 (similarity check, ~45/s in the burst) is computed and that the LLM grading provider's rate limits allow ~25 concurrent calls (owner: user, P1)
- [ ] Pilot: measure the real share of sessions starting in the same 15 minutes, the share of written answers going to the LLM, and LLM latency; revisit Phase 3 numbers (owner: user, due: Jan 2027, P2)
- [ ] Have a contracted teacher confirm the Afrikaans words for the glossary terms (Fact, Verdict, Result, Readiness, Portion…) and add an Afrikaans column to the glossary (owner: user, P2)
- [ ] Update PRD wording on the next revision to use Verdict / Result / Access (PRD uses "grade" and "mark" for answers) (owner: user, P3)
