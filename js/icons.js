// icons.js — the Atlas's tiny inline-SVG icon set for interface chrome (theme toggle, guided
// tour). Deliberately finite: only the affordances the app actually has. Keeping the surface
// small is what keeps the UI authored rather than a mini icon-framework — so the public API is
// exactly one function, with no variants, stroke overrides, class args or composition.
//
// Geometry vendored verbatim from Iconoir (https://iconoir.com — MIT License): a 24px grid with
// a 1.5px stroke, chosen because it matches the Atlas's own SVG stroke grammar (the seal, the
// node rings). Any per-icon optical correction lives in that icon's own `tf` transform here —
// never at the call site, and never by rewriting the vendored path data.
//
// Built with createElementNS (no innerHTML), mirroring the DOM-only h()/el() helpers used
// elsewhere (js/filters.js, js/catalogue.js, js/inspector.js).

const SVGNS = 'http://www.w3.org/2000/svg';

// name → { d: [path strings], tf?: in-definition optical-correction transform }
const ICONS = {
  // Iconoir "half-moon"
  moon: {
    d: [
      'M3 11.5066C3 16.7497 7.25034 21 12.4934 21C16.2209 21 19.4466 18.8518 21 15.7259C12.4934 15.7259 8.27411 11.5066 8.27411 3C5.14821 4.55344 3 7.77915 3 11.5066Z',
    ],
  },
  // Iconoir "sun-light"
  sun: {
    d: [
      'M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z',
      'M22 12L23 12',
      'M12 2V1',
      'M12 23V22',
      'M20 20L19 19',
      'M20 4L19 5',
      'M4 20L5 19',
      'M4 4L5 5',
      'M1 12L2 12',
    ],
  },
  // Iconoir "arrow-left"
  'arrow-left': { d: ['M21 12L3 12M3 12L11.5 3.5M3 12L11.5 20.5'] },
  // Iconoir "arrow-right"
  'arrow-right': { d: ['M3 12L21 12M21 12L12.5 3.5M21 12L12.5 20.5'] },
  // Iconoir "play" — a right-pointing triangle reads right-heavy in a footprint; nudge left ~0.6.
  play: {
    d: [
      'M6.90588 4.53682C6.50592 4.2998 6 4.58808 6 5.05299V18.947C6 19.4119 6.50592 19.7002 6.90588 19.4632L18.629 12.5162C19.0211 12.2838 19.0211 11.7162 18.629 11.4838L6.90588 4.53682Z',
    ],
    tf: 'translate(-0.6 0)',
  },
};

export function icon(name, { size = 16 } = {}) {
  const def = ICONS[name];
  if (!def) throw new Error(`icon: unknown "${name}"`);
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const parent = def.tf ? document.createElementNS(SVGNS, 'g') : svg;
  if (def.tf) {
    parent.setAttribute('transform', def.tf);
    svg.append(parent);
  }
  for (const d of def.d) {
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', d);
    parent.append(p);
  }
  return svg;
}
