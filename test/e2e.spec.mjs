// e2e.spec.mjs — Playwright interaction, deep-link, accessibility and visual-regression checks.
// Guards the interactive state that node --test (data-only) cannot exercise.

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TYPE_LABELS } from '../js/config.js';
import { NODES } from '../js/data/ecosystem.js';

test('focus flow: select a node → inspector populates → clear', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.atlas-svg')).toBeVisible();

  await page.locator('.node[data-id="nsas"] .node-shape').click();
  await expect(page.locator('.inspector-title')).toHaveText('National Space Agency of Singapore');
  // right panel switches Readouts → Inspector; operating-state label derives from state
  await expect(page.locator('#readouts')).toBeHidden();
  await expect(page.locator('#op-state')).toContainText('INSPECT');
  // focus mode dims the rest
  await expect(page.locator('.atlas-svg')).toHaveClass(/has-focus/);

  await page.locator('.inspector-clear').click();
  await expect(page.locator('#inspector')).toBeHidden();
  await expect(page.locator('#readouts')).toBeVisible();
});

test('clear control is an icon that never overlaps the title (any wrap depth)', async ({
  page,
}) => {
  // longest entity name → worst-case multi-line title wrap
  await page.goto('/?node=sutd');
  await expect(page.locator('.inspector-title')).toHaveText(
    'Singapore University of Technology and Design'
  );
  const clear = page.locator('.inspector-clear');
  // an icon-only control must still carry an accessible name
  await expect(clear).toHaveAttribute('aria-label', 'Clear selection');
  await expect(clear).toHaveText('');
  await expect(clear.locator('svg')).toBeVisible();
  // invariant: the button rect never intersects the title's full bounding rect
  const a = await clear.boundingBox();
  const b = await page.locator('.inspector-title').boundingBox();
  const overlap =
    a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  expect(overlap).toBe(false);
});

test('deep link restores focus + inferred state', async ({ page }) => {
  await page.goto('/?node=speqtral&inferred=1');
  await expect(page.locator('.inspector-title')).toHaveText('SpeQtral');
  await expect(page.locator('#evidence-toggle')).toBeChecked();
  // the spun-from NUS relationship is shown with its evidence
  await expect(page.locator('.rel-why').first()).toContainText('Centre for Quantum Technologies');
  // URL stays canonical
  expect(page.url()).toContain('node=speqtral');
});

test('search surfaces a catalogued entity and the honest empty state', async ({ page }) => {
  await page.goto('/');
  await page.locator('#search').fill('quantum');
  await expect(page.locator('.search-results .result').first()).toBeVisible();

  await page.locator('#search').fill('zzzznotathing');
  await expect(page.locator('.no-hit')).toContainText('Not in this snapshot');
});

test('legend filter hides a type', async ({ page }) => {
  await page.goto('/');
  const company = page.locator('.node.type-company').first();
  await expect(company).toBeVisible();
  await page.locator('.legend-chip[data-type="company"]').click();
  await expect(company).toHaveClass(/is-hidden/);
});

test('chrome affordances have action-describing accessible names', async ({ page }) => {
  // theme toggle: explicit scheme (Playwright defaults to light) — assert name AND dynamic update
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();

  // tour controls: names are the words alone (icons are aria-hidden)
  await page.getByRole('button', { name: 'Guided tour' }).click();
  await expect(page.getByRole('button', { name: 'Back' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
});

test('custom checkbox stays keyboard-operable', async ({ page }) => {
  await page.goto('/');
  await page.locator('#evidence-toggle').focus();
  await expect(page.locator('#evidence-toggle')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('#evidence-toggle')).toBeChecked();
});

test('reset restores the canonical resting state', async ({ page }) => {
  await page.goto('/?inferred=1');
  await expect(page.locator('#evidence-toggle')).toBeChecked();
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.locator('#evidence-toggle')).not.toBeChecked();
  // covers the reported symptom directly: inferred edges are no longer shown
  // (`.show-inferred` is toggled on the atlas <svg> in interaction.js).
  await expect(page.locator('.show-inferred')).toHaveCount(0);
  const url = new URL(page.url());
  expect(url.pathname).toBe('/');
  expect(url.search).toBe('');
});

test('unknown ?node= falls back to canonical explore', async ({ page }) => {
  await page.goto('/?node=bogus-does-not-exist');
  await expect(page.locator('#op-state')).toHaveText(/EXPLORE/);
  await expect(page.locator('#readouts')).toBeVisible();
  await expect(page.locator('#inspector')).toBeHidden();
});

test('accessibility: no serious/critical axe violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  expect(
    serious,
    JSON.stringify(
      serious.map((v) => v.id),
      null,
      2
    )
  ).toEqual([]);
});

