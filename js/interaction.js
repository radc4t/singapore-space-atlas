// interaction.js — node focus / hover / keyboard state. Owns the "focus mode" visual application
// (highlight the selected node + its edges + connected nodes; dim the rest) by toggling classes.
// It does NOT render markup or compute geometry — it reacts to the shared store.

import { setState, state, subscribe } from './state.js';

export function initInteraction({ svg, nodeEls, edgeEls }) {
  // adjacency: node id -> { neighbours:Set, edges:[key] }
  const adj = new Map();
  const ensure = (id) => adj.get(id) || adj.set(id, { neighbours: new Set(), edges: [] }).get(id);
  for (const [key, pathEl] of edgeEls) {
    const s = pathEl.getAttribute('data-source');
    const t = pathEl.getAttribute('data-target');
    ensure(s).neighbours.add(t);
    ensure(t).neighbours.add(s);
    ensure(s).edges.push(key);
    ensure(t).edges.push(key);
  }

  // wire node events
  for (const [id, refs] of nodeEls) {
    const g = refs.group;
    g.addEventListener('click', () => selectToggle(id));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectToggle(id);
      } else if (e.key === 'Escape') {
        setState({ selection: null });
      }
    });
    g.addEventListener('mouseenter', () => setState({ hovered: id }));
    g.addEventListener('mouseleave', () => setState({ hovered: null }));
  }

  // clicking empty SVG space clears focus
  svg.addEventListener('click', (e) => {
    if (e.target === svg) setState({ selection: null });
  });

  function selectToggle(id) {
    setState({ selection: state.selection === id ? null : id });
  }

  function apply() {
    const sel = state.selection;
    svg.classList.toggle('has-focus', !!sel);
    svg.classList.toggle('show-inferred', !!state.showInferred);

    const connected = sel ? (adj.get(sel)?.neighbours ?? new Set()) : new Set();
    const activeEdges = sel ? new Set(adj.get(sel)?.edges ?? []) : new Set();

    for (const [id, refs] of nodeEls) {
      refs.group.classList.toggle('is-selected', id === sel);
      refs.group.classList.toggle('is-connected', connected.has(id));
      // visibility filter (type toggles + search) is applied in filters.js via .is-hidden
      if (id === sel) refs.group.setAttribute('aria-current', 'true');
      else refs.group.removeAttribute('aria-current');
    }
    for (const [key, pathEl] of edgeEls) {
      pathEl.classList.toggle('is-active', activeEdges.has(key));
    }
  }

  subscribe(apply);
  apply();
  return { adjacency: adj };
}
