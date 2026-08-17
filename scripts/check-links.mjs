// check-links.mjs — node `url` liveness re-verification (editorial maintenance, not a CI gate).
//
// Reads every node `url` from the corpus and checks it resolves, following redirects. It classifies
// each link so a human can triage — it does NOT auto-decide. Network access + WAFs make liveness a
// review signal, not a pass/fail: a 403 is usually a bot block on a live page, and a redirect may be
// a legitimate move to a new official domain. So this stays out of CI (like the Playwright suite).
//
// Classes: ok (2xx) · redirect (final URL differs — review, esp. cross-host) · blocked (401/403/405
// or similar access-control) · dead (404/410/DNS/timeout/other). The raw status/error is always shown.
//
// Exit codes: `npm run check:links` is advisory and always exits 0. `npm run check:links -- --strict`
// (used by the release gate, `npm run release-check`) exits non-zero ONLY on `dead` URLs. redirect,
// blocked, and *wrong-entity* destinations stay human review states — HTTP liveness cannot decide
// whether a URL points at the correct first-party page.

import { NODES } from '../js/data/ecosystem.js';

const TIMEOUT_MS = 12000;
const CONCURRENCY = 6;
// A browser-identifying User-Agent header (Node fetch is not a browser; some hosts 403 unknown agents).
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const hostOf = (u) => {
  try {
    return new URL(u).host.replace(/^www\./, '');
  } catch {
    return null;
  }
};

async function once(url, method) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, Accept: '*/*' },
    });
    return { status: res.status, finalUrl: res.url };
  } finally {
    clearTimeout(timer);
  }
}

async function check(url) {
  // Method sequence: try HEAD; on a method-related rejection retry GET (authoritative for liveness).
  let r;
  try {
    r = await once(url, 'HEAD');
    if ([405, 501, 400, 403].includes(r.status)) r = await once(url, 'GET');
  } catch {
    try {
      r = await once(url, 'GET');
    } catch (e) {
      return {
        url,
        cls: 'dead',
        status: e.name === 'AbortError' ? 'timeout' : e.code || 'fetch-error',
      };
    }
  }
  const { status, finalUrl } = r;
  const moved = finalUrl && hostOf(finalUrl) !== hostOf(url);
  let cls;
  if (status >= 200 && status < 300) cls = moved ? 'redirect' : 'ok';
  else if ([401, 403, 405, 407, 429].includes(status)) cls = 'blocked';
  else if (status >= 300 && status < 400) cls = 'redirect';
  else cls = 'dead';
  return { url, cls, status, finalUrl: moved ? finalUrl : undefined };
}

// distinct urls → the node ids that use each (surfaces the intentional shared destinations)
const byUrl = new Map();
for (const n of NODES) {
  if (!n.url) continue;
  if (!byUrl.has(n.url)) byUrl.set(n.url, []);
  byUrl.get(n.url).push(n.id);
}
const urls = [...byUrl.keys()];

async function run() {
  console.log(
    `check-links — ${urls.length} distinct URLs across ${NODES.filter((n) => n.url).length} nodes\n`
  );
  const results = [];
  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      results.push(await check(url));
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const order = { dead: 0, blocked: 1, redirect: 2, ok: 3 };
  results.sort((a, b) => order[a.cls] - order[b.cls] || a.url.localeCompare(b.url));

  for (const r of results) {
    if (r.cls === 'ok') continue; // print only rows needing review
    const ids = byUrl.get(r.url).join(', ');
    const tail = r.finalUrl ? `  →  ${r.finalUrl}` : '';
    console.log(`  [${r.cls}] ${String(r.status).padEnd(8)} ${r.url}${tail}   (${ids})`);
  }

  const tally = results.reduce((m, r) => ((m[r.cls] = (m[r.cls] || 0) + 1), m), {});
  console.log(
    `\n  summary: ok ${tally.ok || 0} · redirect ${tally.redirect || 0} · blocked ${tally.blocked || 0} · dead ${tally.dead || 0}`
  );

  const strict = process.argv.includes('--strict');
  const dead = tally.dead || 0;
  if (strict) {
    // Strict (release gate): fail on dead only. redirect/blocked/wrong-entity stay human review.
    if (dead > 0) {
      console.error(
        `  --strict: ${dead} dead URL(s) — release gate FAILS. (redirect/blocked remain human review.)`
      );
      process.exit(1);
    }
    console.log(
      '  --strict: 0 dead URLs — link liveness OK (review any redirect/blocked by hand).'
    );
  } else {
    console.log(
      '  (review redirect/blocked/dead by hand — not an automatic verdict; advisory, exits 0. Use --strict to fail on dead.)'
    );
  }
}

run();
