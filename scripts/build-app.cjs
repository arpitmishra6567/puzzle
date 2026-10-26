#!/usr/bin/env node
/**
 * Builds the production PUZZLED web application:
 * 1. Compiles all TypeScript files in `src/` via `scripts/compile-ts.cjs`
 * 2. Bundles `dist/lib/app_main.js` into a single browser bundle using Webpack 5
 * 3. Produces `dist/index.html` AND `artifacts/file_generation/ttl=63d/output/puzzled.html`
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SEARCH_PATHS = [
  path.join(__dirname, '..', 'node_modules'),
  ...module.paths,
  '/usr/share/nodejs'
];
const webpack = require(require.resolve('webpack', { paths: SEARCH_PATHS }));

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const INTERMEDIATE_DIR = path.join(ROOT, 'artifacts/file_generation/ttl=63d/intermediate');
const OUTPUT_DIR = path.join(ROOT, 'artifacts/file_generation/ttl=63d/output');

// Step 1: Compile TypeScript -> dist/
execSync('node scripts/compile-ts.cjs', { cwd: ROOT, stdio: 'inherit' });

function onBundleReady(bundleJs) {
  const html = buildSelfContainedHtml(bundleJs);

  fs.mkdirSync(INTERMEDIATE_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(DIST, '404.html'), html, 'utf8');
  fs.writeFileSync(path.join(INTERMEDIATE_DIR, 'puzzled.html'), html, 'utf8');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'puzzled.html'), html, 'utf8');

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="5" fill="#000000"/>
  <rect x="2.5" y="2.5" width="8.5" height="8.5" rx="2.2" fill="#2ED3BE"/>
  <rect x="13" y="2.5" width="8.5" height="8.5" rx="2.2" fill="#6C7BFF"/>
  <rect x="2.5" y="13" width="8.5" height="8.5" rx="2.2" fill="#F28B82"/>
  <rect x="13" y="13" width="8.5" height="8.5" rx="2.2" fill="#58C336"/>
</svg>`;
  fs.writeFileSync(path.join(DIST, 'icon.svg'), iconSvg, 'utf8');

  const manifest = {
    name: "Puzzle — Daily Puzzles",
    short_name: "Puzzle",
    description: "Daily logic, word, number, and spatial puzzles across 13 playable games with Easy, Medium, and Hard challenges.",
    start_url: "./index.html",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ]
  };
  fs.writeFileSync(path.join(DIST, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');

  const robotsTxt = "User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n";
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robotsTxt, 'utf8');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
</urlset>\n`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemapXml, 'utf8');

  const swJs = `const CACHE_NAME = "puzzle-v2-cache";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => caches.match("./index.html")))
  );
});
`;
  fs.writeFileSync(path.join(DIST, 'sw.js'), swJs, 'utf8');

  console.log('[build-app] Built dist/index.html, PWA manifest/SW/icons, and artifacts/file_generation/ttl=63d/output/puzzled.html');
}

const appMainEntry = path.join(ROOT, 'build', 'lib', 'app_main.js');
if (fs.existsSync(appMainEntry)) {
  const compiler = webpack({
    mode: 'production',
    entry: appMainEntry,
    output: {
      path: DIST,
      filename: 'bundle.js'
    },
    optimization: {
      minimize: true
    }
  });

  compiler.run((err, stats) => {
    if (err || stats.hasErrors()) {
      console.error(err || stats.toString({ errors: true }));
      process.exit(1);
    }
    const bundleJs = fs.readFileSync(path.join(DIST, 'bundle.js'), 'utf8');
    onBundleReady(bundleJs);
  });
} else if (fs.existsSync(path.join(DIST, 'bundle.js'))) {
  const bundleJs = fs.readFileSync(path.join(DIST, 'bundle.js'), 'utf8');
  onBundleReady(bundleJs);
} else {
  console.error('[build-app] Error: No entry point or pre-built bundle.js found.');
  process.exit(1);
}

function buildSelfContainedHtml(bundleJs) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark" data-accent="cosmic" data-reduced-motion="false">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Puzzle — Daily Puzzles</title>
  <meta name="description" content="Puzzle is a daily logic, word, number, and spatial puzzle hub featuring 13 playable games, daily streaks, and Easy, Medium, and Hard challenges." />
  <meta name="theme-color" content="#000000" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Puzzle" />
  <meta property="og:title" content="Puzzle — Daily Puzzles" />
  <meta property="og:description" content="Play 11 daily logic, word, number, and spatial puzzles plus 2 Classic Vault games with Easy, Medium, and Hard difficulty modes." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Puzzle — Daily Puzzles" />
  <meta name="twitter:description" content="Daily logic, word, number, and spatial puzzles — 100% playable in your browser." />
  <link rel="manifest" href="manifest.webmanifest" />
  <link rel="icon" type="image/svg+xml" href="icon.svg" />
  <style>
    :root, [data-theme="dark"] {
      --bg-base: #000000;
      --bg-surface: #141414;
      --bg-elevated: #1F1F23;
      --bg-interactive: #2A2B32;
      --text-primary: #FFFFFF;
      --text-secondary: #D1D5DB;
      --text-muted: #8E95A5;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-strong: rgba(255, 255, 255, 0.18);
      --accent-primary: #FFFFFF;
      --accent-emerald: #2CC990;
      --accent-amber: #F59E0B;
      --danger: #EF4444;
      --radius-sm: 6px;
      --radius-md: 12px;
      --radius-lg: 16px;
    }

    [data-theme="light"] {
      --bg-base: #F4F3EF;
      --bg-surface: #FFFFFF;
      --bg-elevated: #EAE8E1;
      --bg-interactive: #DDDAD0;
      --text-primary: #11131A;
      --text-secondary: #3C4152;
      --text-muted: #6A7185;
      --border-subtle: rgba(17, 19, 26, 0.1);
      --border-strong: rgba(17, 19, 26, 0.22);
      --accent-primary: #11131A;
      --accent-emerald: #059669;
      --accent-amber: #D97706;
      --danger: #DC2626;
    }

    [data-reduced-motion="true"] * {
      transition: none !important;
      animation: none !important;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    html, body {
      min-height: 100%;
      background-color: var(--bg-base);
      color: var(--text-primary);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.45;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    button, input {
      font-family: inherit;
      color: inherit;
    }

    button {
      cursor: pointer;
      border: none;
      background: none;
    }

    button:focus-visible, input:focus-visible {
      outline: 2px solid var(--accent-amber);
      outline-offset: 2px;
    }

    button:disabled {
      opacity: 0.38;
      cursor: not-allowed;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* TOP STUDIO HEADER */
    .puzzled-header {
      position: sticky;
      top: 0;
      z-index: 40;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 0.7rem 1.5rem;
      background: var(--bg-base);
      border-bottom: 1px solid var(--border-subtle);
    }

    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .brand-btn {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      font-weight: 900;
      font-size: 1.05rem;
      letter-spacing: 0.08em;
      padding: 0.2rem 0.35rem;
    }

    .header-nav {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.3rem;
      margin-left: 0.5rem;
    }

    .nav-pill {
      padding: 0.36rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--text-secondary);
      transition: background 0.12s, color 0.12s;
    }

    .nav-pill:hover {
      background: var(--bg-surface);
      color: var(--text-primary);
    }

    .nav-pill.active {
      color: var(--text-primary);
      text-decoration: underline;
      text-underline-offset: 6px;
      text-decoration-thickness: 2px;
    }

    .metric-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.68rem;
      border-radius: 999px;
      font-size: 0.78rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      font-variant-numeric: tabular-nums;
    }

    .flame-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #F59E0B;
      display: inline-block;
    }

    .icon-btn {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      font-size: 0.88rem;
    }

    /* MAIN SHELL */
    .puzzled-main {
      max-width: 1180px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    .puzzled-main.in-game-stage {
      max-width: 100%;
      padding: 0;
      margin: 0;
    }

    .hub-container {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    /* SCREENSHOT 1: DAILY PUZZLES HEADER & 6-COL BENTO GRID */
    .tudum-daily-header-bar {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .tudum-title-group {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .tudum-main-heading {
      font-size: 1.65rem;
      font-weight: 900;
      letter-spacing: 0.01em;
      text-transform: uppercase;
    }

    .tudum-date-sub {
      font-size: 1.38rem;
      font-weight: 400;
      color: var(--text-secondary);
    }

    .tudum-progress-inline {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      font-size: 0.82rem;
      color: var(--text-secondary);
      flex-wrap: wrap;
    }

    .spotlight-inline-btn {
      padding: 0.28rem 0.65rem;
      border-radius: 999px;
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      font-size: 0.76rem;
      font-weight: 700;
    }

    .tudum-bento-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      grid-auto-rows: 152px;
      gap: 14px;
    }

    .tudum-bento-card {
      position: relative;
      background: var(--bg-surface);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.04);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
      transition: transform 0.14s ease, background 0.14s ease, border-color 0.14s ease;
    }

    .tudum-bento-card:hover {
      background: #1C1C20;
      border-color: rgba(255, 255, 255, 0.16);
      transform: translateY(-2px);
    }

    [data-theme="light"] .tudum-bento-card:hover {
      background: #F3F2EE;
    }

    .tudum-bento-card.tile-solved {
      border-color: rgba(44, 201, 144, 0.45);
    }

    /* Exact Grid Positions from Screenshot 1 */
    .bento-pos-neon { grid-column: 1 / 3; grid-row: 1 / 3; }
    .bento-pos-currents { grid-column: 3 / 4; grid-row: 1 / 2; }
    .bento-pos-snippets { grid-column: 4 / 5; grid-row: 1 / 2; }
    .bento-pos-wordsmith { grid-column: 5 / 6; grid-row: 1 / 2; }
    .bento-pos-starstruck { grid-column: 6 / 7; grid-row: 1 / 2; }
    .bento-pos-bonza { grid-column: 3 / 5; grid-row: 2 / 3; }
    .bento-pos-waywords { grid-column: 5 / 6; grid-row: 2 / 3; }
    .bento-pos-crossover { grid-column: 6 / 7; grid-row: 2 / 3; }
    .bento-pos-jigsaw { grid-column: 1 / 3; grid-row: 3 / 4; }
    .bento-pos-combo { grid-column: 3 / 5; grid-row: 3 / 4; }
    .bento-pos-sudoku { grid-column: 5 / 7; grid-row: 3 / 4; }

    .tudum-card-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      text-align: center;
      padding: 1rem;
    }

    .tudum-card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tudum-card-title {
      font-size: 1.12rem;
      font-weight: 800;
      letter-spacing: -0.01em;
    }

    .tudum-card-title.title-large {
      font-size: 1.55rem;
      margin-top: 0.35rem;
    }

    .tudum-ribbon-badge {
      position: absolute;
      top: 0;
      left: 12px;
      z-index: 2;
      line-height: 0;
    }

    .tudum-new-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #E50914;
      color: #FFFFFF;
      font-size: 0.76rem;
      font-weight: 800;
      padding: 0.26rem 0.72rem;
      border-bottom-left-radius: 10px;
      border-top-right-radius: 14px;
    }

    /* KEEP THE GAME GOING BANNER */
    .keep-going-banner {
      background: var(--bg-surface);
      border-radius: 20px;
      padding: 2rem 1.75rem;
      border: 1px solid var(--border-subtle);
      text-align: center;
    }

    .keep-going-heading {
      font-size: 2.1rem;
      font-weight: 900;
      letter-spacing: -0.02em;
    }

    .keep-going-sub {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .vault-Quick-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      max-width: 560px;
      margin: 1.25rem auto 0;
    }

    .vault-feature-card {
      min-height: 132px;
    }

    .vault-corner-pill {
      position: absolute;
      top: 10px;
      right: 12px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      background: var(--bg-elevated);
      color: var(--text-muted);
    }

    /* CONTINUE PLAYING STRIP */
    .continue-strip {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .strip-label {
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .continue-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
      gap: 0.75rem;
    }

    .continue-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-left: 3px solid var(--cat-accent, #F59E0B);
    }

    .continue-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      font-size: 0.86rem;
    }

    .cat-tag {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .resume-btn {
      padding: 0.4rem 0.75rem;
      border-radius: var(--radius-sm);
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      font-weight: 700;
      font-size: 0.78rem;
    }

    /* PROGRESSION TABLE & LIBRARY */
    .progression-table {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      background: var(--bg-base);
      overflow: hidden;
      text-align: left;
    }

    .prog-row {
      display: grid;
      grid-template-columns: 1.3fr 1.6fr 60px;
      align-items: center;
      gap: 1rem;
      padding: 0.65rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .prog-row:last-child { border-bottom: none; }

    .prog-cat-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .prog-mini-icon svg {
      width: 28px;
      height: 28px;
    }

    .prog-cat-title-line {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.9rem;
    }

    .vault-tag {
      font-size: 0.64rem;
      font-weight: 700;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      background: var(--bg-elevated);
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .prog-domain {
      display: block;
      font-size: 0.73rem;
      color: var(--text-muted);
    }

    .prog-tiers {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.45rem;
    }

    .level-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.35rem 0.6rem;
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .level-pill.done {
      border-color: var(--accent-emerald);
      color: var(--accent-emerald);
    }

    .prog-summary {
      text-align: right;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-muted);
    }

    /* =====================================================================
       CENTERED PHONE-CARD GAME STAGE & CURVED HORIZON BACKDROP (SCREENSHOTS 2-11)
       ===================================================================== */
    .tudum-stage-backdrop {
      position: relative;
      min-height: calc(100vh - 57px);
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 1.4rem 0.75rem 2.5rem;
      background: radial-gradient(ellipse 115% 55% at 50% 0%, var(--horizon-glow, #5C161B) 0%, #050507 62%, #000000 100%);
      overflow: hidden;
    }

    [data-theme="light"] .tudum-stage-backdrop {
      background: radial-gradient(ellipse 115% 55% at 50% 0%, #D6D3C9 0%, #F4F3EF 70%);
    }

    .tudum-phone-card {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 446px;
      min-height: 675px;
      border-radius: 24px;
      padding: 1.1rem 1.15rem 1.15rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
    }

    .card-theme-dark {
      background: #141519;
    }

    .card-theme-neon {
      background: linear-gradient(180deg, #4D7C7A 0%, #191E32 25%, #111320 100%);
    }

    .card-theme-wordsmith {
      background: #12392B;
    }

    .card-theme-combo {
      background: radial-gradient(circle at 50% 24%, #2B3E23 0%, #10160E 75%);
    }

    .card-theme-jigsaw {
      background-color: #131418;
      background-image:
        linear-gradient(45deg, #18191E 25%, transparent 25%),
        linear-gradient(-45deg, #18191E 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #18191E 75%),
        linear-gradient(-45deg, transparent 75%, #18191E 75%);
      background-size: 56px 56px;
      background-position: 0 0, 0 28px, 28px -28px, -28px 0;
    }

    .tudum-card-header {
      display: grid;
      grid-template-columns: 42px 1fr 42px;
      align-items: center;
      gap: 0.5rem;
    }

    .tudum-circle-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.14);
      color: #FFFFFF;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.12s;
    }

    .tudum-circle-btn:hover {
      background: rgba(255, 255, 255, 0.24);
    }

    .tudum-header-center {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .tudum-header-eyebrow {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }

    .tudum-header-title {
      font-size: 1.02rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.2;
    }

    .tudum-subbar {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-top: 0.5rem;
    }

    .tudum-timer-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.22rem 0.65rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
      color: #FFFFFF;
      font-size: 0.78rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .tudum-tier-pills {
      display: inline-flex;
      align-items: center;
      gap: 0.22rem;
      background: rgba(0, 0, 0, 0.28);
      padding: 0.16rem;
      border-radius: 999px;
    }

    .lvl-switch-btn {
      padding: 0.18rem 0.52rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.68);
    }

    .lvl-switch-btn.active {
      background: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
    }

    .tudum-card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.65rem 0;
      width: 100%;
    }

    .tudum-board-stack {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.9rem;
    }

    /* Instruction Pill & White Speech Bubble */
    .tudum-instruction-pill {
      width: 100%;
      padding: 0.6rem 0.95rem;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.32);
      border: 1px solid rgba(255, 255, 255, 0.35);
      color: #FFFFFF;
      font-size: 0.82rem;
      font-weight: 600;
      text-align: center;
    }

    .tudum-speech-bubble {
      position: relative;
      background: #FFFFFF;
      color: #111318;
      padding: 0.6rem 1.05rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 800;
      text-align: center;
      max-width: 260px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
      margin-bottom: 0.25rem;
    }

    .tudum-speech-bubble::after {
      content: '';
      position: absolute;
      bottom: -7px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 7px 7px 0;
      border-style: solid;
      border-color: #FFFFFF transparent transparent;
    }

    /* Bottom Circular Action Bar */
    .tudum-bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding-top: 0.45rem;
    }

    .tudum-bottom-group {
      display: flex;
      align-items: center;
      gap: 0.7rem;
    }

    .tudum-action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.22rem;
      color: rgba(255, 255, 255, 0.82);
    }

    .tudum-action-circle {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.14);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 700;
    }

    .tudum-action-circle.hint-ring {
      border: 2px solid rgba(255, 255, 255, 0.55);
    }

    .tudum-action-label {
      font-size: 0.68rem;
      color: rgba(255, 255, 255, 0.68);
    }

    /* 1. NEON LATTICE BOARD */
    .neon-lattice-wrap {
      position: relative;
      margin: 0.25rem auto;
      touch-action: none;
    }

    .neon-lattice-svg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .neon-hit-grid {
      position: relative;
      z-index: 2;
      display: grid;
    }

    .neon-intersection-btn {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      position: relative;
    }

    .neon-lattice-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.35);
    }

    .neon-intersection-btn.lit .neon-lattice-dot {
      width: 10px;
      height: 10px;
      background: var(--neon-color);
      box-shadow: 0 0 8px var(--neon-color);
    }

    .neon-node-svg {
      filter: drop-shadow(0 0 6px var(--neon-color));
    }

    .neon-mini-selector {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .neon-chip-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid transparent;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .neon-chip-btn.selected {
      border-color: #FFFFFF;
    }

    .np-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    /* 2. CURRENTS LIQUID STREAM BOARD */
    .currents-liquid-stage {
      position: relative;
      margin: 0.5rem auto;
      touch-action: none;
    }

    .currents-liquid-svg {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: visible;
    }

    .currents-hit-grid {
      position: relative;
      z-index: 2;
      display: grid;
    }

    .currents-node-btn {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }

    .currents-wp-num {
      font-size: 1.5rem;
      font-weight: 900;
      color: #FFFFFF;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    }

    /* 3. SNIPPETS ILLUSTRATED BURGER BOARD */
    .snippets-burger-stage {
      padding: 28px 22px 34px;
      border-radius: 18px;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
      touch-action: none;
    }

    .snippets-grid {
      display: grid;
      gap: 3px;
      background: rgba(15, 20, 26, 0.72);
      padding: 4px;
      border-radius: 14px;
    }

    .snippets-cell {
      aspect-ratio: 1;
      border-radius: 6px;
      background: #202B33;
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 900;
    }

    .snippets-cell.covered {
      background: color-mix(in srgb, var(--snip-color) 82%, #141519);
      border-color: rgba(255, 255, 255, 0.45);
    }

    .snippets-cell.anchor-corner, .snippets-cell.drag-preview {
      outline: 2.5px dashed #FFFFFF;
      background: rgba(255, 255, 255, 0.25);
    }

    .snippet-num-text {
      font-size: 1.2rem;
      font-weight: 900;
    }

    /* 4. WORDSMITH 45° DIAMOND BOARD */
    .ws-score-tray {
      position: relative;
      width: 100%;
      max-width: 340px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 14px;
      padding: 1.2rem 1rem 0.65rem;
      margin-top: 0.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .ws-score-diamond {
      position: absolute;
      top: -18px;
      width: 36px;
      height: 36px;
      background: #174936;
      border: 1.5px solid rgba(255, 255, 255, 0.35);
      transform: rotate(45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }

    .ws-score-diamond span {
      transform: rotate(-45deg);
      font-weight: 900;
      font-size: 0.88rem;
    }

    .ws-current-diamonds {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      min-height: 28px;
    }

    .ws-mini-diamond {
      width: 24px;
      height: 24px;
      background: #6A7672;
      transform: rotate(45deg);
      border-radius: 3px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .ws-mini-diamond span {
      transform: rotate(-45deg);
      font-size: 0.72rem;
      font-weight: 900;
    }

    .ws-tray-placeholder {
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.65);
    }

    .ws-target-dots {
      display: flex;
      gap: 0.4rem;
      background: #0D291E;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
    }

    .ws-dot-diamond {
      width: 8px;
      height: 8px;
      background: #1E4D3B;
      transform: rotate(45deg);
    }

    .ws-dot-diamond.done {
      background: #2CC990;
    }

    .ws-plus-score {
      font-size: 1.65rem;
      font-weight: 900;
      color: #A7F3D0;
      min-height: 2rem;
    }

    .ws-diamond-board-wrap {
      padding: 2.2rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: none;
    }

    .wordsmith-diamond-grid {
      display: grid;
      gap: 7px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.24);
      border-radius: 12px;
      border: 2px solid rgba(44, 201, 144, 0.35);
      transition: transform 0.25s ease;
    }

    .wordsmith-diamond-tile {
      width: 52px;
      height: 52px;
      border-radius: 6px;
      background: #2AE6B8;
      border-bottom: 4px solid #139E7D;
      color: #0B291E;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wordsmith-diamond-tile.selected {
      background: #F59E0B;
      border-bottom-color: #B45309;
      color: #FFFFFF;
    }

    .wordsmith-diamond-tile.forged {
      box-shadow: inset 0 0 0 2px #FFFFFF;
    }

    .ws-diamond-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1;
    }

    .ws-char {
      font-size: 1.05rem;
      font-weight: 900;
    }

    .ws-pts {
      font-size: 0.62rem;
      font-weight: 800;
      margin-top: 2px;
    }

    .ws-submit-pill {
      width: 100%;
      max-width: 220px;
      padding: 0.65rem 1.2rem;
      border-radius: 999px;
      background: #FFFFFF;
      color: #0B291E;
      font-weight: 900;
      font-size: 0.92rem;
    }

    /* 5. STARSTRUCK BOARD */
    .starstruck-board-frame {
      display: grid;
      background: #090A0F;
      border: 3px solid #090A0F;
      border-radius: 6px;
      overflow: hidden;
      touch-action: none;
    }

    .starstruck-region-cell {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .starstruck-region-cell.conflict {
      box-shadow: inset 0 0 0 3px #EF4444;
    }

    .star-cross {
      font-size: 1.2rem;
      font-weight: 800;
      color: rgba(10, 12, 18, 0.78);
    }

    /* 6. WAYWORDS BOARD */
    .waywords-stage-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
      touch-action: none;
    }

    .ww-launchpad-marker {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 900;
      color: #FFFFFF;
    }

    .ww-launchpad-marker.top-marker { background: #7B5CE6; }
    .ww-launchpad-marker.bottom-marker { background: #2CC990; }

    .waywords-grid {
      display: grid;
      gap: 4px;
    }

    .waywords-cell {
      width: 44px;
      height: 44px;
      border-radius: 7px;
      background: #26282E;
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
      font-size: 1.05rem;
      font-weight: 800;
    }

    .waywords-cell.selected {
      background: #38BDF8;
      color: #090A0F;
    }

    .waywords-cell.hint-yellow {
      border-color: #F59E0B;
      color: #F59E0B;
    }

    .ww-inline-controls {
      display: flex;
      gap: 0.5rem;
    }

    /* 7. CROSSOVER BOARD */
    .crossover-stage-row {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      touch-action: none;
    }

    .crossover-row-arrow {
      font-size: 0.85rem;
      color: #FFFFFF;
    }

    .crossover-grid {
      display: grid;
      gap: 6px;
    }

    .crossover-tile {
      width: 58px;
      height: 58px;
      border-radius: 9px;
      background: #42454D;
      border-bottom: 4px solid #2A2C32;
      color: #FFFFFF;
      font-size: 1.4rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .crossover-tile.locked-green {
      background: #2CC990;
      border-bottom-color: #1B9669;
      color: #0B1914;
    }

    .crossover-tile.selected {
      outline: 2.5px solid #FFFFFF;
    }

    .co-emoji {
      position: absolute;
      top: 2px;
      right: 4px;
      font-size: 0.85rem;
    }

    .tudum-clue-carousel {
      width: 100%;
      max-width: 320px;
      background: #22242A;
      border-radius: 10px;
      padding: 0.65rem 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .clue-arrow-btn {
      font-size: 1.35rem;
      font-weight: 700;
      padding: 0 0.35rem;
      color: rgba(255, 255, 255, 0.75);
    }

    .clue-carousel-text {
      font-size: 0.84rem;
      font-weight: 600;
      text-align: center;
      color: #FFFFFF;
    }

    /* 8. JIGSAW STOCK PHOTO BOARD */
    .jigsaw-photo-grid {
      display: grid;
      gap: 6px;
      touch-action: none;
    }

    .jigsaw-tile-wrap {
      position: relative;
      width: 92px;
      height: 92px;
      border-radius: 4px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.35);
      background: #1C1E24;
    }

    .jigsaw-tile-wrap.locked-correct {
      border-color: #2CC990;
    }

    .jigsaw-tile-wrap.selected {
      border-color: #F59E0B;
      box-shadow: 0 0 0 2px #F59E0B;
    }

    .jigsaw-tile-btn {
      width: 100%;
      height: 100%;
      display: block;
      position: relative;
    }

    .jigsaw-photo-slice {
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      transition: transform 0.18s ease;
    }

    .jigsaw-badge {
      position: absolute;
      bottom: 3px;
      left: 4px;
      padding: 1px 5px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.72);
      color: #FFFFFF;
      font-size: 0.65rem;
      font-weight: 800;
    }

    .jigsaw-rot-btn {
      position: absolute;
      top: 3px;
      right: 3px;
      width: 22px;
      height: 22px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.72);
      color: #FFFFFF;
      font-size: 0.76rem;
      font-weight: 800;
    }

    /* 9. COMBO PILL CHAIN & QWERTY KEYBOARD */
    .combo-pill-stack {
      width: 100%;
      max-width: 310px;
      display: flex;
      flex-direction: column;
      gap: 0.42rem;
    }

    .combo-chain-pill {
      min-height: 36px;
      border-radius: 999px;
      border: 2px solid #1E7E52;
      background: rgba(16, 28, 18, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem 0.85rem;
      font-size: 0.82rem;
      font-weight: 900;
      letter-spacing: 0.12em;
      cursor: pointer;
    }

    .combo-chain-pill.step-pill.active {
      border-color: rgba(255, 255, 255, 0.55);
      min-height: 44px;
      background: rgba(255, 255, 255, 0.06);
    }

    .combo-chain-pill.step-pill.solved {
      background: rgba(44, 201, 144, 0.2);
      border-color: #2CC990;
      color: #2CC990;
    }

    .combo-slots-row {
      display: flex;
      gap: 0.28rem;
    }

    .combo-letter-slot {
      width: 26px;
      height: 28px;
      border-radius: 5px;
      background: #3B3E45;
      color: #FFFFFF;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.84rem;
      font-weight: 900;
      letter-spacing: 0;
    }

    .combo-letter-slot.fb-locked, .combo-letter-slot.fb-correct {
      background: #2CC990;
      color: #091710;
    }

    .combo-letter-slot.fb-present {
      background: #F59E0B;
      color: #091710;
    }

    .combo-active-clue {
      font-size: 0.74rem;
      font-style: italic;
      color: rgba(255, 255, 255, 0.78);
      text-align: center;
      margin: 0.1rem 0 0.2rem;
    }

    .combo-qwerty {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.32rem;
      margin-top: 0.35rem;
    }

    .qwerty-row {
      display: flex;
      justify-content: center;
      gap: 4px;
    }

    .qwerty-key {
      min-width: 31px;
      height: 36px;
      padding: 0 6px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.14);
      font-size: 0.78rem;
      font-weight: 800;
    }

    .qwerty-key.key-wide {
      min-width: 52px;
    }

    .combo-submit-pill {
      width: 100%;
      height: 36px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 0.8rem;
      font-weight: 800;
      margin-top: 0.15rem;
    }

    /* 10. SUDOKU BOARD & SKY-BLUE NUMPAD */
    .sudoku-grid {
      display: grid;
      grid-template-columns: repeat(9, 36px);
      gap: 1px;
      background: rgba(124, 196, 250, 0.28);
      border: 2.5px solid #7CC4FA;
      border-radius: 4px;
      touch-action: none;
    }

    .sudoku-cell {
      width: 36px;
      height: 36px;
      background: #14171F;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;
      font-weight: 600;
      color: #FFFFFF;
      position: relative;
    }

    .sudoku-cell.editable { color: #7CC4FA; font-weight: 800; }
    .sudoku-cell.related { background: #192638; }
    .sudoku-cell.same-num { background: #233A54; }
    .sudoku-cell.selected { background: #2E5B88; outline: 1.5px solid #7CC4FA; z-index: 2; }
    .sudoku-cell.conflict { background: rgba(239, 68, 68, 0.35); color: #FCA5A5; }

    .box-border-right { border-right: 2px solid #7CC4FA; }
    .box-border-bottom { border-bottom: 2px solid #7CC4FA; }

    .sudoku-notes {
      font-size: 0.5rem;
      line-height: 1;
      color: #93C5FD;
      word-break: break-all;
      padding: 1px;
    }

    .sudoku-sky-numpad {
      display: grid;
      grid-template-columns: repeat(5, 44px);
      gap: 6px;
      margin-top: 0.35rem;
    }

    .sky-num-btn {
      height: 42px;
      border-radius: 8px;
      background: #7CC4FA;
      border-bottom: 3px solid #4A90C8;
      color: #0B192C;
      font-size: 1.15rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sky-num-btn.notes-active {
      background: #F59E0B;
      border-bottom-color: #B45309;
      color: #FFFFFF;
    }

    /* 11. BONZA, SHAPES, & KEYSMASH */
    .bonza-grid, .shapes-grid {
      display: grid;
      gap: 4px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.35);
      border-radius: 10px;
      touch-action: none;
    }

    .bonza-cell, .shape-board-cell {
      aspect-ratio: 1;
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px dashed rgba(255, 255, 255, 0.14);
      font-size: 0.98rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bonza-cell.has-tile {
      background: #2A2D36;
      border: 2px solid rgba(255, 255, 255, 0.28);
    }

    .bonza-cell.selected-frag { border-color: #F59E0B; }
    .bonza-cell.aligned-green { background: #1DB968; border-color: #1DB968; color: #081C11; }
    .bonza-cell.conflict, .shape-board-cell.conflict { border-color: #EF4444; background: rgba(239, 68, 68, 0.25); }

    .shape-board-cell.in-silhouette {
      border: 2px solid rgba(255, 255, 255, 0.32);
      background: rgba(255, 255, 255, 0.08);
    }

    .sil-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
    }

    .shape-tray-compact {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .shape-piece-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.5rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid transparent;
    }

    .shape-piece-chip.selected { border-color: var(--piece-color, #F59E0B); }

    .mini-poly-grid {
      display: grid;
      grid-template-columns: repeat(4, 8px);
      gap: 1.5px;
    }

    .mp-cell {
      width: 8px;
      height: 8px;
      border-radius: 1.5px;
      background: rgba(255, 255, 255, 0.08);
    }

    .ks-progress-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.35rem;
      width: 100%;
    }

    .ks-step-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.35rem 0.55rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.08);
      font-size: 0.74rem;
      font-weight: 700;
    }

    .ks-step-pill.active { border: 1px solid #FFFFFF; }

    .ks-card {
      width: 100%;
      padding: 1rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.7rem;
      text-align: center;
    }

    .ks-clue { font-size: 0.95rem; font-weight: 700; }

    .ks-word-row {
      display: flex;
      gap: 0.3rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .ks-char-tile {
      width: 36px;
      height: 42px;
      border-radius: 6px;
      background: #23252C;
      border: 2px solid rgba(255, 255, 255, 0.2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;
      font-weight: 800;
    }

    .ks-char-tile.vowel-slot { border-color: #FB923C; color: #FB923C; }
    .ks-char-tile.vowel-slot.solved { border-color: #2CC990; color: #2CC990; }

    .ks-vowel-keyboard {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .vowel-key-btn {
      width: 38px;
      height: 38px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.14);
      font-weight: 800;
    }

    /* SHARED CARDS, BUTTONS & MODALS */
    .hub-section { display: flex; flex-direction: column; gap: 1rem; }
    .section-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }
    .section-title { font-size: 1.2rem; font-weight: 800; }
    .section-sub { font-size: 0.84rem; color: var(--text-muted); }
    .link-btn { color: var(--text-primary); font-weight: 700; font-size: 0.82rem; text-decoration: underline; }

    .milestone-strip { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.75rem; }
    .milestone-box { display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.85rem 1rem; border-radius: var(--radius-md); background: var(--bg-surface); border: 1px solid var(--border-subtle); font-size: 0.82rem; }
    .milestone-box.earned { border-color: rgba(44, 201, 144, 0.4); }
    .ms-indicator { font-weight: 800; color: var(--accent-emerald); }
    .milestone-box p { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem; }

    .archive-summary-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; }
    .archive-stat-card { padding: 0.9rem 1rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.2rem; }
    .as-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; color: var(--text-muted); }
    .as-val { font-size: 1.15rem; font-weight: 800; }

    .weekly-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.45rem; }
    .week-day-pill { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; padding: 0.5rem 0.3rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); font-size: 0.74rem; }
    .week-day-pill.today { border-color: var(--text-primary); }
    .week-day-pill.done { border-color: var(--accent-emerald); color: var(--accent-emerald); font-weight: 700; }

    .daily-lineup-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 0.8rem; }
    .puzzle-card { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; gap: 0.55rem; }
    .puzzle-card.solved { border-color: rgba(44, 201, 144, 0.45); }
    .pc-top { display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; }
    .diff-badge { font-size: 0.7rem; font-weight: 700; padding: 0.12rem 0.45rem; border-radius: 4px; background: var(--bg-elevated); }
    .diff-easy { color: #2CC990; }
    .diff-medium { color: #F59E0B; }
    .diff-hard { color: #FB7185; }
    .pc-title { font-size: 1rem; font-weight: 800; }
    .pc-sub { font-size: 0.8rem; color: var(--text-muted); }
    .pc-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 0.3rem; padding-top: 0.55rem; border-top: 1px solid var(--border-subtle); font-size: 0.76rem; }
    .play-chip-btn { padding: 0.32rem 0.75rem; border-radius: var(--radius-sm); background: var(--bg-elevated); border: 1px solid var(--border-strong); font-weight: 700; font-size: 0.76rem; }

    .filter-bar { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }
    .filter-chip { padding: 0.35rem 0.7rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); font-size: 0.78rem; font-weight: 600; }
    .filter-chip.active { background: var(--text-primary); color: var(--bg-base); border-color: var(--text-primary); }

    .cat-showcase-block { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .csb-title-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.4rem; }
    .cc-icon { width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--bg-elevated); border: 1px solid var(--border-subtle); display: inline-flex; align-items: center; justify-content: center; }
    .cc-domain { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); font-weight: 700; }
    .csb-rules { padding-left: 1.2rem; font-size: 0.82rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.2rem; }
    .csb-levels { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 0.75rem; }

    .ctrl-btn { padding: 0.38rem 0.7rem; border-radius: var(--radius-sm); background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.18); font-weight: 700; font-size: 0.76rem; }
    .primary-cta { padding: 0.55rem 1.05rem; border-radius: var(--radius-sm); background: #FFFFFF; color: #090A0F; font-weight: 800; font-size: 0.84rem; }
    .secondary-cta { padding: 0.55rem 1rem; border-radius: var(--radius-sm); background: var(--bg-elevated); border: 1px solid var(--border-strong); font-weight: 700; font-size: 0.82rem; }
    .danger-cta { padding: 0.55rem 1rem; border-radius: var(--radius-sm); background: var(--danger); color: #FFFFFF; font-weight: 700; font-size: 0.82rem; }
    .compact-cta { padding: 0.4rem 0.8rem; font-size: 0.78rem; }

    .modal-backdrop { position: fixed; inset: 0; z-index: 60; background: rgba(0, 0, 0, 0.82); display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal-card { width: 100%; max-width: 450px; background: #18191E; color: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 18px; padding: 1.4rem; }
    .win-modal { text-align: center; }
    .win-stars { font-size: 2rem; color: #F59E0B; letter-spacing: 0.1em; }
    .win-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.45rem; margin: 0.9rem 0; }
    .win-stat-box { padding: 0.5rem; border-radius: var(--radius-sm); background: #23252C; display: flex; flex-direction: column; }
    .ws-val { font-weight: 800; font-size: 0.9rem; }
    .ws-lbl { font-size: 0.68rem; color: var(--text-muted); }
    .share-preview-box { padding: 0.6rem; border-radius: var(--radius-sm); background: #0D0E12; border: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.76rem; margin-bottom: 0.9rem; white-space: pre-wrap; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.9rem; }
    .modal-actions { display: flex; align-items: center; justify-content: center; gap: 0.6rem; flex-wrap: wrap; }
    .settings-list { display: flex; flex-direction: column; gap: 0.8rem; }
    .setting-row { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding-bottom: 0.7rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.82rem; }
    .setting-row p { font-size: 0.74rem; color: var(--text-muted); }
    .segmented-ctrl { display: flex; gap: 0.2rem; background: #23252C; padding: 0.18rem; border-radius: var(--radius-sm); }
    .seg-btn { padding: 0.28rem 0.55rem; border-radius: 4px; font-size: 0.74rem; font-weight: 700; }
    .seg-btn.active { background: #FFFFFF; color: #090A0F; }
    .ww-word-list { display: flex; flex-direction: column; gap: 0.45rem; }
    .ww-word-item { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border-radius: 8px; background: #23252C; font-size: 0.8rem; }
    .ww-word-item.found { border-left: 3px solid #2CC990; }

    .puzzled-toast {
      position: fixed;
      bottom: 1.15rem;
      right: 1.15rem;
      z-index: 80;
      padding: 0.55rem 0.95rem;
      border-radius: 8px;
      background: #23252C;
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: #FFFFFF;
      font-size: 0.8rem;
      font-weight: 700;
      opacity: 0;
      pointer-events: none;
      transform: translateY(6px);
      transition: opacity 0.15s, transform 0.15s;
    }

    .puzzled-toast.visible { opacity: 1; transform: translateY(0); }
    .meta-muted { font-size: 0.76rem; color: var(--text-muted); }
    .date-input { background: var(--bg-elevated); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); padding: 0.3rem 0.55rem; font-size: 0.8rem; }


    /* ANIMATION, MOTION POLISH & REDUCED-MOTION RESPECT */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    /* Screen blink fix: Smooth fade-in once on app root load, no flicker on re-renders */
    #app-root {
      animation: puzzleAppEnter 160ms ease-out;
    }

    @keyframes puzzleAppEnter {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes puzzleStageEnter {
      from { transform: translateY(0); }
      to { transform: translateY(0); }
    }

    @keyframes puzzleTileLockPop {
      0% { transform: scale(0.92); }
      60% { transform: scale(1.06); }
      100% { transform: scale(1); }
    }

    @keyframes puzzleConflictShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      75% { transform: translateX(3px); }
    }

    @keyframes puzzleWinModalPop {
      from { opacity: 0; transform: translateY(10px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Screen blink fix: Do not animate opacity or transform on re-rendered stage containers */
    .tudum-phone-card, .hub-container {
      will-change: auto;
    }

    .tudum-bento-card {
      transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1), border-color 180ms ease, box-shadow 180ms ease;
    }

    .tudum-bento-card:hover, .tudum-bento-card:focus-visible {
      transform: translateY(-2px) scale(1.012);
    }

    .tudum-card-icon {
      transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .tudum-bento-card:hover .tudum-card-icon,
    .tudum-bento-card:focus-visible .tudum-card-icon {
      transform: scale(1.04);
    }

    .locked-green, .aligned-green, .tile-locked, .ww-cell.found-path, .star-cell {
      animation: puzzleTileLockPop 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .conflict {
      animation: puzzleConflictShake 200ms ease-in-out;
    }

    .modal-card {
      animation: puzzleWinModalPop 190ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* STUDIO FOOTER & LEGAL VIEWS */
    .puzzled-footer {
      max-width: 1180px;
      margin: 2rem auto 0;
      padding: 1.25rem 1.5rem 2rem;
      border-top: 1px solid var(--border-subtle);
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .footer-brand-col {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .footer-brand-col strong {
      color: var(--text-primary);
      letter-spacing: 0.04em;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      flex-wrap: wrap;
    }

    .legal-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
    }

    .legal-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.85rem;
    }

    /* RESPONSIVE BREAKPOINTS */
    @media (max-width: 960px) {
      .tudum-bento-grid {
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: 136px;
      }
      .bento-pos-neon { grid-column: 1 / 3; grid-row: span 2; }
      .bento-pos-currents, .bento-pos-snippets, .bento-pos-wordsmith, .bento-pos-starstruck,
      .bento-pos-bonza, .bento-pos-waywords, .bento-pos-crossover, .bento-pos-jigsaw,
      .bento-pos-combo, .bento-pos-sudoku {
        grid-column: span 1;
        grid-row: span 1;
      }
      .prog-row { grid-template-columns: 1fr; gap: 0.5rem; }
      .prog-summary { display: none; }
    }

    @media (max-width: 520px) {
      .puzzled-main { padding: 0.75rem; }
      .puzzled-header { padding: 0.5rem 0.7rem; gap: 0.4rem; }
      .header-nav { margin-left: 0; }
      .nav-pill { padding: 0.25rem 0.45rem; font-size: 0.74rem; }
      .tudum-bento-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .tudum-phone-card {
        border-radius: 16px;
        padding: 0.85rem 0.65rem;
        min-height: 620px;
      }
      .sudoku-grid { grid-template-columns: repeat(9, 28px); }
      .sudoku-cell { width: 28px; height: 28px; font-size: 0.86rem; }
      .sudoku-sky-numpad { grid-template-columns: repeat(5, 38px); }
      .jigsaw-photo-grid { grid-template-columns: repeat(3, 82px) !important; }
      .jigsaw-tile-wrap { width: 82px; height: 82px; }
      .starstruck-board-frame { transform: scale(0.92); transform-origin: center; }
      .neon-lattice-wrap, .currents-liquid-stage { transform: scale(0.9); transform-origin: center; }
      .qwerty-key { min-width: 26px; padding: 0 4px; font-size: 0.72rem; }
    }
  </style>
</head>
<body>
  <svg width="0" height="0" class="sr-only" aria-hidden="true"><defs><linearGradient id="aur-sky"></linearGradient></defs></svg>
  <noscript><div style="padding:2rem;text-align:center;color:#fff;background:#000;">Puzzle requires JavaScript to run its 13 interactive daily puzzle engines.</div></noscript>
  <div id="app-root"></div>
  <script>
${bundleJs}
  </script>
</body>
</html>`;
}
