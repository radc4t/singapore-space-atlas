// layout.js — GEOMETRY ONLY. Deterministic refined-hybrid layout (chosen in Phase C.5):
//   ring = structural layer · angle = cluster wedge for companies, spread evenly (no collisions)
//   inner-ring nodes ordered near the neighbours they connect to (fewer crossings).
//
// Returns a rich intermediate representation so render.js can stay purely declarative:
//   { nodePositions, ringBounds, sectorArcs, edgePaths, viewBox, center }
//
// No DOM, no rendering — pure functions of the data. Only FEATURED nodes are placed on the map;
// catalogued entities live in the Catalogue, not the rings.

import { CLUSTERS, LAYERS } from './config.js';
import { EDGES, NODES } from './data/ecosystem.js';

const TAU = Math.PI * 2;

// Ring radii (px, from centre). Index = structural layer 0..4.
const RING_R = [0, 150, 270, 400, 495];
const SECTOR_INNER = 530;
const SECTOR_OUTER = 585;
const EXTENT = 700; // half-size of the square viewBox

/** Structural layer (ring index) for a node, or null for ambient sectors. */
export function ringOf(n) {
  if (n.kind === 'sector') return null;
  if (n.id === 'nsas') return 0;
  if (n.type === 'government' || n.kind === 'programme') return 1;
  if (n.type === 'academia') return 2;
  if (n.cluster) return 3; // any company with a cluster (domestic or MNC)
  if (n.type === 'international') return 4; // international agencies/bodies
  return 1;
}

const featured = (n) => n.coverage === 'featured';
const byId = new Map(NODES.map((n) => [n.id, n]));

function neighbourAngle(id, adj, angleOf) {
  const nbrs = (adj.get(id) || []).map((x) => angleOf.get(x)).filter((a) => a != null);
  if (!nbrs.length) return null;
  const s = nbrs.reduce((acc, a) => acc + Math.sin(a), 0);
  const c = nbrs.reduce((acc, a) => acc + Math.cos(a), 0);
  return (Math.atan2(s, c) + TAU) % TAU;
}

/**
 * Compute the layout IR. Deterministic: same data → same coordinates.
 * @param {object} [opts] { nodes, edges } overrides for testing.
 */
export function computeLayout(opts = {}) {
  const nodes = (opts.nodes ?? NODES).filter(featured);
  const edges = opts.edges ?? EDGES;

  const rings = [[], [], [], [], []];
  const sectors = [];
  for (const n of nodes) {
    const r = ringOf(n);
    if (r == null) sectors.push(n);
    else rings[r].push(n);
  }

  const angleOf = new Map();
  const pos = new Map();

  // Ring 0 — NSAS at centre.
  for (const n of rings[0]) {
    angleOf.set(n.id, 0);
    pos.set(n.id, { id: n.id, node: n, x: 0, y: 0, ring: 0, angle: 0, r: 0 });
  }

  // Ring 3 — companies, grouped by cluster (contiguous) then spread EVENLY around the circle.
  // Even spacing means crowded clusters simply occupy a wider arc → no label collisions.
  const ring3 = [...rings[3]].sort((a, b) => {
    const ca = CLUSTERS.indexOf(a.cluster) - CLUSTERS.indexOf(b.cluster);
    return ca !== 0 ? ca : a.id.localeCompare(b.id);
  });
  ring3.forEach((n, i) => {
    const a = (i / Math.max(1, ring3.length)) * TAU - Math.PI / 2; // start at top
    angleOf.set(n.id, (a + TAU) % TAU);
  });

  // Inner/outer rings (1,2,4) — order each ring by the mean angle of its neighbours so connected
  // nodes sit radially aligned (fewer crossings); nodes without neighbours keep a stable order.
  const adj = new Map();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source).push(e.target);
    adj.get(e.target).push(e.source);
  }
  for (const ring of [3, 2, 1, 4]) {
    if (ring === 3) continue; // already placed
    const list = rings[ring].map((n) => {
      const na = neighbourAngle(n.id, adj, angleOf);
      return { n, key: na == null ? Number.POSITIVE_INFINITY : na, hasNbr: na != null };
    });
    // stable: neighbour-ordered first (by angle), then the rest alphabetically.
    list.sort((a, b) => {
      if (a.hasNbr !== b.hasNbr) return a.hasNbr ? -1 : 1;
      if (a.hasNbr) return a.key - b.key;
      return a.n.id.localeCompare(b.n.id);
    });
    list.forEach(({ n }, i) => {
      const a = (i / Math.max(1, list.length)) * TAU - Math.PI / 2;
      angleOf.set(n.id, (a + TAU) % TAU);
    });
  }

  // Materialise positions for rings 1,2,4.
  for (const ring of [1, 2, 4]) {
    for (const n of rings[ring]) {
      const a = angleOf.get(n.id);
      pos.set(n.id, {
        id: n.id,
        node: n,
        x: RING_R[ring] * Math.cos(a),
        y: RING_R[ring] * Math.sin(a),
        ring,
        angle: a,
        r: RING_R[ring],
      });
    }
  }
  for (const n of ring3) {
    const a = angleOf.get(n.id);
    pos.set(n.id, {
      id: n.id,
      node: n,
      x: RING_R[3] * Math.cos(a),
      y: RING_R[3] * Math.sin(a),
      ring: 3,
      angle: a,
      r: RING_R[3],
    });
  }

  // Ring captions (structural layers). LAYERS index maps to ring index 0..4.
  const ringBounds = LAYERS.map((layer, i) => ({
    ring: i,
    radius: RING_R[i],
    id: layer.id,
    label: layer.label,
    subtitle: layer.subtitle,
  }));

  // Sector arcs — ambient outer band, one quadrant each (context, not actors).
  const sectorArcs = [];
  sectors.forEach((n, i) => {
    const start = (i / sectors.length) * TAU - Math.PI / 2;
    const end = ((i + 1) / sectors.length) * TAU - Math.PI / 2;
    const mid = (start + end) / 2;
    const midR = (SECTOR_INNER + SECTOR_OUTER) / 2;
    sectorArcs.push({
      id: n.id,
      node: n,
      startAngle: start + 0.02,
      endAngle: end - 0.02,
      innerR: SECTOR_INNER,
      outerR: SECTOR_OUTER,
      labelX: midR * Math.cos(mid),
      labelY: midR * Math.sin(mid),
      labelAngle: mid,
    });
  });

  // Edge paths — quadratic curves; bow magnitude encodes pathway (visual grammar backup to stroke).
  const bow = { direct: 0.12, 'programme-mediated': 0.26, contextual: 0.42 };
  const edgePaths = [];
  for (const e of edges) {
    const a = pos.get(e.source);
    const b = pos.get(e.target);
    if (!a || !b) continue; // endpoint not on the map (shouldn't happen for featured-only edges)
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    // perpendicular offset, pushed outward from centre for a pleasing bow
    const nx = -dy / len;
    const ny = dx / len;
    const outward = mx * nx + my * ny >= 0 ? 1 : -1;
    const k = (bow[e.pathway] ?? 0.15) * len * outward;
    const cx = mx + nx * k;
    const cy = my + ny * k;
    edgePaths.push({
      edge: e,
      source: e.source,
      target: e.target,
      pathway: e.pathway,
      confidence: e.confidence,
      d: `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
    });
  }

  return {
    nodePositions: pos,
    ringBounds,
    sectorArcs,
    edgePaths,
    center: { x: 0, y: 0 },
    viewBox: `${-EXTENT} ${-EXTENT} ${EXTENT * 2} ${EXTENT * 2}`,
    extent: EXTENT,
  };
}

export { byId };
