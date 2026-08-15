// filters.js — visibility, search (a command surface), and evidence controls. Builds the legend
// (type toggles), the "show inferred relationships" control, and the search box; applies node
// visibility by toggling `.is-hidden`. Search matches name · aliases · type · cluster · role, and
// featured nodes on the map plus catalogued nodes that live only in the data.

import { CLUSTER_LABELS, TYPE_LABELS, TYPES } from './config.js';
import { NODES } from './data/ecosystem.js';
import { setState, state, subscribe, toggleType } from './state.js';

const nodeById = new Map(NODES.map((n) => [n.id, n]));

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

function matches(n, q) {
  if (!q) return false;
  const hay = [n.name, n.role, n.type, n.cluster, ...(n.aliases || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

export function initFilters({ legend, search, results, evidenceToggle, reset, status, nodeEls }) {
  // --- legend chips (type toggles) ---------------------------------------------------------
  for (const type of TYPES) {
    const chip = h('button', {
      class: `legend-chip type-${type}`,
      type: 'button',
      'aria-pressed': 'true',
      'data-type': type,
    });
    chip.append(
      h('span', { class: `swatch type-${type}` }),
      h('span', { text: TYPE_LABELS[type] })
    );
    chip.addEventListener('click', () => toggleType(type));
    legend.append(chip);
  }

  // --- evidence toggle ---------------------------------------------------------------------
  evidenceToggle.addEventListener('change', () =>
    setState({ showInferred: evidenceToggle.checked })
  );

  // --- search (command surface) ------------------------------------------------------------
  search.addEventListener('input', () => setState({ query: search.value.trim() }));
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      search.value = '';
      setState({ query: '' });
    }
  });

  // --- reset view --------------------------------------------------------------------------
  reset.addEventListener('click', () => {
    search.value = '';
    setState({
      view: 'explore',
      selection: null,
      query: '',
      hiddenTypes: new Set(),
      story: null,
      showInferred: false,
    });
  });

  function renderResults() {
    results.replaceChildren();
    const q = state.query;
    if (!q) {
      results.hidden = true;
      return;
    }
    results.hidden = false;
    const hits = NODES.filter((n) => matches(n, q)).slice(0, 12);
    if (!hits.length) {
      results.append(
        h('p', { class: 'no-hit' }, [
          h('strong', { text: 'Not in this snapshot. ' }),
          document.createTextNode(
            'No entity in the current corpus matches — we did not find sufficiently specific public evidence to include it.'
          ),
        ])
      );
      return;
    }
    const list = h('ul', { class: 'result-list' });
    for (const n of hits) {
      const onMap = n.coverage === 'featured';
      const btn = h('button', { class: 'result', type: 'button', 'data-id': n.id }, [
        h('span', { class: `swatch type-${n.type}` }),
        h('span', { class: 'result-name', text: n.name }),
        h('span', {
          class: 'result-meta',
          text:
            (TYPE_LABELS[n.type] ?? n.type) +
            (n.cluster ? ` · ${CLUSTER_LABELS[n.cluster] ?? n.cluster}` : '') +
            (onMap ? '' : ' · catalogue'),
        }),
      ]);
      btn.addEventListener('click', () => setState({ view: 'explore', selection: n.id }));
      list.append(h('li', {}, [btn]));
    }
    results.append(list);
  }

  function applyVisibility() {
    const q = state.query;
    for (const [id, refs] of nodeEls) {
      const n = nodeById.get(id);
      const typeHidden = state.hiddenTypes.has(n.type);
      const searchHidden = q ? !matches(n, q) : false;
      refs.group.classList.toggle('is-hidden', typeHidden || searchHidden);
    }
    // legend pressed-state
    for (const chip of legend.querySelectorAll('.legend-chip')) {
      const on = !state.hiddenTypes.has(chip.dataset.type);
      chip.setAttribute('aria-pressed', String(on));
      chip.classList.toggle('is-off', !on);
    }
    // status line
    if (status) {
      const sel = state.selection ? nodeById.get(state.selection) : null;
      if (sel) {
        status.textContent = `Viewing: ${sel.name}`;
        status.hidden = false;
      } else if (q) {
        status.textContent = `Searching: “${q}”`;
        status.hidden = false;
      } else {
        status.hidden = true;
      }
    }
    evidenceToggle.checked = state.showInferred;
    // keep the search box in sync with restored/cleared query state (e.g. ?q= deep links),
    // but never clobber what the user is actively typing.
    if (document.activeElement !== search) search.value = state.query;
  }

  subscribe(() => {
    renderResults();
    applyVisibility();
  });
  applyVisibility();
}
