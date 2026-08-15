// app.js — bootstrap / controller. Wires the data-driven modules together on top of the shared
// store. Strict module boundaries: this file only orchestrates; geometry, rendering, interaction,
// filtering, inspection, cataloguing, routing and story mode each live in their own module.

import { computeLayout } from './layout.js';
import { renderAtlas } from './render.js';
import { initInteraction } from './interaction.js';
import { initInspector } from './inspector.js';
import { initFilters } from './filters.js';
import { initCatalogue } from './catalogue.js';
import { initStory } from './story.js';
import { initTheme } from './theme.js';
import { initRouter } from './router.js';
import { EDGES, NODES } from './data/ecosystem.js';

const $ = (id) => document.getElementById(id);

/** Snapshot bar — counts derived from the data at runtime (never hard-coded). */
function renderSnapshot(mount) {
  if (!mount) return;
  const orgs = NODES.filter((n) => n.kind === 'organisation').length;
  const programmes = NODES.filter((n) => n.kind === 'programme').length;
  const documented = EDGES.filter((e) => e.confidence === 'documented').length;
  const inferred = EDGES.filter((e) => e.confidence === 'inferred').length;
  mount.textContent =
    `Atlas snapshot · 15 Aug 2026 · ${orgs} organisations · ${programmes} programmes · ` +
    `${documented} documented + ${inferred} inferred relationships`;
}

function init() {
  initTheme($('theme-toggle'));

  const atlasMount = $('atlas');
  const ir = computeLayout();
  const { svg, nodeEls, edgeEls } = renderAtlas(atlasMount, ir);
  atlasMount.hidden = false;

  initInteraction({ svg, nodeEls, edgeEls });
  initInspector($('inspector'));
  initFilters({
    legend: $('legend'),
    search: $('search'),
    results: $('search-results'),
    evidenceToggle: $('evidence-toggle'),
    reset: $('reset'),
    status: $('status'),
    nodeEls,
  });
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
  renderSnapshot($('snapshot'));

  // deep links last, so all subscribers exist before URL state is applied
  initRouter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
