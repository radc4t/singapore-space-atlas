// views.js — Explore / Catalogue / Methodology as real view switches (no framework). The `view`
// field is orthogonal to `selection`: selection persists globally, each view decides whether to
// render it. The operating-state label is derived purely from state — real app state, not telemetry.

import { NODES } from './data/ecosystem.js';
import { setState, state, subscribe } from './state.js';

const nameById = new Map(NODES.map((n) => [n.id, n.aliases?.[0] || n.name]));

export function initViews({ navLinks, sections, label }) {
  for (const a of navLinks) {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      setState({ view: a.dataset.view });
    });
  }

  function apply() {
    const view = state.view || 'explore';
    for (const a of navLinks) {
      const on = a.dataset.view === view;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
    for (const [name, el] of Object.entries(sections)) {
      if (el) el.hidden = name !== view;
    }
    if (label) {
      if (view === 'explore') {
        label.textContent = state.selection
          ? `INSPECT · ${(nameById.get(state.selection) || state.selection).toUpperCase()}`
          : 'EXPLORE';
      } else {
        label.textContent = view.toUpperCase();
      }
    }
  }

  subscribe(apply);
  apply();
}
