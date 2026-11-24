# Reliability

Logical design only: technology-neutral. Dependencies are named by role; technology choices live in [../TECH-STACK.md](../TECH-STACK.md). Architecture: [ARCHITECTURE.md](ARCHITECTURE.md). Targets from Phase 3: **99.5% availability, RPO 15 min, RTO 4 h**.

All values below are **starting budgets** (2026-11-16), to be tuned from pilot measurements (January 2027).

## Integration-Point Audit
| Dependency (role) | Call style | Timeout (connect / response) | Circuit breaker | Bulkhead | Retry policy | Degradation | Status |
|---|---|---|---|---|---|---|---|
| **LLM grader** | Synchronous; the child waits | 1 s / **4 s total budget** | Opens at ≥50% failures or timeouts in 30 s (min. 20 calls); half-open after 30 s | **≤30 concurrent calls**; when full, Verdict = Close immediately | None (time budget) | Verdict **Close** at once; child continues; Close answers queued for teacher marking (AC-E12); Close is neutral for mastery | designed |
| **Payment provider**: user-facing (checkout, card update) | Synchronous | 2 s / 10 s | Opens after 5 failures in 60 s; half-open after 60 s | ≤10 concurrent | None (the parent retries) | Friendly "try again shortly"; no account change; children unaffected (Access held locally) | designed |
| **Payment provider**: background (cancel, amount change, status check) | Work queue | 2 s / 15 s | Shared with the row above | Own queue lane | Exponential backoff + jitter, ≤6 attempts over ~24 h, idempotency key; then flag staff | Delayed; reversion unconfirmed before the next billing date alerts staff (AC-A33) | designed |
| **Payment provider**: inbound webhooks | Received | — | — | — | Provider redelivers | Verify authenticity → save to inbox → acknowledge fast → process in the background; **daily reconciliation** against provider status catches lost webhooks | designed |
| **Social identity provider** | Synchronous (sign-in) | 2 s / 5 s | Opens after 5 failures in 60 s | ≤10 concurrent | None | Email + password sign-in still works; children unaffected (device credentials are local) | designed |
| **Email provider** | Work queue only | 5 s / 10 s | Yes | **Two lanes:** billing + alert emails first; digest and other bulk mail after | Backoff + jitter up to 24 h, idempotency key | Emails delayed; nothing user-facing waits on them | designed |
| **Push provider** | Work queue only | 2 s / 5 s | Yes | Own lane | ≤3 attempts within 10 min; **dropped once stale** (30 min after the session time) | In-app reminders; parents still receive alert emails | designed |
| **AI content provider** | Back office, background batch | 5 s / 120 s per call | Yes | **Own workers, never shared with learner traffic** | ≤3 attempts, then item marked "retry needed" for the curator; cost budget per generation run | Back office shows "processing delayed"; learners unaffected (published content untouched) | designed |
| **Object storage** | Reads via edge cache; uploads from back office | 2 s / 30 s (uploads) | Yes | — | ≤3 attempts on upload | Missing diagram shows a placeholder; label-the-diagram questions left out of that session's bundle | designed |
| **System of record** (internal) | Synchronous | Statement limit **2 s** for learner and parent requests; 60 s for batch and reports | — | **Separate connection limits** for learner traffic, back office, jobs and reports | Retry only transient conflicts, with backoff | Fail fast with a friendly error | designed |
| **Work queue** (internal) | — | — | — | Lanes per priority (above) | At least once; after the last attempt → **dead-letter + alert** | — | designed |

## Query & Resource Findings
**Pagination / bounded results**
- [ ] Every list endpoint is paginated: session log, assessments, review queues (~180k facts), problem reports, credit ledger, linked devices. (Owner: team, P1)
- [ ] School search returns ≤20 matches from ~2,000 schools. (Owner: team, P2)
- [ ] Partner sign-up exports are generated in the background as a file, never returned as one unbounded response. (Owner: team, P2)
- [ ] Session bundle capped at ≤40 questions, with image bytes inside the 5 MB per session budget (AC-G8). (Owner: team, P1)

**Steady state (automatic cleanup)**
| Item | Rule |
|---|---|
| Used or expired link codes | Purged after 24 h |
| Delivered outbox events | Purged after 7 days |
| Invalid push tokens | Removed when the push provider reports them invalid |
| Logs | Rotated; retention period to be set with the backup retention to-do |
| Suspended/cancelled family data | 30-day warning, then deletion at 12 months (AC-A16) |

**Self-inflicted load**
- [ ] Landing pages (marketing campaigns and partners) served from the edge cache (a partner newsletter can reach hundreds of thousands of members at once). (Owner: team, P1)
- [ ] Rate limits on checkout, sign-in (AC-A1a) and **link-code redemption** (guessing an 8-character code). (Owner: team, P1)
- [ ] The session-due push fan-out is spread over 1–2 minutes through the queue. (Owner: team, P1)

## Health Checks & Metrics
**Health checks**
- *Liveness:* the process is up.
- *Deep readiness:* the system of record and the work queue are reachable.
- Outside providers are **not** part of readiness (avoids flapping on provider blips); circuit-breaker states are reported separately.

**RED metrics and SLOs** (rate, errors, duration per published operation)
| SLI | SLO |
|---|---|
| Submit answer latency | p95 < 500 ms without the LLM; p99 < 5 s with it |
| Submit answer errors | < 0.5% |
| Alert delivery (child adds/edits a test; session completed) | 99% within 5 min (AC-O1, O4) |
| Availability | 99.5% monthly |

**Symptom-based alerts**
- Error-budget burn rate too high
- Oldest queue message older than 5 min
- Webhook in the inbox unprocessed for more than 15 min
- A circuit breaker **stays** open for more than 10 min (opening alone is expected behaviour)
- Fee reversion unconfirmed before the next billing date
- Close rate or LLM cost per session spikes
- Anything in the dead-letter queue

**Correlation:** every request gets a correlation ID that is carried through events, jobs and outbound calls.

## Deploy vs Release
- **Zero-downtime deploys:** start the new version, pass the health check, switch traffic, keep the previous version ready.
- **Feature flags per brand and per family cohort** (pilot cohort first).
- **Kill switches:** LLM grading (forces Close), each prep strategy (falls back to Standard), offers, ad-platform event delivery and audience sync, each language.
- **Expand-contract schema changes:** every migration is backward-compatible with the running version, so rollback never needs a schema rollback.
- **Contract compatibility:** the server supports the current and previous mobile API versions; the Android app enforces a minimum version. Domain events are versioned; handlers accept the old and new shape during a transition.
- **Rollback:** redeploy the previous build within **10 minutes**. Content rollback = republish the previous (immutable) version.
- **Deploy windows:** no deploys 14:00–21:00 SAST; none in exam weeks without a reason.

### Capacity & failure testing before the pilot
- [ ] Load test to **3× the session-due burst (~600 req/s)**; document the first resource to saturate. (Owner: team, due: before Jan 2027 pilot, P1)
- [ ] 24-hour soak test at ~80% of the tested capacity, to catch leaks. (Owner: team, due: before pilot, P1)
- [ ] One **GameDay**, run by the team on a non-production environment with approved tooling: LLM grader down, payment webhooks delayed, restore from backup within RTO. (Owner: team, due: before pilot, P1)
- No failure injection in production in year 1.
