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

- 22 company nodes shown (of ~70 identified in public materials): 15 domestic + 7 international MNCs
  with a Singapore presence. Featured = the strategically significant / best-documented anchors;
  catalogued = included in the dataset but not necessarily drawn on the default map.

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
