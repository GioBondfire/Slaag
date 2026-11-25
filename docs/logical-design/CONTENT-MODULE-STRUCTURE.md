# Content Module: Folders and Files

The planned source layout for the Content context, file by file. It follows the inventory in [CONTENT-CONTEXT.md](CONTENT-CONTEXT.md) and the repository layout in [../TECH-STACK.md](../TECH-STACK.md) (one pnpm monorepo: `apps/web`, `apps/backoffice`, `packages/core`, `packages/db`, `packages/contracts`). Nothing here is built yet; names may change when code is written, but the **rings and dependency direction must not**.

## Rules this layout enforces

- **Dependencies point inward:** `domain` imports nothing outside `domain`; `application` imports `domain`; `adapters` import `application` and `domain`. Checked by a dependency-rule lint in CI.
- **Only `content/public/` is visible outside the context.** Prep and Family import `@slaag/core/content` (the `public/` barrel) and nothing else from `content/`.
- **One use case per file**, named after the operation. One query service per file.
- **Inbound adapters are one thin step:** validate input, resolve the request context, call one use case or query, present the result.
- **Provider IDs, prompts and payload formats live only in outbound adapters.**
- **Tests sit next to what they test** (`*.test.ts`); adapter contract suites run against both the fake and the real adapter.

## Where the Content code lives

```
slaag/
├── packages/
│   ├── core/src/
│   │   ├── content/                 ← the Content context (sections below)
│   │   ├── usage-limits/            ← generic module used by Content's callers (Prep) — see end
│   │   └── shared/                  ← job service, outbox, clock, ids, Result types (all contexts)
│   ├── db/src/schema/content/       ← Drizzle tables for Content (+ migrations/)
│   └── contracts/src/content/       ← Zod schemas the back office and mobile API share (only what crosses HTTP)
├── apps/
│   ├── backoffice/src/              ← inbound adapters: server functions + UI routes for curators
│   ├── web/src/                     ← no Content UI; Prep's endpoints call ContentCatalogue in-process
│   └── worker/src/                  ← entry point that registers Content's job and event handlers *
└── docs/logical-design/             ← ARCHITECTURE.md, CONTENT-CONTEXT.md, this file
```
\* `apps/worker` makes explicit the separate worker container that TECH-STACK.md already decides ("separate worker container from the same codebase"); add it to the repository-layout row when the repo is created.

## `packages/core/src/content/`

