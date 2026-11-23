# Testing

Logical design only: technology-neutral. Test tools and frameworks are chosen in [../TECH-STACK.md](../TECH-STACK.md). Architecture: [ARCHITECTURE.md](ARCHITECTURE.md). Reliability testing (load, soak, GameDay): [RELIABILITY.md](RELIABILITY.md).

## Test Strategy
Most tests sit in the inner rings, where they are fast and need no I/O. Few end-to-end tests. Fakes are kept honest by running the same contract suite against them and against the real adapter.

| Level | Covers | Runs against | Share |
|---|---|---|---|
| **Domain unit tests** | `PrepPlan` and every `PrepStrategy`, `Importance`, `Mastery` (incl. fact-link rules, lineage carry-over (split inherits, merge takes the lower) and Close = neutral), `effectiveImportance` (strongest anchor in scope; anchor preference), `FactCandidate` resolution and re-anchoring, `Marking` Verdict rules from key-point judgements (rubric format v1: required points, weights, thresholds, misconceptions) and the mechanical question types (incl. fill-in-the-blank tolerance → Close), `Assessment` invariants. **`Subscription` state machine as a table:** every provider-neutral fact × every state, including duplicates and out-of-order delivery | In memory | Most |
| **Use-case tests** | Each use case with fake ports and a fixed `Clock` | In memory | Many |
| **Adapter contract tests** | One suite per port (`AnswerEvaluator`, `ContentAI`, `PaymentGateway`, provider-event translator, `PushSender`, `EmailSender`, `IdentityProvider`, `MediaStore`, `EventPublisher`, `FeatureFlags`), run against **both** the fake and the real adapter (provider sandbox) | Fake + sandbox | Per port |
| **Between-context contract tests** | Each context's published interface; domain event schemas; rubric format versions; mobile API versions **N and N-1** | In memory | Per contract |
| **Concurrency tests** | The 15 no-race invariants ([ARCHITECTURE.md › Data & Consistency Decisions](ARCHITECTURE.md#data--consistency-decisions)), each with parallel requests | The real system of record | 14 |
| **End-to-end tests** | The tracer bullet, then the critical journeys (Safety Net Map) | Full stack, both channels | Few |
| **Static checks** | No hard-coded user-facing text (AC-X1); no hard-coded brand (AC-B1); **dependency rule** (inner rings never import outer rings; no context touches another's data) | Source | Every change |
| **Grader evaluation** | Verdict agreement with teacher marking **≥ 90%** (AC-E9) on a teacher-marked evaluation set of children's Afrikaans answers; rerun on any change to grader, prompt, rubric format or `AnswerEvaluator` provider | Evaluation set | On grader changes |
| **Device & data budget** | 2 GB Android device runs sessions and animations smoothly; ≤ 5 MB per 15-min session (AC-G7, G8); web journeys on the browsers in AC-G7a | Real devices | Before pilot, then per release |

**Grader spike (prototype, thrown away):** 3–5 days, before `Marking` is built for real. Run Haiku 5.5 with Sonnet 5.5 escalation against ~200 Afrikaans written answers marked by teachers per key point, and measure Verdict and key-point agreement and the escalation rate. The prototype code is discarded; the **evaluation set is kept** as the grader evaluation above.

## Safety Net Map
| # | Flow | Test level | Status |
|---|---|---|---|
| 1 | **Tracer bullet:** child on a linked device adds a test → one suggested session (Afrikaans) → parent alerted by push and email | End-to-end, both channels | planned (first CI gate) |
| 2 | Parent signs up → subscribes (payment sandbox) → adds child → links a device | End-to-end | planned |
| 3 | Child starts a session → answers mechanical + written questions → Verdicts (incl. LLM-borderline and Close on timeout) → mastery and readiness update → parent alerted | End-to-end | planned |
| 4 | Failed payment → Overdue (one email) → further failures (no email) → provider paused → Suspended → child blocked on every linked device → reactivation restores access | End-to-end (payment sandbox) + state-machine table | planned |
| 5 | Parent revokes a device → its next access-token refresh is refused and the device returns to the link screen; requests carrying its current access token may still succeed until that token expires (**revocation delay of up to 30 minutes is expected, not a failure**); after expiry every request is rejected | End-to-end (with a controllable clock to cross the 30-minute expiry) + concurrency test (refresh vs revocation) | planned |
| 6 | Content: upload → facts → Gate 1 → generate questions with model answer + rubric → Gate 2 → published → appears in a session bundle | End-to-end (AI provider fake) + contract test | planned |
| 7 | Campaign sign-up → discount locked in → reversion notice → amount change confirmed | Use-case + payment sandbox | planned |
| 8 | Family erasure → every context erases its data | Use-case + end-to-end | planned |
| 9 | Second (test) brand configured with no code change (AC-B8) | End-to-end | planned |

## CI Gates
Run in this order; a failing gate stops the pipeline.

1. **Tracer bullet** end-to-end (Safety Net Map #1)
2. **Static checks:** no hard-coded text or brand; dependency rule
3. **Domain unit + use-case tests**
4. **Contract tests:** adapters (fakes), between contexts, mobile API N and N-1
5. **Concurrency tests** for the 15 invariants
6. **Migration compatibility:** every schema change works with the currently running version (expand-contract)
7. **Grader evaluation ≥ 90%:** only on changes to grading, prompts, rubric format or the grading provider adapter

Adapter contract tests against real provider sandboxes run on a schedule (nightly) and before each release, not on every change.
