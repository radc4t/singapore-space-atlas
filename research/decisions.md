# Research ledger — editorial decisions

Snapshot 2026-08-17. Records the judgement calls behind the corpus, so curation is auditable.

## v1.1.0 Edition roll-up (research snapshot 2026-08-17)

The **2026 Edition** advances from the v1.0.0 freeze (`2026-08-15`) to research snapshot **`2026-08-17`** —
a data refresh **within dataset schema `1.0`** (a SemVer _minor_). Corpus at this snapshot:
**89 nodes · 26 edges (25 documented + 1 inferred) · 22 sources**; the Directory shows **62 companies of
~70** identified in public materials. Every relationship stays independently sourced (the cardinal rule);
no count was padded.

Dispositions of the Phase-1 data issues (#9–#13), **as actually landed** (not as planned):

- **#9 — Company-coverage expansion.** Companies shown grew **22 → 62 of ~70** (two batches). Three were
  promoted to _featured_; the rest are _catalogued_ (Directory-only, zero plate change).
- **#10 — Relationship sourcing & disambiguation.** Promoted `ntu→stdp` to **documented**
  (`participates`); **kept `nus→stdp` inferred** (rationale + evidence retained, not forced to documented);
  re-based the UNOOSA link as documented `ostin→unoosa` (`partners`); added `satoro→ntu` and
  `lighthaus→ntu` (both documented `supplier`).
- **#11 — Omitted-entity sourcing.** Added **DSTA** (featured) with `dsta→st-satsys` (documented
  `partners`), **MSS** (featured), and the **`nuspace→nus`** spin-off (documented `spun-from`). All three
  cleared the evidence bar.
- **#12 — Node URL re-verification.** Added `npm run check:links`; corrected **4 URLs** (Maxar→Vantor
  rebrand; dead SpaceChain / NEC / Unseenlabs domains); **noted** Intelsat→SES (kept); made `beyond-earth`
  inert; `satoro` stays inert. `url` is an ancillary presentation field — no node/edge/count change.
- **#13 — Layout-stress & corpus-size review.** Verdict: **geometry holds at 89/26** (40 featured, 36
  on-ring); no refinement, no demotion. Folded in the `beyond-earth` flag — **kept catalogued + inert +
  documented** (the Directory substantiates its existence; its web presence resolves to a VC; revisit in a
  future edition), **not reclassified**.

**Recorded (not hidden) non-additions & held positions:** `beyond-earth` and `satoro` stay inert;
`nus→stdp` stays deliberately inferred. Full history in the sections below.

### v1.1.0 release notes (draft — tag deferred until #15)

The `v1.1.0` tag / GitHub release is **not cut in this issue.** It is gated on **#15 — a full sanity &
regression check** of the finished corpus/product; the tag is cut only after #15 closes. Draft notes for
that release:

