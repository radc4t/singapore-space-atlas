// build.mjs — production build. Bundles + minifies the app into dist/.
//
// The dev experience stays build-free (open index.html on source with a static server:
// `npm run dev`). This is only for optimized deployment: `npm run build` (or `npm run preview`).
//
// Output:
//   dist/bundle.js       all JS modules bundled + minified (entry: js/app.js)
//   dist/style.min.css   minified CSS
//   dist/index.html      index.html with css/js paths rewritten to the built files
//   dist/og-image.png    social-preview card (the one shipped asset; see scripts/og-image.mjs)
//
// No runtime assets loaded by the page, no CDN scripts, no self-hosted fonts (system font stack) —
// the deployed output is a self-contained static site with no runtime dependencies. og-image.png is a
// crawler-only asset (referenced by <meta>, never fetched by the app), so the strict CSP is unaffected.

import { build } from 'esbuild';
import { access, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

async function main() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  // 1. JS bundle (entry js/app.js pulls in every module; all geometry is hand-authored SVG).
  await build({
    entryPoints: [resolve(root, 'js/app.js')],
    bundle: true,
    minify: true,
    format: 'esm',
    target: ['es2020'],
    outfile: resolve(dist, 'bundle.js'),
    logLevel: 'info',
  });

  // 2. CSS minify.
  await build({
    entryPoints: [resolve(root, 'css/style.css')],
    bundle: true,
    minify: true,
    outfile: resolve(dist, 'style.min.css'),
    logLevel: 'info',
  });

  // 3. Emit dist/index.html pointing at the built files.
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const out = html
    .replace('href="css/style.css"', 'href="style.min.css"')
    .replace('src="js/app.js"', 'src="bundle.js"');
  if (out === html) {
    throw new Error('index.html asset paths not found — did the css/js references change?');
  }
  await writeFile(resolve(dist, 'index.html'), out);

  // 4. Ship the social-preview card. It is a REQUIRED build input, not an optional side artifact —
  //    a missing asset fails the build (regenerate it with `node scripts/og-image.mjs`).
  const ogSrc = resolve(root, 'assets/og-image.png');
  try {
    await access(ogSrc);
  } catch {
    throw new Error(
      'assets/og-image.png not found — regenerate it with `node scripts/og-image.mjs` before building.'
    );
  }
  await copyFile(ogSrc, resolve(dist, 'og-image.png'));

  console.log('Build complete → dist/ (bundle.js, style.min.css, index.html, og-image.png)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
