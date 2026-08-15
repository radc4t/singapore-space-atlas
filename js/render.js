// render.js — SVG RENDERING ONLY. Declarative build from the layout IR. No layout math, no
// interaction state (those live in layout.js / interaction.js). Returns element handles so other
// modules can attach behaviour and toggle classes.
//
// Visual grammar (see plan): colour = type · shape = kind (+ scope outline variant) ·
// stroke = pathway · opacity = confidence · position = structural layer.

const SVGNS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const c of children) node.append(c);
  return node;
}

// Semantic node radius (kept mostly uniform so the map isn't a centrality chart).
function radiusFor(node) {
  if (node.type === 'agency') return 30; // NSAS — structural + editorial anchor
  if (node.kind === 'programme') return 15;
  return 15;
}

const edgeKey = (e) => `${e.source}|${e.target}|${e.edge.relation}`;

/** Annular-sector path for an ambient sector arc. */
function arcPath(cx, cy, a0, a1, rIn, rOut) {
  const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0o, y0o] = p(rOut, a0);
  const [x1o, y1o] = p(rOut, a1);
  const [x1i, y1i] = p(rIn, a1);
  const [x0i, y0i] = p(rIn, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M ${x0o.toFixed(1)} ${y0o.toFixed(1)}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${x1o.toFixed(1)} ${y1o.toFixed(1)}`,
    `L ${x1i.toFixed(1)} ${y1i.toFixed(1)}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${x0i.toFixed(1)} ${y0i.toFixed(1)}`,
    'Z',
  ].join(' ');
}

/**
 * Render the Atlas SVG into `mount`.
 * @returns {{ svg, nodeEls: Map, edgeEls: Map, labelEls: Map }}
 */
export function renderAtlas(mount, ir) {
  mount.replaceChildren();

  const svg = el('svg', {
    viewBox: ir.viewBox,
    class: 'atlas-svg',
    role: 'img',
    'aria-label':
      "Systems map of Singapore's space ecosystem: NSAS at the centre, surrounded by government, research, industry and international layers.",
  });

  const gRings = el('g', { class: 'layer-rings', 'aria-hidden': 'true' });
  const gSectors = el('g', { class: 'layer-sectors', 'aria-hidden': 'true' });
  const gEdges = el('g', { class: 'layer-edges', 'aria-hidden': 'true' });
  const gNodes = el('g', { class: 'layer-nodes' });
  svg.append(gRings, gSectors, gEdges, gNodes);

  // --- ring guide circles + captions -------------------------------------------------------
  for (const rb of ir.ringBounds) {
    if (rb.radius > 0) {
      gRings.append(el('circle', { cx: 0, cy: 0, r: rb.radius, class: 'ring-guide' }));
      // caption sits at the top of each ring
      const label = el('text', {
        x: 0,
        y: -rb.radius - 8,
        class: 'ring-caption',
        'text-anchor': 'middle',
      });
      label.textContent = rb.label;
      gRings.append(label);
    }
  }

  // --- ambient sector arcs (context, not actors) -------------------------------------------
  for (const s of ir.sectorArcs) {
    const path = el('path', {
      d: arcPath(0, 0, s.startAngle, s.endAngle, s.innerR, s.outerR),
      class: 'sector-arc',
      'data-id': s.id,
    });
    const t = el('title');
    t.textContent = `${s.node.name} — supporting sector`;
    path.append(t);
    gSectors.append(path);

    const label = el('text', {
      x: s.labelX.toFixed(1),
      y: s.labelY.toFixed(1),
      class: 'sector-label',
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
    });
    label.textContent = s.node.name;
    gSectors.append(label);
  }

  // --- edges (stroke = pathway, opacity = confidence) --------------------------------------
  const edgeEls = new Map();
  for (const ep of ir.edgePaths) {
    const path = el('path', {
      d: ep.d,
      class: `edge pathway-${ep.pathway} confidence-${ep.confidence}`,
      'data-source': ep.source,
      'data-target': ep.target,
      fill: 'none',
    });
    edgeEls.set(edgeKey(ep), path);
    gEdges.append(path);
  }

  // --- nodes (colour = type, shape = kind + scope) -----------------------------------------
  const nodeEls = new Map();
  const labelEls = new Map();
  for (const p of ir.nodePositions.values()) {
    const n = p.node;
    const outlined = n.scope === 'international';
    const g = el('g', {
      class: [
        'node',
        `type-${n.type}`,
        `kind-${n.kind}`,
        outlined ? 'scope-international' : 'scope-domestic',
      ].join(' '),
      transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`,
      'data-id': n.id,
      'data-ring': String(p.ring),
      'data-type': n.type,
    });

    // The interactive control is the SHAPE. It is keyboard-focusable and named; we intentionally
    // do NOT put role="button" on an SVG shape (assistive-tech mapping is uneven and it trips
    // false nested-interactive flags) — the semantic HTML Catalogue is the canonical accessible
    // representation of the same data. `img` role + aria-label gives the shape an accessible name.
    const shapeAttrs = {
      class: 'node-shape',
      tabindex: '0',
      role: 'img',
      'aria-label': `${n.name}. ${n.role}.`,
    };
    let shape;
    if (n.kind === 'programme') {
      const w = 34;
      const h = 20;
      shape = el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, ...shapeAttrs });
    } else {
      shape = el('circle', { cx: 0, cy: 0, r: radiusFor(n), ...shapeAttrs });
    }
    g.append(shape);

    // editorial-prominence halo for the central anchor (not degree-driven size)
    if (n.type === 'agency') {
      g.append(el('circle', { cx: 0, cy: 0, r: radiusFor(n) + 8, class: 'node-halo' }));
    }

    // label, placed radially outward so it clears the ring
    const outX = p.ring === 0 ? 0 : Math.cos(p.angle);
    const outY = p.ring === 0 ? 1 : Math.sin(p.angle);
    const lx = outX * (radiusFor(n) + 6);
    const ly = outY * (radiusFor(n) + 6);
    const anchor = p.ring === 0 ? 'middle' : outX > 0.3 ? 'start' : outX < -0.3 ? 'end' : 'middle';
    const label = el('text', {
      x: lx.toFixed(1),
      y: (ly + 4).toFixed(1),
      class: 'node-label',
      'text-anchor': anchor,
    });
    label.textContent = n.aliases && n.aliases.length ? n.aliases[0] : n.name;
    g.append(label);

    gNodes.append(g);
    nodeEls.set(n.id, { group: g, shape, label });
    labelEls.set(n.id, label);
  }

  mount.append(svg);
  return { svg, nodeEls, edgeEls, labelEls };
}

export { edgeKey };
