# Handoff & execution guide — v1.1.0 "Next Edition"

> A self-contained brief for resuming the v1.1.0 data-expansion work in a **fresh session** (human or
> AI) with no prior chat context. Pairs with [`../ROADMAP.md`](../ROADMAP.md) (the canonical roadmap) and
> [`../design.md`](../design.md) (the design constitution). If anything here disagrees with `ROADMAP.md`,
> that file wins.

## 0. How to resume (cold start)

```bash
cd ~/singapore-space-atlas && claude
```

Then say, e.g.: **"Continue the Singapore Space Atlas roadmap — start milestone #2 (v1.2.0 product depth)."**
(Phase 1 / `v1.1.0` is shipped; §6 is its historical execution record.)
The session should: read this file + `ROADMAP.md`, run `gh issue list --milestone "v1.1.0 — Next Edition (data expansion)"`,
then follow §4 (workflow) under the §5 rules. Per-issue plans are written to `~/.claude/plans/` (ephemeral;
in this project a human reviews each plan closely before approval — expect 2–4 revision rounds).

## 1. What this project is (30-second version)

An **evidence-backed, zero-runtime-dependency systems map** of Singapore's space ecosystem — NSAS at the
centre; government · academia · industry · international arranged in concentric rings. A hand-authored SVG
"instrument" (no D3 / graph library / framework). Live at
<https://radc4t.github.io/singapore-space-atlas/> (GitHub Pages via Actions; repo `radc4t/singapore-space-atlas`).
Core value: **honesty** — every relationship is independently sourced; absence of an edge is never a claim
that no relationship exists. Full identity/grammar in `design.md`.

## 2. Current state (2026-08-17)

