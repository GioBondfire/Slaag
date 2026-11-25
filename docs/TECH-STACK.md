# Slaag — Technology Stack

<!-- Written by the tech-stack-interview skill. This is the single source for Slaag's technology
     choices, preferences and decision records. Facets with status `pending` are still to be decided. -->

**Status:** complete (two research items open)
**Last updated:** 2026-11-16
**Inputs:** [PRD.md](PRD.md) (revised 2026-11-16); the user's stack selection, preferences and principles (2026-11-16)

This is the "separate architecture document" referenced in the PRD's Constraints and Technical Context. It holds three things that would otherwise live in separate files:

- the user's **technology preferences and principles**, which guided every choice;
- the **decisions**, one section per facet: choice, reasons, alternatives rejected, consequences;
- the **decision records** for choices that are hard to reverse, marked **◆** in the summary. Their sections carry the full context, rejected alternatives and consequences. To change one, add a dated "Superseded" note to the section rather than rewriting it.

## Driving constraints

| # | Constraint | Source |
|---|---|---|
| K1 | Closed pilot January 2027, production launch February 2027 (~7 weeks from 2026-11-16) | PRD § Constraints → Delivery |
| K2 | Learner data hosted in the EU with a GDPR-governed provider (decided 2026-11-16; PRD amended 2026-11-16 to allow international hosting); POPIA s72 cross-border transfer (DPA + privacy notice); parent consent for children's data recorded | PRD § Constraints; *Hosting → Provider & region* |
| K3 | Responsive web app (also serves iPhone/iPad users) + native Android app on Google Play, same features; no iOS app | PRD § Constraints, Technical Context |
| K4 | Runs on 2 GB RAM Android phones; a 15-min session uses < 5 MB data | PRD § Constraints |
| K5 | Parents: Google or email+password only, explicit linking; children: no login, parent-issued one-time code/QR (15 min, single use) creating a revocable device credential | PRD AC-A1…A11 |
| K6 | PayFast onsite checkout + recurring billing, web-only checkout, webhook-driven lifecycle; Android shows no prices | PRD § Accounts & billing |
| K7 | Multi-brand: brand = configuration record; one Android app per brand from one codebase; per-brand domains, OAuth clients, push, email domains, PayFast merchants; shared parent identity across brands | PRD § Multi-brand |
| K8 | Language-driven everywhere (web, Android, email, push, landing pages); Afrikaans now, English behind a flag | PRD § Language, AC-X |
| K9 | AI pipeline: reading Afrikaans phone-photo PDFs (no text layer), fact extraction/paraphrase, question generation with rubrics; cost-capped two-step grader marking correct/partial/incorrect | PRD § Content, Engine, AC-E8–E12 |
| K10 | Push to Android (parents, children), email to parents, in-app reminders on web | PRD § Constraints |
| K11 | Web-only content back office with versioning and review queues | PRD § Content |
| K12 | Engine: knowledge tracing, spaced repetition, pluggable strategy layer; scheduled work (missed sessions, digests) | PRD § Engine, Oversight |

## Technology preferences and principles

The user's standing preferences for Slaag (2026-11-16). The decisions below start from these; where a decision differs from a recommendation, its section says so.

**Preferred stack**
- **Languages:** TypeScript for web and backend (unified full stack); Kotlin for Android (native — not React Native, Flutter or Rust).
- **Web + backend:** TanStack Start (React + TypeScript), Server Routes for REST APIs and Server Functions for in-app calls; business logic in shared TypeScript services independent of the framework.
- **Validation & contracts:** Zod throughout, with TypeScript types inferred from Zod; OpenAPI generated from Zod (`@asteasolutions/zod-to-openapi`).
- **Auth:** Better Auth (Google OAuth + email/password, explicit account linking).
- **Data:** PostgreSQL; Drizzle ORM; Drizzle Kit with version-controlled SQL migrations.
- **Android:** Jetpack Compose; MVVM + Repository; Retrofit + OkHttp; OpenAPI Generator → Kotlin client and DTOs.
- **Hosting:** Hetzner Cloud; start on CX33 (4 vCPU, 8 GB), resize to CX43 (8 vCPU, 16 GB) for exam periods; web, backend, Better Auth and PostgreSQL on one VPS until separation is justified; Docker; Coolify.
- **Delivery:** GitHub; GitHub Actions; GitHub Container Registry.

**Principles**
- Native Android in Kotlin.
- Low infrastructure cost over hyperscaler ecosystems.
- Portability: standard Docker images, minimal provider lock-in.
- Development productivity: unified TypeScript full-stack development.
- API-first: shared, versioned REST contracts for web and Android.
- Type safety: Zod for runtime validation and schema-driven contracts.
- Automation: AI-assisted development and automated CI/CD pipelines.
- Elasticity: cheap vertical scaling before load balancing or Kubernetes.
- Application UX: responsive web, fast question transitions, asynchronous answer synchronisation.

## Summary

◆ = hard to reverse; its section is the decision record.

