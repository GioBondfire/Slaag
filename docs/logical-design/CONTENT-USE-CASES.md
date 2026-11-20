# Content Use Cases

Logical design only: technology-neutral. Technology choices live in [../TECH-STACK.md](../TECH-STACK.md).

**Status:** draft, 2026-11-20. Rows marked **New** go beyond the PRD (AC-C1–C28). They are listed under [Decisions to confirm](#decisions-to-confirm) and need a PRD update once confirmed.

**What the Content context does.** It turns outside sources (textbooks first) into a **fact base** and **questions** for Prep:
- **Fact base:** reviewed, verbatim facts with paraphrases, importance (tier + weight), typed links to related facts, the textbook's index tree and a CAPS cross-reference.
- **Questions:** each with a model answer and a rubric.

Prep only ever sees approved, published versions, through `ContentCatalogue` ([ARCHITECTURE.md → Context map](ARCHITECTURE.md#context-map)).

## Actors
| Actor | Role in Content |
|---|---|
| **Curator** (content manager) | Registers textbooks, uploads pages, starts extraction and generation runs, sets importance, publishes |
| **Teacher reviewer** | Gate 1 (facts) and Gate 2 (questions): approves, edits, rejects, gives feedback for regeneration, handles problem reports |
| **Staff** | Maintains CAPS reference data; oversight and traceability |
| **System** (work queue) | Runs page reading, extraction and generation; auto-hides reported questions |
| **Prep** (downstream context) | Reads the published catalogue; forwards problem reports from parents and children |

## Lifecycle
```
Register textbook ─► Index tree from TOC (+ CAPS map) ─► Upload page PDFs ─► Read pages (OCR, quality flags)
                                                                                     │
        ┌──────────── reprocess (change proposal) ◄───────────┐                      ▼
        │                                                     │             Extraction run (facts as drafts)
        ▼                                                     │                      │
   Gate 1: review facts ── feedback ─► regenerate fact ───────┘                      │
        │ approved facts                                                             │
        ▼                                                                            │
   Generation run (questions + model answers + rubrics) ◄────────────────────────────┘
        │
        ▼
   Gate 2: review questions ── feedback ─► regenerate question ─► back to Gate 2
        │ approved
        ▼
   Publish textbook ─► ContentCatalogue ─► Prep ── problem reports ─► back to review
```

**Item states** (one general `Review & Versioning` module, [S10](ARCHITECTURE.md#consolidations)): Draft → In review → Approved → **Live** (on publish). Items can also be Rejected, **Hidden** (problem reports) or Retired. Every edit, regeneration or reprocessing result creates a **new version of the same item**. The item's ID stays stable, and the live version stays live until a newer one is approved and published.

## Use cases

Stage: **Pilot** (Jan 2027), **Launch** (Feb 2027), **D#** (deferred, see [Debt Ledger](ARCHITECTURE.md#debt-ledger)), **New** (stage to decide).

### A. Set up a source
| # | Use case | Actor | What happens | PRD | Stage |
|---|---|---|---|---|---|
| CU-1 | `RegisterTextbook` | Curator | Creates the textbook record: title, publisher, edition/ISBN, grade, subject, language, cover. Source type "textbook" (the first type) | C1 | Pilot |
| CU-2 | `ProposeIndexTree` | Curator → System | Curator uploads a photo PDF of the table of contents. AI proposes the index tree (term > topic > subtopic, with page ranges) and a CAPS mapping per node | C2 | Pilot |
| CU-3 | `ConfirmIndexTree` | Curator | Confirms or corrects nodes, page ranges and CAPS mappings | C2 | Pilot |
| CU-4 | `AmendIndexTree` | Curator | Corrects a confirmed tree. Pages are placed again. Facts keep their IDs and get new versions with the new index/CAPS references | — | **New** |
| CU-5 | `MaintainCapsReference` | Staff | Loads and versions CAPS curriculum nodes (grade, subject, term, topic, subtopic) used for cross-referencing | (ontology: CAPSNode) | Pilot |

### B. Ingest pages
| # | Use case | Actor | What happens | PRD | Stage |
|---|---|---|---|---|---|
| CU-6 | `UploadPages` | Curator | Uploads a PDF of phone photos tagged with textbook and grade, plus optional section and page range(s). Pages are split out, stored with their images and placed in the index tree by page number. Reading starts automatically | C3 | Pilot |
| CU-7 | `ReadPages` | System | OCR (Afrikaans and English), with each page kept linked to its image. Pages that read poorly (blur, skew, glare, cut-off) are flagged for re-photographing | C4 | Pilot |
| CU-8 | `ReplacePages` | Curator | A re-upload replaces pages entirely. Their facts go back to Gate 1, and questions built on those facts go back to Gate 2 | C5 | Pilot |
| CU-9 | `ResolvePageFlag` | Curator | Accepts a flagged page as readable enough, or keeps it waiting for a re-photograph | C4 | Pilot |

### C. Build the fact base
| # | Use case | Actor | What happens | PRD | Stage |
|---|---|---|---|---|---|
| CU-10 | `StartExtractionRun` | Curator | Chooses a scope of read pages (textbook, index nodes or page range) and starts extraction. AI extracts verbatim facts with type, key terms, page area, position type, index node and CAPS reference. It also proposes tier + weight (recording the signal used), links and 1–2 paraphrases, and crops diagrams. Everything lands as drafts in the Gate 1 queue. The run is logged | C7–C9, C26, C27 | Pilot; **New**: curator-started |
| CU-11 | `ReprocessSource` | Curator | Runs extraction again on a scope whose pages haven't changed (e.g. improved extraction, an amended index tree, or curator guidance notes). The result is a **change proposal** against the current fact base, never a replacement: unchanged facts are kept; changed facts become a new draft version with the same ID; new facts become drafts; facts no longer found are proposed for retirement. Each change is decided in Gate 1 | — | **New** |

### D. Review facts (Gate 1: every fact)
| # | Use case | Actor | What happens | PRD | Stage |
|---|---|---|---|---|---|
| CU-12 | `FactReviewQueue` (query) | Reviewer | Queue by textbook, node or page. Each fact is shown beside its page photo with paraphrases, importance, signal and links. Reprocessed facts show a diff | C10, C19 | Pilot |
| CU-13 | `ApproveFacts` | Reviewer | Approves one fact or a **batch** (a page, a node or a selection) in one action. A batch can contain only facts shown on the reviewer's screen, so Gate 1 still sees every fact | C10 | Pilot; **New**: batch |
| CU-14 | `EditFact` | Reviewer | Edits text, paraphrases, type, key terms, index node or CAPS reference (new version) | C10 | Pilot |
| CU-15 | `MergeFacts` / `SplitFact` | Reviewer | Merges duplicates or splits a fact holding two ideas. The results get new IDs, and their mastery starts fresh | C10, C27 | Pilot |
| CU-16 | `RejectFacts` | Reviewer | Rejects one fact or a batch, with a reason | C10 | Pilot |
| CU-17 | `SetImportance` | Reviewer | Confirms or changes tier and weight per fact | C25, C28 | Pilot |
| CU-18 | `LinkFacts` | Reviewer | Adds, changes or removes typed links (elaborates / duplicates / part of / related) | C27 | Pilot |
| CU-19 | `RequestFactRegeneration` | Reviewer | Writes feedback on a fact or paraphrase (or one note for a batch) and sends it back to AI. The result is a new draft version of the same fact, with the feedback attached, back in the queue | — | **New** |
| CU-20 | `BulkSetImportance` | Curator | Sets tier/weight for a whole index node (e.g. an enrichment section → Peripheral) | C28 | D6 |

### E. Generate questions
| # | Use case | Actor | What happens | PRD | Stage |
|---|---|---|---|---|---|
| CU-21 | `StartGenerationRun` | Curator | Selects a scope of **approved** facts. The dialog is pre-filled with defaults by tier and fact type; the curator overrides counts, types and the basis (paraphrase by default, or verbatim). Each question gets a difficulty, links to its source facts, a model answer and a rubric. On a scope that already has questions this is **"generate more"**, with meaning-based duplicate detection. Never automatic; every run is logged | C12–C17 | Pilot (diagram labelling: D3) |
| CU-22 | `RequestQuestionRegeneration` | Reviewer | Writes feedback on a question, its model answer or its rubric (single or batch) and sends it back to AI. The result is a new draft version of the same question, back in Gate 2 | — | **New** |

### F. Review questions (Gate 2: risk-based)
| # | Use case | Actor | What happens | PRD | Stage |
|---|---|---|---|---|---|
| CU-23 | `QuestionReviewQueue` (query) | Reviewer | Shows judgement types (written definitions, "why", paragraph) for full review, and mechanical types through their sample | C18, C19 | Pilot |
| CU-24 | `ReviewSample` | Reviewer | Marks pass/fail on a random ~10% sample of mechanical questions per textbook. If ≥ 95% pass, the batch is approved; otherwise the whole batch goes to full review | C18 | Pilot |
| CU-25 | `ApproveQuestions` | Reviewer | Approves one question or a batch. A question can't be approved without an approved model answer and rubric | C15c, C18 | Pilot |
| CU-26 | `EditQuestion` | Reviewer | Edits the question, model answer, rubric and difficulty together, as one version | C15c, C19 | Pilot |
| CU-27 | `RejectQuestions` | Reviewer | Rejects one question or a batch, with a reason | C19 | Pilot |

### G. Publish and maintain
| # | Use case | Actor | What happens | PRD | Stage |
|---|---|---|---|---|---|
| CU-28 | `PublishTextbook` | Curator | Makes all approved changes for a textbook live together as one new, immutable catalogue version. Prep picks it up from the next session plan | C20, C28 | Pilot |
| CU-29 | `TriageProblemReport` | Reviewer | Fixes the reported question (edit → Gate 2) or dismisses the report. A question with ≥ 3 open reports is already hidden automatically | C21 | Pilot |
| CU-30 | `RetireContent` | Curator | Removes a fact or question from the live catalogue without deleting it (e.g. textbook errata). A retired fact drops out of scopes and readiness | C20 | Pilot |

### H. Oversee
| # | Use case | Actor | What happens | PRD | Stage |
|---|---|---|---|---|---|
| CU-31 | `ViewCoverage` | Curator, staff | Per textbook: pages uploaded / flagged / extracted, facts approved, questions generated / live | C6 | Pilot (table); D7 (dashboard) |
| CU-32 | `ViewRunLog` | Curator | Extraction and generation runs: who, when, scope, options, counts, status, failed items, AI spend | C17 | Pilot |
| CU-33 | `TraceItem` | Reviewer, staff | Question → fact(s) → page → upload → textbook, with versions and feedback history | C22 | Pilot |

### I. Published to Prep (`ContentCatalogue`)
| # | Use case | Actor | What happens | PRD | Stage |
|---|---|---|---|---|---|
| CU-34 | `ResolveScope` | Prep | Scope (index nodes or page ranges) → live fact references with tier, weight, difficulty and links | C11 | Pilot |
| CU-35 | `GetSessionBundle` | Prep | Live questions with model answers and rubrics for a session's coverage, by catalogue version | — | Pilot |
| CU-36 | `ReportProblem` | Prep (parent, child) | Records a report on a question and sends it back to review | C21 | Pilot |

## Enabling operations
The operations below sit **inside** Content and are not use cases. Use cases coordinate them. Each module listed is a deep module with a small interface ([Module Design](ARCHITECTURE.md#module-design-deep-modules)).

### Outside services (ports)
| Operation | Port | Used by |
|---|---|---|
| `readPage(image, languages)` → text, layout regions, quality score | `ContentAI` | CU-7 |
| `proposeIndexTree(tocPages, capsNodes)` → nodes, page ranges, CAPS suggestions | `ContentAI` | CU-2 |
| `extractFacts(pages, indexNodes, guidance?)` → fact drafts (text, type, key terms, area, position type, tier + weight + signal, links, diagram regions) | `ContentAI` | CU-10, CU-11 |
| `paraphrase(fact, feedback?)` → 1–2 paraphrases keeping key terms | `ContentAI` | CU-10, CU-19 |
| `generateQuestions(facts, plan, basis)` → questions, difficulty, model answers, rubrics | `ContentAI` | CU-21 |
| `regenerate(item, sourceFacts, feedback)` → new draft content | `ContentAI` | CU-19, CU-22 |
| `compareMeaning(a, b)` → similarity | `ContentAI` | Duplicate detection |
| `storePageImage`, `cropRegion` (diagram crops) | `MediaStore` | CU-6, CU-10 |

Prompts, model choice and provider formats live only in the adapter ([Design Conventions](ARCHITECTURE.md#design-conventions)).

### Internal modules
| Module | Operations | Used by |
|---|---|---|
| **Ingestion** | Split an upload into pages; **place** a page in the index tree by page number; quality policy (read result → flag); replace-page cascade (facts → Gate 1, questions → Gate 2) | CU-6–CU-9, CU-4 |
| **Extraction** | Turn AI output into fact drafts; inherit the CAPS reference from the index node unless overridden; map the importance signal to a proposed tier and weight (defaults in `ContentSettings`); detect duplicate facts across pages (→ proposed `duplicates` links); **reconcile** re-extracted drafts with the current fact base (match by page area, text and meaning → keep / new version / new / retire proposal) | CU-10, CU-11 |
| **Generation** | Default plan (counts by tier, types by fact type, from `ContentSettings`); derive rubrics automatically for mechanical types; **grounding check** (a model answer must contain nothing outside its source facts); duplicate detection against existing questions | CU-21, CU-22 |
| **Review & Versioning** | New version of any item (with author, run or batch ID, feedback); state transitions; batch actions applied per item; Gate 1 policy (every fact) and Gate 2 policy (sample or full review); **dependency cascade** (a fact's text change → its questions back to Gate 2); auto-hide at ≥ 3 open reports; feedback log | CU-12–CU-19, CU-22–CU-30 |
| **Catalogue** | Publish a textbook as an immutable catalogue version; resolve scopes; build session bundles; coverage counts; trace queries | CU-28, CU-31, CU-33–CU-35 |
| **Runs** | Record extraction and generation runs (who, when, scope, options, status, counts, AI spend); split work into idempotent chunks per page or per fact; retry failed chunks only | CU-10, CU-11, CU-21, CU-32 |

## Rules
1. **AI output is always a draft.** Nothing AI-produced goes live without human approval (Gate 1 for every fact; Gate 2 by policy).
2. **Reprocessing and regeneration never overwrite.** They create new draft versions. The live version stays live until a newer one is approved and published.
3. **Stable IDs.** Facts and questions keep their ID across versions. Merge and split create new IDs (mastery starts fresh, per [Data & Consistency](ARCHITECTURE.md#fact-set-of-an-assessment-re-resolved-live)).
4. **Generation uses approved facts only.**
5. **Changes flow downstream.** A replaced page sends its facts to Gate 1 and their questions to Gate 2. A change to a fact's text or paraphrases sends the questions built on it to Gate 2. Importance or link changes don't.
6. **Batch actions are audited per item.** Each item's version records the reviewer and the batch ID.
7. **Feedback is kept** with the version it produced, so regeneration quality can be measured and prompts improved.
8. **Runs are idempotent.** Retrying a chunk never duplicates drafts.
9. **Learners never see sources.** Page photos and verbatim text never cross into the catalogue for learners (C24); learners see questions, model answers and diagram crops only.

## Decisions to confirm
| # | Proposal | Alternative | PRD impact |
|---|---|---|---|
| 1 | Page reading runs automatically on upload. **Fact extraction is curator-started** per scope (CU-10) | Extraction runs automatically after reading | C7 wording |
| 2 | **Reprocessing yields a change proposal** reviewed in Gate 1, keeping fact IDs and approvals for unchanged facts (CU-11) | Re-extract and replace (loses approvals and mastery) | New AC |
| 3 | **Batch approval** in Gate 1 per page, node or selection, limited to facts shown on screen (CU-13) | One-by-one approval only | C10 clarification |
| 4 | **Feedback-driven regeneration** for facts, paraphrases, questions, model answers and rubrics, single or batch (CU-19, CU-22) | Reviewers edit by hand only | New AC |
| 5 | **Approval ≠ live:** the curator publishes per textbook as one catalogue version (CU-28) | Each approval goes live immediately | C20 clarification |
| 6 | **The index tree can be amended** after confirmation (CU-4) | "Confirmed once" stays (current `Textbook` invariant) | C2; `Textbook` invariant |
| 7 | A fact's **text change sends dependent questions to Gate 2** (Rule 5) | Questions stay live until reported | New AC |
| 8 | **Stage** of the New items: pilot or launch | — | v1 Scope & Staging |

Once confirmed: update the PRD, add `Upload`, `ExtractionRun`, `GenerationRun` and `CatalogueVersion` to the [aggregates table](ARCHITECTURE.md#aggregates-and-invariants), and record the decisions in the [Decision Log](ARCHITECTURE.md#decision-log).