> **Singapore Space Atlas v1.1.0 — 2026 Edition (research snapshot 2026-08-17).** A data refresh within
> schema 1.0. The corpus grew from 47 nodes / 22 edges to **89 nodes / 26 edges (25 documented + 1
> inferred)** over 22 sources; the Directory now catalogues **62 of ~70** identified companies.
> Highlights: wider company coverage (#9); sourced & disambiguated relationships (#10); newly sourced
> entities — DSTA, MSS, and the NuSpace→NUS spin-off (#11); a URL-liveness checker with re-verified links
> (#12); and a layout-stress review confirming the plate reads cleanly at the larger size (#13). No schema
> change (`SCHEMA_VERSION` stays `1.0`); no deliberate non-goals built.

## v1.1.0 release gate — full sanity & regression (#15, GitHub #29)

The pre-release gate for Phase 1: prove the finished Edition satisfies every roadmap criterion, automate
the checks that should stay true for future Editions, and record the editorial judgments that automation
cannot honestly make. Run via **`npm run release-check`** (the durable repeatable gate). Final corpus at
this gate: **89 nodes (40 featured / 49 catalogued) · 26 edges (25 documented + 1 inferred) · 22 sources ·
schema 1.0**. (GitHub auto-numbered this issue **#29**; "#15" is its roadmap-sequence label — GitHub #15 is
an unrelated Phase-2 issue.)

**Automated battery — 8/8 PASS** (`validate · test · lint · format:check · build · stress ·
check:links --strict · test:e2e`). New permanent guards added (join `npm test` → CI):
`test/release.test.mjs` (strict CSP · zero runtime deps · product-facing snapshot/Edition sync) and
`test/research-consistency.test.mjs` (entities.csv↔NODES & relationships.csv↔EDGES field-level parity ·
source-id provenance in sources.md · inert/omitted disposition↔data checks); `test/e2e.spec.mjs` extended
with rendered release-surface, grammar-carrier, and no-console-error tests. **Every new guard was
guard-bitten** (perturb the target → confirm FAIL → revert), so each provably protects its invariant.

Roadmap coverage — every Phase-1 "Done when" criterion, guiding invariant, and the release-quality bar,
with its check and disposition (automated unless marked _manual_):

| Roadmap item                                             | Check                                                       | Result   |
| -------------------------------------------------------- | ----------------------------------------------------------- | -------- |
| Data contract green (`validate`)                         | `scripts/validate-data.mjs` (`npm test` + battery)          | **PASS** |
| Release-quality bar — every node/edge ≥1 source          | `validate` `resolveSources`; inferred needs rationale/note  | **PASS** |
| Evidence ledger records every disposition                | `research-consistency` disposition↔data + _manual_ review   | **PASS** |
| Directory denominator reflects the new counts            | `e2e` release-surfaces (62 of ~70 · 25 documented + 1 inf.) | **PASS** |
| Edition label / snapshot bumped & rendered               | `release.test` sync + `e2e` surfaces (17 Aug/AUG 2026)      | **PASS** |
| Unit tests · lint · format · build green                 | battery                                                     | **PASS** |
| Zero runtime dependencies                                | `release.test` (empty `dependencies`)                       | **PASS** |
| Strict CSP (`connect-src 'none'`, no network)            | `release.test` CSP directives                               | **PASS** |
| Six-channel grammar intact (meaning not by colour alone) | `e2e` non-colour carriers (regression) + _manual_ semantics | **PASS** |
| Ledger mirrors (entities/relationships CSV ↔ data)       | `research-consistency` field-level parity                   | **PASS** |
| Layout reads cleanly at the larger corpus                | `stress` + visual regression + _manual_ plate review        | **PASS** |
| URL liveness                                             | `check:links --strict` (0 dead)                             | **PASS** |

**Human-review items (recorded, never auto-claimed PASS):**

- **Source-substantiation** — spot-checked that cited sources support their specific claims (the cardinal
  rule); the automated layer proves _presence_ of ≥1 source, not that it substantiates. **Reviewed: OK.**
- **Six-channel grammar semantics** — the plate at 1280×720 keeps shape (legend: organisation ● /
  programme ▢ / international ◌), line-style, label, and position channels; meaning does not rest on colour
  alone. **Reviewed: OK** (automation detects carrier _presence_ only, not semantic clarity).
- **`check:links` dispositions** — `79 ok · 1 redirect · 0 blocked · 0 dead`. The one redirect is
  `intelsat-sg` → `ses.com` (SES acquired Intelsat; documented under "Entity website links" below). No
  wrong-entity or dead links. **Reviewed: OK.**
- **Final visual/editorial review** — plate + release surfaces (masthead `2026 Edition`, footer
  `17 AUG 2026`, readouts `17 August 2026`, Directory `62 of ~70`) render correctly. **Reviewed: OK.**

**Verdict: release-ready.** The `v1.1.0` tag / GitHub release is cut **after** this PR merges and the
maintainer explicitly approves publication (irreversible, outward-facing) — the gate passing is not itself
the release. Wiring these checks into CI (e2e/stress/check-links) and the stress CI guard remain **Phase 3**.

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

## Inferred edges — original snapshot rationale (2026-08-15)

- `ntu → stdp`, `nus → stdp` (`participates`, programme-mediated): STDP eligibility explicitly
  includes local IHLs and both are core space IHLs, so participation is highly likely — but a
  _specific award_ to each was not individually sourced in this snapshot. Eligibility ≠ a confirmed
  award, so these are inferred and hidden by default.
- `nsas → unoosa` (`participates`, contextual): Singapore participates in COPUOS, but which office
  represents the state (NSAS/OSTIn vs MFA) is not disambiguated in captured sources.

## Relationship sourcing & disambiguation — dispositions (2026-08-17, issue #10)

Each of the three non-documented edges was researched to a primary source; per-edge outcomes differ.

- **`ntu → stdp` — PROMOTED to documented.** NTU's Satellite Research Centre (SaRC) leads **three
  projects under the Space Access Programme** (an STDP funding archetype run by OSTIn), launches
  targeted 2026–2028 (`ntu-sap-2026`, first-party NTU). The `rationale` is dropped; pathway set to
  `direct` (NTU is a direct participant). This is a specific award, not mere eligibility.
- **`nus → stdp` — LEFT inferred (per-edge, deliberately).** No _primary_ NUS STDP award was found.
  Secondary reporting describes the NUS-DSO STAR flagship as "STDP-supported"; that is noted in the
  edge's `rationale` but does not clear the primary-source bar, so the edge stays inferred/hidden.
  (NTU and NUS legitimately diverge — the whole point of treating them per-edge.)
- **`nsas → unoosa` — DISAMBIGUATED and re-attached as documented `ostin → unoosa`.** The unresolved
  question was _which office_ engages UNOOSA. A specific, documented relationship exists: **OSTIn and
  UNOOSA agreed the "Space Law for New Space Actors" collaboration (29 Apr 2025)** with a Technical
  Advisory Mission in Singapore (`ostin-unoosa-2025`, first-party OSTIn). The edge is re-cast as that
  documented `partners` relationship (attached to `ostin`, matching the `ostin → cnes`/`esa` pattern;
  `nsas → ostin` conveys inheritance). **Explicit modelling decision:** this edge now represents the
  documented space-law collaboration, **not** a claim that OSTIn/NSAS is Singapore's COPUOS state
  representative (national COPUOS statements are delivered by the diplomatic mission / MFA, which is
  not modelled). It is re-attached, not silently removed, because a specific source substantiates it.

### New-company relationships (bounded search, issue #10)

The SAP consortium (`ntu-sap-2026`) yielded two documented **supplier** edges: `satoro → ntu` (Satoro
builds the SaRC CubeSat) and `lighthaus → ntu` (LightHaus supplies the optical payload). Aliena also
provides propulsion for a SAP satellite, but `aliena → ntu` is **already** modelled (`spun-from`); a
second overlapping edge was **not** drawn (would double a curve between the same pair) — recorded here
instead. Deliberate omissions (relationship real but not drawable): **Atomionics** — CQT-_staff_-
founded (a founder was a CQT Research Fellow), **not a formal spin-off** (CQT lists it under "startups
founded by staff/alumni"); its investors (Wavemaker, SGInnovate, Cap Vista) are not modelled — so no
edge, same bar that keeps NuSpace edgeless. **Bifrost** — SUTD-alumni-founded (not a formal spin-off);
its NTT Data partner and Cap Vista backer are not modelled nodes. **Galamad**, and the satcom/MNC
additions — their documented counterparts (foreign customers, VCs) are outside the corpus. Per the
bounded stop rule, these stay edgeless and are recorded, not chased across the open web.

## Deliberate omissions (honest coverage, not oversight)

- **DSTA, NEA/Meteorological Service** — _omitted in the 2026-08-15 snapshot_ (no space-specific
  activity from a citable source); **both sourced and added 2026-08-17 (issue #11)** — see the §"Omitted
  entities revisited" dispositions below.
- **Aliena/ZES/SpeQtral spin-off lineages** — all three were upgraded from "inferred" to
  "documented" once primary NTU/EDB sources were found (`ntu-aliena-2022`, `ntu-zes-2020`,
  `edb-speqtral-2024`).
- **NuSpace lineage** — _omitted in the 2026-08-15 snapshot_ (no primary spin-off source captured);
  **sourced and added 2026-08-17 (issue #11)** as `nuspace → nus spun-from` — see below.
- **Company↔NSAS support edges** — the national office's industry-development mandate is general;
  no per-company support relationship is drawn without a specific source. Companies connect via
  documented spin-off / supply / research edges only; otherwise they sit in their cluster ring.
  Their membership in the ecosystem is conveyed by _position_, not by a fabricated edge.

## Omitted entities revisited — dispositions (2026-08-17, issue #11)

The three 2026-08-15 omissions were re-researched. All three cleared the bar and were **added** (per-item;
"still omitted" was an accepted outcome, but each found a qualifying space-specific source).

- **DSTA — ADDED** as a `government` node (featured). Space-specific evidence: DSTA (a MINDEF statutory
  board) and ST Engineering **jointly commissioned the DS-SAR radar-imaging satellite** from IAI (ordered
  2018, launched 30 Jul 2023), supporting Singapore government satellite-imagery needs (`dssar-2023`,
  Gunter's Space Page — authoritative secondary; no first-party page states it as plainly). Modelled as
  `government` (procurement/systems agency), **not** `academia` — that role belongs to the defence _R&D
  lab_ DSO, which is already modelled. A documented `dsta → st-satsys` (`partners`) edge records the DS-SAR
  co-development (same source substantiates the specific relationship).
- **NEA / Meteorological Service — ADDED** as `mss` (Meteorological Service Singapore, a division under NEA),
  `government` node (featured). Space-specific evidence: MSS **receives and processes Himawari (JMA)
  meteorological-satellite data** (`mss-satellite`, first-party weather.gov.sg). Modelled as a government
  space **data-user**, like CAAS/MPA — the acceptance test (satellite/space-derived capability, not generic
  weather forecasting) is met by the satellite-reception/processing role.
- **NuSpace — ADDED** `nuspace → nus` (`spun-from`, documented). Formal spin-off evidence: NuSpace is a
  **2018 NUS spin-off**, founded by NUS Faculty of Engineering researchers, **incubated under NUS GRIP**
  (the NUS venture-creation programme), with the Galassia nanosatellite lineage (`nuspace-nus-2018`,
  first-party). This clears the **formal-spin-off** bar (materially stronger than the alumni/staff-founded
  cases that kept Atomionics/Bifrost edgeless).

## Coverage

- **2026-08-17 expansion (issue #9).** Company coverage grown from 22 to **62 of ~70** shown, over two
  batches (25 + 15 additions): **27 domestic** (`type: company`) + **35 international** MNCs with a
  Singapore presence (`type: international` + cluster). Featured = the strategically significant /
  best-documented anchors (16 total; only 3 of the 40 additions were featured); catalogued = included in
  the dataset but not necessarily drawn on the default map. This is a data refresh within schema 1.0; the
  in-product Edition/`DATA_SNAPSHOT` label is advanced separately at release (Phase 1 track #14), so new
  sources carry their real `accessed` date (`2026-08-17`) while the snapshot label still reads
  `2026-08-15` until the release cut. The second batch (all catalogued, so no map-geometry change) added
  the remaining clearly-space firms — VSAT/RF and satcom hardware (Amplus, Meds Technologies, Nera),
  space-data/analytics and infrastructure (Liberatech, SpaceChain), and space-focused MNCs (Speedcast,
  L3Harris, Cobham SATCOM, KVH, Comtech, Mitsubishi Electric, Mitsubishi Heavy Industries, SKY Perfect
  JSAT, ABS, Applied Satellite Technology). The remaining gap to ~70 is general-industry component/
  materials/electronics suppliers listed under space segments (Jabil, Flex, AMD, Nvidia, Microchip, …),
  deliberately **not** added — the atlas counts space companies, not every supplier with a space line.

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
- **Considered but excluded on verification (mis-segmented in the directory):** `Skycom Satellite
Systems` — "satellite" in the CATV/MATV/IPTV building-TV sense (hotel/condo TV distribution), not a
  space company; `Wizlogix` — a general PCB design/fabrication house (some satellite PCB work for
  DSO/NTU/ST, but an electronics-services enabler, not a space firm). Both live-checked and left out.
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

**Re-run 2026-08-17 (issue #13 — corpus-size review at 89 nodes / 26 edges)** (`npm run stress`; ring
counts now **1/13/6/62/3**):

| strategy                     | edge-crossings | label-collisions |
| ---------------------------- | -------------- | ---------------- |
| A concentric (angle = index) | 51             | 62               |
| B radial-sector (packed)     | 40–68 (jitter) | 115–119 (jitter) |
| C hybrid (barycentre)        | 13–24 (jitter) | 62               |

**Reproducibility.** Only **A** is deterministic in the stress script; **B and C seed the inner rings
(1/2/4) from `Math.random()`** (`layout-stress.mjs` `anglesRadial`), so their crossing counts vary
run-to-run (collisions stay put because the even-spread rings have uniform spacing regardless of order).
This randomness is a property of the **decision-aid prototype only** — the **production layout
(`js/layout.js`) is fully deterministic** (no RNG; stable sorts with alphabetical tie-breaks). For trend
comparison across editions, treat **A's figures (and C's stable collision count) as the reproducible
baseline**, recorded from the same script version; interpret changes **in the context of corpus size and
featured population**, never as a fixed pass/fail threshold.

**Why label-collisions jumped 0 → 62 vs. the `1/11/6/47/3` re-run.** Pure **all-node artifact**: ring 3
(the collision proxy counts _all_ companies) grew 47 → 62, so even index-spacing at that radius now falls
below the 26 px proxy distance (47 cleared it; 62 do not). It is catalogue growth, **not** a plate change —
the plate draws only the **16 featured** ring-3 companies, evenly spread. The stress numbers are therefore
a conservative all-node upper bound, exactly as noted before; the real check is the featured plate.

**The real check — production featured plate (DOM overlap at 1280×720, the Playwright baseline viewport).**
The plate draws **40 featured** nodes: **36 on rings 1/12/4/16/3** (ring 0 NSAS · ring 1 government +
programmes · ring 2 academia · ring 3 companies · ring 4 international) plus **4 ambient `kind:sector`
arcs** (`sec-aerospace`, `sec-microelectronics`, `sec-ai`, `sec-quantum`; background context, not ring
nodes), with **25 featured↔featured plate edges**. A DOM bounding-box check (`getBoundingClientRect` over
every `svg text` label + node marker, classified by intent — intentional self-proximity excluded)
inspected **42 labels + 36 markers** and found:

- **label↔label overlaps: 0** · **marker↔marker overlaps: 0** · **label-obscures-neighbour marker: 0.**
- **edge-curve-over-label: 8 geometric intersections, 0 material.** Every one is a faint relationship
  curve passing _behind_ a label; the plate paints labels **after** edges (verified: all `path.edge` in
  DOM order precede all labels, and `elementFromPoint` at the central NSAS label returns the NSAS text as
  topmost), so the text stays fully crisp and no label is obscured. This is the inherent character of a
  radial node-link plate and the layer order is unchanged from v1.0.0.

**Decision: geometry holds at 89/26 (40 featured, 36 on-ring); no refinement, no demotion.** Ring 1 grew
to 12 featured (9 government/agency + 3 programmes) after DSTA/MSS, and ring 3 to 16 featured companies,
yet the even-spread hybrid keeps the plate collision-free and legible at the supported viewport. The
production layout is **unchanged** — this issue is a research-ledger review only (no `js/data`, no
plate, no baseline change).

**`beyond-earth` classification (folded in from #12) — keep + document.** The node "Beyond Earth
Technologies" (`type:company`, `cluster:satellite-mfg`, catalogued + already inert) is enumerated by the
OSTIn/AAIS Directory (`dir-2025`), so its catalogued **existence is validly sourced** (a company's mere
existence/segment may rest on `dir-2025`). A 2026-08-17 web check found its public presence resolves to
**Beyond Earth _Ventures_ (a VC)** with no standalone satellite-company site surfacing — hence the URL was
already made inert in #12. Disposition: **stays catalogued + inert; not reclassified** (the schema has no
investor type, and a documented flag is more honest than forcing a category); **classification to be
revisited in a future edition** should firmer first-party evidence appear. Zero plate/count/edge impact.

## Entity website links (`node.url`) — Directory

Added 2026-08-16. Each linkable node carries a `url` = its **official first-party homepage** (canonical,
post-redirect, no tracking params), shown as an external link in the Directory. Rule: the URL is the
entity's own site, or the official parent's page **explicitly representing** it. Singapore branches of
global firms link to the **global official** site. After #9/#11 grew the corpus and the 2026-08-17
re-verification (below), the split is **82 linked / 7 intentionally inert of 89**.

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
- `satoro` — _re-checked 2026-08-17: `satoro.space` fails with an SSL certificate mismatch (not a clean
  first-party site); still no trustworthy official homepage, so left inert (per the conservative bar)._
- `beyond-earth` — _made inert 2026-08-17: its `beyondearth.tech` redirects to **Beyond Earth Ventures**
  (a VC), not a first-party site for a small-satellite company; the node's classification should be
  revisited in a future edition (it may be a VC rather than a company)._

The node `url` is an ancillary presentation field — it does not change any node/edge/analytical value, so
the dataset snapshot and edition are unchanged. A malformed or non-http node `url` fails `npm run validate`;
the rendered link's anchor attributes (`href`/`target`/`rel`) and the inert exceptions are asserted in
`test/e2e.spec.mjs` (the catalogue test).

### Re-verification 2026-08-17 (issue #12)

Re-verified all node URLs with the new `npm run check:links` tool (`scripts/check-links.mjs` — a
zero-dependency liveness checker: browser-identifying UA, HEAD→GET, follows redirects, classifies
`ok`/`redirect`/`blocked`/`dead` with the raw status; a manual/edition tool, kept out of CI like the e2e
suite). Of 80 distinct URLs: **79 ok**, and the corrections below. `redirect`/`blocked` were browser-reviewed,
not auto-failed.

**Corrections (`old → new`, reason):**

- `spacechain`: `spacechain.com` → `spacechaininc.com` — _dead (old domain no longer resolves); current
  official site._
- `nec-space-sg`: `www.sg.nec.com` → `www.necspace.co.jp/en/` — _dead (SG subdomain no longer resolves);
  the global-official NEC Space Technologies site (SG-branch → global rule; the site 403s bots but is live)._
- `maxar-sg`: `www.maxar.com` → `vantor.com` — _rebrand: Maxar Intelligence became **Vantor** (Oct 2025).
  Node name kept as "Maxar" for recognisability; a rename is a content decision for a future edition._
- `unseenlabs-sg`: `unseenlabs.space` → `unseenlabs.com` — _moved to the new official domain._

**Kept after review (live, not changed):**

- `intelsat-sg`: `intelsat.com` kept — it resolves but redirects to `ses.com` because **SES acquired
  Intelsat** (closed 17 Jul 2025). Kept Intelsat's own canonical domain (not repointed to `ses.com`, which
  would duplicate `ses-sg` and conflate the entities); the merger is noted here. A future edition may merge
  `intelsat-sg` into `ses-sg`.
- Firewall-blocked-but-live (403/blocked to bots, live in a browser): none remained after the GET retry;
  `necspace.co.jp` is the one WAF-heavy host, resolved via GET.

Shared destinations (`stengg.com`, the STDP page) remain intentional, not duplicates.

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
