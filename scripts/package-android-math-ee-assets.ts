#!/usr/bin/env node
/**
 * scripts/package-android-math-ee-assets.ts
 *
 * Packages all mathematical symbols, theorems, electrical & electronic engineering
 * content, offline KaTeX assets, and simulators into Android offline assets.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_STATIC_DIR = path.join(ROOT_DIR, 'site', 'web', 'static');
const SOURCE_MATH_EE_DIR = path.join(WEB_STATIC_DIR, 'math-ee');
const SOURCE_SIM_DIR = path.join(WEB_STATIC_DIR, 'simulators');
const DEST_ASSETS_DIR = path.join(ROOT_DIR, 'android-app', 'app', 'src', 'main', 'assets', 'math-ee');

function copyRecursive(src: string, dest: string): void {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

console.log('=== Packaging Android Math & EE Offline Assets ===');
console.log(`Source Web: ${SOURCE_MATH_EE_DIR}`);
console.log(`Dest Assets: ${DEST_ASSETS_DIR}`);

// 1. Ensure clean target directory
if (!fs.existsSync(DEST_ASSETS_DIR)) {
  fs.mkdirSync(DEST_ASSETS_DIR, { recursive: true });
}

// 2. Read consolidated manifest and verify
const manifestPath = path.join(SOURCE_MATH_EE_DIR, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`ERROR: Source manifest not found at ${manifestPath}`);
  process.exit(1);
}
const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
const manifestJson = JSON.parse(manifestRaw);

// Copy manifest.json
fs.writeFileSync(path.join(DEST_ASSETS_DIR, 'manifest.json'), manifestRaw, 'utf8');
console.log('✓ Copied manifest.json');

// Write manifest.data.js for instant 0ms WebView loading (avoids file:// fetch CORS)
const manifestDataJs = `window.__MATH_EE_MANIFEST__ = ${manifestRaw};\n`;
fs.writeFileSync(path.join(DEST_ASSETS_DIR, 'manifest.data.js'), manifestDataJs, 'utf8');
console.log('✓ Generated manifest.data.js');

// 3. Copy CSS and JS
fs.copyFileSync(path.join(SOURCE_MATH_EE_DIR, 'viewer.css'), path.join(DEST_ASSETS_DIR, 'viewer.css'));
fs.copyFileSync(path.join(SOURCE_MATH_EE_DIR, 'viewer.js'), path.join(DEST_ASSETS_DIR, 'viewer.js'));
console.log('✓ Copied viewer.css and viewer.js');

// 4. Copy KaTeX bundle
const srcKatex = path.join(SOURCE_MATH_EE_DIR, 'katex');
const destKatex = path.join(DEST_ASSETS_DIR, 'katex');
copyRecursive(srcKatex, destKatex);
console.log('✓ Copied offline KaTeX bundle (CSS, JS, Fonts)');

// 5. Copy Simulators bundle
const destSim = path.join(DEST_ASSETS_DIR, 'simulators');
copyRecursive(SOURCE_SIM_DIR, destSim);
console.log('✓ Copied EE and Electronics simulators');

// 6. Generate viewer.html optimized for Android WebView
const viewerHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>수학 기호·정리 증명 및 전기·전자공학 마스터 스위트</title>
  
  <!-- Offline KaTeX Styles -->
  <link rel="stylesheet" href="katex/katex.min.css">
  <link rel="stylesheet" href="viewer.css">
</head>
<body>

  <header class="app-header">
    <div class="brand-title">
      <span>📐⚡</span>
      <span>수학·전기·전자공학 마스터 스위트</span>
    </div>
    <nav class="tab-nav">
      <button class="tab-btn active" data-tab="math-symbols">수학 기호 백과</button>
      <button class="tab-btn" data-tab="math-theorems">12대 수학 증명</button>
      <button class="tab-btn" data-tab="electrical">전기공학 &amp; 시뮬레이터</button>
      <button class="tab-btn" data-tab="electronics">전자공학 &amp; 시뮬레이터</button>
    </nav>
  </header>

  <main class="container">
    <!-- TAB 1: Math Symbols -->
    <section id="tab-math-symbols" class="tab-pane active"></section>

    <!-- TAB 2: Math Theorems -->
    <section id="tab-math-theorems" class="tab-pane"></section>

    <!-- TAB 3: Electrical Engineering -->
    <section id="tab-electrical" class="tab-pane"></section>

    <!-- TAB 4: Electronic Engineering -->
    <section id="tab-electronics" class="tab-pane"></section>
  </main>

  <!-- Offline KaTeX Scripts -->
  <script src="katex/katex.min.js"></script>
  <script src="katex/auto-render.min.js"></script>

  <!-- Electrical Engineering Simulators -->
  <script src="simulators/ee/ee-sim-core.js"></script>
  <script src="simulators/ee/rlc-transient.js"></script>
  <script src="simulators/ee/phasor-power.js"></script>
  <script src="simulators/ee/three-phase.js"></script>
  <script src="simulators/ee/relay-sequence.js"></script>

  <!-- Electronic Engineering Simulators -->
  <script src="simulators/electronics/electronics-sim-core.js"></script>
  <script src="simulators/electronics/logic-sim.js"></script>
  <script src="simulators/electronics/opamp-bode.js"></script>
  <script src="simulators/electronics/transistor-curves.js"></script>
  <script src="simulators/electronics/timer555.js"></script>

  <!-- Manifest Preload Data & Main Controller -->
  <script src="manifest.data.js"></script>
  <script src="viewer.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(DEST_ASSETS_DIR, 'viewer.html'), viewerHtml, 'utf8');
console.log('✓ Generated Android WebView viewer.html');

console.log('\n--- Packaging Summary ---');
console.log(`- Symbols: ${manifestJson.mathSymbols.categories.reduce((acc: number, c: any) => acc + c.symbols.length, 0)} items`);
console.log(`- Theorems: ${manifestJson.mathTheorems.theorems.length} items`);
console.log(`- Electrical Modules: ${manifestJson.electrical.modules.length} modules`);
console.log(`- Electronics Modules: ${manifestJson.electronics.modules.length} modules`);
console.log('✓ All assets successfully packaged for Android offline bundle!');
