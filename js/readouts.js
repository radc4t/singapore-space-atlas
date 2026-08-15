// readouts.js — the right panel's default state: a SPARSE set of honest, derived facts (not an
// analytics dashboard). It yields to the Inspector when a node is selected (one panel, two modes).

import { DATA_SNAPSHOT, EDGES, NODES } from './data/ecosystem.js';
import { SOURCES } from './data/sources.js';
import { state, subscribe } from './state.js';

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

function stat(mount, value, label) {
  const row = document.createElement('div');
  row.className = 'readout';
  const v = document.createElement('span');
  v.className = 'readout-val';
  v.textContent = value;
  const l = document.createElement('span');
  l.className = 'readout-lab';
  l.textContent = label;
  row.append(v, l);
  mount.append(row);
}

export function initReadouts(mount) {
  const featured = NODES.filter((n) => n.coverage === 'featured').length;
  const documented = EDGES.filter((e) => e.confidence === 'documented').length;
  const inferred = EDGES.filter((e) => e.confidence === 'inferred').length;

  const head = document.createElement('h4');
  head.className = 'panel-title';
  head.textContent = 'Readouts';
  mount.append(head);

  stat(mount, String(NODES.length), 'cited entities');
  stat(mount, String(featured), 'featured');
  stat(mount, String(documented), 'documented relationships');
  stat(mount, String(inferred), 'inferred relationships');
  stat(mount, String(SOURCES.length), 'sources');

  const snap = document.createElement('p');
  snap.className = 'readout-snap';
  snap.textContent = `Research snapshot · ${snapshotLabel(DATA_SNAPSHOT)}`;
  mount.append(snap);

  // yields to the inspector when a node is selected
  subscribe(() => {
    mount.hidden = !!state.selection;
  });
  mount.hidden = !!state.selection;
}