```
content/
├── index.ts                                  ← re-exports public/ only
│
├── public/                                   ← PUBLISHED INTERFACE (the only import path for other contexts)
│   ├── content-catalogue.ts                  ← ContentCatalogue: resolveScope, sessionBundle, lineage, reportProblem
│   ├── catalogue-contract/                   ← Published language, versioned
│   │   ├── fact-ref.ts                       ← FactRef { factId, effectiveImportance, anchors in scope, links, lineage }
│   │   ├── live-question.ts                  ← LiveQuestion { questionId, version, type, prompt, options, exhibit URL, … }
│   │   ├── rubric-v1.ts                      ← Rubric format version 1 (Zod schema + types)
│   │   ├── question-types.ts                 ← question types, defined once
│   │   ├── effective-importance.ts           ← effectiveImportance(fact, scope, anchorPreference?)
│   │   └── anchor-preference.ts
│   └── events.ts                             ← events other contexts consume: FactsMerged, FactSplit, BrandContentLicenceChanged
│
├── domain/                                   ← RING 1: pure; no I/O, no framework
│   ├── sources/
│   │   ├── source-document.ts                ← type (textbook | standard document), language, openness
│   │   ├── textbook.ts                       ← spans editions; main edition
│   │   ├── index-tree.ts                     ← nodes, page ranges, standard mappings, corrections
│   │   ├── upload.ts                         ← idempotent on (source file ID, revision); edition label
│   │   ├── page.ts                           ← identity (source, edition label, page number)
│   │   ├── page-version.ts                   ← pipeline state machine, transcription, quality, provenance
│   │   ├── brand-content-licence.ts
│   │   ├── openness.ts                       ← open | closed
│   │   ├── placement-policy.ts               ← page/anchor → index node; split at mid-page headings
│   │   ├── page-quality-policy.ts
│   │   └── *.test.ts
│   │
│   ├── standards/
│   │   ├── standard.ts                       ← level names, mapping depth, openness; no versions
│   │   ├── standard-node.ts                  ← language-independent; text per language; content items
│   │   ├── standard-node-candidate.ts        ← extraction output; matched to existing nodes for a later language
│   │   └── *.test.ts
│   │
│   ├── ingestion/
│   │   ├── fact-candidate.ts                 ← resolved once: new fact | match accepted | combined | rejected
│   │   ├── reconciliation-proposal.ts        ← new | re-anchor | additional anchor | (+ core change)
│   │   ├── reconciliation-order.ts           ← shortlist: old page anchors → same standard node → key-term trim
│   │   ├── retry-policy.ts                   ← free steps auto; transient AI auto; charged bad output manual; pause
│   │   ├── importance-proposal-policy.ts     ← textbook signal → proposed tier + weight
│   │   ├── provenance.ts                     ← model, prompt version, cost, attempt
│   │   └── *.test.ts
│   │
│   ├── facts/                                ← CORE DOMAIN
│   │   ├── fact.ts                           ← VersionedItem<FactCore> + lineage
│   │   ├── fact-core.ts                      ← canonical statement, paraphrases, type, key terms
│   │   ├── source-anchor.ts                  ← VersionedItem<AnchorContent>; region may span two pages
│   │   ├── fact-link-set.ts                  ← elaborates | part of (position) | related
│   │   ├── exhibit.ts                        ← type, region, linked facts, open alternatives
│   │   ├── lineage-rules.ts                  ← merge/split: anchors and links rewired
│   │   ├── importance.ts                     ← tier + weight + signal
│   │   ├── value-objects/                    ← PageRegion, PositionType, FactType, KeyTerm, Paraphrase,
│   │   │                                       IndexNodeRef, StandardNodeRef, Scope, ExhibitType
│   │   └── *.test.ts
│   │
│   ├── questions/
│   │   ├── question.ts                       ← VersionedItem<QuestionContent>; anchor IDs; basis
│   │   ├── model-answer.ts
│   │   ├── generation-run.ts                 ← fact selection, mode, options, urgency, counts, cost
│   │   ├── fact-selection.ts                 ← ready for questions | approved since | by structure | hand-picked
│   │   ├── generation-defaults-policy.ts     ← counts per tier, types per fact type
│   │   ├── mechanical-rubric.ts              ← derives rubrics for mechanical types
│   │   ├── basis-policy.ts                   ← verbatim only for open sources
│   │   └── *.test.ts
│   │
│   ├── review/                               ← GENERIC Review & Versioning
│   │   ├── versioned-item.ts                 ← versions, one draft, live version, holds, retirement
│   │   ├── version.ts                        ← Draft → InReview → Approved → Superseded | Rejected
│   │   ├── hold.ts                           ← problem reports | material edit awaiting review
│   │   ├── edit-impact.ts                    ← minor | material
│   │   ├── reviewer-mode.ts                  ← AI review | curator review (per textbook or subject)
│   │   ├── review-policies.ts                ← Gate 1, light review, Gate 2; auto-approval rules
│   │   ├── review-batch.ts                   ← per (generation run, source); sampling
│   │   ├── spot-check.ts                     ← sampled auto-approved items; error rate
│   │   ├── problem-report.ts                 ← ≥3 open → hold
│   │   └── *.test.ts
│   │
│   ├── catalogue/
│   │   ├── liveness-rules.ts                 ← fact, anchor, link, question, exhibit liveness
│   │   └── *.test.ts
│   │
│   └── events.ts                             ← all Content domain events (internal + published)
│
├── application/                              ← RING 2: use cases, query services, ports
│   ├── ports/
│   │   ├── content-ai.ts                     ← submit(task, urgency) / collect(); task kinds
│   │   ├── source-repository.ts              ← fetch(fileId, revision)
│   │   ├── media-store.ts                    ← put, urlFor(ref, audience)
│   │   ├── repositories.ts                   ← one interface per aggregate, optimistic version checks
│   │   └── (JobQueue, EventPublisher, Clock come from shared/)
│   │
│   ├── use-cases/
│   │   ├── sources/
│   │   │   ├── register-source-document.ts
│   │   │   ├── set-source-openness.ts
│   │   │   ├── upload-table-of-contents.ts
│   │   │   ├── record-index-proposal.ts
│   │   │   ├── confirm-index-tree.ts
│   │   │   ├── correct-index-tree.ts
│   │   │   ├── map-index-nodes-to-standard.ts
│   │   │   ├── grant-brand-content-licence.ts
│   │   │   └── revoke-brand-content-licence.ts
│   │   ├── standards/
│   │   │   ├── register-standard.ts
│   │   │   ├── upload-standard-document.ts
│   │   │   ├── record-standard-extraction.ts
│   │   │   └── confirm-standard-tree.ts
│   │   ├── intake/
│   │   │   ├── register-upload.ts
│   │   │   ├── render-pages.ts
│   │   │   └── assign-page-number.ts
│   │   ├── reading/
│   │   │   ├── submit-page-reading.ts
│   │   │   ├── record-page-reading.ts        ← quality policy; exhibits recorded
│   │   │   ├── collect-ai-results.ts
│   │   │   ├── retry-failed-step.ts          ← shows estimated cost for manual retries
│   │   │   ├── pause-source-pipeline.ts
│   │   │   └── resume-source-pipeline.ts
│   │   ├── placement/
│   │   │   ├── place-pages.ts
│   │   │   └── place-anchor-manually.ts
│   │   ├── extraction/
│   │   │   ├── submit-extraction.ts
│   │   │   ├── record-extraction.ts
│   │   │   ├── propose-matches.ts            ← shortlist + one MatchJudgement per page
│   │   │   ├── record-match-judgement.ts
│   │   │   └── reextract-pages.ts
│   │   ├── candidates/                       ← Gate 1
│   │   │   ├── approve-candidate-as-new-fact.ts
│   │   │   ├── accept-candidate-match.ts
│   │   │   ├── combine-candidates.ts
│   │   │   ├── edit-candidate.ts
│   │   │   ├── reject-candidate.ts
│   │   │   ├── regenerate-with-feedback.ts   ← herskep met terugvoer (candidate or fact)
│   │   │   └── resolve-orphaned-anchor.ts
│   │   ├── facts/
│   │   │   ├── edit-fact-core.ts
│   │   │   ├── approve-fact-core.ts
│   │   │   ├── merge-facts.ts
│   │   │   ├── split-fact.ts
│   │   │   ├── retire-fact.ts
│   │   │   ├── edit-anchor.ts
│   │   │   ├── approve-anchor.ts
│   │   │   ├── edit-fact-links.ts
│   │   │   └── approve-fact-links.ts
│   │   ├── exhibits/
│   │   │   ├── edit-exhibit.ts
│   │   │   └── upload-exhibit-alternative.ts
│   │   ├── generation/
│   │   │   ├── preview-generation.ts
│   │   │   ├── start-generation-run.ts
│   │   │   ├── record-generated-questions.ts ← validate, model-answer check, rubrics, duplicate check
│   │   │   └── complete-generation-run.ts
│   │   ├── review/                           ← Gate 2, AI review, spot checks, holds
│   │   │   ├── set-reviewer-mode.ts
│   │   │   ├── submit-ai-review.ts
│   │   │   ├── record-ai-review.ts
│   │   │   ├── draw-spot-check-sample.ts
│   │   │   ├── record-spot-check.ts
│   │   │   ├── open-review-batches.ts
│   │   │   ├── review-sampled-question.ts
│   │   │   ├── close-review-batch.ts
│   │   │   ├── review-question.ts
│   │   │   ├── regenerate-question-with-feedback.ts
│   │   │   ├── retire-question.ts
│   │   │   ├── retire-replaced-questions.ts
│   │   │   ├── repoint-questions-after-lineage.ts
│   │   │   ├── report-problem.ts
│   │   │   ├── resolve-problem-reports.ts
│   │   │   └── hold-or-release-item.ts
│   │   └── catalogue/
│   │       ├── update-live-catalogue.ts      ← recalculates liveness of an item and its dependants
│   │       └── rebuild-live-catalogue.ts
│   │
│   └── queries/                              ← back-office read models (no aggregates loaded)
│       ├── pipeline-status.ts
│       ├── review-queue.ts
│       ├── work-queues.ts                    ← page number, unplaced, re-photograph
│       ├── coverage.ts
│       ├── spot-check-error-rate.ts
│       ├── generation-run-log.ts
│       ├── item-history.ts
│       ├── traceability.ts
│       ├── brand-content.ts
│       ├── exhibits-needing-alternatives.ts
│       └── catalogue-reads.ts                ← resolveScope, sessionBundle, lineage (used by public/)
│
└── adapters/                                 ← RING 3
    ├── inbound/                              ← framework-free handlers; apps/ wire them in
    │   ├── jobs/
    │   │   ├── collect-ai-results.job.ts
    │   │   ├── pipeline-steps.job.ts         ← render, read, extract, match, AI review
    │   │   ├── draw-spot-check-sample.job.ts
    │   │   └── close-review-batch.job.ts
    │   └── event-handlers/
    │       ├── on-index-tree-confirmed.ts    ← PlacePages
    │       ├── on-generation-run-completed.ts← OpenReviewBatches
    │       ├── on-version-approved.ts        ← RetireReplacedQuestions, UpdateLiveCatalogue
    │       ├── on-lineage.ts                 ← RepointQuestionsAfterLineage
    │       └── on-catalogue-change.ts        ← UpdateLiveCatalogue (held, released, retired, licence, exhibit)
    │
    └── outbound/
        ├── anthropic-content-ai/             ← ContentAI: batch vs real time, prompt caching, translation
        │   ├── anthropic-content-ai.ts
        │   ├── prompts/                      ← versioned prompt files per task kind
        │   │   ├── page-reading.v1.md
        │   │   ├── candidate-extraction.v1.md
        │   │   ├── match-judgement.v1.md
        │   │   ├── index-proposal.v1.md
        │   │   ├── standard-extraction.v1.md
        │   │   ├── standard-node-match.v1.md
        │   │   ├── question-generation.v1.md
        │   │   ├── model-answer-check.v1.md
        │   │   ├── duplicate-question-check.v1.md
        │   │   ├── ai-review.v1.md
        │   │   └── regeneration.v1.md
        │   ├── translate.ts                  ← provider output → Content draft types (anti-corruption)
        │   └── anthropic-content-ai.contract.test.ts
        ├── google-drive-source-repository.ts
        ├── r2-media-store.ts
        ├── drizzle-repositories/             ← one file per aggregate repository
        ├── drizzle-queries/                  ← read-model queries for application/queries
        └── fakes/                            ← in-memory fakes; same contract suites as the real adapters
```