| Layer | Facet | Choice | Status |
|---|---|---|---|
| Foundations | Primary languages ◆ | TypeScript (web + backend), Kotlin (Android) | decided |
| Foundations | Architecture style | Modular monolith; shared TypeScript business services independent of framework | decided |
| Foundations | Code-sharing across clients | API contract only (OpenAPI → generated Kotlin client) | decided |
| Foundations | Repository layout | One monorepo, pnpm workspaces (apps/web, apps/backoffice, packages/core, packages/db, packages/contracts, packages/i18n, packages/brands, android/) | decided |
| Backend | Runtime & framework ◆ | TanStack Start (≥ 1.0) Server Routes (REST) + Server Functions | decided |
| Backend | Background jobs & scheduling | pg-boss (12.x) behind a shared job-service abstraction; separate worker container from the same codebase | decided |
| Backend | Webhook intake (PayFast ITN) | Verify → store in webhook_events inbox (idempotent) → 200 → pg-boss job applies state | decided |
| Backend | Configuration, feature flags, brand resolution | Postgres tables (brands, settings, flags; Zod-validated, back-office editable) + env secrets via Coolify; brand from Host header / Android app ID | decided |
| Data | Primary database ◆ | PostgreSQL 18 | decided |
| Data | Data access & migrations ◆ | Drizzle ORM; Drizzle Kit, version-controlled SQL | decided |
| Data | Source document repository | Google Drive (Shared Drive) for ingested source documents; back office reads via Drive API | decided |
| Data | User-facing images & content files | Cloudflare R2 + Cloudflare CDN | decided |
| Data | Backups | Continuous WAL archiving / PITR (WAL-G or pgBackRest) to Cloudflare R2 + Coolify scheduled pg_dump + Hetzner daily server backups; restore drill before pilot | decided |
| Engine | Answer evaluation (grader) ◆ | AnswerEvaluationService: Claude Haiku 5.5 judges each rubric key point; Claude Sonnet 5.5 re-judges when a required point is uncertain; code decides the Verdict | decided (Afrikaans accuracy: research) |
| API | Style: mobile BFF ◆ | `/api/mobile/v1/*` REST (Server Routes) for Android; Server Functions for web; both transport adapters over shared services | decided |
| API | Versioning ◆ | Contract version (v1, v2) separate from app version; compile-time default, server config may select among versions the build supports; fixed trusted origins | decided |
| API | Minimum supported app version | Server-driven minSupportedVersionCode (block + Play in-app update) and recommendedVersionCode (nudge) | decided |
| API | Validation, types and contract | Zod throughout; OpenAPI for `/api/mobile/*` only via @asteasolutions/zod-to-openapi (v8+, Zod v4); OpenAPI Generator → Kotlin client + DTOs | decided |
| Identity | Auth library & parent sign-in ◆ | Better Auth, self-hosted; Google OAuth + email/password, explicit account linking | decided |
| Identity | Child device linking ◆ | Separate device-credential module (hashed one-time codes, rate-limited redemption, opaque long-lived device token, parent revokes) | decided |
| Identity | Android session model | Credential Manager → Google ID token → Better Auth ID-token sign-in; email/password via mobile API; bearer token stored encrypted (Android Keystore key) | decided |
| Identity | Cross-brand parent sign-in | — | pending (research) |
| Web | Framework ◆ | TanStack Start (React + TypeScript) | decided |
| Web | UI components & styling | Mantine 9 (React 19.2+); per-brand theme from the brand record | decided |
| Web | Data fetching & forms | TanStack Query + TanStack Form (Zod validators) | decided |
| Web | Internationalisation | Paraglide JS (compiled, typed messages; TanStack Start middleware + router rewrite) | decided |
| Web | Offline behaviour | Prefetch session questions in memory + retried answer posts; no service worker | decided |
| Web | Landing pages | Inside TanStack Start: prerendered/SSR routes, Paraglide language paths, marketing-campaign and partner landing pages from Marketing's landing-link records | decided |
| Web | In-app reminders | Server returns due reminders on app open; shown as in-app notices (no web push) | decided (default) |
| Android | Language, UI toolkit, architecture ◆ | Kotlin; Jetpack Compose; MVVM + Repository; Retrofit + OkHttp | decided |
| Android | SDK levels & low-RAM targets | minSdk 26, targetSdk 36, compileSdk 37; baseline profiles; tested on a real 2 GB device | decided |
| Android | Dependency injection | Hilt | decided |
| Android | Local storage & async answer sync | Room (prefetched questions + answer outbox) + WorkManager sync; DataStore for settings | decided |
| Android | Push | FCM HTTP v1 sent from pg-boss jobs; one Firebase project per brand; localized server-side templates | decided |
| Android | Per-brand build flavors | `brand` product flavor dimension × debug/release | decided |
| Android | QR scanning | Google code scanner (Play Services, no camera permission) + manual code entry | decided |
| Android | Crash reporting & performance | Sentry (EU region), shared with web and backend | decided |
| Android | Distribution | Gradle Play Publisher from GitHub Actions: internal → closed testing (pilot) → production staged rollout; Play App Signing | decided |
| Shared | Translation source of truth | Paraglide/inlang message JSON in `packages/i18n`; build step generates Android strings.xml; emails/push use the same messages | decided |
| Shared | Design tokens & brand theming | `packages/brands/<brand>.json` → generated Compose theme per flavor + seeded brand record driving the Mantine theme | decided |
| Integrations | AI: page reading ◆ | PDFs directly to Claude Sonnet 5.5 (`claude-sonnet-5-5`); Batch API for production runs, real-time for urgent ingestion | decided |
| Integrations | AI: content pipeline ◆ | Claude Opus 5.5 (`claude-opus-5-5`) via Batch API; real-time for curator-initiated runs | decided |
| Integrations | AI: grader | Claude Haiku 5.5 (`claude-haiku-5-5`) primary, Claude Sonnet 5.5 (`claude-sonnet-5-5`) escalation, real-time | decided |
| Integrations | Transactional email | Amazon SES (EU region) + React Email templates rendered in pg-boss jobs; per-brand verified domains | decided |
| Integrations | Payments | PayFast (fixed by PRD) | decided |
| Back office | Approach | Separate TanStack Start + Mantine app `apps/backoffice` on its own subdomain; staff-only Google sign-in with allow-list/roles | decided |
| Hosting | Provider & region ◆ | Hetzner Cloud, EU (Germany; Helsinki fallback) | decided |
| Hosting | Server size, topology, containers | CX33 → CX43 at peaks (manual resize); everything on one VPS; Docker; Coolify | decided |
| Hosting | Environments | Production: Hetzner VPS. Staging: on-prem Proxmox Docker VM managed by Coolify, behind the existing k3s Traefik; synthetic data only | decided |
| Hosting | Edge & DNS | Cloudflare DNS + Free-plan proxy; VPS firewall accepts web traffic from Cloudflare only; app-level rate limits remain primary | decided |
| Hosting | Secrets | Coolify environment variables (encrypted) + GitHub Actions secrets | decided |
| Delivery | Source control, CI/CD, registry | GitHub; GitHub Actions; GHCR | decided |
| Delivery | Release strategy & code quality tooling | Trunk-based; tag promotes the staging image to production; expand/contract migrations; Biome (TS), ktlint + detekt (Kotlin), Renovate | decided |
| Quality | Testing tools | Vitest + Testcontainers Postgres; OpenAPI contract tests; Playwright; Android JUnit + Turbine + Compose UI tests + Maestro | decided |
| Operations | Error tracking | Sentry (EU region) for Android, web and backend | decided |
| Operations | Logging, metrics, uptime | Better Stack (EU): pino JSON logs, external uptime checks, pg-boss job heartbeats, phone/SMS alerts | decided |
| Analytics | Product & behaviour analytics | Server-side product events in Postgres only (no analytics SDK); per-device support timeline and stale-outbox alert in the back office | decided |

## Decisions

### Foundations

#### Primary languages ◆
- **Choice:** TypeScript for web and backend; Kotlin for Android.
- **Category:** New
- **Why:** User principles: unified TypeScript full stack for productivity; native Android in Kotlin.
- **Preference:** matched
- **Alternatives rejected:** React Native / Flutter / Rust for Android — user prefers native Kotlin, and native suits 2 GB phones (K4); a Kotlin backend shared with Android — splits the stack and loses the unified TypeScript web and backend.
- **Status:** decided

#### Architecture style
- **Choice:** Modular monolith. Business logic lives in shared TypeScript services (`packages/core`) that don't depend on TanStack Start, called from Server Functions (web), Server Routes (REST for Android) and the pg-boss worker.
- **Category:** New
- **Why:** One codebase and one deployable fits K1 and a single VPS; framework-independent services keep the engine testable and let the HTTP layer change without rewriting logic.
- **Preference:** matched
- **Consequence:** keeping business logic out of route and Server Function handlers is a discipline code review must enforce — it is what makes the mobile BFF's transport adapters possible.
- **Status:** decided

#### Code-sharing across clients
- **Choice:** Share only the API contract: OpenAPI generated from Zod, Kotlin client generated from OpenAPI.
- **Category:** New
- **Why:** Keeps Android fully native; the contract is the single source of truth for both clients.
- **Alternatives rejected:** Kotlin Multiplatform shared logic — the shared logic lives in TypeScript services on the server, and the client stays thin.
- **Status:** decided

#### Repository layout
- **Choice:** One monorepo with pnpm workspaces: `apps/web` (TanStack Start: UI, Server Routes, Server Functions), `apps/backoffice`, `packages/core` (framework-free business services), `packages/db` (Drizzle schema and migrations), `packages/contracts` (Zod schemas → `openapi.json`), `packages/i18n`, `packages/brands`, `android/` (Gradle project with the generated Kotlin client), `docs/`. GitHub Actions workflows use path filters.
- **Category:** New
- **Why:** A contract change, its generated Kotlin client and both clients' updates land in one commit and one PR; AI-assisted development sees the whole system.
- **Alternatives rejected:** two repos (TypeScript + Android) — contract changes span two PRs and a published artifact; Turborepo on top — extra tooling not needed for a handful of packages (can be added later).
- **Status:** decided

### Backend

#### Runtime & framework ◆
- **Choice:** One TanStack Start (≥ 1.0, React + TypeScript) application on Node for the web app and backend: UI routes for parents, children and landing pages; Server Functions for web-only calls; Server Routes for the versioned mobile REST API and inbound webhooks. The back office is a second TanStack Start app in the same monorepo.
- **Category:** New
- **Why:** Unified TypeScript full stack (user principle). TanStack Start's docs recommend Server Routes for endpoints called from outside the app and Server Functions for in-app calls, which matches the web/Android split. Server Functions remove most of the boilerplate between web UI and backend.
- **Preference:** matched
- **Alternatives rejected:** a separate backend framework (NestJS, Fastify, Hono) plus a React SPA — two deployables and two routing/validation setups for one small team; Next.js — user's choice of TanStack Start (type-safe routing, first-class TanStack Query, Server Routes suit the mobile API).
- **Facts checked:** TanStack Start 1.0 declared stable (Appwrite dates it 2026-10-13); 1.0 requires Vite 8 and renames `.inputValidator()` to `.validator()` — checked 2026-11-16.
- **Consequences:** freshly stable — many examples still target the release candidate, so pin versions and follow the 1.0 migration notes. Node ≥ 22.12 required (pg-boss 12); use the current Node LTS.
- **Status:** decided

