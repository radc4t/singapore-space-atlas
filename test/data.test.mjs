// data.test.mjs — the data contract, exercised two ways:
//   1. the REAL dataset must validate with zero errors;
//   2. the validator must actually CATCH each contract violation (so the guarantees are real even
//      while the corpus is still being authored in Phase B).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateData } from '../scripts/validate-data.mjs';

test('real dataset validates with zero errors', () => {
  const { errors } = validateData();
  assert.deepEqual(errors, [], `unexpected data errors:\n${errors.join('\n')}`);
});

// --- helpers for synthetic datasets ---------------------------------------------------------
const src = (id) => ({
  id,
  title: `T ${id}`,
  publisher: 'P',
  url: 'https://example.org/' + id,
  accessed: '2026-08-15',
  kind: 'primary-live',
});
const org = (id, over = {}) => ({
  id,
  name: id,
  kind: 'organisation',
  type: 'government',
  scope: 'domestic',
  coverage: 'catalogued',
  role: 'role',
  sources: ['s1'],
  ...over,
});
const base = (over = {}) => ({
  sources: [src('s1')],
  nodes: [org('a'), org('b')],
  edges: [],
  universe: { companies: 70, sourceId: 's1' },
  ...over,
});
const errText = (data) => validateData(data).errors.join('\n');

test('baseline synthetic dataset is clean', () => {
  assert.deepEqual(validateData(base()).errors, []);
});

test('catches duplicate node ids', () => {
  const data = base({ nodes: [org('a'), org('a')] });
  assert.match(errText(data), /duplicate node id "a"/);
});

test('catches unresolved node source', () => {
  const data = base({ nodes: [org('a', { sources: ['missing'] })] });
  assert.match(errText(data), /unresolved source id "missing"/);
});

test('catches node with no sources', () => {
  const data = base({ nodes: [org('a', { sources: [] })] });
  assert.match(errText(data), /must reference ≥1 source/);
});

test('catches invalid vocabulary values', () => {
  assert.match(errText(base({ nodes: [org('a', { type: 'bogus' })] })), /invalid type "bogus"/);
  assert.match(errText(base({ nodes: [org('a', { kind: 'bogus' })] })), /invalid kind "bogus"/);
});

test('enforces ontology: kind:organisation requires scope', () => {
  const n = org('a');
  delete n.scope;
  assert.match(errText(base({ nodes: [n] })), /kind:organisation requires a scope/);
});

test('enforces ontology: kind:sector must not have scope and must not appear in edges', () => {
  const sector = {
    id: 'sec',
    name: 'AI',
    kind: 'sector',
    type: 'sector',
    coverage: 'catalogued',
    role: 'r',
    sources: ['s1'],
  };
  assert.deepEqual(validateData(base({ nodes: [org('a'), sector] })).errors, []);
  const withScope = { ...sector, scope: 'domestic' };
  assert.match(
    errText(base({ nodes: [org('a'), withScope] })),
    /kind:sector must not have a scope/
  );
  const data = base({
    nodes: [org('a'), sector],
    edges: [
      {
        source: 'a',
        target: 'sec',
        relation: 'supports',
        sources: ['s1'],
        confidence: 'documented',
        pathway: 'direct',
      },
    ],
  });
  assert.match(errText(data), /sector node "sec" must not appear in EDGES/);
});

test('enforces ontology: kind:programme requires type:programme', () => {
  const p = org('p', { kind: 'programme', type: 'agency', scope: undefined });
  assert.match(errText(base({ nodes: [p] })), /kind:programme requires type:programme/);
});

test('enforces ontology: company requires a cluster', () => {
  const c = org('c', { type: 'company', scope: 'domestic' });
  assert.match(errText(base({ nodes: [c] })), /type:company requires a valid cluster/);
});

test('enforces coverage:featured requires featuredReason', () => {
  const f = org('a', { coverage: 'featured' });
  assert.match(errText(base({ nodes: [f] })), /coverage:featured requires a featuredReason/);
});

test('catches duplicate edges and unknown endpoints', () => {
  const edge = {
    source: 'a',
    target: 'b',
    relation: 'supports',
    sources: ['s1'],
    confidence: 'documented',
    pathway: 'direct',
  };
  assert.match(errText(base({ edges: [edge, { ...edge }] })), /duplicate edge/);
  assert.match(
    errText(base({ edges: [{ ...edge, target: 'nope' }] })),
    /unknown target node "nope"/
  );
});

test('inferred edges require rationale AND evidenceNote', () => {
  const edge = {
    source: 'a',
    target: 'b',
    relation: 'participates',
    sources: ['s1'],
    confidence: 'inferred',
    pathway: 'programme-mediated',
  };
  const errs = errText(base({ edges: [edge] }));
  assert.match(errs, /requires a rationale/);
  assert.match(errs, /requires an evidenceNote/);
  const ok = base({
    edges: [
      {
        ...edge,
        rationale: 'shared programme; no direct tie found',
        evidenceNote: 'both listed as participants in X',
      },
    ],
  });
  assert.deepEqual(validateData(ok).errors, []);
});

test('catches syntactically invalid source URL', () => {
  const data = base({ sources: [{ ...src('s1'), url: 'not a url' }] });
  assert.match(errText(data), /syntactically invalid url/);
});
