# Research ledger — editorial decisions

Snapshot 2026-08-15. Records the judgement calls behind the corpus, so curation is auditable.

## Provisional planning claims — verified in Phase B

- **NSAS launch 1 Apr 2026, under MTI, absorbing OSTIn** — CONFIRMED (`nsas-establishment`).
- **OSTIn = "Office for Space Technology & Industry", EDB's national space office since 2013** —
  CONFIRMED (`dir-2025`, `edb-nextbound`). (Corrected from the planning doc's looser wording.)
- **~70 companies / ~2,000 professionals** — CONFIRMED, and it is OSTIn's own figure in the
  2025/26 Directory (`dir-2025`). This is the cited `CATALOGUE_UNIVERSE_ESTIMATE`.
- **STDP** — CONFIRMED as "Space Technology Development Programme": S$150M initial + S$60M top-up,
  three archetypes (Technology Development, Validation & Experimentation, **Space Access
  Programme**). "SAP" is an STDP archetype, not a separate top-level programme (modelled with an
  `sap → stdp` `programme` edge). "EOI" from the planning doc was NOT confirmed as a distinct named
  programme and was dropped.
- **GSTC** — organised by Singapore Space & Technology Ltd, not by NSAS (`gstc-2024`).

## Ontology / modelling calls

- **OSTIn kept as a node with `status: renamed`.** For a 2026-08-15 snapshot NSAS is active and
  OSTIn is recently superseded. Documented history (CNES/ESA MoUs, inter-agency co-authorship) is
  attached to OSTIn _as it actually occurred_, with `nsas → ostin` (`spun-from`) conveying
  inheritance — rather than back-dating those relationships onto NSAS.
- **STDP-era attribution.** `nsas oversees stdp` is sourced to space.gov.sg (the NSAS-era
  statement); `ostin coordinates {caas,mpa,esg}` is sourced to the OSTIn-era co-published Directory.
  Each edge is attached to the entity whose evidence actually supports it.
- **Sectors (aerospace, microelectronics, AI, quantum) are `kind: sector` with NO edges.** They are
  ambient context, not network actors — the validator enforces their edge-absence.
- **`partners` is used only twice** (CNES, ESA), each backed by an explicit MoU / letter of intent.
  All softer government links use `coordinates`; agency oversight uses `oversees`.

## Inferred edges (3) — why each is inferred, not documented

- `ntu → stdp`, `nus → stdp` (`participates`, programme-mediated): STDP eligibility explicitly
  includes local IHLs and both are core space IHLs, so participation is highly likely — but a
  _specific award_ to each was not individually sourced in this snapshot. Eligibility ≠ a confirmed
  award, so these are inferred and hidden by default.
- `nsas → unoosa` (`participates`, contextual): Singapore participates in COPUOS, but which office
  represents the state (NSAS/OSTIn vs MFA) is not disambiguated in captured sources.

## Deliberate omissions (honest coverage, not oversight)

- **DSTA, NEA/Meteorological Service** — named in the brief but no _space-specific_ activity was
  captured from a citable source in this snapshot, so they are omitted rather than asserted. DSO
  National Laboratories IS included (documented via X-SAT / the NUS STAR centre).
- **Aliena/ZES/SpeQtral spin-off lineages** — all three were upgraded from "inferred" to
  "documented" once primary NTU/EDB sources were found (`ntu-aliena-2022`, `ntu-zes-2020`,
  `edb-speqtral-2024`).
- **NuSpace lineage** — commonly described as NUS-adjacent, but no primary spin-off source was
  captured, so NO spin-off edge was drawn (an example of "no evidence found" ≠ "no relationship").
- **Company↔NSAS support edges** — the national office's industry-development mandate is general;
  no per-company support relationship is drawn without a specific source. Companies connect via
  documented spin-off / supply / research edges only; otherwise they sit in their cluster ring.
  Their membership in the ecosystem is conveyed by _position_, not by a fabricated edge.

## Coverage

- **2026-08-17 expansion (issue #9).** Company coverage grown from 22 to **47 of ~70** shown: **22
  domestic** (`type: company`) + **25 international** MNCs with a Singapore presence
  (`type: international` + cluster). Featured = the strategically significant / best-documented anchors;
  catalogued = included in the dataset but not necessarily drawn on the default map. This is a data
  refresh within schema 1.0; the in-product Edition/`DATA_SNAPSHOT` label is advanced separately at
  release (Phase 1 track #14), so new sources carry their real `accessed` date (`2026-08-17`) while the
  snapshot label still reads `2026-08-15` until the release cut.

### Method — how the batch was sourced

- **Enumerator:** the OSTIn/AAIS 2025/26 Industry Directory (`dir-2025`) — its Alphabetical Listing
  (pp.19–46) and Space Related Industries segment listings (pp.49–74) list each company with its
  official website and space segment. `dir-2025` is sufficient citation for a **catalogued** node; it
  does **not** by itself justify **featured** prominence.
- **Segment → cluster mapping** used for the directory's eight segments:
  Launch Service Providers → `launch`; Satellite Manufacturers / Space Exploration → `satellite-mfg`
  (unless clearly propulsion/quantum/optical); Satellite Operations → `comms-ground` (operators) or
  `geospatial` (EO operators); Space-Based Services / Space Infrastructure → `geospatial`, `comms-ground`
  or `downstream` by activity; Supporting Services and Space R&D → **excluded** where they are
  legal/finance/VC/insurance firms, polytechnics or universities (modelled elsewhere in the atlas, or
  not space-technology companies).
- **Tiering rule:** catalogued by default; promote to featured only where significance is reproducible
  from a first-party primary beyond the directory (or a clear cluster-anchor role). Only **3** of 25
  additions were featured — all domestic, each SG-anchored with an SG-institution primary:
  `atomionics` (quantum; `cqt-atomionics-2021`), `bifrost` (geospatial; `nttdata-bifrost-2025`),
  `galamad` (satellite-mfg; `ntu-galamad-2023`). The other 22 stayed catalogued — evidence the tiering
  rule holds (go wide in the catalogue, stay selective on the plate).
- **Considered but deferred (not added):** `THISS Technologies` — listed under Satellite Manufacturers
  but its space-specific role could not be verified beyond the directory listing; deferred rather than
  assert an unverified role. Numerous directory entries were excluded as out-of-scope: law firms
  (Allen & Gledhill, Rajah & Tann, WongPartnership, Bird & Bird, Clifford Chance, Drew & Napier, …),
  VC/finance (Cap Vista, Seeds Capital, Elev8.VC, Incubate Fund, Pavilion, Wavemaker, EY, Marsh, Sompo),
  and universities/polytechnics (NTU, NUS, SMU, SUTD, the polytechnics, Embry-Riddle) — the atlas models
  academia and government as their own node types, and professional-services firms are not space-tech
  companies. No entity was added solely to raise the count.

## Phase C.5 — layout stress test (evidence over prediction)

Ran the real corpus through three geometries (`npm run stress`; ring counts 1/11/6/22/3):

| strategy                                        | edge-crossings | label-collisions |
| ----------------------------------------------- | -------------- | ---------------- |
| A concentric (angle = index)                    | 29             | 0                |
| B radial-sector (angle = cluster wedge, packed) | **17**         | 13               |
| C hybrid (barycentre reorder)                   | 35             | 0                |

**Finding (surprised the prediction):** with only 22 edges over 47 nodes the graph is sparse, so
crossings are modest in every layout — **label collisions are the real risk.** Packing companies
into tight cluster wedges (B) minimises crossings but collides labels in crowded clusters
(satellite-mfg). A naive one-sweep barycentre reorder (C) destroys the cluster semantics and adds
crossings. **Decision:** production layout is a _refined hybrid_ — ring = structural layer, angle =
cluster wedge for companies **but spread evenly within the ring** (crowded clusters get wider arcs,
so no collisions), and inner-ring nodes (agencies, academia, programmes, international) ordered to
sit angularly near the nodes/clusters they connect to (reduces crossings without sacrificing the
"where in the ecosystem / what capability" readability). The chosen geometry is deterministic.

**Re-run after the 2026-08-17 expansion** (`npm run stress`; ring counts now **1/11/6/47/3**):
concentric = 30 crossings / 0 collisions, packed = 28 / 58, hybrid = 33 / 0. The even-spread hybrid
still resolves to **0 label-collisions**; only the packed variant collides, as before. Note the stress
script counts _all_ nodes (ring 4 = 47), whereas the plate draws **featured-only**: featured companies
grew 13 → 16 (+3: `atomionics`, `bifrost`, `galamad`), so on-plate crowding is modest and the behavioural
review (below) confirms the ring stays legible. The bulk of the batch is catalogued (Directory-only) and
does not touch the plate.

## Entity website links (`node.url`) — Directory

Added 2026-08-16. Each linkable node carries a `url` = its **official first-party homepage** (canonical,
post-redirect, no tracking params), shown as an external link in the Directory. Rule: the URL is the
entity's own site, or the official parent's page **explicitly representing** it. Singapore branches of
global firms link to the **global official** site. **41 / 47 linked; 6 intentionally inert.**

Intentional **shared** destinations (not accidental duplicates):

- `st-satsys` + `st-geoinsights` → `stengg.com` — both are ST Engineering business units.
- `sap` → `space.gov.sg/resources/stdp/` — the Space Access Programme is an **STDP archetype** with no
  standalone site; the STDP page is its canonical description (same URL as `stdp`).
- `stdp` uses the entity-specific STDP page (not the NSAS homepage), because the entity is STDP.

Programme / community pages (parent page explicitly representing the entity): `gstc` →
`space.org.sg/gstce/` (the official GSTCE site, run by Singapore Space & Technology Ltd — `gstc-2024`);
`ssc` → `aais.org.sg/category/space-community/` (AAIS's Singapore Space Community).

**Inert (no `url`) and why:**

- `sec-aerospace`, `sec-microelectronics`, `sec-ai`, `sec-quantum` — _supporting-sector groupings, not
  organisations; no official website exists._
- `ostin` — _defunct: its mandate & functions were subsumed by NSAS on 1 Apr 2026 (`nsas-establishment`);
  its site is now NSAS's `space.gov.sg`, so a separate link would duplicate/mislead._
- `satoro` — _no identifiable official website found (only LinkedIn / business-directory listings); left
  inert rather than link a non-first-party page._

Verified each linked URL resolves (2xx, http(s)) and is the correct entity on 2026-08-16. A malformed or
non-http node `url` now fails `npm run validate` (`test/data.test.mjs` covers the rule). `url` is an
ancillary presentation field — it does not change any node/edge/analytical value, so the dataset snapshot
and edition are unchanged.

## Discovery model — deliberately editorial, not a zoomable tool

Added 2026-08-16 (prompted by the taste-check external-quality note that "zoom & filter" is thin). The
atlas **deliberately favours** overview (the resting plate) → details-on-demand (the inspector) →
search + the Directory index, and **intentionally omits** in-map zoom/pan and faceted filtering. This
is an editorial constraint, not an implementation gap: the plate is a published instrument to be
_read_, not a canvas to be flown around (per "motion is drafting, not gaming" and the restraint of the
Singaporean signature). Known-item lookup is already served by the search command surface and the
Directory (the accessible, groupable index). Legend type-toggles remain the one on-plate filter because
they teach the colour = type channel; anything more would trade legibility of the whole for local
exploration the Directory already handles better.