#### Background jobs & scheduling
- **Choice:** pg-boss as the queue and scheduler, used only through a shared job-service abstraction in `packages/core` (enqueue, schedule, handle) so the implementation stays replaceable. Jobs run in a separate worker container built from the same TypeScript codebase and deployed by Coolify alongside the web container.
- **Category:** New
- **Why:** Postgres-backed, so no extra service on the single VPS (cost, simplicity) and jobs can be enqueued in the same transaction as the data that triggers them (e.g. PayFast webhook → subscription change → email job). Covers K12 scheduled work (missed sessions, digests) and K9 pipeline steps (page reading, extraction, question generation). A separate worker keeps long AI jobs away from request handling.
- **Preference:** specified by the user (abstraction and separate worker container)
- **Alternatives rejected:** BullMQ + Redis — another stateful container to run, back up and monitor; Graphile Worker — comparable, smaller ecosystem in Drizzle-based stacks.
- **Facts checked:** pg-boss 12.x is current (12.26.x as of July 2026) and requires Node ≥ 22.12; PostgreSQL 18 is the current stable major — checked 2026-11-16.
- **Status:** decided

#### Webhook intake (PayFast ITN)
- **Choice:** A Server Route receives each ITN and verifies it: signature, source host, PayFast's server-to-server validation call, and amount. It stores the raw event in a `webhook_events` inbox table with an idempotency key and returns 200 quickly. A pg-boss job then applies the event to the subscription state machine (Active → Overdue → Suspended, etc.).
- **Category:** Build
- **Why:** PayFast can notify on every failed collection attempt (K6); the inbox makes processing idempotent, replayable and auditable, and keeps the response fast so PayFast doesn't retry.
- **Alternatives rejected:** inline processing — failures trigger PayFast retries and leave no record to replay.
- **Status:** decided

#### Configuration, feature flags and brand resolution
- **Choice:** Brands and settings (language flags such as English on/off, LLM cost caps, grader confidence threshold, strategy cut-offs, importance defaults) are typed, Zod-validated Postgres rows, editable in the back office. Secrets (PayFast keys, OAuth client secrets per brand, API keys) are environment variables managed in Coolify and referenced by name from the brand row. Each request resolves its brand from the Host header (web) or the Android app ID.
- **Category:** Build
- **Why:** K7 says a brand is a configuration record; pilot tuning (cut-offs, caps, thresholds) must not need a deploy; no extra processor under POPIA.
- **Alternatives rejected:** config files in the repo — every tuning change needs a deploy; a hosted flag service — more than year 1 needs and another data processor.
- **Status:** decided

### Data

#### Primary database ◆
- **Choice:** PostgreSQL 18 as the only operational database: application data, Better Auth tables, pg-boss queues, configuration and brand records, product events and webhook inboxes.
- **Category:** New
- **Why:** The data is strongly relational with integrity rules — families, parents, children, device credentials, brands, one subscription per family per brand, billing events, source documents, facts with typed links, questions, rubrics, assessments, mastery per fact, engine outcomes. Billing state must stay consistent with the jobs it triggers.
- **Preference:** matched
- **Alternatives rejected:** a document database (MongoDB, Firestore) — the data is relational; a separate queue (Redis) or analytics store — Postgres covers jobs and events at this scale, with one system to back up.
- **Consequences:** one stateful service to operate and back up; it is also the single point of failure until separated "only when justified". Heavy reporting queries could compete with live sessions — run them off-peak, or add a read replica when needed.
- **Status:** decided

#### Data access & migrations ◆
- **Choice:** Drizzle ORM; Drizzle Kit producing version-controlled SQL migrations, reviewed in PRs.
- **Category:** New
- **Why:** Type-safe and close to SQL; schemas can feed Zod (drizzle-zod).
- **Preference:** matched
- **Alternatives rejected:** Prisma — further from SQL, heavier runtime.
- **Consequence:** migrations follow expand/contract so older Android releases keep working within a mobile API version.
- **Status:** decided

#### Source document repository
- **Choice:** Google Drive (a Shared Drive owned by Slaag Group) holds ingested source documents such as textbook photo-PDFs. The back office reads them through the Drive API with a service account.
- **Category:** Integrate
- **Why:** User choice. Source PDFs are copyrighted textbook content, not learner data.
- **Preference:** specified by the user
- **Notes:** use a Shared Drive (not a personal My Drive) so files outlive staff accounts; give the service account read access to the ingestion folder only; record the Drive file ID and revision on each source document so re-uploads (replace-and-redo, PRD § Content) are traceable.
- **Status:** decided

#### User-facing images & content files
- **Choice:** Cloudflare R2 (S3-compatible API) for images and content files the apps display (diagram-labelling images, textbook page crops, mascots, brand assets), delivered through the Cloudflare CDN.
- **Category:** Buy
- **Why:** No egress fees; CDN edge locations in South Africa give children fast image loads despite the EU-hosted backend; caching helps the < 5 MB per session budget (K4).
- **Preference:** specified by the user
- **Notes:** access through the S3 SDK behind a storage abstraction; content-hashed file names so CDN caches never serve stale images; consider an EU jurisdiction bucket. Images hold textbook content, not learner data.
- **Status:** decided

#### Backups
- **Choice:** Continuous WAL archiving with point-in-time recovery (WAL-G or pgBackRest; tool chosen at setup) to Cloudflare R2 — a different provider from the server, so one object-storage service covers backups and content; Coolify scheduled `pg_dump` as a second, simpler copy; Hetzner daily server backups. A restore drill runs before the January 2027 pilot and is repeated each term.
- **Category:** Build
- **Why:** PostgreSQL on one VPS is the only copy of all data, including billing webhooks and children's answers; PITR limits loss to minutes. A different provider protects against a provider- or site-level failure.
- **Alternatives rejected:** daily dumps + snapshots only — up to a day of answers and billing events could be lost; Hetzner Object Storage as the target — an extra object-storage service and same provider as the server.
- **Status:** decided

### Engine

#### Answer evaluation (grader) ◆
- **Context:** written answers are graded instantly against curator-approved model answers and rubrics and marked correct, partial or incorrect (AC-E8). The grader must tolerate Afrikaans spelling slips, agree with curators ≥ 90% of the time (AC-E9), and respect a per-session cost cap (AC-E11). Revised 2026-11-23: the evaluator judges **each key point** of the rubric and code decides the Verdict (ARCHITECTURE.md › Content: rubric format).
- **Choice:** An `AnswerEvaluationService` abstraction in `packages/core`, behind Prep's `AnswerEvaluator` port:
  1. **Primary:** Claude Haiku 5.5 (`claude-haiku-5-5`), real-time, judges each key point of the rubric as met / missed / uncertain, flags known misconceptions, and reports a confidence.
  2. **Escalation:** when a **required** key point comes back uncertain, or confidence is below a configurable threshold, Claude Sonnet 5.5 (`claude-sonnet-5-5`) re-judges **only the uncertain key points**. The trigger is not narrowed until the grader spike and pilot give a quality baseline. The per-session cost cap applies; once reached, the answer is marked "close".
  3. **Prompt caching:** fixed grading instructions first with a cache breakpoint, then question + model answer + rubric, then the child's answer. Cache reads are billed at ~0.1× the input price on Haiku 5.5 and 0.05× on Sonnet 5.5; the minimum cacheable prefix is 512 tokens on both, so the fixed instructions must be at least that long to cache.
  4. **Daily limit per child:** at most 300 written answers per child per day go to a model (ARCHITECTURE.md › Usage limits); past it, the child's sessions stop for the rest of the day and a system administrator is alerted.
  Mechanical question types (including fill-in-the-blank) are marked by code only, never by a model. The threshold, cost cap and evaluator per language are configuration rows, not code.
