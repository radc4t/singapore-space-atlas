// router.js — shareable deep links. Serialises selection + filters + evidence + search into the
// URL query, and restores that state on load. Uses replaceState (no history spam). This is why a
// link like ?node=speqtral opens straight into that focused state.

import { setState, state, subscribe } from './state.js';
import { TYPES } from './config.js';
import { NODES } from './data/ecosystem.js';

const validType = new Set(TYPES);
const validView = new Set(['explore', 'catalogue', 'methodology']);
const validNodeIds = new Set(NODES.map((n) => n.id));

export function readURL() {
  const p = new URLSearchParams(location.search);
  const patch = {};
  if (validView.has(p.get('view'))) patch.view = p.get('view');
  if (p.has('node') && validNodeIds.has(p.get('node'))) patch.selection = p.get('node');
  if (p.has('q')) patch.query = p.get('q') || '';
  if (p.get('inferred') === '1') patch.showInferred = true;
  if (p.has('hide')) {
    const hidden = new Set(
      (p.get('hide') || '')
        .split(',')
        .map((t) => t.trim())
        .filter((t) => validType.has(t))
    );
    patch.hiddenTypes = hidden;
  }
  return patch;
}

function writeURL() {
  const p = new URLSearchParams();
  if (state.view && state.view !== 'explore') p.set('view', state.view); // canonical / = explore
  if (state.selection) p.set('node', state.selection);
  if (state.query) p.set('q', state.query);
  if (state.showInferred) p.set('inferred', '1');
  if (state.hiddenTypes.size) p.set('hide', [...state.hiddenTypes].join(','));
  const qs = p.toString();
  const url = qs ? `${location.pathname}?${qs}` : location.pathname;
  history.replaceState(null, '', url);
}

export function initRouter() {
  // apply URL → state first
  const patch = readURL();
  if (Object.keys(patch).length) setState(patch);
  // then keep URL in sync with state
  subscribe(writeURL);
  writeURL();
}
