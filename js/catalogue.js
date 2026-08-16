// catalogue.js — the Directory: the evidence surface, a calm editorial INDEX of the atlas (card-list,
// not a spreadsheet) AND the accessible representation of the corpus. Referential, not a second way
// into Explore: each entity name links to its official website (new tab) where the corpus provides
// one, else it is inert text. Linked to the map one-way via the shared store — selecting a map node
// marks its Directory card active. Rendered via DOM APIs only (no untrusted innerHTML).
// (The internal view id / route stays `catalogue`; the visible label is "Directory".)

import { CLUSTER_LABELS, TYPE_LABELS, TYPES } from './config.js';
import {
  CATALOGUE_UNIVERSE_ESTIMATE,
  DATA_SNAPSHOT,
  EDGES,
  NODES,
  SCHEMA_VERSION,
} from './data/ecosystem.js';
import { state, subscribe } from './state.js';

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

  mount.append(h('h2', { text: 'Directory' }));
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

  const cardById = new Map();

  // One directory card: name → meta → role. Type is NOT in the card — its stakeholder-type section
  // header is the sole type indicator (dot colour + label), so nothing strands. The name links to the
  // entity's official website (new tab) when one exists; otherwise it is inert text — the Directory is
  // referential, not a second way into Explore (map selection remains the reverse-highlight mechanism).
  const makeCard = (n) => {
    const name = n.url
      ? h('a', {
          class: 'cat-name',
          href: n.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          text: n.name,
        })
      : h('span', { class: 'cat-name', text: n.name });
    const metaParts = [
      n.cluster ? (CLUSTER_LABELS[n.cluster] ?? n.cluster) : null,
      n.coverage,
      `${docCount.get(n.id) || 0} documented`,
      `${(n.sources || []).length} ${(n.sources || []).length === 1 ? 'source' : 'sources'}`,
    ].filter(Boolean);
    const item = h('li', { class: 'cat-item', 'data-id': n.id }, [
      name,
      h('p', { class: 'cat-meta', text: metaParts.join(' · ') }),
      h('p', { class: 'cat-role', text: n.role }),
    ]);
    cardById.set(n.id, item);
    return item;
  };

  // Group by stakeholder type in canonical TYPES order (matches filters + map); alphabetical within.
  // DOM order == visual order, so screen-reader users get the same hierarchy. Empty types are skipped.
  for (const type of TYPES) {
    const nodes = NODES.filter((n) => n.type === type).sort((a, b) => a.name.localeCompare(b.name));
    if (!nodes.length) continue;
    const head = h('h3', { class: 'cat-group-head' }, [
      h('span', { class: `swatch type-${type}`, 'aria-hidden': 'true' }),
      h('span', { text: TYPE_LABELS[type] }),
      h('span', { class: 'cat-group-count', text: String(nodes.length).padStart(2, '0') }),
    ]);
    const list = h('ul', { class: 'cat-list' }, nodes.map(makeCard));
    mount.append(h('section', { class: 'cat-group' }, [head, list]));
  }

  // linked highlighting: the selected node marks its catalogue card
  subscribe(() => {
    for (const [id, card] of cardById) card.classList.toggle('is-active', id === state.selection);
  });
}
