// app.js — bootstrap / controller. Orchestrates the data-driven modules on the shared store.
// Strict module boundaries: geometry, rendering, interaction, filtering, inspection, readouts,
// cataloguing, views, routing and story each live in their own module.

import { computeLayout, ringOf } from './layout.js';
import { renderAtlas } from './render.js';
import { initInteraction } from './interaction.js';
import { initInspector } from './inspector.js';
import { initReadouts } from './readouts.js';
import { initFilters } from './filters.js';
import { initCatalogue } from './catalogue.js';
import { initStory } from './story.js';
import { initViews } from './views.js';
import { initTheme } from './theme.js';
import { initRouter } from './router.js';
import { LAYERS } from './config.js';
import { NODES } from './data/ecosystem.js';

const $ = (id) => document.getElementById(id);

/** Left-panel "Structural layers" — the named key to the map's four concentric rings (which are
 *  deliberately unlabelled on the map). Count = featured entities in that layer; magnitude is left to
 *  the number and to the map's own ring density (no bar — a bar only implied a false ceiling). A
 *  footnote reconciles the four ring counts (30) with the 35 featured total: the gap is the NSAS
 *  origin (ring 0) + the supporting-sector arcs (no ring), which sit outside rings 1–4 by design. */
function renderLayers(mount) {
  if (!mount) return;
  const counts = [0, 0, 0, 0, 0];
  let originFeatured = 0;
  let sectorFeatured = 0;
  for (const n of NODES) {
    if (n.coverage !== 'featured') continue;
    const r = ringOf(n);
    if (r != null && r >= 1 && r <= 4) counts[r] += 1;
    else if (r === 0) originFeatured += 1;
    else sectorFeatured += 1; // ring null → supporting-sector arcs, outside the concentric rings
  }
  mount.replaceChildren();
  const title = document.createElement('span');
  title.className = 'panel-title';
  title.textContent = 'Structural layers';
  mount.append(title);
  for (let r = 1; r <= 4; r++) {
    const row = document.createElement('div');
    row.className = 'layer-row';
    const name = document.createElement('span');
    name.className = 'layer-name';
    name.textContent = LAYERS[r].label;
    const num = document.createElement('span');
    num.className = 'layer-num';
    num.textContent = String(counts[r]).padStart(2, '0');
    row.append(name, num);
    mount.append(row);
  }
  const parts = [];
  if (originFeatured) parts.push('NSAS origin');
  if (sectorFeatured)
    parts.push(`${sectorFeatured} supporting sector${sectorFeatured === 1 ? '' : 's'}`);
  if (parts.length) {
    const note = document.createElement('p');
    note.className = 'layer-note';
    note.textContent = `+ ${parts.join(' · ')}`;
    mount.append(note);
  }
}

function init() {
  initTheme($('theme-toggle'));

  const atlasMount = $('atlas');
  const ir = computeLayout();
  const { svg, nodeEls, edgeEls } = renderAtlas(atlasMount, ir);
  atlasMount.hidden = false;

  initInteraction({ svg, nodeEls, edgeEls });
  initReadouts($('readouts'));
  initInspector($('inspector'));
  initFilters({
    legend: $('legend'),
    search: $('search'),
    results: $('search-results'),
    evidenceToggle: $('evidence-toggle'),
    reset: $('reset'),
    status: null, // operating-state label (views.js) replaces the old status line
    plateEmpty: $('plate-empty'),
    nodeEls,
  });
  renderLayers($('layers-readout'));
  initCatalogue($('catalogue'));
  initStory({
    startBtn: $('story-start'),
    panel: $('story-panel'),
    caption: $('story-caption'),
    prevBtn: $('story-prev'),
    nextBtn: $('story-next'),
    exitBtn: $('story-exit'),
    svg,
  });
  initViews({
    navLinks: document.querySelectorAll('.nav a[data-view]'),
    sections: {
      explore: $('explore-view'),
      catalogue: $('catalogue'),
      methodology: $('methodology'),
    },
    label: $('op-state'),
  });

  initRouter(); // last, so all subscribers exist before URL state is applied
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