- **Category:** Integrate
- **Why:** judgements per key point give feedback to the child ("you forgot …"), let moderators see exactly where the grader disagreed (AC-E9), and let verdicts be recalculated when rubric thresholds change without asking the model again. One vendor and one DPA for all model work.
- **Preference:** specified by the user (2026-11-23)
- **Alternatives rejected:** TypeSafe AI **Jev** as primary (decided 2026-11-16, replaced 2026-11-23) — cheapest per answer (~$0.04 per million input tokens, output free) with calibrated probabilities, but it classifies the **whole answer** and gives no judgement per key point; a second vendor and DPA. Embedding similarity (pgvector) + pg_trgm, then an LLM — similarity scores are not calibrated confidence, and thresholds on raw cosine similarity are brittle across question types.
- **Facts checked (2026-11-16, Claude API reference cached 2026-11-03):** Haiku 5.5 $0.10 / $0.50 and Sonnet 5.5 $2 / $10 per million tokens input / output, so escalation costs about 20× a primary judgement. Roughly 1,000 tokens in and 200 out per written answer: ~$0.0002 on Haiku, ~$0.004 on Sonnet.
- **Research:**
  - **To learn:** does Haiku 5.5 reach ≥ 90% Verdict agreement with Afrikaans-speaking moderators (AC-E9), and how well does it agree **per key point**, including children's spelling slips? How often does escalation to Sonnet happen, and what cost cap does that imply?
  - **How:** moderators label 300–500 real-style Grade 4–7 Afrikaans answers per key point; run Haiku and Sonnet; measure Verdict and key-point agreement and escalation rate per question type.
  - **Decide by:** before the January 2027 pilot (the pilot validates AC-E9 at scale).
  - **If it fails:** Sonnet 5.5 becomes primary for Afrikaans behind the same abstraction, with the cost cap retuned.
- **POPIA:** children's answer text goes to a US processor — sign Anthropic's DPA, request zero retention, and send no names or identifiers: only question, model answer, rubric and answer text.
- **Consequences:** no pgvector or embeddings needed for grading. Every written answer is a primary model call (the burst estimate in ARCHITECTURE.md › Back-of-envelope sizing applies). The grader spike measures key-point agreement, not only Verdicts.
- **Status:** decided (Afrikaans accuracy: research)

### API & contract

#### Style: mobile BFF inside TanStack Start ◆
- **Context:** two clients (K3): a web app that always runs the latest code, and a native Android app whose installed releases stay in use for months. The engine and content will change often during the pilot and after launch, and those changes must not need an Android release.
- **Choice:** A lightweight API gateway / backend-for-frontend inside TanStack Start:
  - **Android** calls a versioned REST contract at `/api/mobile/v1/*` (Server Routes). This is the contract described in OpenAPI and used to generate the Kotlin client.
  - **Web** calls Server Functions directly; it has no public REST contract.
  - Server Routes and Server Functions are **transport adapters only** — both call the same shared business services; neither contains business logic.
  - The **Android app is a thin native presentation layer**; business logic, educational content and configurable behaviour live on the backend.
- **Category:** New
- **Why:** independent API contracts for Android and web; mobile APIs evolve independently of web; backward compatibility for older Android releases; shared business logic behind both interfaces; engine and content changes ship without an app release.
- **Preference:** specified by the user
- **Alternatives rejected:** one shared REST API for web and Android — web changes would be tied to old Android releases' compatibility needs; a separate gateway service — another deployable and network hop on a single VPS, no benefit at year-1 scale (the adapter layer can be extracted later); header-based version negotiation — path versions are easier to route, log, cache and debug.
- **Consequences:** when `v2` exists, `v1` and `v2` are served side by side until no supported Android release depends on `v1` — adapter code only, since both map to the same services. OpenAPI covers only `/api/mobile/*`, with contract tests in CI. A thin client needs the network for most actions, so the Android Room cache and outbox must cover the session flow to keep transitions fast at ~150–200 ms latency.
- **Status:** decided

#### Versioning ◆
- **Choice:** API contract version ≠ Android app version. The contract version (`v1`, `v2`) names an explicitly supported HTTP contract; the app version (e.g. `1.4.2` and its numeric `versionCode`) names the installed binary. Each build has a compile-time default contract version; server-provided configuration may select another version the build supports. API origins are fixed and trusted per environment (production, testing), compiled into the app — remote configuration never changes the hostname.
- **Rules:**

  | Change | New API version? |
  |---|---|
  | Add optional response field | No |
  | Add new endpoint | No |
  | Add optional request parameter | Usually no |
  | Remove existing field | Yes, if breaking |
  | Change field type | Yes, if breaking |
  | Change response structure incompatibly | Yes |
  | Change internal business logic | No |
  | Change adaptive learning algorithm | No |

- **Preference:** specified by the user
- **Alternatives rejected:** remotely configurable API base URL — lets a configuration change redirect the app's credentials to any host (security, credential-handling and configuration risks).
- **Status:** decided

#### Minimum supported app version
- **Choice:** The mobile config endpoint returns `minSupportedVersionCode` and `recommendedVersionCode`. Below the minimum, the app shows a localized update screen and starts a Play in-app update (immediate); below the recommended version, it nudges (flexible update).
- **Why:** lets an API contract version be retired safely, and stops a release with a serious bug — without making the API URL configurable.
- **Status:** decided

#### Validation, types and contract
- **Choice:** Zod schemas are the source of truth for runtime validation and TypeScript types everywhere. OpenAPI is generated from them with `@asteasolutions/zod-to-openapi`, for `/api/mobile/*` only. OpenAPI Generator produces the Kotlin client and DTOs for Android.
- **Category:** New
- **Why:** API-first, schema-driven contracts (user principles).
- **Preference:** matched
- **Facts checked:** zod-to-openapi v8.0.0 added Zod v4 support; v7.3.x is the Zod v3 line — checked 2026-11-16. Pin a v8+ version against the Zod version in use.
- **Status:** decided

### Identity & access

#### Auth library & parent sign-in ◆
- **Choice:** Better Auth, self-hosted inside the TanStack Start app with its tables in PostgreSQL: Google OAuth and email/password with explicit account linking; email verification, password reset and its built-in rate limiter (AC-A1–A1b); the bearer plugin for Android; staff sign-in for the back office with roles. Children do not use Better Auth (see *Child device linking*).
- **Category:** New
- **Why:** low cost, portability, identity data stays in the application database (K2); covers K5 parent requirements.
- **Preference:** matched
- **Alternatives rejected:** hosted identity (Auth0, Clerk, Firebase Auth) — per-user cost, identity data outside the database, lock-in; Keycloak / Zitadel — a separate stateful identity server on the single VPS; hand-rolled auth — password storage, verification and OAuth are commodity security code that is risky to write.
- **Facts checked:** Better Auth has a bearer plugin for non-cookie clients and a Device Authorization plugin (RFC 8628) — checked 2026-11-16.
- **Consequences:** Slaag runs its own identity: upgrades, security patches and deliverability of verification/reset emails are Slaag's job. One Google OAuth client per brand and platform (web origin, Android app ID). Cross-brand sign-in is open (research, below).
- **Status:** decided

#### Child device linking ◆
- **Context:** children have no sign-in details (AC-A8). A parent picks a child and taps "Link a device"; Slaag shows a one-time ~8-character code and QR, valid once, for that child only, expiring after 15 minutes (AC-A9). Redeeming it adds the child's profile to the device until the parent removes it (AC-A10). Better Auth's Device Authorization plugin runs the reverse flow (the device shows the code, a user approves elsewhere).
- **Choice:** A small device-credential module outside Better Auth:
  - **Link codes:** created only by an authenticated parent for one of their children; ~8 characters from an unambiguous alphabet plus a QR encoding; stored hashed with child ID, 15-minute expiry and a used flag.
  - **Redemption:** the device posts the code with device metadata; rate-limited per IP and per device, invalid attempts counted; success marks the code used and issues an opaque, high-entropy device token.
  - **Device credentials:** stored hashed in `device_credentials` (child, device label, created, last seen); on Android encrypted with a Keystore key, in a browser an httpOnly, Secure cookie.
  - **Two principal types:** request handling resolves a *parent* (Better Auth session or bearer token) or a *child device* (device token); authorization rules state which principal each operation accepts.
