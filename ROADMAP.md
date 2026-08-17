# Roadmap

The forward plan for the **Singapore Space Atlas**. It exists to make the atlas **more trustworthy and
useful** — not merely to make the corpus bigger or the UI richer. Every item below is grounded in a signpost
the codebase already carries (`design.md`, `research/decisions.md`, `README.md`), sequenced into phases and
mirrored as GitHub milestones and issues.

The project tracks two independent axes (see [Versioning & editions](README.md#versioning--editions)):
**software SemVer** (`v1.0.0`, git-tagged) and the **editorial Edition** (the content version shown
in-product). They are related but not synonymous — a minor version is not automatically a new Edition.

## Canonical source of truth

**This file is the canonical sequencing and scope document.** GitHub issues are execution records and may
carry implementation detail, discussion, and status. When the two disagree, this file wins.

> **Resuming mid-flight?** [`docs/HANDOFF.md`](docs/HANDOFF.md) is a self-contained execution brief — current
> corpus state, the remaining v1.1.0 issues in detail, the per-issue workflow, the evidence rules, the data
> model, and the verification gotchas — written so a fresh session can continue with no prior context.

## Guiding constraints

Every phase must hold these invariants:

- **Evidence over completeness.** An edge exists only when a specific source substantiates that specific
  relationship; **absence of an edge is not a claim** that no relationship exists.
- **Zero runtime dependencies** and a strict Content-Security-Policy (`connect-src 'none'`).
- The **six-channel visual grammar** stays intact — meaning never rests on colour alone.
- The **data contract** (`npm run validate`, `scripts/validate-data.mjs`) stays green.
- **`research/decisions.md` is the evidence ledger, not a changelog.** Every accepted, rejected, _or
  deferred_ evidence decision is recorded there with the source considered and the reason for its
  disposition — so "researched it and left it inferred/omitted" is visible work, never mistaken for a missed
  edit.

## Non-goals and deferrals

Two different categories, kept apart on purpose.

**Project-level non-goals — not by design, not ever.** These are deliberate editorial decisions, not backlog:

- **In-map zoom / pan** and **faceted filtering** — the plate is a published instrument to be _read_, not a
  canvas to fly around (`design.md` §"Product & views"; `research/decisions.md` §"Discovery model").
- **On-map cluster labels** — dropped because, _with this corpus_, one cluster spans half the ring and a
  centroid label misleads (`design.md` §"The map"). The "with this corpus" caveat is recorded so a future
  call stays deliberate, not accidental.
- **Fictional telemetry / spatial claims** — the instrument metaphor is expressive, not literal
  (`design.md`, opening constraint).

**This-Edition deferrals — "not now," may be scheduled later:**

- Mobile interaction depth beyond the Phase 2 scope below.
- Tour-authoring infrastructure beyond `STEPS`-as-data.

## Phase 1 — The next Edition · data expansion

**Target: `v1.1.0` · new research snapshot (new Edition). Primary axis: editorial / data.**

The loudest, most quantified signal in the repo: **22 of ~70 cited companies are mapped**, 12 nodes are
catalogued but not drawn, and several relationships and entities are held back pending sources
(`research/decisions.md`). The versioning model already frames this as "a data refresh within schema 1.0 …
a new Edition (and a minor bump)."

> **Release-quality bar.** No coverage increase is accepted solely to raise the denominator or node count.
> Every added or promoted entity or relationship must meet the existing evidence threshold and carry at
> least one source. The roadmap grows the atlas to make it _more trustworthy_, not merely bigger.

Split into six evidence-workflow tracks so no single mega-issue forms (each is its own GitHub issue):

1. **Company-coverage expansion** — grow from 22 toward ~70 _as sources permit_ (a sourcing-gated range, not
   a hard 70); promote the best-documented catalogued nodes to `coverage: 'featured'` where evidence
   supports drawing them.
2. **Relationship sourcing & disambiguation** — resolve the three currently non-documented relationships,
   with _per-edge_ acceptance criteria: `ntu→stdp` and `nus→stdp` are source-pending inferred edges (find a
   specific STDP award to promote to `documented`, else leave inferred); `nsas→unoosa` is a
   disambiguation — decide which office represents the state (NSAS/OSTIn vs MFA) and attach accordingly. Add
   per-company NSAS support edges only with a specific source.
3. **Omitted-entity sourcing** — DSTA, NEA / Meteorological Service, and a NuSpace spin-off edge: include
   each only once a citable primary source exists; otherwise record in the ledger why it remains omitted.
4. **URL re-verification** — re-verify every node `url` resolves to the correct first-party page; resolve
   `satoro` if a first-party site now exists (it is currently intentionally inert).
5. **Layout-stress & corpus-size review** — re-run `npm run stress` at the larger corpus; the current low
   edge-crossing count depends on the graph being sparse, so refine the layout only if crossings or
   label-collisions regress.
6. **Edition / research-snapshot release bookkeeping** — prepare the release metadata: bump `DATA_SNAPSHOT`
   and the in-product Edition label (schema stays `1.0`), update `research/decisions.md`, and verify release
   checks. The actual tag/release is cut once every other Phase 1 track is closed.

**Done when:** `npm run validate`, the unit tests, and the build are green; the Directory denominator readout
reflects the new counts; the `research/` ledger is updated; and the Edition label is bumped.

**Release gate.** Before the `v1.1.0` tag is cut, a **full sanity & regression pass** (`npm run
release-check`, tracked as the release-gate issue) must be green: it runs the complete automated battery,
adds permanent guards for the guiding invariants (strict CSP, zero runtime deps, Edition/snapshot sync,
ledger↔data parity, rendered release surfaces), and records the remaining editorial judgments as explicit
human checks. Publication (tag + release) happens only after that gate passes, the PR merges, and the
maintainer approves.

## Phase 2 — Mobile interaction and layout depth

**Target: `v1.2.0`. Primary axis: product.**

Today the "mobile companion" is a single `@media (max-width: 720px)` reflow block; the README and design
constitution promise "intelligent / intentional simplification." This phase makes the _companion_ real —
the intended experience, **simplification, not parity**:

- Touch affordances in `js/interaction.js`, a responsive type scale, a tablet breakpoint, and panels as real
  bottom sheets — beyond the single reflow block. No new exploratory tooling; the editorial stance holds.
- A **deep-linkable, richer guided tour**: serialize the story step in `js/router.js` / `js/state.js`
  (it is currently not shareable), and consider moving `STEPS` to data in `js/story.js`.

**Edition semantics.** `v1.2.0` is a minor version; whether it _also_ opens a new Edition is decided at
release, and only if it ships a data refresh. A product-depth release need not be a new Edition.

## Phase 3 — Engineering / trust hardening

**Rolling (patch / minor), no Edition change. Primary axis: engineering.**

Protects the evidence-first credibility as the corpus grows:

- **Wire e2e / axe / visual into CI.** `test/e2e.spec.mjs` (Playwright interaction, accessibility, visual
  regression) is not in CI today because baselines are platform-specific. Add a Playwright job to
  `.github/workflows/ci.yml` (or a separate workflow) with Linux-generated baselines committed for
  `test/e2e.spec.mjs-snapshots/`.
- **Layout-stress CI guard** — add `npm run stress` as a regression guard. **Dependency:** start only after
  Phase 1's corpus expansion reaches a size where crossings / collisions are meaningful; until then, retain
  manual / local stress runs, so the guard tests the real scenario rather than a still-sparse graph.
- **Accessibility depth beyond axe**, as objective, closable checks: keyboard traversal of every interactive
  control; focus visibility and order; screen-reader announcement of node / panel state; no loss of meaning
  at supported mobile widths; and documented exceptions where AAA contrast is incompatible with the visual
  system.

## Milestone & edition map

| Phase | Milestone                                                                             | Version / Edition                                         | Primary axis   |
| ----- | ------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------- |
| 1     | [v1.1.0 — Next Edition](https://github.com/radc4t/singapore-space-atlas/milestone/1)  | v1.1.0 · new research snapshot (new Edition)              | Editorial/data |
| 2     | [v1.2.0 — Product depth](https://github.com/radc4t/singapore-space-atlas/milestone/2) | v1.2.0 · Edition unchanged unless it ships a data refresh | Product        |
| 3     | [Engineering hardening](https://github.com/radc4t/singapore-space-atlas/milestone/3)  | Rolling patch/minor · no Edition change                   | Engineering    |

## Longer-term candidates — not committed roadmap scope

Ideas retained for future consideration; inclusion here does **not** imply priority, implementation, or
acceptance. They have a home so they need not be forced into a committed phase before the evidence justifies
one.

- **Research / data model** — provenance depth, richer relationship semantics, and _historical / versioned
  research snapshots_: preserving the atlas as a sequence of Editions rather than only replacing the current
  corpus (well-aligned with the project's research character).
- **Discovery / storytelling** — more tour narratives, shareable and permalinked perspectives.
- **Performance / scale** — corpus-scale layout strategy, render performance, asset optimisation.
- **Editorial operations** — a repeatable refresh workflow, a source-review checklist, stale-link detection.
- **Accessibility** — a broader assistive-technology / browser matrix and more formal regression coverage.
- **Distribution** — an embeddable viewer, downloadable research artifacts, machine-readable exports.
