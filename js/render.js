// render.js — SVG RENDERING ONLY. Declarative build from the layout IR. No layout math, no
// interaction state (those live in layout.js / interaction.js).
//
// Editorial-cartography treatment: construction-line rings (ticks + faint radials), NSAS as a
// concentric anchor (not a bubble), programme instrument-plaques, capability-cluster envelopes,
// international outward continuation lines, corner registration marks. Colour lives on NODES; edges
// are neutral (stroke = pathway, opacity = confidence). Node size = editorial prominence (close
// tiers, felt not read). Every element has a job.

const SVGNS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const c of children) node.append(c);
  return node;
}

// Editorial-prominence tiers — deliberately close (felt, not a ranking). Not degree-driven.
function radiusFor(node) {
  if (node.type === 'academia' || node.type === 'government') return 8;
  if (node.type === 'international') return 7.5;
  return 7; // companies
}

const edgeKey = (e) => `${e.source}|${e.target}|${e.edge.relation}`;
const pol = (r, a) => [r * Math.cos(a), r * Math.sin(a)];

// Shortest available alias for the map label (breathing room; full names live in catalogue/inspector).
function shortLabel(n) {
  const cands = (n.aliases && n.aliases.length ? n.aliases : [n.name]).slice();
  cands.sort((a, b) => a.length - b.length);
  return cands[0];
}

