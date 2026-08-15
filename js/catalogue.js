// catalogue.js — the evidence surface: a calm editorial INDEX of the atlas (card-list, not a
// spreadsheet) AND the accessible representation of the corpus. Linked to the map via the shared
// store: selecting a map node marks its catalogue card; selecting a card selects the node (which the
// map halos even if currently dimmed). Rendered via DOM APIs only (no untrusted innerHTML).

import { CLUSTER_LABELS, TYPE_LABELS } from './config.js';
import {
  CATALOGUE_UNIVERSE_ESTIMATE,
  DATA_SNAPSHOT,
  EDGES,
  NODES,
  SCHEMA_VERSION,
} from './data/ecosystem.js';
import { setState, state, subscribe } from './state.js';

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

function snapshotLabel(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
}

// documented-connection count per node (for the card metadata)
const docCount = new Map();
for (const e of EDGES) {
  if (e.confidence !== 'documented') continue;
  docCount.set(e.source, (docCount.get(e.source) || 0) + 1);
  docCount.set(e.target, (docCount.get(e.target) || 0) + 1);
}

export function initCatalogue(mount) {
  mount.replaceChildren();

  const companies = NODES.filter(
    (n) => n.type === 'company' || (n.type === 'international' && n.cluster)
  );
  const orgs = NODES.filter((n) => n.kind === 'organisation').length;
  const programmes = NODES.filter((n) => n.kind === 'programme').length;
  const documented = EDGES.filter((e) => e.confidence === 'documented').length;
  const inferred = EDGES.filter((e) => e.confidence === 'inferred').length;

  mount.append(h('h2', { text: 'Catalogue' }));
  mount.append(
    h('p', {
      class: 'snapshot',
      text: `Atlas snapshot · ${snapshotLabel(DATA_SNAPSHOT)} · Dataset schema ${SCHEMA_VERSION}`,
    })
  );
  mount.append(
    h('p', {
      class: 'coverage',
      text: `${companies.length} companies shown of ~${CATALOGUE_UNIVERSE_ESTIMATE.companies} identified in public materials · ${orgs} organisations · ${programmes} programmes · ${documented} documented + ${inferred} inferred relationships.`,
    })
  );
  mount.append(
    h('p', {
      class: 'muted small',
      text: 'The index of the same data behind the map, and its accessible representation. Every count is derived from the dataset; only the “~70” denominator is a cited editorial estimate.',
    })
  );

  const list = h('ul', { class: 'cat-list' });
  const cardById = new Map();
  for (const n of [...NODES].sort((a, b) => a.name.localeCompare(b.name))) {
    const nameBtn = h('button', {
      class: 'link-btn',
      type: 'button',
      'data-id': n.id,
      text: n.name,
    });
    nameBtn.addEventListener('click', () => setState({ view: 'explore', selection: n.id }));
    const metaParts = [
      TYPE_LABELS[n.type] ?? n.type,
      n.cluster ? (CLUSTER_LABELS[n.cluster] ?? n.cluster) : null,
      n.coverage,
      `${docCount.get(n.id) || 0} documented`,
      `${(n.sources || []).length} ${(n.sources || []).length === 1 ? 'source' : 'sources'}`,
    ].filter(Boolean);
    const item = h('li', { class: 'cat-item', 'data-id': n.id }, [
      h('div', {}, [h('span', { class: `dot type-${n.type}` }), nameBtn]),
      h('p', { class: 'cat-meta', text: metaParts.join(' · ') }),
      h('p', { class: 'cat-role', text: n.role }),
    ]);
    list.append(item);
    cardById.set(n.id, item);
  }
  mount.append(list);

  // linked highlighting: the selected node marks its catalogue card
  subscribe(() => {
    for (const [id, card] of cardById) card.classList.toggle('is-active', id === state.selection);
  });
}
