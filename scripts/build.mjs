// build.mjs — production build. Bundles + minifies the app into dist/.
//
// The dev experience stays build-free (open index.html on source with a static server:
// `npm run dev`). This is only for optimized deployment: `npm run build` (or `npm run preview`).
//
// Output:
//   dist/bundle.js       all JS modules bundled + minified (entry: js/app.js)
//   dist/style.min.css   minified CSS
//   dist/index.html      index.html with css/js paths rewritten to the built files
//
// No runtime assets, no CDN scripts, no self-hosted fonts (system font stack) — the deployed
// output is a self-contained static site with no runtime dependencies.

import { build } from 'esbuild';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

async function main() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  // 1. JS bundle (entry js/app.js pulls in every module; d3-shape is bundled in).
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

  console.log('Build complete → dist/ (bundle.js, style.min.css, index.html)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
