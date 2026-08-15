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

// two-digit, so single counts (e.g. inferred = 3) don't read as a stray digit beside the pairs
const pad = (n) => String(n).padStart(2, '0');

function stat(parent, value, label) {
  const row = document.createElement('div');
  row.className = 'readout';
  const v = document.createElement('span');
  v.className = 'readout-val';
  v.textContent = value;
  row.append(v);
  if (label) {
    const l = document.createElement('span');
    l.className = 'readout-lab';
    l.textContent = label;
    row.append(l);
  }
  parent.append(row);
}

// one ontological cluster: a quiet mono header carries the noun, so the rows below can be terse
function group(mount, head, rows) {
  const g = document.createElement('div');
  g.className = 'readout-group';
  const h = document.createElement('span');
  h.className = 'readout-head';
  h.textContent = head;
  g.append(h);
  for (const [value, label] of rows) stat(g, value, label);
  mount.append(g);
}

export function initReadouts(mount) {
  const featured = NODES.filter((n) => n.coverage === 'featured').length;
  const documented = EDGES.filter((e) => e.confidence === 'documented').length;
  const inferred = EDGES.filter((e) => e.confidence === 'inferred').length;

  const head = document.createElement('h4');
  head.className = 'panel-title';
  head.textContent = 'Readouts';
  mount.append(head);

  group(mount, 'Entities', [
    [pad(NODES.length), 'cited'],
    [pad(featured), 'featured'],
  ]);
  group(mount, 'Relationships', [
    [pad(documented), 'documented'],
    [pad(inferred), 'inferred'],
  ]);
  group(mount, 'Sources', [[pad(SOURCES.length), '']]);

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