test('catalogue groups by type: structure, membership, meta contract, a11y', async ({ page }) => {
  await page.goto('/?view=catalogue');

  // routing identity vs terminology: visible label is "Directory", the route stays ?view=catalogue
  await expect(page.locator('[data-view="catalogue"]')).toHaveText('Directory'); // nav label
  await expect(page.locator('.catalogue h2')).toHaveText('Directory');
  expect(new URL(page.url()).searchParams.get('view')).toBe('catalogue');

  // structure
  await expect(page.locator('.cat-group')).toHaveCount(7);
  await expect(page.locator('.cat-group-head')).toHaveCount(7);
  await expect(page.locator('.cat-item')).toHaveCount(47);
  await expect(page.locator('.cat-item .dot')).toHaveCount(0); // dots live only in headers

  // card names — DATA-DRIVEN: external link where the node has a url, inert text otherwise. Assert the
  // right url on the right card (a count-only test can't catch a mis-mapped url); never hard-code a total.
  await expect(page.locator('.cat-item .cat-name')).toHaveCount(NODES.length);
  await expect(page.locator('.cat-item .link-btn')).toHaveCount(0); // old button control is gone
  for (const node of NODES) {
    const card = page.locator(`.cat-item[data-id="${node.id}"]`);
    if (node.url) {
      const link = card.locator('a.cat-name');
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('href', node.url); // exact canonical URL from the data
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
      await expect(link).toHaveAttribute('rel', /noreferrer/);
      expect(new URL(node.url).protocol).toMatch(/^https?:$/);
    } else {
      await expect(card.locator('span.cat-name')).toHaveCount(1); // inert text
      await expect(card.locator('a.cat-name')).toHaveCount(0);
    }
  }
  const linked = NODES.filter((n) => n.url).length;
  await expect(page.locator('.cat-item a.cat-name[target="_blank"]')).toHaveCount(linked);
  await expect(page.locator('.cat-item span.cat-name')).toHaveCount(NODES.length - linked);
  // protect the deliberate exceptions: a future data edit can't silently add a url to a modelled-inert node
  for (const id of ['sec-aerospace', 'sec-microelectronics', 'sec-ai', 'sec-quantum', 'ostin'])
    expect(NODES.find((n) => n.id === id)?.url).toBeUndefined();

  // canonical order + counts — assert label & count spans per header (raw DOM text; uppercase is
  // CSS-only). Hard-coded independently of TYPES so an accidental reorder is actually caught.
  const canonical = [
    ['National space agency', '01'],
    ['Government agency', '07'],
    ['University / research', '06'],
    ['Company', '15'],
    ['International partner', '10'],
    ['Supporting sector', '04'],
    ['Programme', '04'],
  ];
  const heads = page.locator('.cat-group-head');
  for (let i = 0; i < canonical.length; i++) {
    await expect(heads.nth(i).locator('span').nth(1)).toHaveText(canonical[i][0]);
    await expect(heads.nth(i).locator('.cat-group-count')).toHaveText(canonical[i][1]);
  }

  // membership: each group holds exactly its cards
  const expected = [1, 7, 6, 15, 10, 4, 4];
  const groups = page.locator('.cat-group');
  for (let i = 0; i < expected.length; i++)
    await expect(groups.nth(i).locator('.cat-item')).toHaveCount(expected[i]);

  // meta contract: no type label leaks into any card meta
  await expect(page.locator('.cat-item .cat-meta')).toHaveCount(47);
  const metas = await page.locator('.cat-item .cat-meta').allTextContents();
  for (const m of metas)
    for (const label of Object.values(TYPE_LABELS))
      expect(m.toLowerCase()).not.toContain(label.toLowerCase());

  // long-name regression (stable node): no stranded dot; name renders (now an <a>, sutd.edu.sg)
  const sutd = page.locator('.cat-item[data-id="sutd"]');
  await expect(sutd.locator('.dot')).toHaveCount(0);
  await expect(sutd.locator('.cat-name')).toBeVisible();

  // header swatches all decorative; the one linked card (NSAS, first) exposes exactly one tab stop
  expect(await page.locator('.cat-group-head .swatch[aria-hidden="true"]').count()).toBe(7);
  await expect(page.locator('.cat-group-head span').nth(1)).not.toHaveAttribute('tabindex');
  await expect(page.locator('.cat-group-count').first()).not.toHaveAttribute('tabindex');
  const firstCard = page.locator('.cat-item').first();
  await expect(firstCard.locator('button, a, [tabindex]:not([tabindex="-1"])')).toHaveCount(1);

  // project-consistency (computed style) — catches a foreign redesign
  await expect(page.locator('.cat-group-head').first()).toHaveCSS('text-transform', 'uppercase');
  await expect(page.locator('.cat-group-head').first()).toHaveCSS('font-family', /mono/i);
  await expect(page.locator('.cat-group-head .swatch')).toHaveCount(7);
  await expect(page.locator('.cat-group-count')).toHaveCount(7);

  // axe on the catalogue view — it is the accessible representation of the corpus
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  expect(
    serious,
    JSON.stringify(
      serious.map((v) => v.id),
      null,
      2
    )
  ).toEqual([]);
});

test('visual regression — desktop light', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('.atlas-svg')).toBeVisible();
  await expect(page).toHaveScreenshot('atlas-desktop-light.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.02,
  });
});

test('visual regression — desktop dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('.atlas-svg')).toBeVisible();
  await expect(page).toHaveScreenshot('atlas-desktop-dark.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.02,
  });
});
