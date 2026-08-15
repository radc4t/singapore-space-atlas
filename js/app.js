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

/** Left-panel "Structural layers" readout — count = entities in layer, bar = count / max (a plain
 *  occupancy calibration mark, never a share-of-100% or "importance" chart). */
function renderLayers(mount) {
  if (!mount) return;
  const counts = [0, 0, 0, 0, 0];
  for (const n of NODES) {
    if (n.coverage !== 'featured') continue;
    const r = ringOf(n);
    if (r != null && r >= 1 && r <= 4) counts[r] += 1;
  }
  const max = Math.max(1, ...counts.slice(1));
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
    const bar = document.createElement('span');
    bar.className = 'layer-bar';
    const fill = document.createElement('i');
    fill.style.width = `${(counts[r] / max) * 100}%`;
    bar.append(fill);
    row.append(name, num, bar);
    mount.append(row);
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