function arcPath(a0, a1, rIn, rOut) {
  const [x0o, y0o] = pol(rOut, a0);
  const [x1o, y1o] = pol(rOut, a1);
  const [x1i, y1i] = pol(rIn, a1);
  const [x0i, y0i] = pol(rIn, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0o.toFixed(1)} ${y0o.toFixed(1)} A ${rOut} ${rOut} 0 ${large} 1 ${x1o.toFixed(1)} ${y1o.toFixed(1)} L ${x1i.toFixed(1)} ${y1i.toFixed(1)} A ${rIn} ${rIn} 0 ${large} 0 ${x0i.toFixed(1)} ${y0i.toFixed(1)} Z`;
}

const anchorFor = (a) => (Math.cos(a) > 0.35 ? 'start' : Math.cos(a) < -0.35 ? 'end' : 'middle');

/**
 * Render the Atlas SVG into `mount`.
 * @returns {{ svg, nodeEls: Map, edgeEls: Map, labelEls: Map }}
 */
export function renderAtlas(mount, ir) {
  mount.replaceChildren();
  const EXT = ir.extent;

  const svg = el('svg', {
    viewBox: ir.viewBox,
    class: 'atlas-svg',
    role: 'img',
    'aria-label':
      "Systems map of Singapore's space ecosystem: NSAS at the centre, surrounded by institutional, capability, industry and international layers.",
  });

  // Soft NSAS bloom (dark-only; CSS hides it in light). A surface effect BEHIND the anchor —
  // desaturated blue-green, huge/soft/low-opacity, no pulse. Blur via an SVG filter.
  const defs = el('defs');
  const blur = el('filter', {
    id: 'nsas-bloom',
    x: '-80%',
    y: '-80%',
    width: '260%',
    height: '260%',
  });
  blur.append(el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '26' }));
  defs.append(blur);
  svg.append(defs);
  svg.append(
    el('circle', { cx: 0, cy: 0, r: 84, class: 'nsas-bloom', filter: 'url(#nsas-bloom)' })
  );

  const gConstruct = el('g', { class: 'layer-construction', 'aria-hidden': 'true' });
  const gSectors = el('g', { class: 'layer-sectors', 'aria-hidden': 'true' });
  const gClusters = el('g', { class: 'layer-clusters', 'aria-hidden': 'true' });
  const gEdges = el('g', { class: 'layer-edges', 'aria-hidden': 'true' });
  const gNodes = el('g', { class: 'layer-nodes' });
  const gPlate = el('g', { class: 'layer-plate', 'aria-hidden': 'true' });
  svg.append(gConstruct, gSectors, gClusters, gEdges, gNodes, gPlate);

  // --- construction: rings + ticks + faint radials -----------------------------------------
  const ringR = ir.ringBounds.map((r) => r.radius).filter((r) => r > 0);
  const maxR = Math.max(...ringR);
  for (let k = 0; k < 8; k++) {
    const [x, y] = pol(maxR, (k / 8) * Math.PI * 2);
    gConstruct.append(
      el('line', { x1: 0, y1: 0, x2: x.toFixed(1), y2: y.toFixed(1), class: 'radial-guide' })
    );
  }
  ir.ringBounds.forEach((rb, i) => {
    if (rb.radius <= 0) return;
    gConstruct.append(
      el('circle', {
        cx: 0,
        cy: 0,
        r: rb.radius,
        class: i === 4 ? 'ring-guide dashed' : 'ring-guide',
      })
    );
    const ticks = 72;
    for (let k = 0; k < ticks; k++) {
      const a = (k / ticks) * Math.PI * 2;
      const inr = rb.radius - (k % 6 === 0 ? 5 : 2.5);
      const [x1, y1] = pol(rb.radius, a);
      const [x2, y2] = pol(inr, a);
      gConstruct.append(
        el('line', {
          x1: x1.toFixed(1),
          y1: y1.toFixed(1),
          x2: x2.toFixed(1),
          y2: y2.toFixed(1),
          class: 'ring-tick',
        })
      );
    }
  });

  // --- ambient supporting sectors (faint arcs + labels; context, not actors) ---------------
  for (const s of ir.sectorArcs) {
    gSectors.append(
      el('path', {
        d: arcPath(s.startAngle, s.endAngle, s.innerR, s.outerR),
        class: 'sector-arc',
        'data-id': s.id,
      })
    );
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

  // Capability clusters are conveyed by contiguous same-activity placement + the Catalogue's
  // per-company cluster. On-map cluster envelopes/labels were dropped: with this corpus one cluster
  // (satellite systems, 7 of 13) spans half the ring, so a centroid label misleads. Corpus veto.
  void gClusters;

  // --- edges (neutral; stroke = pathway, opacity = confidence) ------------------------------
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

  // --- international outward continuation lines (Singapore → wider ecosystem) ---------------
  for (const p of ir.nodePositions.values()) {
    if (p.ring !== 4) continue;
    const [x2, y2] = pol(EXT - 26, p.angle);
    gConstruct.append(
      el('line', {
        x1: p.x.toFixed(1),
        y1: p.y.toFixed(1),
        x2: x2.toFixed(1),
        y2: y2.toFixed(1),
        class: 'outward',
      })
    );
  }

  // --- nodes -------------------------------------------------------------------------------
  const nodeEls = new Map();
  const labelEls = new Map();
  for (const p of ir.nodePositions.values()) {
    const n = p.node;

    // NSAS anchor — concentric target + dot + generous whitespace + ORIGIN. Not a bubble.
    if (n.type === 'agency') {
      const g = el('g', {
        class: 'node type-agency kind-organisation scope-domestic anchor',
        transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`,
        'data-id': n.id,
        'data-ring': '0',
        'data-type': 'agency',
      });
      g.append(el('circle', { cx: 0, cy: 0, r: 24, class: 'anchor-ring' }));
      g.append(el('circle', { cx: 0, cy: 0, r: 15, class: 'anchor-ring' }));
      g.append(el('circle', { cx: 0, cy: 0, r: 6, class: 'anchor-dot' }));
      // transparent hit target (focusable control; large enough to click the whole anchor)
      const hit = el('circle', {
        cx: 0,
        cy: 0,
        r: 26,
        class: 'node-shape anchor-hit',
        tabindex: '0',
        role: 'img',
        'aria-label': `${n.name}. ${n.role}.`,
      });
      g.append(hit);
      const name = el('text', { x: 0, y: 42, class: 'anchor-name', 'text-anchor': 'middle' });
      name.textContent = n.aliases?.[0] || 'NSAS';
      const sub = el('text', { x: 0, y: 56, class: 'anchor-sub', 'text-anchor': 'middle' });
      sub.textContent = 'NATIONAL SPACE AGENCY';
      const origin = el('text', { x: 32, y: -26, class: 'anchor-origin', 'text-anchor': 'start' });
      origin.textContent = 'ORIGIN';
      g.append(name, sub, origin);
      gNodes.append(g);
      nodeEls.set(n.id, { group: g, shape: hit, label: name });
      labelEls.set(n.id, name);
      continue;
    }

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

    const shapeAttrs = {
      class: 'node-shape',
      tabindex: '0',
      role: 'img',
      'aria-label': `${n.name}. ${n.role}.`,
    };
    let shape;
    if (n.kind === 'programme') {
      const w = 44;
      const h = 19;
      shape = el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 1.5, ...shapeAttrs });
    } else {
      shape = el('circle', { cx: 0, cy: 0, r: radiusFor(n), ...shapeAttrs });
    }
    g.append(shape);

    // label
    const label = el('text', { class: 'node-label' });
    if (n.kind === 'programme') {
      // plaque label sits inside the plaque (mono)
      label.setAttribute('x', '0');
      label.setAttribute('y', '3.5');
      label.setAttribute('text-anchor', 'middle');
      label.classList.add('plaque-label');
      label.textContent = shortLabel(n);
    } else {
      const outX = Math.cos(p.angle);
      const outY = Math.sin(p.angle);
      const off = radiusFor(n) + 6;
      label.setAttribute('x', (outX * off).toFixed(1));
      label.setAttribute('y', (outY * off + 3.5).toFixed(1));
      label.setAttribute('text-anchor', anchorFor(p.angle));
      if (p.ring >= 3) label.classList.add('tertiary'); // companies = tertiary labels
      label.textContent = shortLabel(n);
    }
    g.append(label);

    gNodes.append(g);
    nodeEls.set(n.id, { group: g, shape, label });
    labelEls.set(n.id, label);
  }

  // --- corner registration marks + plate metadata (closed vocabulary) ----------------------
  const m = EXT - 16;
  const arm = 18;
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    gPlate.append(
      el('line', {
        x1: (sx * m).toFixed(1),
        y1: (sy * m).toFixed(1),
        x2: (sx * (m - arm)).toFixed(1),
        y2: (sy * m).toFixed(1),
        class: 'reg-mark',
      })
    );
    gPlate.append(
      el('line', {
        x1: (sx * m).toFixed(1),
        y1: (sy * m).toFixed(1),
        x2: (sx * m).toFixed(1),
        y2: (sy * (m - arm)).toFixed(1),
        class: 'reg-mark',
      })
    );
  }
  const meta = (x, y, anchor, text) => {
    const t = el('text', {
      x: x.toFixed(1),
      y: y.toFixed(1),
      class: 'plate-meta',
      'text-anchor': anchor,
    });
    t.textContent = text;
    gPlate.append(t);
  };
  meta(-m + arm + 6, -m + 4, 'start', 'ATLAS / 2026');
  meta(m - arm - 6, m - 2, 'end', 'SG / 01');
  meta(-m + arm + 6, m - 2, 'start', 'PLATE / ECOSYSTEM');

  mount.append(svg);
  return { svg, nodeEls, edgeEls, labelEls };
}

export { edgeKey };
