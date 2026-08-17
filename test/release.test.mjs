// release.test.mjs — permanent release-invariant guards (Layer 2 of the #15 release gate).
//
// These protect roadmap guiding-invariants that were previously only checked by hand:
//   · strict Content-Security-Policy (the zero-network posture)         — ROADMAP "Guiding constraints"
//   · zero runtime dependencies                                         — ROADMAP "Guiding constraints"
//   · product-facing Edition/snapshot strings match DATA_SNAPSHOT/SCHEMA — Phase-1 "Done when"
//
// Scope note: the snapshot guard covers the PRODUCT-FACING pointers (index.html + README) only. The
// research ledger / HANDOFF synchronization is a separate concern (research-consistency.test.mjs +
// documented manual review). These run under `npm test`, so they are permanent CI guards.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { DATA_SNAPSHOT, SCHEMA_VERSION } from '../js/data/ecosystem.js';

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const indexHtml = read('../index.html');
const readme = read('../README.md');
const pkg = JSON.parse(read('../package.json'));

// Derive the two hardcoded display formats from DATA_SNAPSHOT with a fixed month table — no locale or
// timezone coupling. '2026-08-17' → day '17', mon 'Aug' → README "17 Aug 2026", index.html "17 AUG 2026".
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const [year, month, day] = DATA_SNAPSHOT.split('-').map((s) => parseInt(s, 10));
const monAbbr = MONTHS[month - 1];
const titleDate = `${day} ${monAbbr} ${year}`; // README form
const upperDate = `${day} ${monAbbr.toUpperCase()} ${year}`; // index.html status-meta form

test('CSP stays strict — no network, no injection surface', () => {
  const m = indexHtml.match(/http-equiv="Content-Security-Policy"[^>]*\scontent="([^"]*)"/is);
  assert.ok(m, 'index.html must carry a Content-Security-Policy meta tag');
  const csp = m[1];
  for (const directive of [
    "default-src 'self'",
    "script-src 'self'",
    "connect-src 'none'", // the zero-network invariant
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]) {
    assert.ok(csp.includes(directive), `CSP must keep "${directive}" — got: ${csp}`);
  }
});

test('zero runtime dependencies', () => {
  const deps = pkg.dependencies ?? {};
  assert.deepEqual(
    Object.keys(deps),
    [],
    `package.json must have no runtime dependencies; found: ${Object.keys(deps).join(', ')}`
  );
});

test('product-facing Edition/snapshot strings match DATA_SNAPSHOT + SCHEMA_VERSION', () => {
  // index.html plate metadata line carries the uppercased abbreviated date.
  assert.ok(
    indexHtml.includes(upperDate),
    `index.html must show the current snapshot "${upperDate}" (derived from DATA_SNAPSHOT ${DATA_SNAPSHOT})`
  );
  // README live banner + "Versioning & editions" line carry the title-case date.
  assert.ok(
    readme.includes(titleDate),
    `README.md must show the current snapshot "${titleDate}" (derived from DATA_SNAPSHOT ${DATA_SNAPSHOT})`
  );
  // README schema line must match the code constant.
  assert.ok(
    readme.includes(`dataset schema ${SCHEMA_VERSION}`),
    `README.md must state "dataset schema ${SCHEMA_VERSION}" to match SCHEMA_VERSION`
  );
});
