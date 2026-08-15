// catalogue.js — a first-class product surface AND the accessible representation of the corpus.
// Semantic HTML tables (not the SVG) carry the same entities + relationships, so assistive tech
// never has to depend on the interactive graphic. Rows select the entity (syncing map + inspector).

import { CLUSTER_LABELS, TYPE_LABELS } from './config.js';
import {
  CATALOGUE_UNIVERSE_ESTIMATE,
  DATA_SNAPSHOT,
  EDGES,
  NODES,
  SCHEMA_VERSION,
} from './data/ecosystem.js';
import { SOURCES } from './data/sources.js';
import { setState } from './state.js';

const nodeById = new Map(NODES.map((n) => [n.id, n]));
const srcById = new Map(SOURCES.map((s) => [s.id, s]));

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

function stats() {
  const companies = NODES.filter(
    (n) => n.type === 'company' || (n.type === 'international' && n.cluster)
  );
  return {
    organisations: NODES.filter((n) => n.kind === 'organisation').length,
    programmes: NODES.filter((n) => n.kind === 'programme').length,
    sectors: NODES.filter((n) => n.kind === 'sector').length,
    companies: companies.length,
    featured: NODES.filter((n) => n.coverage === 'featured').length,
    catalogued: NODES.filter((n) => n.coverage === 'catalogued').length,
    documented: EDGES.filter((e) => e.confidence === 'documented').length,
    inferred: EDGES.filter((e) => e.confidence === 'inferred').length,
    sources: SOURCES.length,
  };
}

export function initCatalogue(mount) {
  const s = stats();
  mount.replaceChildren();

  mount.append(h('h2', { text: 'Ecosystem catalogue' }));
  mount.append(
    h('p', {
      class: 'snapshot',
      text: `Atlas snapshot · ${snapshotLabel(DATA_SNAPSHOT)} · Dataset schema · ${SCHEMA_VERSION}`,
    })
  );
  mount.append(
    h('p', {
      class: 'coverage',
      text: `${s.companies} companies shown of ~${CATALOGUE_UNIVERSE_ESTIMATE.companies} identified in public materials · ${s.organisations} organisations · ${s.programmes} programmes · ${s.documented} documented + ${s.inferred} inferred relationships · ${s.sources} sources.`,
    })
  );
  mount.append(
    h('p', {
      class: 'muted small',
      text: 'This catalogue is the accessible, text-based view of the same data behind the map. Every count above is derived from the dataset; only the “~70” denominator is a cited editorial estimate.',
    })
  );

  // --- entities table ----------------------------------------------------------------------
  const entTable = h('table', { class: 'cat-table' });
  entTable.append(
    h('caption', { text: 'Entities' }),
    h('thead', {}, [
      h('tr', {}, [
        h('th', { scope: 'col', text: 'Name' }),
        h('th', { scope: 'col', text: 'Type' }),
        h('th', { scope: 'col', text: 'Cluster / scope' }),
        h('th', { scope: 'col', text: 'Role' }),
        h('th', { scope: 'col', text: 'Coverage' }),
      ]),
    ])
  );
  const tbody = h('tbody');
  for (const n of [...NODES].sort((a, b) => a.name.localeCompare(b.name))) {
    const nameBtn = h('button', {
      class: 'link-btn',
      type: 'button',
      'data-id': n.id,
      text: n.name,
    });
    nameBtn.addEventListener('click', () => setState({ selection: n.id }));
    tbody.append(
      h('tr', { 'data-id': n.id }, [
        h('th', { scope: 'row' }, [nameBtn]),
        h('td', {}, [
          h('span', { class: `dot type-${n.type}` }),
          document.createTextNode(TYPE_LABELS[n.type] ?? n.type),
        ]),
        h('td', {
          text:
            (n.cluster ? (CLUSTER_LABELS[n.cluster] ?? n.cluster) : '—') +
            (n.scope === 'international' ? ' · intl' : n.scope === 'domestic' ? '' : ''),
        }),
        h('td', { class: 'cat-role', text: n.role }),
        h('td', { text: n.coverage }),
      ])
    );
  }
  entTable.append(tbody);
  mount.append(wrapScroll(entTable));

  // --- relationships table -----------------------------------------------------------------
  const relTable = h('table', { class: 'cat-table' });
  relTable.append(
    h('caption', { text: 'Relationships' }),
    h('thead', {}, [
      h('tr', {}, [
        h('th', { scope: 'col', text: 'From' }),
        h('th', { scope: 'col', text: 'Relation' }),
        h('th', { scope: 'col', text: 'To' }),
        h('th', { scope: 'col', text: 'Pathway' }),
        h('th', { scope: 'col', text: 'Evidence' }),
        h('th', { scope: 'col', text: 'Sources' }),
      ]),
    ])
  );
  const rbody = h('tbody');
  for (const e of EDGES) {
    const from = nodeById.get(e.source);
    const to = nodeById.get(e.target);
    const srcCell = h('td');
    (e.sources || []).forEach((sid, i) => {
      const src = srcById.get(sid);
      if (i) srcCell.append(document.createTextNode('; '));
      if (src) {
        const a = h('a', {
          href: src.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          text: src.publisher,
        });
        srcCell.append(a);
      } else srcCell.append(document.createTextNode(sid));
    });
    rbody.append(
      h('tr', { class: `conf-${e.confidence}` }, [
        h('th', { scope: 'row', text: from ? from.name : e.source }),
        h('td', { text: e.relation }),
        h('td', { text: to ? to.name : e.target }),
        h('td', { text: e.pathway }),
        h('td', {}, [h('span', { class: `badge conf-${e.confidence}`, text: e.confidence })]),
        srcCell,
      ])
    );
  }
  relTable.append(rbody);
  mount.append(wrapScroll(relTable));
}

function wrapScroll(table) {
  return h('div', { class: 'table-scroll' }, [table]);
}
