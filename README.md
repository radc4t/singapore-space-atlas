# Singapore Space Atlas

**A visual, evidence-backed systems map of Singapore's space ecosystem.**
_Government · Research · Industry · International_

NSAS (the National Space Agency of Singapore, established 1 April 2026) has an ecosystem-building
mandate, but there is no single visual overview of how its parts connect. People cannot participate
in a system they cannot see. The Atlas makes the relationships between the agency, government bodies,
universities, ~70 companies, national programmes and international partners legible in one view — and
does so **honestly**, showing what is documented, what is inferred, and how each relationship is
known.

> **Editorial thesis.** This map shows the publicly documented relationships and structural roles
> connecting Singapore's space institutions, research community, companies, programmes and supporting
> ecosystem — _not_ an exhaustive representation of every company or every relationship.

## What makes it different

It is a **research-grade information system that happens to have a visualization**, not the reverse:

- **Every relationship carries its own evidence.** Edges are separate from nodes and cite their own
  sources, with two independent labels — `confidence` (documented vs inferred) and `pathway` (direct,
  programme-mediated, contextual). Documented links show by default; inferred links are opt-in.
- **A locked five-channel visual grammar** so meaning never rests on colour alone: colour = type ·
  shape = ontology (+ international outline) · line style = pathway · line opacity = confidence ·
  position = structural layer.
- **Honest coverage.** The map draws the featured anchors; the full corpus lives in the catalogue and
  search. Counts are derived from the data; only the "~70 companies" denominator is a cited estimate.
  Absence of an edge is never a claim that no relationship exists.
- **A first-class Catalogue** (semantic HTML) that doubles as the accessible representation — assistive
  tech never has to depend on the SVG.
- **Auditable curation.** The `research/` ledger records sources (with retrieval locations,
  first-party vs secondary), editorial decisions, and honest omissions.

## Features

- Curated concentric **systems map** (SVG) — click a node for focus mode + a research-grade inspector
  (role · why it's here · relationships with "why shown" + cited sources).
- **Search** as a command surface (name · type · cluster · role · aliases), with a "not in this
  snapshot" state that makes the methodology visible.
- **Legend filters**, a **"show inferred relationships"** toggle, and **reset**.
- **Guided story mode** — a stepped reading of the layers (Explore the Atlas).
- **Shareable deep links** — selection + filters live in the URL (e.g. `?node=speqtral&inferred=1`).
- **Light/dark** parity, keyboard navigation, reduced-motion, print and no-JS fallback.

## Run

Build-free dev server (no build step needed to view source):

```bash
npm install
npm run dev      # serves at http://127.0.0.1:8000
```

Production build (bundled + minified, self-contained static output):

```bash
npm run build && npm run preview
```

## Develop

```bash
npm run validate   # data-contract integrity, ontology + evidence rules
npm test           # node --test: validator caught-violations + data cleanliness
npm run stress     # layout crossing/collision report (Phase C.5 decision aid)
npm run lint
npm run format
```

## Architecture

Vanilla ES modules; **D3 (`d3-shape`) for geometry only**, bundled via esbuild. No graph library, no
force simulation, no UI framework, no runtime external dependencies. Strict module boundaries:

```
js/
  data/ecosystem.js   NODES + EDGES (clean publication dataset)
  data/sources.js     source registry (nodes/edges cite ids, never raw URLs)
  config.js           controlled vocabularies + visual taxonomy (single source of truth)
  layout.js           GEOMETRY ONLY → rich IR {nodePositions, ringBounds, sectorArcs, edgePaths}
  render.js           SVG RENDERING ONLY (declarative from the IR)
  interaction.js      node focus / hover / keyboard state
  filters.js          visibility · search · evidence controls
  inspector.js        selected-node info + generated citations
  catalogue.js        semantic-HTML catalogue (also the a11y representation)
  router.js           URL/History deep links
  story.js            guided story mode (thin layer over the shared store)
  state.js            the shared observable store
  theme.js            light/dark toggle
scripts/
  validate-data.mjs   the data contract (run in CI)
  layout-stress.mjs   layout stress test
  build.mjs           esbuild → dist/
research/             evidence ledger (sources.md, decisions.md, entities.csv, relationships.csv)
```

## Data & method

Research snapshot **15 August 2026** — a dated snapshot of a fast-moving ecosystem, not a permanent
registry. Primary/official sources include the **Singapore Space Industry Directory 2025/2026**
(AAIS with OSTIn/CAAS/ESG/MPA), MTI's NSAS establishment release, `space.gov.sg`, and university
sources; full provenance is in [`research/sources.md`](research/sources.md). The cardinal rule: **an
edge exists only when its relation, pathway and confidence can be justified independently from a
source that substantiates that specific relationship.** When the evidence and the desired picture
disagree, change the picture.

## Extensions (not in v1)

Atlas snapshot counts; an "evidence lens"; dated snapshot comparison (the data model already carries
`since`/`status` and dated sources); a compare-two-entities mode. See the project plan for the full
backlog.

## Licence

MIT.
