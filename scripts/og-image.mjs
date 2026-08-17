// og-image.mjs — regenerate the social-preview card (assets/og-image.png), 1200×630.
//
// TOOLING ONLY. This script is never bundled, copied into dist/, or loaded by the app — it just
// produces the committed asset that build.mjs ships. Regeneration is manual (like docs/hero-*.png):
// run `node scripts/og-image.mjs` after a material change to the light Explore plate.
//
// The capture is made deterministic so re-runs are byte-stable modulo rendering: forced light theme,
// Explore view, system fonts settled, chrome hidden to show just the plate, and all CSS
// transitions/animations disabled before the shot. The output is asserted to be exactly 1200×630.
//
// Requires the dev toolchain (Playwright's chromium). Not part of `npm run build`.

import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'assets/og-image.png');
const WIDTH = 1200;
const HEIGHT = 630;
const ORIGIN = 'http://127.0.0.1:8000';

// PNG IHDR: 8-byte signature, then length(4)+"IHDR"(4)+width(4)+height(4) — big-endian.
function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      // not up yet
    }
    if (Date.now() > deadline) throw new Error(`server did not start at ${url}`);
    await new Promise((r) => setTimeout(r, 200));
  }
}

async function main() {
  await mkdir(dirname(OUT), { recursive: true });

  const server = spawn('python3', [resolve(root, 'scripts/nocache_server.py')], {
    stdio: 'ignore',
  });
  const stopServer = () => {
    try {
      server.kill('SIGKILL');
    } catch {
      /* already gone */
    }
  };

  let browser;
  try {
    await waitForServer(`${ORIGIN}/`);
    browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1, // 1:1 pixels → screenshot is exactly WIDTH×HEIGHT
      colorScheme: 'light',
    });

    await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
    await page.locator('.atlas-svg').waitFor({ state: 'visible' });
    // String-form so the browser-context reference stays out of this Node-scoped file's lint. The app
    // ships no web fonts (system stack), so this settles immediately — it's belt-and-braces.
    await page.evaluate('document.fonts && document.fonts.ready');

    // Show just the plate on the canvas ground: hide the instrument chrome, kill motion, centre the
    // circular map so it reads as an iconic card rather than a clipped screenshot.
    await page.addStyleTag({
      content: `
        *, *::before, *::after { transition: none !important; animation: none !important; }
        .topbar, .statusbar, .panel, .story-panel { display: none !important; }
        .stage { min-height: 100vh !important; padding: 0 !important; }
        .atlas-svg { width: auto !important; height: 88vh !important; }
      `,
    });

    // Let layout settle after the injected style before the shot (motion is already disabled above).
    await page.waitForTimeout(150);

    await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });

    const { width, height } = pngSize(await readFile(OUT));
    if (width !== WIDTH || height !== HEIGHT) {
      throw new Error(`og-image.png is ${width}×${height}, expected ${WIDTH}×${HEIGHT}`);
    }
    console.log(`og-image.png written → ${OUT} (${width}×${height})`);
  } finally {
    if (browser) await browser.close();
    stopServer();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
