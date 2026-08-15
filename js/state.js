// state.js — the single shared application store. A tiny observable: modules read `state`, call
// `setState(patch)`, and `subscribe(fn)` to react. Keeping selection/filters/evidence here is what
// makes deep-links (router.js), the inspector, the catalogue and story mode all stay in sync.

import { TYPES } from './config.js';

const listeners = new Set();

export const state = {
  view: 'explore', // 'explore' | 'catalogue' | 'methodology' — orthogonal to selection
  selection: null, // node id in focus, or null (persists globally; each view decides to render it)
  hovered: null, // node id hovered, or null
  showInferred: false, // reveal inferred-confidence edges
  query: '', // search text
  hiddenTypes: new Set(), // visual-taxonomy types toggled OFF
  story: null, // active story step index, or null
};

export function setState(patch) {
  Object.assign(state, patch);
  for (const fn of listeners) fn(state);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function toggleType(type) {
  const next = new Set(state.hiddenTypes);
  if (next.has(type)) next.delete(type);
  else next.add(type);
  setState({ hiddenTypes: next });
}

export const isTypeVisible = (type) => !state.hiddenTypes.has(type);
export const ALL_TYPES = TYPES;
