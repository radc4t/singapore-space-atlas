# Singapore Space Atlas

**A visual, evidence-backed systems map of Singapore's space ecosystem.**
_Government · Research · Industry · International_

🛰 **Live:** https://radc4t.github.io/singapore-space-atlas/ · **Edition:** 2026 · research snapshot 15 Aug 2026

![Singapore Space Atlas — the Explore plate (light)](docs/hero-light.png)

NSAS (the National Space Agency of Singapore, established 1 April 2026) has an ecosystem-building
mandate, but there is no single visual overview of how its parts connect. People cannot participate
in a system they cannot see. The Atlas makes the relationships between the agency, government bodies,
universities, ~70 companies, national programmes and international partners legible in one view — and
does so **honestly**, showing what is documented, what is inferred, and how each relationship is known.

> **Editorial thesis.** This maps the publicly documented relationships and structural roles
> connecting Singapore's space institutions, research community, companies, programmes and supporting
> ecosystem — _not_ an exhaustive representation of every company or every relationship.

## What it is

A **"scientific / mission-control instrument"**: a large, centred constellation on a technical
canvas, in two matched themes — a light _archival instrument_ and a dark _night operations room_
(same instrument, two temperatures). It is a research-grade information system that happens to have a
visualization, not the reverse. Aesthetic hierarchy: **map → evidence → instrument chrome**. The
instrument metaphor is expressive, not literal — no fictional telemetry or spatial claims.

## The six-channel visual grammar

Meaning never rests on colour alone:

| channel  | encodes                                                                                |
| -------- | -------------------------------------------------------------------------------------- |
| colour   | stakeholder **type** (on nodes; edges stay neutral)                                    |
| shape    | ontology — organisation circle · programme plaque · international outline · sector arc |
| stroke   | **pathway** — solid direct · dashed programme-mediated · dotted contextual             |
| opacity  | **confidence** — documented crisp · inferred muted (off by default)                    |
| position | structural **layer** — concentric ring, inner → outer                                  |
| size     | **editorial prominence** (declared, non-quantitative)                                  |

## Using it

Three views (real view switches; state is deep-linkable):

- **Explore** — the instrument. Click a node → focus mode; the right module switches from **Readouts**
  (derived counts) to an **Inspector** field-note with the relationship's evidence and cited sources.
  Search (name · type · cluster · alias), filter by type, toggle inferred links, or take the guided tour.
- **Catalogue** — the card-index of the full corpus, and the accessible representation of the data.
- **Methodology** — the intellectual contract: what the Atlas does, what it does not claim, what
  counts as evidence.

Shareable deep links carry the exact state, e.g. `?node=speqtral&inferred=1` or `?view=catalogue`.
Light/dark follow your system preference (toggle in the top bar). Desktop-first, with a mobile
companion (intelligent simplification, not forced parity).

## Honesty model

Every relationship carries its **own** sources and two independent labels — `confidence`
(documented vs inferred) and `pathway` (direct, programme-mediated, contextual). An edge exists only
when a specific source substantiates that specific relationship; **absence of an edge is not a claim
that no relationship exists.** Counts are derived from the data; only the "~70 companies" denominator
is a cited editorial estimate. The `research/` ledger records sources (with retrieval locations,
first-party vs secondary) and the editorial decisions behind the corpus.

## Run

```bash
npm install
npm run dev      # http://127.0.0.1:8000 (build-free static server)
```

Production build (self-contained static output, no runtime dependencies):

```bash
npm run build && npm run preview
```

## Develop

```bash
npm run validate   # data-contract integrity, ontology + evidence rules
npm test           # node --test: validator provably catches contract violations
npm run stress     # layout crossing/collision report
npm run test:e2e   # Playwright: interaction, deep links, axe a11y, visual regression
npm run lint && npm run format
```

## Architecture

Vanilla ES modules; **D3 (`d3-shape`) for geometry only**, bundled via esbuild. No graph library, no
force simulation, no UI framework, no runtime external dependencies. Strict module boundaries:

```
js/
  data/{ecosystem,sources}.js   corpus + source registry (single source of truth)
  config.js                     controlled vocabularies + visual taxonomy
  layout.js  render.js          geometry → rich IR → declarative SVG
  interaction.js filters.js     focus/hover/keyboard · visibility/search/evidence
  readouts.js inspector.js      right panel: Readouts ↔ Inspector (one module, two modes)
  catalogue.js views.js         the card-index · Explore/Catalogue/Methodology switching
  router.js state.js theme.js story.js
scripts/  validate-data.mjs · layout-stress.mjs · build.mjs
research/ evidence ledger (sources.md, decisions.md, entities.csv, relationships.csv, references.md)
design.md the design constitution
```

## Versioning & editions

Two independent axes:

- **Software (SemVer):** git-tagged releases. `v1.0.0` is the first public release. Patch = fixes;
  minor = new features or a data refresh within schema 1.0; major = a schema break or identity overhaul.
- **Editorial edition:** the content version, shown in-product — **2026 Edition · research snapshot
  15 Aug 2026 · dataset schema 1.0**. A future data refresh is a new Edition (and a minor bump).

## Licence

MIT.
