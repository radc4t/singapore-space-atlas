// research-consistency.test.mjs — bidirectional ledger parity (Layer 2/3 of the #15 release gate).
//
// The research ledger silently drifts (HANDOFF §4/§7 note it is hand-kept). These guards pin the
// mirror CSVs to the publication data so a drift is caught by `npm test`, and assert that recorded
// inert/omitted DISPOSITIONS still match the data (a regression check, not proof of editorial intent).
//
// This test CONFORMS TO THE EXISTING LEDGER SCHEMA — it does not add columns. Verified headers:
//   entities.csv       : id,name,kind,type,scope,cluster,coverage,status,role,sources   (url NOT mirrored)
//   relationships.csv  : source,target,relation,confidence,pathway,sources,evidenceNote,rationale
// Optional cells are the empty string ("scope"/"cluster"/"status" for some node types; evidenceNote/
// rationale only on inferred edges). Every field is double-quoted; sources are "; "-joined; one record
// per line.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { EDGES, NODES } from '../js/data/ecosystem.js';
import { SOURCES } from '../js/data/sources.js';

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');

// Minimal RFC4180 field parser (handles quoted commas + doubled-quote escapes). One record per line.
function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').trim().split('\n');
  const rows = lines.map((line) => {
    const fields = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else inQ = false;
        } else cur += c;
      } else if (c === '"') inQ = true;
      else if (c === ',') {
        fields.push(cur);
        cur = '';
      } else cur += c;
    }
    fields.push(cur);
    return fields;
  });
  return { header: rows[0], rows: rows.slice(1) };
}

const s = (v) => (v == null ? '' : String(v)); // optional → empty string
const joinSources = (ids) => ids.join('; ');

test('entities.csv mirrors NODES field-for-field (existing schema)', () => {
  const { header, rows } = parseCsv(read('../research/entities.csv'));
  assert.deepEqual(header, [
    'id',
    'name',
    'kind',
    'type',
    'scope',
    'cluster',
    'coverage',
    'status',
    'role',
    'sources',
  ]);
  assert.equal(rows.length, NODES.length, 'entities.csv data-row count must equal NODES.length');

  const csvById = new Map(rows.map((r) => [r[0], r]));
  assert.equal(csvById.size, rows.length, 'entities.csv has duplicate id rows');

  for (const n of NODES) {
    const row = csvById.get(n.id);
    assert.ok(row, `entities.csv is missing a row for node "${n.id}"`);
    const expected = [
      n.id,
      s(n.name),
      s(n.kind),
      s(n.type),
      s(n.scope),
      s(n.cluster),
      s(n.coverage),
      s(n.status),
      s(n.role),
      joinSources(n.sources),
    ];
    assert.deepEqual(row, expected, `entities.csv row for "${n.id}" is out of sync with NODES`);
  }
});

test('relationships.csv mirrors EDGES field-for-field, in order', () => {
  const { header, rows } = parseCsv(read('../research/relationships.csv'));
  assert.deepEqual(header, [
    'source',
    'target',
    'relation',
    'confidence',
    'pathway',
    'sources',
    'evidenceNote',
    'rationale',
  ]);
  assert.equal(
    rows.length,
    EDGES.length,
    'relationships.csv data-row count must equal EDGES.length'
  );

  // The CSV is regenerated wholesale from EDGES, so order is significant.
  EDGES.forEach((e, i) => {
    const expected = [
      s(e.source),
      s(e.target),
      s(e.relation),
      s(e.confidence),
      s(e.pathway),
      joinSources(e.sources),
      s(e.evidenceNote),
      s(e.rationale),
    ];
    assert.deepEqual(
      rows[i],
      expected,
      `relationships.csv row ${i} (${e.source}→${e.target}) is out of sync with EDGES`
    );
  });
});

test('every source id has a provenance mention in research/sources.md', () => {
  const md = read('../research/sources.md');
  const missing = SOURCES.map((src) => src.id).filter((id) => !md.includes(id));
  assert.deepEqual(
    missing,
    [],
    `source ids absent from research/sources.md: ${missing.join(', ')}`
  );
});

test('recorded inert/omitted dispositions still match the data', () => {
  const byId = new Map(NODES.map((n) => [n.id, n]));
  const has = (id) => byId.has(id);
  const url = (id) => byId.get(id)?.url;
  const edge = (src, tgt) => EDGES.find((e) => e.source === src && e.target === tgt);

  // Intentionally inert (no url) — a future edit must not silently add one without a disposition update.
  for (const id of [
    'beyond-earth',
    'satoro',
    'sec-aerospace',
    'sec-microelectronics',
    'sec-ai',
    'sec-quantum',
    'ostin',
  ])
    assert.equal(url(id), undefined, `"${id}" is recorded inert — it must have no url`);

  // beyond-earth stays catalogued (kept + documented in #13, not reclassified/removed).
  assert.equal(
    byId.get('beyond-earth')?.coverage,
    'catalogued',
    'beyond-earth must stay catalogued'
  );

  // #11 additions that cleared the evidence bar — presence + their sourced edges.
  for (const id of ['dsta', 'mss', 'nuspace'])
    assert.ok(has(id), `"${id}" was added in #11 and must be present`);
  assert.ok(edge('dsta', 'st-satsys'), 'dsta→st-satsys (from #11) must exist');
  const spin = edge('nuspace', 'nus');
  assert.ok(spin && spin.relation === 'spun-from', 'nuspace→nus spun-from (from #11) must exist');
});
