// app.js — bootstrap / bundle entry.
//
// Phase A: wires the data into a minimal, accessible Catalogue and reveals the (still-empty) map
// mount. The full visual shell (layout/render/interaction/inspector/router/story) arrives in
// Phase D, built on top of this same state once the researched corpus exists.
//
// Discipline: all data renders via DOM APIs (createElement/textContent) — never untrusted
// innerHTML — so the CSP never needs to relax and injection is impossible by construction.

import { TYPE_LABELS } from './config.js';
import { DATA_SNAPSHOT, EDGES, NODES, SCHEMA_VERSION } from './data/ecosystem.js';

const $ = (sel, root = document) => root.querySelector(sel);

/** Human date for the snapshot line, from the YYYY-MM-DD id. */
function snapshotLabel(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Counts derived from the data at runtime (never hard-coded), so the UI can't drift. */
function deriveStats(nodes, edges) {
  return {
    organisations: nodes.filter((n) => n.kind === 'organisation').length,
    programmes: nodes.filter((n) => n.kind === 'programme').length,
    featured: nodes.filter((n) => n.coverage === 'featured').length,
    catalogued: nodes.filter((n) => n.coverage === 'catalogued').length,
    documented: edges.filter((e) => e.confidence === 'documented').length,
    inferred: edges.filter((e) => e.confidence === 'inferred').length,
  };
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

function renderCatalogue(root) {
  root.replaceChildren();
  const stats = deriveStats(NODES, EDGES);

  root.append(
    el('h2', { text: 'Ecosystem catalogue' }),
    el('p', {
      class: 'snapshot',
      text: `Atlas snapshot · ${snapshotLabel(DATA_SNAPSHOT)} · Dataset schema · ${SCHEMA_VERSION}`,
    })
  );

  if (NODES.length === 0) {
    root.append(
      el('p', {
        class: 'muted',
        text: 'Corpus in progress — the cited research pass (Phase B) will populate the entities, relationships and sources. This catalogue and the interactive map are both generated from that dataset.',
      })
    );
    return;
  }

  root.append(
    el('p', {
      class: 'muted',
      text: `${stats.organisations} organisations · ${stats.programmes} programmes · ${stats.documented} documented + ${stats.inferred} inferred relationships · ${stats.featured} featured, ${stats.catalogued} catalogued.`,
    })
  );

  const list = el('ul', { class: 'catalogue-list' });
  for (const n of [...NODES].sort((a, b) => a.name.localeCompare(b.name))) {
    const item = el('li', {}, [
      el('span', { class: 'cat-name', text: n.name }),
      el('span', { class: 'cat-type', text: TYPE_LABELS[n.type] ?? n.type }),
      el('span', { class: 'cat-role', text: n.role }),
    ]);
    list.append(item);
  }
  root.append(list);
}

function init() {
  const atlas = $('#atlas');
  const catalogue = $('#catalogue');
  if (catalogue) renderCatalogue(catalogue);
  // The map mount stays hidden until Phase D renders into it; the catalogue is always present.
  if (atlas) atlas.hidden = true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
