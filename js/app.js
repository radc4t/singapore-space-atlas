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

const $ = (id) => document.getElementById(id);

function init() {
  initTheme($('theme-toggle'));

  // --- map ---------------------------------------------------------------------------------
  const atlasMount = $('atlas');
  const ir = computeLayout();
  const { svg, nodeEls, edgeEls } = renderAtlas(atlasMount, ir);
  atlasMount.hidden = false;

  initInteraction({ svg, nodeEls, edgeEls, ir });
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

  // --- About dialog ------------------------------------------------------------------------
  const about = $('about');
  $('about-btn').addEventListener('click', () => about.showModal());

  // --- deep links (last, so all subscribers exist before URL state is applied) -------------
  initRouter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
