# Content Context

Logical design only: technology-neutral. Components are named by role; technology choices live in [../TECH-STACK.md](../TECH-STACK.md). Requirements: [../PRD.md](../PRD.md) (AC-C1…C31). Decisions and rationale: [ARCHITECTURE.md](ARCHITECTURE.md), sections *Content: facts, anchors and lineage*, *ingestion pipeline*, *question generation*, *the live catalogue*, *review and versioning*, and the Decision Log.

This document is the **inventory** of the Content context, from a source document arriving to content being **ready for consumption** (live in the catalogue): its modules, domain layer, application layer, ports, inbound and outbound adapters, and the published interface Prep uses. It adds no new decisions; where something is still open it is listed in [Open points](#11-open-points).

---

## 0. Roles

| Role | May do |
|---|---|
| **Content curator** | All content work: register sources and standards, uploads, review queues (candidates, anchors, links, questions, problem reports), spot checks, question generation, exhibits and open alternatives, reviewer mode, retiring facts and questions |
| **Moderator** | Marks children's answers against rubrics ("close" queue, grader agreement samples, grader evaluation set); sees answer text without names or identifiers. Works in Prep's marking tools, not on content |
| **System administrator** | Anything, including brand content licensing, settings and usage-limit flags |

"Actor" columns below name the least-privileged role; a system administrator can always act too. In AI review mode, "Curator" approvals happen for items the AI check doubts or samples for spot checks.

## 1. Scope

| In scope | Out of scope (other contexts or later) |
|---|---|
| Source documents and their index trees; uploads, pages and page versions; AI reading, extraction and reconciliation; fact candidates; facts, anchors and links; Gate 1 and light review; question generation; Gate 2; versioning, holds and retirement; problem reports received from Prep; the live catalogue and its published interface | Using content in prep (Prep: `PrepPlan`, `Importance`, `Mastery`, `Marking`); mastery carry-over on merge/split (Prep's `Mastery`, from Content's lineage events); staff sign-in and roles (Identity & Access); bulk importance edit per index node (D6); full coverage dashboard (D7); "label the diagram" questions (D3) |

---

## 2. Modules inside the context

One bounded context, six modules. Modules call each other only through their application services; only the Catalogue is visible outside the context.

| Module | Owns | Main types |
|---|---|---|
| **Sources** | What came in and where it sits | `SourceDocument` (type: textbook), `IndexTree`, `Upload`, `Page`, `PageVersion` |
| **Ingestion** | Moving each page version through reading, quality, placement, extraction and reconciliation | `PageVersion` pipeline state, `AiTask` records, `FactCandidate` |
| **Fact model** *(core domain)* | What is true, where it appears and how much it matters | `Fact` (core + lineage), `SourceAnchor`, `FactLinkSet` |
| **Question bank** | What is asked and how it is marked | `Question` (+ `ModelAnswer`, `Rubric`), `GenerationRun` |
| **Review & Versioning** *(generic)* | Draft → review → approve → live → hold / retire, for any versioned item; review queues; Gate 2 batches; problem reports | `VersionedItem<T>`, `Version<T>`, `Hold`, `ReviewBatch`, `ProblemReport` |
| **Catalogue** | The live, consumable view | Live catalogue projection, `ContentCatalogue` (published interface) |

Dependency direction between modules: Sources ← Ingestion → Fact model ← Question bank; Review & Versioning is used by Fact model and Question bank; Catalogue reads from all of them through events, never the other way round.

---

## 3. Layers and code shape

The four rings from [ARCHITECTURE.md › Layer Map](ARCHITECTURE.md#layer-map--dependency-rule), applied to Content. Dependencies point inward only.

```
content/
  domain/                 ← ring 1: no I/O, no framework
    sources/              SourceDocument, IndexTree, Page, PageVersion, PlacementPolicy, PageQualityPolicy
    ingestion/            FactCandidate, ReconciliationProposal, pipeline state rules
    facts/                Fact, SourceAnchor, FactLinkSet, lineage rules, ImportanceProposalPolicy
    questions/            Question, GenerationRun, GenerationDefaultsPolicy, MechanicalRubric
    review/               VersionedItem, Version, Hold, ReviewBatch, ProblemReport, review policies
    catalogue-contract/   effectiveImportance, rubric format, LiveQuestion/FactRef shapes (published language)
  application/            ← ring 2: use cases, query services, ports
    use-cases/            one file per command (section 6)
    queries/              back-office query services (section 6.12)
    ports/                interfaces owned here (section 7)
  adapters/               ← ring 3
    inbound/              back-office server functions, job and event handlers, ContentCatalogue entry point
    outbound/             repositories, ContentAI, SourceRepository, MediaStore, publisher
```

The file-by-file layout across the monorepo is in [CONTENT-MODULE-STRUCTURE.md](CONTENT-MODULE-STRUCTURE.md).

The **catalogue contract** (effective importance, rubric format, published shapes) is the one piece other contexts compile against. It is defined once and versioned ([ARCHITECTURE.md › Design Conventions](ARCHITECTURE.md#design-conventions): one source per contract).

---

## 4. Domain layer

### 4.1 Aggregates

Every versioned aggregate follows one generic shape from Review & Versioning:

```
VersionedItem<T>
  id, kind
  versions: Version<T>[]        append-only; state Draft → InReview → Approved → Superseded | Rejected
  draft: Version<T>?            at most one at a time, based on a specific approved version
  liveVersion: Version<T>?      the latest approved one
  holds: Hold[]                 reasons the item is kept out of the catalogue
  retired: Retirement?
```

| Aggregate | Identity | Holds | Invariants |
|---|---|---|---|
| **SourceDocument** | `SourceDocumentId` | Type (**textbook** or **standard document**), title, publisher, edition/ISBN (informational; a textbook spans editions), grade, subject, **language**, cover, **openness (open / closed)** | Language fixed once content exists; every fact anchored in it shares its language |
| **Standard** | `StandardId` | Name (e.g. CAPS), level names, **mapping depth**, openness | No versions; a material revision is a separate standard |
| **StandardNode** | `StandardNodeId`, stable, language-independent | Standard, level, parent; title, description and content items **per language**; optional metadata (teaching time, assessment weighting) | Created by confirming standard node candidates; a later language's document is matched to existing nodes and adds its text; content items extracted where the document lists them |
| **Exhibit** | `ExhibitId` | Source page version + region, **type** (diagram, table, chart/graph, map, photo, illustration, timeline, other), caption, linked fact IDs, open alternatives (uploaded files, versioned and reviewed) | Learner-visible only if its source is open or it has an approved open alternative |
| **BrandContentLicence** | (brand, source) | Brand, source document or standard | Catalogue and enrolment lists show only licensed sources per brand |
| **IndexTree** | One per source document | Nodes term > topic > subtopic with page ranges; CAPS mapping per node; proposal, confirmation and correction history | Page ranges of sibling nodes don't overlap; confirmed by a person before placement runs; each correction re-runs placement |
| **Upload** | `UploadId` | Source file ID + revision, tags (grade, source document, optional section and page ranges), uploader | Idempotent on (source file ID, revision) |
| **Page** | (source document, edition label, printed page number) | Its page versions; the current one; uploads without an edition label belong to the main edition | At most one current page version; a newer version supersedes the old one |
| **PageVersion** | `PageVersionId` | Rendered image, transcription with layout blocks (headings, margin boxes, captions, diagram regions), quality result, index placement, **pipeline state**, AI provenance | Advances only forward through the pipeline states (or to Failed / FlaggedForRephoto / Superseded); results for a superseded version are ignored |
| **FactCandidate** | `FactCandidateId` (never a `FactId`) | Proposed statement, paraphrases, anchor (source, region, verbatim, position type, signal, importance), links, `ReconciliationProposal` | Resolved exactly once: new fact, accepted match, combined, or rejected |
| **Fact** = `VersionedItem<FactCore>` + lineage | `FactId`, stable across versions and re-anchoring | Core: canonical statement, 1–2 paraphrases, fact type, key terms. Lineage: `mergedFrom[]`, `splitFrom`, `mergedInto`, `splitInto[]` | Created only by approving a candidate, a merge or a split; merge and split create new IDs and retire the old ones; a fact with no live anchor is in no scope |
| **SourceAnchor** = `VersionedItem<AnchorContent>` | `AnchorId`, stable across page versions | `FactId`; source document, page version(s), section, region (may span **two consecutive pages**), verbatim text, index node, CAPS reference (from node unless overridden), position type, importance signal, **tier + weight** | Belongs to exactly one fact at a time; re-anchoring, placement, importance or region edits create new versions; placement versions are auto-approved |
| **FactLinkSet** = `VersionedItem<Link[]>` | One per `FactId` | Outgoing links: *elaborates*, *part of* (with position), *related* | Links point to other facts by ID; no links to itself; no "duplicates" type; a link is live only while both facts are live |
| **Question** = `VersionedItem<QuestionContent>` | `QuestionId` | Type, difficulty, fact IDs, **anchor IDs** (all in one source document), basis (paraphrase / anchor verbatim), prompt and options, model answer (citing facts), rubric (catalogue format), diagram crop | Can't be approved without model answer and rubric, versioned together; live only while its own version, its facts' cores and its anchors are live; ≥3 open problem reports → hold |
| **GenerationRun** | `GenerationRunId` | Curator, fact selection, mode (generate more / regenerate), options, urgency, per-source counts, provenance, cost | Started only by a curator; only approved facts with live anchors are generated from |
| **ReviewBatch** | (generation run, source document) | Mechanical questions of that run and source; sample; sample verdicts | ~10% sample, ≥95% pass → all approved; otherwise the whole batch goes to full review; none live before it passes |
| **ProblemReport** | `ProblemReportId` | Question + version, reporter role, reason, status | ≥3 open reports on one question place a hold; resolving the review releases it |

### 4.2 Value objects

| Value object | Meaning |
|---|---|
| `SourceRef` | Source document + page version(s) + section |
| `PageRegion` | Area of a page image; may continue onto the next page |
| `LayoutBlock` | A transcribed block with kind (heading, margin keyword box, body, summary box, caption, example/enrichment box, activity, diagram) and region |
| `PositionType` | Where on the page an anchor sits (margin keyword/definition box, body, heading, summary/"remember" box, caption, example/enrichment, activity) |
| `FactType` | Definition, fact, list item, process step, cause and effect, date or event, diagram/table label |
| `ImportanceSignal` | The textbook signal behind a proposed importance (margin keyword, bold term, heading, summary box, end-of-chapter question, body text, enrichment) |
| `Importance` | Tier (Core / Supporting / Peripheral) + weight |
| `EffectiveImportance` | `{ anchorId, tier, weight }` chosen for a fact in a scope |
| `AnchorPreference` | Optional filter on position types (e.g. margin keywords only) |
| `IndexNodeRef`, `StandardNodeRef` | Place in the source's own index tree; reference to a node in a standard (e.g. CAPS) |
| `Scope` | Index nodes or page ranges within one source document |
| `FactSelection` | Ready for questions · approved since · by structure · hand-picked; across any source documents |
| `ReconciliationProposal` | New fact · re-anchor existing anchor `AnchorId` · additional anchor on `FactId` · (optionally) a core change |
| `EditImpact` | Minor (questions stay live, queued for Gate 2) or material (questions held until Gate 2) |
| `HoldReason` | Problem reports · material edit awaiting Gate 2 |
| `QuestionType`, `Difficulty`, `Basis` | Question kind; easy / medium / hard; paraphrase or anchor verbatim |
| `ModelAnswer`, `Rubric` | Answer citing source facts; rubric in **format version 1** of the catalogue contract: key points with weights and required flags, correct/partial thresholds, misconceptions, never-correct answers, and mechanical variants ([ARCHITECTURE.md › rubric format](ARCHITECTURE.md#content-rubric-format-catalogue-contract-format-version-1)) |
| `Provenance` | Model, prompt version, cost, time, attempt |
| `QualityResult` | Readable, or flagged with reasons (blur, skew, glare, cut-off) |

### 4.3 Domain policies and rules

| Policy / rule | Decides | Used by |
|---|---|---|
| `PageQualityPolicy` | Whether a read page is usable or flagged for re-photographing | Ingestion |
| `PlacementPolicy` | Page → index node from page ranges; anchor → node, splitting a page at mid-page headings; an anchor spanning pages goes by its start; unclear → curator queue | Sources |
| `ImportanceProposalPolicy` | Signal → proposed tier and weight (AC-C26) | Ingestion (candidates) |
| `effectiveImportance(fact, scope, anchorPreference?)` | Strongest anchor in scope, or strongest of the preferred type; none → fact drops out | **Catalogue contract**: question generation and Prep |
| `GenerationDefaultsPolicy` | Questions per fact by effective tier (~4 / 2 / 0–1) and types by fact type (AC-C13) | Question bank |
| `MechanicalRubric` | Derives rubrics for mechanical types from the question (correct option, sequence, blank, ordering partial credit) | Question bank |
| `LineageRules` | Merge: new fact takes all anchors and links (re-pointed; links among merged facts dropped). Split: anchors and links assigned by the curator | Fact model |
| `LivenessRules` | Fact, anchor, link and question liveness (see [ARCHITECTURE.md › the live catalogue](ARCHITECTURE.md#content-the-live-catalogue)) | Catalogue projection |
| Review policies | **Reviewer mode** per textbook or subject: **AI review** (year-1 default: independent AI check of every item, confident → live, doubtful → curator queue, curator spot checks at a set rate) or **curator review** (Gate 1 full; light review for anchors and link sets; Gate 2 full for judgement types, sampled `ReviewBatch` for mechanical types); placement auto-approved | Review & Versioning |
| `ReconciliationOrder` | Shortlist: the superseded page version's anchors first, then facts in the same language and subject mapped to the **same CAPS subtopic**, trimmed by key-term text search when large | Ingestion |
| `RetryPolicy` | Which failures retry automatically (free steps; transient AI failures) and which wait for a curator; when a source pauses | Ingestion |

### 4.4 Domain events

| Event | Payload (in short) | Consumed by |
|---|---|---|
| `UploadRegistered` | upload, source document | Ingestion (render pages) |
| `PageVersionRead` / `PageFlaggedForRephoto` | page version, quality | Ingestion; coverage |
| `PageVersionSuperseded` | old and new page version | Ingestion (re-anchoring) |
| `IndexTreeConfirmed` / `IndexTreeCorrected` | source document, tree revision | Sources (`PlacePages`) |
| `CandidatesExtracted` | page version, candidate IDs | Ingestion (reconciliation) |
| `FactCandidateResolved` | candidate, outcome, resulting fact/anchor | Coverage |
| `VersionApproved` | item kind, item ID, version, edit impact | Catalogue projection; Question bank (minor/material handling) |
| `ItemHeld` / `ItemReleased` / `ItemRetired` | item kind, item ID, reason | Catalogue projection |
| `FactsMerged` | from[], into | **Prep** (`Mastery`: lower estimate); Question bank (re-point questions) |
| `FactSplit` | from, into[] | **Prep** (`Mastery`: inherit); Question bank (re-point questions) |
| `GenerationRunCompleted` | run, per-source counts | Review & Versioning (open `ReviewBatch`es) |
| `ReviewBatchPassed` / `ReviewBatchFailed` | batch | Review & Versioning |
| `ProblemReportThresholdReached` | question | Review & Versioning (hold) |
| `StandardTreeConfirmed` | standard, source document, language | Sources (mapping proposals for textbook index trees) |
| `ExhibitAlternativeApproved` | exhibit, alternative version | Catalogue projection (exhibit becomes learner-visible) |
| `BrandContentLicenceChanged` | brand, source, granted / revoked | Catalogue projection; Family (textbook lists for enrolment) |
| `AiReviewCompleted` | item, verdict (confident / doubtful), reasons | Review & Versioning (auto-approve or curator queue) |

Events leave through the transactional outbox ([ARCHITECTURE.md › Data & Consistency Decisions](ARCHITECTURE.md#data--consistency-decisions)); every handler is idempotent.

---

## 5. Lifecycles

**PageVersion pipeline**
```
Registered → Rendered → Reading → Read ─┬→ Placed → Extracting → Extracted → Reconciled → InReview → Resolved
                                        └→ FlaggedForRephoto
any step → Failed (automatic retry only for free steps and transient AI failures; otherwise manual)
newer version of the same page → Superseded
repeated failures in one source → that source's pipeline Paused until a curator resumes it
```
`Placed` may be reached later than `Extracted` when the index tree is confirmed after upload; placement doesn't block extraction or review.

**Version (any versioned item)**
```
Draft → InReview → Approved (live) → Superseded
                 ↘ Rejected
```

**Item availability**
```
Live ⇄ Held(reason…)      Live | Held → Retired
```

**FactCandidate**
```
Proposed → (Gate 1) → ApprovedAsNewFact | MatchAccepted | Combined | Rejected
```

---

## 6. Application layer: use cases

One use case per operation. Each loads aggregates, calls domain behaviour, saves, and publishes events; no business rules live here. "Actor" is who or what starts it.

### 6.1 Source setup
| Use case | Actor | Does |
|---|---|---|
| `RegisterSourceDocument` | Curator | Creates a textbook record (AC-C1) |
| `UploadTableOfContents` | Curator | Registers the ToC PDF; submits an `IndexProposal` task |
| `RecordIndexProposal` | Job (AI result) | Stores the proposed tree and CAPS mapping |
| `ConfirmIndexTree` | Curator | Confirms or corrects the tree; emits `IndexTreeConfirmed` |
| `CorrectIndexTree` | Curator | Changes nodes or ranges later; emits `IndexTreeCorrected` |

### 6.2 Intake
| Use case | Actor | Does |
|---|---|---|
| `RegisterUpload` | Curator | Records source file ID + revision and tags; idempotent |
| `RenderPages` | Job | Renders page images to media storage; creates page versions (splits spreads); supersedes existing pages with the same number |
| `AssignPageNumber` | Curator | Resolves a page whose printed number couldn't be read |

### 6.3 Reading and quality
| Use case | Actor | Does |
|---|---|---|
| `SubmitPageReading` | Job | Submits a `PageReading` task (urgency from the upload) |
| `RecordPageReading` | Job (AI result) | Stores transcription and layout; applies `PageQualityPolicy`; creates diagram crops |
| `CollectAiResults` | Scheduled job | Collects finished AI tasks and hands each to its `Record…` use case |
| `RetryFailedStep` | Job (free steps; transient AI failures) / curator | Automatic only for steps with no AI cost and for transient, usually uncharged AI failures; otherwise manual, per page or in bulk, showing the estimated cost before confirming |
| `PauseSourcePipeline` | Policy (repeated failures) | Pauses a source document's pipeline after the failure threshold and alerts the curator |
| `ResumeSourcePipeline` | Curator | Resumes a paused source after investigation |

### 6.4 Placement
| Use case | Actor | Does |
|---|---|---|
| `PlacePages` | Event (`IndexTreeConfirmed` / `Corrected`) | Places all read page versions and their anchors; auto-approved anchor versions; unclear cases to the "unplaced" queue |
| `PlaceAnchorManually` | Curator | Resolves an unplaced page or anchor |

### 6.5 Extraction and reconciliation
| Use case | Actor | Does |
|---|---|---|
| `SubmitExtraction` | Job | Submits `CandidateExtraction` with neighbouring pages as context |
| `RecordExtraction` | Job (AI result) | Creates `FactCandidate`s with anchors, signals, importance and links |
| `ProposeMatches` | Job | Builds each candidate's shortlist (`ReconciliationOrder`: old page anchors, then same CAPS subtopic, trimmed by key-term text search) and submits **one** cheap-model `MatchJudgement` per page |
| `RecordMatchJudgement` | Job (AI result) | Stores the `ReconciliationProposal` on the candidate; candidate enters Gate 1 |
| `ReextractPages` | Curator | Re-runs extraction (e.g. new prompt) through the same reconciliation path |

### 6.6 Gate 1: resolving candidates
| Use case | Actor | Does |
|---|---|---|
| `ApproveCandidateAsNewFact` | Curator | Creates `Fact`, its first `SourceAnchor` and `FactLinkSet` (approved) |
| `AcceptCandidateMatch` | Curator | Re-anchors an existing anchor or adds an anchor to an existing fact (light review); a proposed core change becomes a fact-core draft for full Gate 1 |
| `CombineCandidates` | Curator | Joins candidates into one before approval (no lineage) |
| `EditCandidate` | Curator | Edits statement, paraphrases, anchor details, importance or links before deciding |
| `RejectCandidate` | Curator | Rejects; no `FactId` is created |
| `ResolveOrphanedAnchor` | Curator | For an old anchor with no match after page replacement: retire it or re-anchor elsewhere; a fact left with no anchor is retired |

### 6.7 Fact maintenance (approved facts)
| Use case | Actor | Does |
|---|---|---|
| `EditFactCore` | Curator | Opens (or joins) the one draft of the fact core |
| `ApproveFactCore` | Curator | Approves with `EditImpact` minor or material |
| `MergeFacts` | Curator | New fact from several; takes all anchors and links; lineage; `EditImpact` (default **material**); emits `FactsMerged` |
| `SplitFact` | Curator | New facts from one; curator assigns anchors and links; lineage; `EditImpact` (default **material**); emits `FactSplit` |
| `RetireFact` | Curator | Retires a fact and its anchors |

### 6.8 Anchors and links
| Use case | Actor | Does |
|---|---|---|
| `EditAnchor` | Curator | Importance, region, CAPS override (light review) |
| `ApproveAnchor` | Curator | Light review approval |
| `EditFactLinks` | Curator | Opens the link-set draft |
| `ApproveFactLinks` | Curator | Light review approval with `EditImpact` (e.g. a *part of* change is material for ordering questions) |

### 6.9 Question generation
| Use case | Actor | Does |
|---|---|---|
| `PreviewGeneration` | Curator | Resolves the `FactSelection` and shows defaults per fact (effective importance, fact type) |
| `StartGenerationRun` | Curator | Fixes selection, mode, overrides and urgency; submits `QuestionGeneration` tasks per fact or fact group per anchor source |
| `RecordGeneratedQuestions` | Job (AI result) | Validates schema; checks model answers against source facts; derives mechanical rubrics; drops duplicates (one cheap-model `DuplicateQuestionCheck` per fact against its existing questions, rejected included); creates question drafts |
| `CompleteGenerationRun` | Job | Records counts and cost; emits `GenerationRunCompleted` |

### 6.10 Gate 2
| Use case | Actor | Does |
|---|---|---|
| `OpenReviewBatches` | Event (`GenerationRunCompleted`) | One batch per source document for mechanical questions; draws the ~10% sample |
| `ReviewSampledQuestion` | Curator | Pass / fail (with edits) for a sampled question |
| `CloseReviewBatch` | Job | ≥95% → approve all; otherwise send all to the full queue |
| `ReviewQuestion` | Curator | Full review: approve, edit (question, model answer, rubric together), set difficulty, reject |
| `RetireReplacedQuestions` | Event (`VersionApproved` in regenerate mode) | For each fact: once it has at least one approved replacement from the run **and** all the run's drafts for that fact are resolved, retires its old questions |
| `RepointQuestionsAfterLineage` | Event (`FactsMerged` / `FactSplit`) | Re-points questions to the new fact(s) and sends them to Gate 2; held until then if the merge/split was material, live if minor |
| `RetireQuestion` | Curator | Retires a question |

### 6.11 Holds and problem reports
| Use case | Actor | Does |
|---|---|---|
| `ReportProblem` | **Prep** (parent or child) | Records a report on a question version; at 3 open reports, holds it (AC-C21) |
| `ResolveProblemReports` | Curator | Reviews the question; releases the hold or edits/retires |
| `HoldItem` / `ReleaseItem` | Policy / curator | Generic hold handling |

### 6.12a Standards
| Use case | Actor | Does |
|---|---|---|
| `RegisterStandard` | Curator | Creates a standard (e.g. CAPS) with level names, mapping depth and openness; a revision that matters is registered as a separate standard |
| `UploadStandardDocument` | Curator | Registers a standard document (e.g. one phase × subject × language) as a source; runs through intake and reading |
| `RecordStandardExtraction` | Job (AI result) | Creates **standard node candidates** (tree and node content, down to content items where listed); for a later language, proposes matches to existing nodes |
| `ConfirmStandardTree` | Curator | Confirms or corrects nodes and matches against the document; adds that language's text; emits `StandardTreeConfirmed` |
| `MapIndexNodesToStandard` | Curator (AI-proposed) | Maps a textbook's index nodes to standard nodes at the mapping depth; anchors inherit the references unless overridden |

### 6.12b Exhibits and openness
| Use case | Actor | Does |
|---|---|---|
| `SetSourceOpenness` | Curator | Marks a source open or closed |
| `RecordExhibits` | Job (reading result) | Stores crops as exhibits with a type, linked to the facts they illustrate after extraction |
| `EditExhibit` | Curator | Changes type, caption or linked facts |
| `UploadExhibitAlternative` | Curator | Uploads an open alternative for an exhibit (versioned; reviewed); emits `ExhibitAlternativeApproved` on approval |

### 6.12c Brand content licensing
| Use case | Actor | Does |
|---|---|---|
| `GrantBrandContentLicence` / `RevokeBrandContentLicence` | System administrator | Adds or removes a source (textbook or standard) for a brand; overlap allowed; emits `BrandContentLicenceChanged` |

### 6.12d AI review (reviewer mode)
| Use case | Actor | Does |
|---|---|---|
| `SetReviewerMode` | Curator | AI review (year-1 default) or curator review, per textbook or subject |
| `SubmitAiReview` | Job | Submits an independent AI check for each new or changed item (fact candidate, anchor, link set, question) |
| `RecordAiReview` | Job (AI result) | Confident → approves (auto-approval logged as AI); doubtful → curator queue with reasons |
| `DrawSpotCheckSample` | Scheduled job | Samples auto-approved items at the configured rate into the curator's spot-check queue |
| `AddToEvalSet` | Curator | Adds a production item (an edit, rejection or spot-check result, with its input) to the Content AI evaluation set, tagged with the error type ([TESTING.md › Content AI evaluation](TESTING.md#content-ai-evaluation)) |
| `RecordSpotCheck` | Curator | Pass / fail (with edits); updates the measured error rate per textbook and item kind |

### 6.12 Query services (back office reads)
Read models, not use cases; they don't load aggregates.

| Query | Shows |
|---|---|
| `PipelineStatus` | Page versions per state per upload and source document; failures with reasons; paused sources; AI cost so far |
| `ReviewQueue(kind)` | Candidates (Gate 1), anchors and link sets (light), questions (Gate 2 full), sampled questions, problem reports |
| `PageNumberQueue`, `UnplacedQueue`, `RephotoQueue` | Curator work queues |
| `Coverage(sourceDocument)` | Pages uploaded / flagged / extracted, facts approved, questions generated / live, **facts with no live question anchored in this source**, unplaced pages (AC-C6) |
| `SpotCheckErrorRate` | Error rate of auto-approved items per textbook and item kind, from spot checks |
| `BrandContent(brand)` | Sources licensed to a brand |
| `ExhibitsNeedingAlternatives` | Exhibits from closed sources linked to live facts, without an open alternative |
| `GenerationRunLog` | Runs with selection, mode, options, counts, cost (AC-C17) |
| `ItemHistory(item)` | Versions, transitions, who and when (AC-C20, C22) |
| `Traceability(question)` | Question → anchors → fact → page version → upload → source document (AC-C22) |

### 6.13 Catalogue projection
| Handler | Trigger | Does |
|---|---|---|
| `UpdateLiveCatalogue` | `VersionApproved`, `ItemHeld`, `ItemReleased`, `ItemRetired` | Recalculates liveness of the item and its dependants |
| `RebuildLiveCatalogue` | Operator | Rebuilds the projection from the system of record |

---

## 7. Ports (owned by the application layer)

| Port | Operations (in short) | Boundary ([ARCHITECTURE.md › Boundary map](ARCHITECTURE.md#boundary-map)) |
|---|---|---|
| `ContentAI` | `submit(task, urgency) → TaskRef`; `collect() → [(TaskRef, Done(result) \| Failed(reason))]`; tasks: `IndexProposal`, `PageReading`, `CandidateExtraction`, `MatchJudgement`, `QuestionGeneration`, `ModelAnswerCheck`, `DuplicateQuestionCheck`, `StandardExtraction`, `StandardNodeMatch`, `AiReview` | Full + anti-corruption |
| `SourceRepository` | `fetch(fileId, revision) → document`; `revisionOf(fileId)` | Full |
| `MediaStore` | `put(content) → contentHashedRef`; `urlFor(ref, audience)`; crop storage | Partial |
| Repositories | One per aggregate: `SourceDocuments`, `IndexTrees`, `Uploads`, `Pages`, `FactCandidates`, `Facts`, `SourceAnchors`, `FactLinkSets`, `Questions`, `GenerationRuns`, `ReviewBatches`, `ProblemReports`; each with optimistic version checks | Full |
| `JobQueue` | `enqueue(job, key)`, `schedule(job, when)`; idempotency key per job | Shared job service |
| `EventPublisher` | `publish(event)` inside the same transaction (outbox) | Shared |
| `Clock` | `now()` | Partial |

Provider identifiers, prompts and payload formats live only inside the adapters (Design Conventions).

---

## 8. Inbound adapters

Each one translates input, resolves the request context (actor, role), calls **one** use case or query service, and presents the result. No rules here.

| Inbound adapter | Driven by | Calls |
|---|---|---|
| **Back-office server functions** (staff only, role-checked) | Curators, system administrators | Sections 6.1–6.11 commands and 6.12 queries |
| **AI result collector** | Scheduled job | `CollectAiResults` → `Record…` use cases |
| **Pipeline job handlers** | Job queue | `RenderPages`, `SubmitPageReading`, `SubmitExtraction`, `ProposeMatches`, `CompleteGenerationRun`, `CloseReviewBatch`, retries |
| **Domain event handlers** | Outbox events | `PlacePages`, `OpenReviewBatches`, `RetireReplacedQuestions`, `RepointQuestionsAfterLineage`, `UpdateLiveCatalogue` |
| **`ContentCatalogue` entry point** (in-process) | **Prep** | `resolveScope`, `sessionBundle`, `lineage` (queries on the live catalogue); `reportProblem` (use case) |

## 9. Outbound adapters

| Port | Adapter role | Current choice ([TECH-STACK.md](../TECH-STACK.md)) |
|---|---|---|
| `ContentAI` | AI document reading and generation provider, batch and real time | Claude Sonnet 5.5 (page reading), Claude Opus 5.5 (extraction, matching, generation); Batch API for large runs |
| `SourceRepository` | Source document repository | Google Drive (Shared Drive), service account |
| `MediaStore` | Object storage + CDN | Cloudflare R2 + CDN |
| Repositories, projection | System of record | PostgreSQL |
| `JobQueue` | Queue and scheduler | pg-boss, separate worker process |
| `EventPublisher` | Transactional outbox | PostgreSQL outbox |

### 9.1 The published interface (for Prep)

Defined in [ARCHITECTURE.md › Content: the live catalogue](ARCHITECTURE.md#content-the-live-catalogue):

```
resolveScope(sourceDocument, scope, anchorPreference?)
  → FactRef[] { factId, effectiveImportance {anchorId, tier, weight},
                anchors in scope {anchorId, page number, index node}, links, lineage }

sessionBundle(sourceDocument, factIds, constraints)
  → LiveQuestion[] { questionId, version, type, prompt, options, diagram crop URL,
                     modelAnswer, rubric + rubricVersion, factIds, anchorIds, difficulty }

lineage(factIds) → mergedInto / splitInto
reportProblem(questionId, version, reason)
```
plus the events `FactsMerged` and `FactSplit`. Never verbatim text, page images, drafts or review state.

---

## 10. End-to-end flows

**Upload to Gate 1**
1. Curator: `RegisterUpload` → `RenderPages` (spreads split; page versions created).
2. Jobs: `SubmitPageReading` → … → `RecordPageReading` (quality; crops) → `PlacePages` if the tree is confirmed.
3. Jobs: `SubmitExtraction` → `RecordExtraction` (candidates) → `ProposeMatches` → `RecordMatchJudgement`.
4. Candidates appear in the Gate 1 queue with their proposals.

**Re-photographed page**
1. New upload with an existing page number → new page version; old one `Superseded`.
2. Extraction and reconciliation look first at the old version's anchors.
3. Curator accepts matches (anchors move, `AnchorId` and `FactId` kept, light review); changed statements go to full Gate 1 with minor/material; unmatched old anchors are resolved.
4. Mastery is untouched; questions stay live unless an edit is material.

**Curation over weeks, then one generation run**
1. Ten PDFs ingested; curators approve facts over two weeks.
2. Curator: `PreviewGeneration` with selection "ready for questions" across the ten source documents → `StartGenerationRun` (batch).
3. Results recorded per source; `OpenReviewBatches` per source; judgement types to the full queue.
4. Each passing batch and each approved question goes live at once.

**Merge**
1. Curator: `MergeFacts(a, b)` → fact `c` with all anchors and links; `a`, `b` retired.
2. `FactsMerged` → Prep sets `c`'s mastery to the lower of `a` and `b` in every active assessment.
3. Questions re-pointed to `c` and sent to Gate 2; held until approved, unless the curator marked the merge minor.

**Approval to live**
1. `VersionApproved` → `UpdateLiveCatalogue` recalculates the item and its dependants.
2. Prep's next session plan re-resolves scope and picks it up.

---

## 11. Open points

### Resolved (2026-11-23)
| # | Point | Decision |
|---|---|---|
| O1 | Do questions stay live while re-reviewed after a merge or split? | A merge or split is treated as a **material** edit by default: its questions are held until Gate 2. The curator can mark it **minor** to keep them live |
| O2 | When regenerated questions retire the old ones | For each fact, when it has at least one approved replacement from the run **and** all the run's drafts for that fact are resolved |
| O6 | Who may retire facts and questions, and resolve orphaned anchors | **Content curators** retire facts and resolve orphaned anchors; **content curators** may retire questions |
| O7 | Index tree corrections after facts are live | Placement re-runs; anchors move nodes (auto-approved); index-node scopes in Prep re-resolve at the next session plan |
| O3 | `SimilarityIndex` technology | **Dropped.** Reconciliation: shortlist (old page anchors; same CAPS subtopic, trimmed by key-term text search) + one cheap-model `MatchJudgement` per page. Duplicate questions: one cheap-model `DuplicateQuestionCheck` per fact per run. No vector index |
| O5 | Rubric format | **Format version 1** in the catalogue contract: the evaluator judges each key point, code decides the Verdict; partial credit by weights, required points and thresholds; fill-in-the-blank uncertain band → Close. Grader: Haiku 5.5 primary, Sonnet 5.5 escalation |
| O4 | Retries of failed pipeline steps | Free steps retry automatically (3 attempts, 1 min → 10 min → 1 h); AI steps retry automatically only for transient, usually uncharged failures (switchable); charged bad output waits for a manual retry; a source pauses after 5 failures in a row; manual retries show the estimated cost |

| O8 | Page identity across editions | Optional curator-only **edition label** per upload; page identity (textbook, edition label, page number); facts from every edition merge as extra anchors; parents' page-range scopes resolve against the main edition |
| O9 | Review with almost no reviewer capacity in year 1 | **AI review** by default: independent AI check of every item (different prompt, ideally a different model); confident → live, doubtful → curator queue; curator spot checks at a set rate; problem reports as the safety net; **curator review** switchable per textbook or subject. Applies to Gate 2 judgement types too |
| O10 | Verbatim question basis | Allowed only for anchors in **open** sources |
| O11 | Standards and language | One language-independent node with text per language; a later language's document is matched to existing nodes |
| O12 | Where Standards live | A module inside the Content context |
| O14 | Exhibit types | Diagram, table, chart/graph, map, photo, illustration, timeline, other |
| O15 | Measuring AI quality in the pipeline | **Content AI evaluation set** with a gate on every prompt, model or pipeline change; first gold set before the first textbook; see [TESTING.md › Content AI evaluation](TESTING.md#content-ai-evaluation) |

### Still open
| # | Open point | Suggested direction |
|---|---|---|
| O13 | Withdrawing a textbook (legal request) | Parked until needed |