- **Software:** `v1.0.0` shipped (2026-08-15). **`v1.1.0` shipped (2026-08-17)** — 2026 Edition
  (research snapshot 2026-08-17); all six data tracks (#9–#14) plus the release gate (#29) merged, and the
  `v1.1.0` tag + GitHub release are cut. Milestone #1 is complete; the next committed work is milestone #2.
- **Corpus:** **89 nodes · 26 edges (25 documented + 1 inferred) · 22 sources.** Schema `1.0`.
  `DATA_SNAPSHOT` = `'2026-08-17'` (bumped in #14) and the in-product Edition label reads research
  snapshot 17 Aug 2026. The Directory reads **"62 companies shown of ~70."**
- **Git:** work lands via short-lived `data/<topic>` (or `docs/<topic>`) branches → PR → **the human
  merges** (each merge auto-deploys Pages). `main` is CI-gated; never push to it directly.

## 3. The roadmap & milestone status

Canonical: [`ROADMAP.md`](../ROADMAP.md), mirrored to **GitHub milestones + issues**
(`gh api repos/radc4t/singapore-space-atlas/milestones`, `gh issue list`). Three milestones:

| #   | Milestone                        | Status                                                                 |
| --- | -------------------------------- | ---------------------------------------------------------------------- |
| 1   | **v1.1.0 — Next Edition (data)** | ✅ **shipped** — 7/7 issues closed; `v1.1.0` tag + release cut         |
| 2   | v1.2.0 — Product depth           | open (mobile depth; deep-linkable guided tour)                         |
| 3   | Engineering hardening            | open (wire e2e/axe/visual into CI; layout-stress CI guard; a11y depth) |

**Milestone #1 issues:**

| Issue | Title                                   | State     | Result                                                                                                                      |
| ----- | --------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| #9    | Company-coverage expansion              | ✅ merged | 22 → **62 of ~70** companies (2 batches; 3 featured, rest catalogued)                                                       |
| #10   | Relationship sourcing & disambiguation  | ✅ merged | promoted `ntu→stdp`; kept `nus→stdp` inferred; `nsas→unoosa`→documented `ostin→unoosa`; added `satoro→ntu`, `lighthaus→ntu` |
| #11   | Omitted-entity sourcing                 | ✅ merged | added **DSTA** (+`dsta→st-satsys`), **MSS**, **`nuspace→nus` spin-off**                                                     |
| #12   | Node URL re-verification                | ✅ merged | added `npm run check:links`; fixed 4 URLs; Intelsat→SES noted; `beyond-earth` made inert; Satoro stays inert                |
| #13   | Layout-stress & corpus-size review      | ✅ merged | geometry holds at 89/26 (40 featured, 36 on-ring); no plate/data change; `beyond-earth` kept catalogued + documented (#27)  |
| #14   | Edition / snapshot release bookkeeping  | ✅ merged | `DATA_SNAPSHOT`→`2026-08-17` + edition strings + roll-up; no tag (#28)                                                      |
| #29   | Release gate — full sanity & regression | ✅ merged | `npm run release-check` (8/8 automated + 4 human-review); permanent guards added; `v1.1.0` shipped (#30)                    |

## 4. The per-issue execution workflow (repeat this)

Established across #9–#12. For each data issue:

1. **Branch:** `git checkout main && git pull && git checkout -b data/<topic>`.
2. **Live-source** (WebSearch/WebFetch). The OSTIn/AAIS **2025/26 Industry Directory** (`dir-2025` source;
   PDF URL in `js/data/sources.js`) is the company enumerator — fetch + parse it with a Node/`fitz` script
   in the scratchpad if needed (it's a compressed PDF; `pypdf`/`fitz` are available). Verify each claim
   against a real retrieved source; **use the real `accessed` date** (today's) for new sources.
3. **Edit the source of truth:** `js/data/ecosystem.js` (`NODES` / `EDGES`) and `js/data/sources.js`
   (`SOURCES`). Match the surrounding field order + prose style; run `npx prettier --write` on touched files.
4. **Sync the research ledger by hand** (not tool-enforced — it silently drifts):
   - `research/entities.csv` — one mirror row per node (columns `id,name,kind,type,scope,cluster,coverage,status,role,sources`; sources joined by `; `).
   - `research/relationships.csv` — **regenerate wholesale from `EDGES`** (guarantees the field-level match; see §7).
   - `research/sources.md` — a provenance row per new source (id · source · first-party? · what it substantiates · retrieval location).
   - `research/decisions.md` — record every disposition (promoted / left / omitted / inert), **keeping the history** (don't delete the old decision; append the new one).
5. **Tests:** if node **type-group counts** changed, update `test/e2e.spec.mjs` (the `canonical` label/count
   array + the `expected = [agency,govt,academia,company,international,sector,programme]` membership array).
   No test hard-codes edge counts. Node-total assertions read `NODES.length` dynamically.
6. **Visual baselines:** regenerate **only if the _featured_ plate changed** (a new featured node, or a new
   **featured↔featured** edge): `npm run test:e2e -- --update-snapshots`. Catalogued-only additions and URL
   changes never touch the plate. (In practice the 2% `maxDiffPixelRatio` often absorbs small changes, so
   the snapshots may not rewrite — that's fine.)
7. **Gate:** `npm run validate && npm test && npm run lint && npm run format:check && npm run build`, then
   `npm run test:e2e` (incl. axe). Browser-verify the change (`npm run dev`; see §7 gotchas).
8. **PR:** `git commit`, `git push -u origin data/<topic>`, `gh pr create --base main` referencing the
   issue (`Closes #NN`). Confirm CI green. **Leave the merge to the human.** After merge:
   `git checkout main && git pull && git remote prune origin`.

## 5. Evidence discipline (the rules — never relax these)

- **Cardinal rule:** an **edge exists only when a source substantiates that _specific_ relationship**. A
  node's own sources never justify an edge. **Absence of an edge ≠ absence of a relationship.** Inferred
  edges require both `rationale` and `evidenceNote`.
- **Source hierarchy:** first-party primary > government/academic > reputable secondary. A _formal_ claim
  (e.g. a spin-off) needs a primary source; a company's mere existence/segment can rest on `dir-2025`.
- **Keep-omitted / stay-inert is a valid, recorded outcome.** Never pad a count. Every "not added" decision
  is logged in `research/decisions.md` with the reason.
- **Coverage tiers:** companies default to **`catalogued`** (Directory-only, **zero** map change);
  **`featured`** is curated, requires a `featuredReason`, and **draws on the plate** — "go wide in the
  catalogue, stay selective on the plate." Government / academia / agency nodes are **all featured**. A
  sourced relationship never by itself justifies promoting a node to featured (promotion follows the
  significance bar independently).
- **Only featured↔featured edges render on the plate.** An edge touching a catalogued node is _not_ dead
  data — it still enriches that node's Directory "N documented" count and its Inspector.
- **Deliberate non-goals** (recorded, do not build): in-map zoom/pan, faceted filtering, on-map cluster
  labels, fictional telemetry.

## 6. Phase-1 issues (detailed — execution record, all shipped in v1.1.0)

> **All Phase-1 issues below are complete and shipped in `v1.1.0`.** The sections are retained as the
> historical execution record; the next committed work is milestone #2 (§9).

### #13 — Layout-stress & corpus-size review (✅ done — PR #27)

**Why:** at v1.0.0 the graph was sparse (47 nodes / 22 edges) so crossings were trivial; it's now
89 / 26, and #9–#11 added featured nodes to rings 1 (government: 7→9) and 3 (companies) plus new
plate edges. Confirm the plate still reads cleanly at the larger size.

**Do:**

- `npm run stress` — compare edge-crossings + label-collisions vs the recorded baseline in
  `research/decisions.md` §"Phase C.5" (originally `1/11/6/22/3`; already re-noted at `1/11/6/47/3`).
  Note: the stress script counts **all** nodes; the plate draws **featured only** — so it's a conservative
  upper bound. The real check is the _featured_ plate.
- Browser-verify legibility (`npm run dev`, then the browser tools): no label overlaps, no ring-1 crowding
  after the +2 government nodes, no obscured nodes. A quick DOM overlap check (query `svg text` bounding
  boxes) has been the reliable method.
- If a cluster/ring over-crowds, the remedy is **demote marginal featured → catalogued** (never distort the
  geometry). Update §"Phase C.5" with the new figures + any decision.
- **Fold in the `beyond-earth` flag from #12:** its site resolves to Beyond Earth _Ventures_ (a VC), so it
  may be miscategorised as a company. Decide: reclassify, or keep + document. (It's already `catalogued` +
  inert, so it doesn't affect the plate — low urgency, but the honest place to resolve it.)
- Likely outcome: "geometry holds, no change needed" — a valid, recorded result. This issue may touch only
  `research/decisions.md` (no data/plate change).

### #14 — Edition / research-snapshot release bookkeeping (bookkeeping only — NO tag)

**#13 is closed.** #14 advances the Edition pointer and rolls up the decisions; it **does NOT cut the
release.** The `v1.1.0` tag is deferred until **#15 (full sanity & regression check)** closes.

**Do:**

- Bump `DATA_SNAPSHOT` in `js/data/ecosystem.js` (`'2026-08-15'` → the new snapshot date) + its header
  comment. `SCHEMA_VERSION` **stays `'1.0'`**; `CATALOGUE_UNIVERSE_ESTIMATE.companies` stays `70`.
- Bump the hardcoded in-product date strings: `index.html` plate metadata line, and `README.md`
  (live banner + "Versioning & editions" line). The masthead "2026 Edition" (year) and the readouts /
  catalogue snapshot labels (derived from `DATA_SNAPSHOT`) update on their own.
- Update `research/decisions.md` with the Edition roll-up + a release-notes draft (the #9–#13 dispositions,
  as actually landed). Consistency sweep: `research/sources.md` header + this file's stale state lines.
- Regenerate visual baselines (the snapshot text renders in the `fullPage` shots) + full gate.
- **Do NOT cut the tag here.** After #15 closes, cut the `v1.1.0` git tag / GitHub release (SemVer minor =
  a data refresh within schema 1.0).

### #29 — Release gate: full sanity & regression (✅ shipped — PR #30; roadmap-labelled "#15")

**Gated the `v1.1.0` tag; `v1.1.0` is now cut.** (GitHub auto-numbered it **#29**; "#15" is its
roadmap-sequence label — GitHub #15 is an unrelated Phase-2 issue.) The repeatable gate is
**`npm run release-check`** — a four-layer check reusable for every future Edition:

- **Layer 1** existing automated checks; **Layer 2** new permanent guards (`test/release.test.mjs` — strict
  CSP, zero runtime deps, product snapshot/Edition sync; `test/research-consistency.test.mjs` — CSV↔data
  parity, source provenance, disposition↔data; extended `test/e2e.spec.mjs` release surfaces); **Layer 3**
  regression-detection for judgment-laden things (grammar non-colour carriers); **Layer 4** explicit human
  checks (source-substantiation, colour-semantics, `check:links` dispositions, final visual).
- `check:links --strict` fails on `dead` only; redirect/blocked/wrong-entity stay human review.
- **No data/plate change** (`js/data/*`, CSV contents, visual baselines untouched); `package.json` version
  → `1.1.0`. Guard-bite every new test (perturb → FAIL → revert) so each provably protects its invariant.
- The pass is recorded in `research/decisions.md` (§"v1.1.0 release gate"). **Publication was a separate,
  approved step:** the PR merged, the maintainer approved, and the annotated `v1.1.0` tag + GitHub release
  were cut (notes = the #14 release-note draft + the gate result); §2/§3 above now read "v1.1.0 shipped".
- **Out of scope (Phase 3):** wiring e2e/stress/check-links into CI; the layout-stress CI guard.

## 7. Mechanics, verification & gotchas

**Data model (`js/data/ecosystem.js` + `sources.js`):**

- **Node:** `{ id, name, aliases[], kind:'organisation'|'programme'|'sector', type:'agency'|'government'|'academia'|'company'|'international'|'sector'|'programme', scope:'domestic'|'international', coverage:'featured'|'catalogued', status, role, featuredReason?, cluster?, url?, sources:[≥1 id] }`.
  `scope` required for organisations; `cluster` required for `type:'company'` (7 clusters:
  `satellite-mfg, propulsion, comms-ground, geospatial, quantum, launch, downstream`); `featuredReason`
  required when featured; `url` optional (omit = inert).
- **Edge:** `{ source, target, relation, confidence:'documented'|'inferred', pathway:'direct'|'programme-mediated'|'contextual', sources:[≥1], evidenceNote?, rationale? }`.
  `relation` ∈ `supports, coordinates, research, participates, member, supplier, programme, spun-from, funds, oversees, partners`. Inferred ⇒ `rationale` + `evidenceNote` required. No self-edges; no duplicate `source|target|relation`; sector nodes may never appear in edges.
- **Source:** `{ id, title, publisher, url, published?, updated?, accessed, kind:'primary-live'|'primary-archived'|'secondary' }`.
- **Rings** (`ringOf` in `js/layout.js`): 0 = NSAS · 1 = government + programmes ("institutional context")
  · 2 = academia · 3 = companies (by cluster) · 4 = international. Only featured nodes are placed.

**Validator** (`scripts/validate-data.mjs`, `npm run validate`): enforces the contract above, but checks
`url` **syntax only, not liveness** (that's what `check:links` is for). `url` is **ancillary** — it is
**not** mirrored in `entities.csv` and cites no source, so URL edits touch no CSV/ledger analytics.

**Ledger consistency check** (run after edits): `entities.csv` data-row count `== NODES.length`; and a
**field-level** match of `relationships.csv` to `EDGES` on source/target/relation/confidence/pathway/sources
(regenerate `relationships.csv` from `EDGES` to guarantee it).

**Commands:** `npm run dev` (static server on :8000) · `npm run validate` · `npm test` (node --test) ·
`npm run lint` · `npm run format:check` · `npm run build` · `npm run stress` (layout) ·
`npm run check:links` (URL liveness — manual, **not** in CI) · `npm run test:e2e` (Playwright: interaction +
axe a11y + visual regression; baselines are darwin/Chrome; **not** in CI; regenerate with `-- --update-snapshots`).

**Gotchas:**

- **Port 8000:** `npm run dev` and Playwright both bind `:8000`. Kill stale servers before running e2e —
  `lsof -ti :8000 | xargs -r kill -9; pkill -9 -f nocache_server` — and wait a beat for the socket to free.
- **Prettier:** run `npx prettier --write` on every touched `.js/.mjs/.md/.json/.css` before `format:check`
  (a husky pre-commit also runs it). Markdown tables get re-padded — match after.
- **Built-in Browser pane** downscales screenshots and can't crop-zoom; for pixel-legibility checks query
  the DOM (`svg text` bounding boxes) via the browser JS tool instead. For "show me", use the real Chrome
  tools (`mcp__claude-in-chrome__*`), navigating to `http://127.0.0.1:8000/?node=<id>` to open the Inspector.
- **Live sourcing can correct your assumptions** — e.g. #10 found "Space Armour" is orbital-AI not radiation
  shielding; #12 found `beyond-earth`'s domain is a VC. Always verify, don't assume.

## 8. File map

```
js/data/ecosystem.js   NODES + EDGES + SCHEMA_VERSION/DATA_SNAPSHOT/CATALOGUE_UNIVERSE_ESTIMATE  (source of truth)
js/data/sources.js     SOURCES registry
js/{layout,render,interaction,filters,readouts,inspector,catalogue,views,router,state,theme,story,config,icons}.js
research/entities.csv           node mirror (hand-kept)
research/relationships.csv      edge mirror (regenerate from EDGES)
research/sources.md             source provenance ledger
research/decisions.md           editorial dispositions + history  ← update every issue
research/{sources.md,references.md,entities.csv,relationships.csv}
scripts/validate-data.mjs · layout-stress.mjs · check-links.mjs · build.mjs · nocache_server.py
test/data.test.mjs (node --test) · e2e.spec.mjs (Playwright) · e2e.spec.mjs-snapshots/
ROADMAP.md · design.md · index.html · docs/HANDOFF.md (this file)
```

## 9. Milestones #2 / #3 (after #1)

Once #13 + #14 close and `v1.1.0` is cut, the next committed work is **milestone #2 (v1.2.0 — product
depth:** real mobile interaction/layout + a deep-linkable guided tour) and **#3 (engineering hardening:**
wire e2e/axe/visual into CI with Linux baselines; a `stress` CI guard once the corpus is dense enough;
accessibility depth). `ROADMAP.md` also lists an explicitly **non-committed** "Longer-term candidates"
section (historical/versioned Editions, embeddable viewer, etc.) — ideas, not promises.