## `packages/db/src/schema/content/`

```
content/
├── sources.ts           ← source_documents, textbooks, uploads, pages, page_versions, brand_content_licences
├── index-trees.ts       ← index_trees, index_nodes, index_node_standard_maps
├── standards.ts         ← standards, standard_nodes, standard_node_texts (per language)
├── ingestion.ts         ← ai_tasks, fact_candidates, reconciliation_proposals, pipeline_pauses
├── facts.ts             ← facts, fact_core_versions, fact_lineage, source_anchors, anchor_versions,
│                          fact_link_sets, link_set_versions, exhibits, exhibit_alternatives
├── questions.ts         ← questions, question_versions (model answer + rubric), generation_runs
├── review.ts            ← holds, review_batches, spot_checks, problem_reports, transition_log
├── catalogue.ts         ← live_catalogue projection tables (liveness stored)
└── index.ts
migrations/              ← Drizzle Kit SQL, version-controlled (shared folder for all contexts)
```

## `apps/backoffice/src/` (curator and administrator inbound adapters)

```
src/
├── server/content/                ← server functions: one thin call per use case or query
│   ├── sources.functions.ts
│   ├── standards.functions.ts
│   ├── uploads.functions.ts
│   ├── pipeline.functions.ts      ← status, retries, pause/resume, work queues
│   ├── review.functions.ts        ← candidate, anchor, link, question, AI-doubt and spot-check queues
│   ├── facts.functions.ts
│   ├── exhibits.functions.ts
│   ├── generation.functions.ts
│   ├── licensing.functions.ts     ← system administrator only
│   └── reports.functions.ts       ← coverage, error rate, run log, history, traceability
└── routes/content/                ← UI (TanStack Start + Mantine)
    ├── sources/                   ← list, detail, index tree editor, standard mapping
    ├── standards/                 ← list, tree confirmation side by side with the PDF
    ├── uploads/                   ← upload form (edition label), pipeline status
    ├── review/                    ← side-by-side page image and candidate/anchor/question review
    ├── facts/                     ← fact detail: versions, anchors, links, exhibits, lineage
    ├── exhibits/                  ← exhibits needing open alternatives; upload alternative
    ├── generation/                ← selection preview, run, run log
    ├── licensing/                 ← brand content licences
    └── reports/                   ← coverage, spot-check error rate
```

