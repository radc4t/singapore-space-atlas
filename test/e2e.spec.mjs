// e2e.spec.mjs — Playwright interaction, deep-link, accessibility and visual-regression checks.
// Guards the interactive state that node --test (data-only) cannot exercise.

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
