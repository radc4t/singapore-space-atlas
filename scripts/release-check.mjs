// release-check.mjs — the v1.1.0 release gate as one repeatable command (issue #15).
//
// Runs the full automated battery in a deterministic order, ALWAYS running every stage (so the record
// shows which stage failed, not just a non-zero exit), then exits non-zero if any stage failed. It is a
// MANUAL / local gate (it includes the network `check:links --strict`) — it is NOT wired into CI; that
// is Phase-3 work. `npm run release-check`.
//
// The summary separates what a script can prove (AUTOMATED PASS/FAIL) from what it cannot — the
// editorial judgments that stay HUMAN REVIEW and are recorded in research/decisions.md, never
// auto-marked PASS.
//
// Port note: `test:e2e` binds :8000. Free a stale server first if needed:
//   lsof -ti :8000 | xargs -r kill -9; pkill -9 -f nocache_server

import { spawnSync } from 'node:child_process';

const STAGES = [
  ['validate', ['run', 'validate']],
  ['test', ['test']],
  ['lint', ['run', 'lint']],
  ['format:check', ['run', 'format:check']],
  ['build', ['run', 'build']],
  ['stress', ['run', 'stress']],
  ['check:links --strict', ['run', 'check:links', '--', '--strict']],
  ['test:e2e', ['run', 'test:e2e']],
];

const HUMAN_REVIEW = [
  'source-substantiation (does each cited source support its claim?)',
  'colour-semantics (six-channel grammar still clear; meaning not by colour alone?)',
  'check:links dispositions (redirect / blocked / wrong-entity resolved by hand?)',
  'final visual/editorial review of the plate + release surfaces',
];

const results = [];
for (const [label, args] of STAGES) {
  console.log(`\n━━━ ${label} ━━━`);
  const r = spawnSync('npm', args, { stdio: 'inherit' });
  results.push([label, r.status === 0]);
}

const passed = results.filter(([, ok]) => ok).length;
console.log('\n════════ release-check summary ════════');
for (const [label, ok] of results) console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`);
console.log(`\n  AUTOMATED: ${passed}/${results.length} PASS`);
console.log(
  `  HUMAN REVIEW: ${HUMAN_REVIEW.length} items REQUIRED (recorded in research/decisions.md):`
);
for (const item of HUMAN_REVIEW) console.log(`    · ${item}`);

if (passed !== results.length) {
  console.error('\n✗ release gate: automated checks FAILED — not release-ready.');
  process.exit(1);
}
console.log('\n✓ automated gate PASSED — proceed to the human-review items before publishing.');