## `evals/content/` (developer tool, outside the product code)

```
evals/content/
├── README.md               ← how to run, add cases, read results
├── cases/                  ← private storage reference (closed textbook content is not committed)
│   ├── page-reading/       ← page image + gold transcription
│   ├── extraction/         ← page + gold facts (verbatim, type, tier, key terms, links)
│   ├── matching/           ← candidate/fact pairs: same | different | same-but-changed
│   ├── index-tree/         ← table of contents + gold tree and mappings
│   ├── standards/          ← CAPS section + gold tree
│   ├── questions/          ← facts + gold judgements of generated questions
│   └── ai-review/          ← planted errors of known kinds
├── splits.json             ← tuning vs held-out cases
├── scorers/                ← text error rate, set matching, AI judge (with its own calibration cases)
├── run.ts                  ← runs one task's eval against a prompt version and model; records cost
└── results/                ← stored runs, compared with the baseline per metric
```

## `apps/worker/src/`

```
src/
├── main.ts              ← starts the job service; registers handlers from all contexts
└── register-content.ts  ← wires content/adapters/inbound/jobs and event-handlers to the queue and outbox
```

## `packages/core/src/usage-limits/` (generic module, for reference)

```
usage-limits/
├── index.ts                    ← consume, status, clearFlag, setOverride
├── domain/limit-definition.ts  ← key, subject type, window, default, action on breach
├── domain/usage-counter.ts     ← conditional increment (no-race invariant 15)
├── application/…               ← use cases + ports
└── adapters/…                  ← Drizzle counters; UsageLimitReached → outbox
```
Prep's `Marking` calls `usage-limits` before each model call; Content does not use it yet.