- **Category:** Build
- **Why:** matches the PRD's parent-issued flow and keeps children out of the user/credential model.
- **Alternatives rejected:** credential-less child users in Better Auth plus a custom plugin issuing long-lived sessions — children become special-case "users", and Better Auth upgrades touch custom session internals; Better Auth's Device Authorization plugin — its flow runs the other way.
- **Consequences:** Slaag owns security-sensitive code (code generation, hashing, rate limiting, token lifecycle) — focused tests and a security review before the pilot. Child devices never hold parent credentials; revoking a device doesn't affect the parent's sessions. AC-A11 (a child using the parent's signed-in app) is handled by authorization: a parent may act for their own children without a device token.
- **Status:** decided

#### Android session model (parents)
- **Choice:** Google sign-in through Android Credential Manager, which returns a Google ID token; the app passes it to Better Auth's ID-token sign-in (`signIn.social` with `idToken`), so there is no browser redirect. Email/password sign-in goes through the mobile API. Better Auth's bearer plugin returns a session token, stored encrypted with an Android Keystore key.
- **Category:** Integrate
- **Why:** native sign-in UX without a browser hop; Google blocks OAuth in WebViews. Each brand's Android app has its own OAuth client (K7).
- **Alternatives rejected:** browser OAuth through Custom Tabs — clunkier UX and per-brand deep-link handling.
- **Facts checked:** Better Auth documents ID-token sign-in for Google (no redirect) in its v1.6 and v1.8 beta docs — checked 2026-11-16.
- **Status:** decided

#### Cross-brand parent sign-in
- **Status:** pending (research)
- **To learn:** how one parent identity works across brand domains (K7) when cookies are per domain: a central auth domain with redirects, or a token exchange between brand apps.
- **Decide by:** before brand #2. Not needed for the single-brand pilot, but must not be designed out.

### Web application

#### Framework ◆
- **Choice:** TanStack Start (React + TypeScript) — see *Backend → Runtime & framework*.
- **Status:** decided

#### UI components & styling
- **Choice:** Mantine 9 (requires React 19.2+). Each request's brand record supplies the Mantine theme (colours, fonts, radius, mascot assets), so no component hard-codes "Slaag".
- **Category:** New
- **Why:** user choice. A full component library with forms, dates, notifications and modals speeds up the parent screens and the back office.
- **Preference:** specified by the user (recommendation was Tailwind + shadcn/ui)
- **Watch:** the child experience must still feel playful, so budget custom components for the session runner and gamification; measure bundle size and interaction speed on a low-end phone browser. SSR needs Mantine's colour-scheme script in the document head.
- **Facts checked:** Mantine 9.x is current (9.7.x) and requires React 19.2+ — checked 2026-11-16.
- **Status:** decided

#### Data fetching & forms
- **Choice:** TanStack Query over Server Functions (caching, prefetching the session's next questions, optimistic answer submission); TanStack Form with Zod validators.
- **Category:** New
- **Why:** same TanStack family as the framework; Zod schemas shared with the server.
- **Preference:** matched
- **Status:** decided

#### Internationalisation
- **Choice:** Paraglide JS: compiled, typed message functions; unused messages tree-shaken; language from the URL path (`/af`, `/en`) via the router `rewrite` option and `paraglideMiddleware` on the server, falling back to the family's saved language (K8 order: explicit choice → entry point → default `af`).
- **Category:** New
- **Why:** missing keys are compile errors, which supports the AC-X1 "no hard-coded text" check; small bundles for low-end phones.
- **Preference:** matched
- **Facts checked:** Paraglide has a documented TanStack Start setup (Vite plugin, router rewrite, server middleware) — checked 2026-11-16.
- **Status:** decided

#### Offline behaviour
- **Choice:** No service worker. When a session starts, its questions are prefetched into memory (TanStack Query); answers post asynchronously with retries, so transitions never wait on the server.
- **Category:** New
- **Why:** keeps the web app simple for the February deadline while meeting the fast-transition principle.
- **Preference:** specified by the user (recommendation was an installable PWA with an IndexedDB answer queue)
- **Trade-off accepted:** answers still queued in memory are lost if the page reloads or the browser kills the tab mid-session. iPhone users can't install the app or get web push; parents rely on email (as the PRD already states).
- **Status:** decided

#### Landing pages
- **Choice:** routes inside the TanStack Start app, prerendered or SSR: language paths (`/af`, `/en`) via Paraglide; partner co-branded landing pages (PRD Revision 11) rendered from Marketing's partner and landing-link records; brand theme from the brand record; campaign tags carried into sign-up (K8 entry-point rule).
- **Why:** one deploy, one i18n and brand setup, no funnel hand-off between two apps.
- **Alternatives rejected:** a separate Astro site — duplicates brand and i18n setup; a hosted site builder — monthly cost, K7/K8 rules enforced by hand.
- **Status:** decided

#### In-app reminders
- **Choice:** when the web app opens, the server returns due reminders (next suggested session, upcoming tests); they show as in-app notices. No web push (no service worker).
- **Status:** decided (default — follows from the offline decision; revisit if web push is wanted)

### Android

#### Language, UI toolkit, architecture ◆
- **Choice:** Kotlin; Jetpack Compose; MVVM + Repository; Retrofit + OkHttp using the client generated from OpenAPI. Supporting choices are in the sections below (Hilt, Room, WorkManager, DataStore, flavors).
- **Category:** New
- **Why:** mainstream native Android stack; Compose fits a state-driven, playful UI, and with baseline profiles performs acceptably on low-RAM devices (verify on a 2 GB device, K4). The app is a thin presentation layer over the mobile BFF.
- **Preference:** matched
- **Alternatives rejected:** React Native / Flutter — user preference, and they add a runtime on low-RAM phones while sharing little, since business logic lives on the server; Kotlin Multiplatform shared logic — the shared logic is in server-side TypeScript; XML Views — Compose is the current toolkit.
- **Consequences:** two UI codebases (React web, Compose Android), so every screen is built twice — the thin-client rule keeps that to presentation only. Performance is measured on a real 2 GB device before the pilot (startup, memory, session transitions). Play's target-API requirement moves yearly — plan an annual SDK bump.
- **Status:** decided

#### SDK levels & low-RAM targets
- **Choice:** minSdk 26 (Android 8.0), targetSdk 36 (Android 16), compileSdk 37. Baseline profiles from the first release; startup and memory checked on a real 2 GB RAM phone before the pilot.
- **Category:** New
- **Why:** Play requires new apps and updates to target API 36 since 2026-08-31; Compose 1.12 compiles against API 37. minSdk 26 reaches nearly all active devices, including budget Android Go phones (K4), without legacy workarounds.
- **Facts checked:** Play target API 36 requirement (deadline 2026-08-31; API 37 expected next); Compose 1.12 (August 2026) needs compileSdk 37 and AGP 9.1.1+ — checked 2026-11-16.
- **Status:** decided

#### Dependency injection
- **Choice:** Hilt
- **Why:** standard, compile-time checked, integrates with ViewModel, WorkManager and Compose navigation.
- **Status:** decided

#### Local storage & async answer sync
- **Choice:** when a session starts, its questions are prefetched into Room. Answers go to a Room outbox and are synced by WorkManager, which retries on connectivity and survives the app being killed. DataStore holds settings; the device token is stored encrypted with an Android Keystore key. The app reports its outbox size and last sync time to the server.
- **Category:** New
- **Why:** low-RAM phones kill background apps often; an outbox means no answer is lost, and transitions never wait on the ~150–200 ms round trip to the EU. Stays a thin client: Room is a cache and outbox, not a second source of truth.
- **Alternatives rejected:** in-memory with retries — answers lost when Android kills the app; full offline sessions — too much sync work before February.
- **Status:** decided

#### Push
- **Choice:** Firebase Cloud Messaging (HTTP v1 API), sent by the backend from pg-boss jobs (session reminders, missed-session alerts, digests). One Firebase project per brand (K7); notification text rendered server-side from per-language templates (K8). Android notification channels per notification type.
- **Category:** Integrate
- **Why:** FCM is the delivery path on Play devices; sending from pg-boss keeps scheduling in one place and adds no processor beyond Google.
- **Alternatives rejected:** OneSignal / Novu — another processor holding children's device tokens, for features year 1 doesn't need.
- **Status:** decided

#### Per-brand build flavors
- **Choice:** a `brand` product-flavor dimension. Each flavor (first: `slaag`) sets applicationId, app name, launcher icons, theme colours, `google-services.json` (its own Firebase project), Google OAuth client ID, and API origins per environment. Brand-neutral code lives in `main`. Adding a brand means a new flavor folder, its configuration and its own upload key. Combined with debug/release build types.
- **Why:** Play requires a separate applicationId, listing and signing key per app (K7); flavors keep one codebase.
- **Status:** decided

#### QR scanning
- **Choice:** Google code scanner (Play Services `GmsBarcodeScanning`): a ready-made scanner UI, no camera permission, model supplied by Play Services so the APK stays small. Manual entry of the 8-character code is always offered.
- **Alternatives rejected:** CameraX + ML Kit — more code, camera permission; ZXing — older, weaker on low-end cameras.
- **Status:** decided

#### Crash reporting & performance
- **Choice:** Sentry (EU data region) on Android, web and backend, with distributed tracing linking app requests to API errors. Play Console Android Vitals (crash and ANR rates) alongside, with no SDK.
- **Category:** Buy
- **Why:** one tool across all three tiers; EU region keeps the POPIA processor list simple.
- **Alternatives rejected:** Crashlytics + Sentry — two tools, no cross-client tracing; self-hosted GlitchTip — extra load and operations on the single VPS.
- **Notes:** scrub children's names and answer text from events (`beforeSend`); no session replay on child screens.
- **Status:** decided

#### Distribution
- **Choice:** signed AABs uploaded from GitHub Actions with Gradle Play Publisher: internal track (team) → closed testing track (January 2027 pilot families) → production with staged rollout (February 2027). Play App Signing; upload key in GitHub secrets.
- **Category:** Integrate
- **Facts checked (2026-11-16, third-party sources):** new *personal* Play developer accounts (created after 2023-11-13) must run a closed test with at least 12 testers opted in for 14 consecutive days before production access, per app. *Organization* accounts are exempt but need a D-U-N-S number (reported up to 30 days to obtain).
- **Timeline risk:** register Slaag Group as an organization developer account now (D-U-N-S first). With a personal account, the January closed pilot can double as the 12-tester/14-day test if it starts by mid-January.
- **Status:** decided

### Shared web/Android

#### Translation source of truth
- **Choice:** Paraglide/inlang message files (JSON per language) in `packages/i18n` are the only source. A build step generates Android `strings.xml` per language (`values-af`, `values-en`); email and push templates use the same messages server-side. Translators edit with inlang's editor or through PRs. CI fails on keys missing from any enabled language.
- **Why:** one set of strings for every surface (K8, AC-X1) with no extra service while only Afrikaans is live.
- **Alternatives rejected:** Tolgee — another service to run; Crowdin/Lokalise — paid, overkill for one live language.
- **Status:** decided

#### Design tokens & brand theming
- **Choice:** `packages/brands/<brand>.json` holds colours, typography, radii and mascot asset keys. A build step generates the Compose theme for each Android flavor and seeds the brand's Postgres record, which drives the Mantine theme at runtime.
- **Why:** one edit updates both clients; no drift (K7).
- **Status:** decided

### Integrations

#### AI: page reading, content pipeline and fallback grader ◆
- **Context:** content comes from PDFs of phone photos of Afrikaans textbook pages with no text layer. Each page becomes typed facts — verbatim plus 1–2 paraphrases, importance tier, links, textbook-index and CAPS tags — and questions with model answers and rubrics are generated from them. Curators review every fact (Gate 1); question review is risk-based (Gate 2). The launch library is roughly 10,000 pages.
- **Choice:**
  - **Page reading:** source PDFs go directly to Claude Sonnet 5.5 (`claude-sonnet-5-5`, native PDF input), which transcribes each page verbatim with layout cues (headings, margin keywords, captions, diagram regions). Large production runs use the Message Batches API (50% cost, asynchronous); urgent ingestion uses the real-time API. No separate OCR engine for now.
  - **Content pipeline:** Claude Opus 5.5 (`claude-opus-5-5`) turns transcriptions into facts, tiers, links and tags, and generates questions with model answers and rubrics. Bulk runs use the Batch API; curator-initiated "generate more questions" uses the real-time API. Structured outputs validated against the Zod schemas.
  - **Grader:** Claude Haiku 5.5 (`claude-haiku-5-5`) primary and Claude Sonnet 5.5 (`claude-sonnet-5-5`) escalation, real-time, behind `AnswerEvaluationService` (see *Engine → Answer evaluation*).
  - **AI review (year-1 default reviewer):** an independent check of every fact candidate, anchor and question, with a different prompt and ideally a different model from the producer (e.g. Claude Sonnet 5.5 checking Claude Opus 5.5's extraction against the page image), at batch rates. Confident → approved; doubtful → curator queue.
  - **Matching and duplicate checks:** Claude Haiku 5.5 at batch rates — one call per page to match fact candidates against a shortlist of existing facts (same CAPS subtopic, old page version), and one call per fact per generation run to drop duplicate questions. No vector index or embedding model (decided 2026-11-23).
  - All calls go through pg-boss and a thin AI-client module in `packages/core`, so models and providers are configuration.
- **Category:** Integrate
- **Why:** one vendor and one DPA for all generative work; the Batch API halves the cost of non-urgent work; token cost for ~10,000 pages is small next to curator review time, so quality (fewer Gate 1/Gate 2 edits) is worth paying for.
- **Preference:** specified by the user (recommendation for reading was a hybrid OCR engine + Claude)
- **Alternatives rejected:** a dedicated OCR engine (Google Cloud Vision / Document AI) plus an LLM — deferred: stronger verbatim fidelity, but another vendor and pipeline step before the pilot; it can slot in ahead of extraction later. Open-source OCR (Tesseract / PaddleOCR) on the worker — weaker on curved, low-light phone photos and uses the single VPS's CPU. Sonnet 5.5 for extraction and generation — curator time costs far more than the token difference. Sonnet 5.5 as fallback grader — ~20× Haiku's cost per answer, so the cost cap is reached sooner.
- **Facts checked (2026-11-16, Claude API reference cached 2026-11-03):** prices per million tokens input/output — Opus 5.5 $4/$20, Sonnet 5.5 $2/$10, Haiku 5.5 $0.10/$0.50 (Haiku up to 100K-token prompts); Batch API runs asynchronously at 50% cost; PDF input up to 600 pages / 32 MB per request.
- **Consequences:**
  - Verbatim risk: a vision model may silently normalise wording. Gate 1 compares verbatim facts with the page image; if the pilot's edit rate on verbatim text is high, add an OCR engine.
  - Code must follow the current API surface: `effort` instead of disabling thinking, structured outputs instead of forced tool choice, no assistant prefill, and handling `refusal` stop reasons with server-side fallbacks enabled on Opus 5.5 and Sonnet 5.5.
  - Batch results arrive in any order and within hours, so ingestion state is tracked per page and per job.
- **POPIA:** the content pipeline sends textbook content only; the fallback grader sends answer text with no names or identifiers. Sign Anthropic's DPA and list Anthropic as a processor.
- **Status:** decided

#### Transactional email
- **Choice:** Amazon SES in an EU region, sending from per-brand verified domains (SPF, DKIM, DMARC). Templates written with React Email (TSX) using Paraglide messages, rendered and sent by pg-boss jobs. Bounces and complaints come back through SNS to a webhook inbox.
- **Category:** Buy
- **Why:** lowest cost at volume (about $0.10 per 1,000 emails); EU region consistent with EU hosting; templates stay in TypeScript.
- **Alternatives rejected:** Postmark — better out-of-the-box deliverability but costs more; Resend — younger company, data region to verify.
- **To do:** request SES production access (leave the sandbox) early; warm up the sending domain before the pilot.
- **Status:** decided

#### Payments
- **Choice:** PayFast
- **Category:** Integrate
- **Why:** fixed by the PRD (K6).
- **Open:** partner campaigns (PRD Revision 11) need the recurring amount to change after a discount period — confirm PayFast's subscription API supports amount changes.
- **Status:** decided

### Back office

#### Approach
- **Choice:** a separate TanStack Start + Mantine app, `apps/backoffice`, on its own subdomain, reusing `packages/core` and `packages/db`. Staff-only Google sign-in through Better Auth with an allow-list and roles. Covers photo-PDF intake from Drive, ingestion status, Gate 1 fact review, question generation, Gate 2 review, versioning, brand/settings records, offers (Billing), marketing campaigns, partners and landing links (Marketing), and the per-device support timeline.
- **Why:** no admin code in the parent/child bundle; independent deploys and access policy.
- **Alternatives rejected:** `/admin` inside the main app — admin code and permissions next to the child experience; an admin framework (Refine) — review queues and side-by-side page/fact review would still be custom.
- **Status:** decided

### Hosting & infrastructure

#### Provider & region ◆
- **Context:** the approved PRD says learner data is "hosted in South Africa (a local cloud region)". The user chose Hetzner Cloud for cost, portability and vertical scaling. Hetzner Cloud has no South African location. Users are Afrikaans-speaking families in South Africa and the product processes children's data under POPIA; section 72 allows transfer outside South Africa when the recipient is bound by law or agreement providing adequate protection (GDPR is such a regime), or with consent. Year-1 load is modest, with peaks in exam periods.
- **Choice:** host the whole platform (web app, REST API, Better Auth, PostgreSQL) on Hetzner Cloud in the EU: Germany (Falkenstein or Nuremberg) by default, Helsinki if capacity requires. Sign Hetzner's GDPR data-processing agreement; the privacy notice states that data is stored in the EU; amend the PRD's hosting constraint to match (pending).
- **Category:** Buy
- **Why:** lowest infrastructure cost and minimal lock-in (user principles).
- **Preference:** matched (the user chose to amend the PRD rather than host in South Africa)
- **Alternatives rejected:** a South African VPS with the same Docker + Coolify setup (e.g. Vultr Johannesburg) — higher cost for equivalent capacity, though it stays available because the setup is portable; hyperscaler South African regions (AWS af-south-1, Azure South Africa North, Google Cloud africa-south1) — much higher cost and pull towards provider-specific services; Hetzner for the pilot then a South African host — a migration in launch month.
- **Facts checked:** Hetzner Cloud locations are Nuremberg, Falkenstein, Helsinki, Ashburn, Hillsboro and Singapore, none in Africa (Hetzner docs). Third-party reports say cost-optimised CX plans showed "currently unavailable" in October 2026 and prices rose in June 2026 (CX33 ≈ €8.49/month). Checked 2026-11-16; confirm CX availability when provisioning — regular shared-vCPU plans are the fallback.
- **Consequences:**
  - ~150–200 ms round trip from South Africa: clients prefetch the session's questions and sync answers asynchronously; images come from Cloudflare's South African edge.
  - POPIA s72 obligations: Hetzner DPA, privacy-notice wording, and a list of all processors and their locations (see *Processors*).
  - "Your child's data stays in South Africa" can't be used as a trust message to parents.
  - Revisit if a regulator, school partner or parent feedback requires South African residency, or if pilot latency hurts the experience. Docker + Coolify keeps a move to a South African host to days, not weeks.
- **Status:** decided

#### Server size, topology, containers, deployment
- **Choice:** start on one 4 vCPU / 8 GB VPS (CX33) running web, worker, Better Auth and PostgreSQL; resize to 8 vCPU / 16 GB (CX43) manually during exam periods; Docker images deployed with Coolify; separate the database or scale horizontally only when justified.
- **Category:** New
- **Why:** low cost, portability and vertical-first scaling (user principles); simplest operational setup for K1.
- **Preference:** matched
- **Status:** decided

#### Environments
- **Choice:** production on the Hetzner VPS. Staging on the user's on-premises Proxmox host: a Docker VM managed by the same Coolify instance (over SSH), reachable at `staging.<domain>` through the existing Traefik proxy on the k3s cluster, with router port forwarding already in place.
- **Why:** free staging capacity on existing hardware; same Docker images and Coolify deployment as production for parity.
- **Preference:** specified by the user
- **Notes:** Coolify deploys to Docker hosts, not k3s, so staging runs in a Docker VM and Traefik routes the staging hostname to it. Staging holds synthetic or anonymised data only — never real children's data (POPIA; the staging host is outside the production DPA chain). Restrict Coolify's SSH access to the production server's IP; keep staging behind basic auth or an allow-list if pilot testers don't need it.
- **Status:** decided

#### Edge & DNS
- **Choice:** Cloudflare DNS and the Free-plan proxy for all brand domains: DDoS shielding, TLS, caching, the basic managed ruleset, and the one edge rate-limiting rule on code redemption and sign-in. The VPS firewall accepts web traffic only from Cloudflare IP ranges. Application-level rate limits (Better Auth's limiter, device-code redemption limits) stay the primary protection.
- **Category:** Buy (free tier)
- **Why:** $0 extra; the Cloudflare account already exists for R2 and the CDN. Upgrade a domain to Pro (~$20–25/month per domain, unconfirmed) only if attacks appear.
- **Alternatives rejected:** Pro from day 1 — protection before there's traffic to protect; DNS only — no edge DDoS protection.
- **Facts checked:** Free plan includes a basic managed WAF ruleset and about one rate-limiting rule; Pro adds fuller managed rulesets and more rules — third-party sources disagree on exact limits, checked 2026-11-16.
- **POPIA:** Cloudflare sees traffic in transit; list it as a processor.
- **Status:** decided

#### Secrets
- **Choice:** runtime secrets as encrypted Coolify environment variables per environment; build and release secrets (Play upload key, GHCR token) in GitHub Actions secrets. Brand records reference secrets by name.
- **Status:** decided

### Delivery

#### Source control, CI/CD, registry
- **Choice:** GitHub; GitHub Actions; GitHub Container Registry.
- **Category:** New
- **Preference:** matched
- **Status:** decided

#### Release strategy & code quality tooling
- **Choice:** trunk-based development: short-lived branches → PR (CI: lint, tests, contract tests) → `main`. Merges to `main` auto-deploy to staging; a version tag promotes the same container image to production. Android `versionCode` comes from the CI build number. Database migrations follow expand/contract so older Android builds keep working. Biome (lint + format) for TypeScript; ktlint + detekt for Kotlin; Renovate for dependency updates.
- **Why:** small team, fast pilot fixes; the image tested in staging is the one released.
- **Alternatives rejected:** ESLint + Prettier — slower, two tools; GitFlow — more ceremony than a small team needs.
- **Status:** decided

### Quality

#### Testing tools
- **Choice:** Vitest for core services with Testcontainers Postgres; contract tests checking `/api/mobile` responses against OpenAPI; Playwright for web E2E; Android JUnit + Turbine + Compose UI tests and Maestro flows for sign-in, device linking and a session. All in GitHub Actions.
- **Alternatives rejected:** a lean pilot set with manual Android E2E — device linking and sessions are too central to test by hand only.
- **Status:** decided

### Operations

#### Error tracking
- **Choice:** Sentry (EU region) for Android, web and backend — see *Android → Crash reporting & performance*.
- **Status:** decided

#### Logging, metrics, uptime
- **Choice:** structured JSON logs (pino) shipped to Better Stack (EU region); external uptime and heartbeat checks (including pg-boss job heartbeats) with phone/SMS alerts.
- **Category:** Buy
- **Why:** one tool; uptime checks must run outside the single VPS to catch an outage.
- **Alternatives rejected:** Grafana Cloud + UptimeRobot — more setup; Coolify built-in only — no external alerting.
- **Status:** decided

### Analytics

#### Product & behaviour analytics
- **Choice:** server-side product events only, written to Postgres by the shared services (sessions started/completed/abandoned, tests added, strategy switches, suggestions ignored, repeated failures on a fact). No third-party analytics SDK on any screen. The back office gets a per-device support timeline (events, errors, app version, last sync) and an alert when a device's answer outbox hasn't synced. Campaign attribution comes from tagged links carried into sign-up (Marketing `Touchpoint`). *2026-11-24: confirmed — no ad-platform browser tag (no Meta Pixel); conversion and lifecycle events go to Meta from the server through the Conversions API. See [ARCHITECTURE.md › Marketing](logical-design/ARCHITECTURE.md#marketing-campaigns-attribution-and-ad-platforms).* Analysis by SQL (a BI tool such as Metabase can be added later).
- **Category:** Build
- **Why:** children under 13 use the app — no tracking SDK keeps Play Families policy and POPIA simple; the engine already records outcomes server-side. Crash and error diagnosis is covered by Sentry, Android Vitals and Better Stack.
- **Preference:** specified by the user
- **Alternatives rejected:** PostHog EU on parent/landing pages — another processor; Plausible/Umami — not needed while campaign links are tagged; Firebase Analytics/GA4 — device identifiers on child screens.
- **Status:** decided

## Requirement coverage

| Constraint | Satisfied by |
|---|---|
| K1 Pilot Jan 2027 / launch Feb 2027 | Familiar TypeScript + Kotlin stack; one monorepo and one VPS; managed services for email, errors, logs; Batch API ingestion. **Risk:** large scope for ~7 weeks; Play organization account (D-U-N-S) is on the critical path |
| K2 EU hosting + POPIA s72 | Hetzner EU; EU regions for SES, Sentry, Better Stack; DPAs with every processor (below); no analytics SDK; no identifiers sent to AI providers. **PRD amendment pending** |
| K3 Web + Android, same features | TanStack Start web; native Android; mobile BFF over shared services |
| K4 2 GB phones, < 5 MB/session | Native Compose + baseline profiles; minSdk 26; Room question cache; images via Cloudflare CDN; test on a real 2 GB device |
| K5 Parent sign-in; child device linking | Better Auth; device-credential module; Google code scanner |
| K6 PayFast web-only, webhook lifecycle | Webhook inbox + pg-boss; no prices in Android (thin client) |
| K7 Multi-brand | Brand records in Postgres; Android product flavors; brand token JSON; per-brand OAuth, Firebase, SES domains, PayFast merchants. **Open:** cross-brand sign-in (research) |
| K8 Language-driven | Paraglide + inlang files as single source → Android strings.xml, emails, push; CI fails on missing keys |
| K9 AI pipeline + grader | Sonnet 5.5 page reading, Opus 5.5 content pipeline; Haiku 5.5 grader with Sonnet 5.5 escalation. **Open:** Afrikaans accuracy (research) |
| K10 Push, email, in-app | FCM via pg-boss; SES + React Email; in-app reminders on web open |
| K11 Back office | `apps/backoffice` (TanStack Start + Mantine); Google Drive source repository |
| K12 Engine + scheduled work | `packages/core` services; pg-boss schedules (missed sessions, digests) |

## Processors (POPIA s72 / privacy notice)

| Processor | Purpose | Data | Location |
|---|---|---|---|
| Hetzner | Hosting, database | All application data | EU (Germany/Finland) |
| Cloudflare | DNS, proxy, R2, CDN, backups | Traffic in transit; content images; encrypted database backups | Global edge; EU bucket option |
| Google | Sign-in, FCM push, Drive (sources), Play | Parent identity, device push tokens, textbook sources | Global |
| PayFast | Payments | Parent billing details | South Africa |
| Amazon SES | Email | Parent email addresses, email content | EU region |
| Anthropic | Content pipeline, fallback grading | Textbook content; answer text without identifiers | US (check inference location options) |
| Sentry | Error tracking | Technical errors, scrubbed of names/answers | EU region |
| Better Stack | Logs, uptime | Server logs (avoid personal data in logs) | EU region |

## Cross-check findings (2026-11-16)

- **Compatibility:** Mantine 9 needs React 19.2+ (fine with TanStack Start 1.0); pg-boss 12 needs Node ≥ 22.12 — use the current Node LTS in all containers; Compose 1.12 needs AGP 9.1.1+; zod-to-openapi v8+ for Zod v4. No conflicts found.
- **Duplication:** backups go to Cloudflare R2 rather than adding Hetzner Object Storage, so object storage is one service. Sentry (errors) and Better Stack (logs, uptime) are complementary, not duplicates.
- **Web/Android consistency:** Android keeps unsent answers in a Room outbox; the web keeps them in memory only (accepted trade-off). Both use the same i18n source, brand tokens and server-side events; the web uses Server Functions and Android the versioned mobile API, both over the same services.
- **Timeline:** about 7 weeks to the pilot. The critical path is the Play organization account, the Afrikaans grader evaluation set, the device-linking security review, SES production access, and testing on a real 2 GB phone.

## Cost estimate (paid services)

Rough monthly estimates, checked 2026-11-16 from third-party sources where noted; confirm on each vendor's pricing page.

| Service | Launch | 10× usage | Notes |
|---|---|---|---|
| Hetzner CX33 (+IPv4) | ~€9 | CX43 ~€16.50 in exam periods | Prices raised June 2026; CX availability to confirm; Hetzner backups add a % of server price |
| Cloudflare (DNS, proxy, CDN) | $0 | $0 | Free plan; Pro ~$20–25 per domain only if needed |
| Cloudflare R2 | ~$0–5 | ~$5–15 | Free tier then per GB stored; no egress fees |
| Amazon SES | <$5 | ~$10–30 | ~$0.10 per 1,000 emails |
| Claude (ingestion, one-off) | ~$150–400 total | per new textbook | Opus 5.5 + Sonnet 5.5 at batch rates for ~10,000 pages (estimate) |
| Claude Haiku 5.5 (grading, every written answer) | <$10 | ~$250 (~$3,000/year) | ~$0.00015 per written answer with the fixed instructions cached (~$0.0002 without) × ~20M written answers/year (66M answers × ~30% written; ARCHITECTURE.md › sizing). Estimate; written share measured in the pilot |
| Claude Sonnet 5.5 (grading escalation) | <$10 | ~$170 per 5% escalation rate: 5% ~$170 (~$2,000/year) · 10% ~$330 (~$4,000/year) · 20% ~$670 (~$8,000/year) | ~$0.002 per escalation with caching and only the uncertain key points re-judged (~$0.004 without) × escalation rate × ~20M written answers/year. Trigger not narrowed in v1; the rate is measured in the grader spike. The 20% case is the old Phase 3 "borderline" guess, not data. Bounded per session by the cost cap and per child by the 300/day limit |
| Claude Sonnet 5.5 (AI review of facts and questions) | ~$500–1,000 total | per new textbook | Rough: ~1 batch call per page for fact candidates (page image + candidates) and ~1 per fact for its questions, at batch rates (estimate; measured on the first textbook) |
| Claude Haiku 5.5 (fact matching, duplicate questions) | <$5 | per new textbook | ~1 call per page + 1 per fact per generation run, batch rates (estimate) |
| Sentry | $0 | ~$26+ | Free developer tier, then team plan (confirm) |
| Better Stack | $0 | ~$25+ | Free tier, then paid (confirm) |
| Google Play developer account | $25 once | — | |
| Staging | $0 | $0 | On-prem Proxmox |

## Open issues

- **Play developer account (deadline risk):** create an organization account for Slaag Group now — D-U-N-S can take up to 30 days. Also check Play's Families policy obligations for an app used by children under 13 (target audience declaration, permitted SDKs, data practices).
- **PRD amendments not yet applied.** Another session regenerates `docs/PRD.md` from `.omc/specs/deep-interview-slaag-prd.md`, which overwrote an earlier edit. Make these changes through that spec:
  1. ~~Constraints and Technical Context: hosting outside South Africa~~ — **done 2026-11-16** (PRD Revision 12: international hosting allowed under POPIA s72; the PRD stays provider-neutral, so EU/Hetzner remains recorded here only).
  2. ~~Engine constraint, AC-E8 and Technical Context: grading by evaluation model with confidence threshold, not keyword/semantic similarity~~ — **done 2026-11-16** (PRD Revision 13).
- **Research — grader Afrikaans accuracy (AC-E9):** Haiku 5.5 Verdict and key-point agreement and Sonnet escalation rate on a labelled evaluation set before the January 2027 pilot (*Engine → Answer evaluation*).
- **Research — cross-brand parent sign-in (K7):** decide before brand #2 (*Identity → Cross-brand parent sign-in*).
- **PayFast amount changes:** confirm the subscription API can change the recurring amount for partner-campaign discounts (PRD Revision 11).
- **POPIA s72 follow-ups:** sign DPAs with every processor listed above; privacy notice states EU storage and lists processors.
