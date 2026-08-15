// layout-stress.mjs — Phase C.5 "three ugly prototypes" stress test.
//
// Runs the REAL corpus through three candidate geometries and reports edge-crossing and
// label-collision estimates, so the composition is chosen by the evidence density rather than
// pre-ordained. Not a product; a decision aid. `npm run stress`.
//
//   A concentric    — ring = layer, angle = index within ring (arbitrary order)
//   B radial-sector — ring = layer, angle = cluster wedge (companies), others spread
//   C hybrid        — ring = layer, angle = cluster wedge, and within-ring ordering pulls
//                     connected nodes together (barycentre of neighbours)

import { EDGES, NODES } from '../js/data/ecosystem.js';
import { CLUSTERS } from '../js/config.js';

const TAU = Math.PI * 2;

// Ring (structural layer) assignment — mirrors LAYERS in config.js.
function ringOf(n) {
  if (n.kind === 'sector') return null; // ambient arcs, not ring nodes
  if (n.id === 'nsas') return 0;
  if (n.type === 'government' || n.type === 'programme' || n.kind === 'programme') return 1;
  if (n.type === 'academia') return 2;
  if (n.cluster) return 3; // any company (domestic or MNC) with a cluster
  if (n.type === 'international') return 4; // international agencies/bodies
  return 1;
}

const ringNodes = [[], [], [], [], []];
for (const n of NODES) {
  const r = ringOf(n);
  if (r != null) ringNodes[r].push(n);
}
const radius = [0, 1, 2, 3, 4].map((r) => (r === 0 ? 0 : 60 + r * 60));

// angle strategies -----------------------------------------------------------------------------
function anglesConcentric(nodes) {
  const m = new Map();
  nodes.forEach((n, i) => m.set(n.id, (i / Math.max(1, nodes.length)) * TAU));
  return m;
}

function clusterWedge(n, ring) {
  // Companies: wedge by cluster. Others: spread by index later.
  if (ring === 3 && n.cluster) {
    const idx = CLUSTERS.indexOf(n.cluster);
    return (idx + 0.5) / CLUSTERS.length; // fractional position of the wedge centre [0,1)
  }
  return null;
}

function anglesRadial(nodes, ring) {
  // Group by cluster wedge; within a wedge, fan out.
  const byWedge = new Map();
  nodes.forEach((n) => {
    const w = clusterWedge(n, ring);
    const key = w == null ? `_${n.id}` : w.toFixed(4);
    if (!byWedge.has(key)) byWedge.set(key, []);
    byWedge.get(key).push(n);
  });
  const m = new Map();
  for (const [key, group] of byWedge) {
    const base = key.startsWith('_') ? Math.random() : parseFloat(key);
    const span = 0.8 / CLUSTERS.length; // fan width within a wedge
    group.forEach((n, i) => {
      const off = group.length === 1 ? 0 : (i / (group.length - 1) - 0.5) * span;
      m.set(n.id, ((base + off) % 1) * TAU);
    });
  }
  return m;
}

function positions(strategy) {
  const pos = new Map();
  ringNodes.forEach((nodes, r) => {
    let angles;
    if (strategy === 'A') angles = anglesConcentric(nodes);
    else angles = anglesRadial(nodes, r); // B and C both start from cluster wedges
    for (const n of nodes) {
      const a = angles.get(n.id) ?? 0;
      pos.set(n.id, { x: radius[r] * Math.cos(a), y: radius[r] * Math.sin(a), r, a });
    }
  });
  if (strategy === 'C') barycentreReorder(pos);
  return pos;
}

// C: within each ring, reorder nodes so connected nodes sit nearer each other (one sweep).
function barycentreReorder(pos) {
  const adj = new Map();
  for (const e of EDGES) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source).push(e.target);
    adj.get(e.target).push(e.source);
  }
  for (let r = 1; r <= 4; r++) {
    const nodes = ringNodes[r];
    const desired = nodes.map((n) => {
      const nbrs = (adj.get(n.id) || []).map((id) => pos.get(id)).filter(Boolean);
      const bary = nbrs.length
        ? Math.atan2(avg(nbrs.map((p) => Math.sin(p.a))), avg(nbrs.map((p) => Math.cos(p.a))))
        : pos.get(n.id).a;
      return { n, bary: (bary + TAU) % TAU };
    });
    desired.sort((a, b) => a.bary - b.bary);
    desired.forEach(({ n }, i) => {
      const a = (i / Math.max(1, desired.length)) * TAU;
      pos.set(n.id, { x: radius[r] * Math.cos(a), y: radius[r] * Math.sin(a), r, a });
    });
  }
}

const avg = (xs) => xs.reduce((s, x) => s + x, 0) / (xs.length || 1);

// metrics --------------------------------------------------------------------------------------
function segsIntersect(p1, p2, p3, p4) {
  const d = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const d1 = d(p3, p4, p1),
    d2 = d(p3, p4, p2),
    d3 = d(p1, p2, p3),
    d4 = d(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function report(strategy) {
  const pos = positions(strategy);
  const segs = EDGES.map((e) => [pos.get(e.source), pos.get(e.target)]).filter(([a, b]) => a && b);
  let crossings = 0;
  for (let i = 0; i < segs.length; i++)
    for (let j = i + 1; j < segs.length; j++)
      if (segsIntersect(segs[i][0], segs[i][1], segs[j][0], segs[j][1])) crossings++;

  // label-collision proxy: pairs of same-ring nodes closer than a threshold arc distance.
  let collisions = 0;
  for (let r = 0; r <= 4; r++) {
    const ns = ringNodes[r].map((n) => pos.get(n.id)).filter(Boolean);
    for (let i = 0; i < ns.length; i++)
      for (let j = i + 1; j < ns.length; j++) {
        const dx = ns[i].x - ns[j].x,
          dy = ns[i].y - ns[j].y;
        if (Math.hypot(dx, dy) < 26) collisions++;
      }
  }
  return { strategy, crossings, collisions };
}

console.log('Singapore Space Atlas — layout stress test (Phase C.5)');
console.log(
  `  ${NODES.length} nodes, ${EDGES.length} edges, ${ringNodes.map((n) => n.length).join('/')} per ring (0..4)\n`
);
for (const s of ['A', 'B', 'C']) {
  const { crossings, collisions } = report(s);
  const label = { A: 'concentric   ', B: 'radial-sector', C: 'hybrid       ' }[s];
  console.log(`  ${s} ${label}  edge-crossings=${crossings}  label-collisions=${collisions}`);
}
