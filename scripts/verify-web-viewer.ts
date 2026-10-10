#!/usr/bin/env node
/**
 * scripts/verify-web-viewer.ts
 *
 * Validates the web viewer HTML, CSS, JavaScript, manifest, KaTeX assets,
 * and simulator linkages for the Math-EE interactive suite.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'site', 'web', 'static', 'math-ee');
const SIM_DIR = path.join(ROOT_DIR, 'site', 'web', 'static', 'simulators');

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, fn: () => boolean | string): void {
  try {
    const res = fn();
    if (res === true) {
      results.push({ name, passed: true, message: 'OK' });
    } else {
      results.push({ name, passed: false, message: typeof res === 'string' ? res : 'Failed' });
    }
  } catch (err: any) {
    results.push({ name, passed: false, message: err.message || String(err) });
  }
}

// 1. Check HTML existence & key tags
check('index.html structure', () => {
  const htmlPath = path.join(WEB_DIR, 'index.html');
  if (!fs.existsSync(htmlPath)) return 'index.html does not exist';
  const content = fs.readFileSync(htmlPath, 'utf8');

  if (!content.includes('<meta charset="utf-8">')) return 'Missing UTF-8 meta tag';
  if (!content.includes('viewport')) return 'Missing viewport meta tag';
  if (!content.includes('katex/katex.min.css')) return 'Missing KaTeX CSS link';
  if (!content.includes('viewer.css')) return 'Missing viewer.css link';
  if (!content.includes('katex/katex.min.js')) return 'Missing KaTeX JS script';
  if (!content.includes('viewer.js')) return 'Missing viewer.js script';
  if (!content.includes('tab-math-symbols')) return 'Missing math symbols tab';
  if (!content.includes('tab-math-theorems')) return 'Missing math theorems tab';
  if (!content.includes('tab-electrical')) return 'Missing electrical tab';
  if (!content.includes('tab-electronics')) return 'Missing electronics tab';

  return true;
});

// 2. Check CSS existence & responsive styles
check('viewer.css styles & responsiveness', () => {
  const cssPath = path.join(WEB_DIR, 'viewer.css');
  if (!fs.existsSync(cssPath)) return 'viewer.css does not exist';
  const content = fs.readFileSync(cssPath, 'utf8');

  if (!content.includes('@media')) return 'Missing responsive media queries';
  if (!content.includes('.symbol-card')) return 'Missing .symbol-card style';
  if (!content.includes('.theorem-item') && !content.includes('.theorem-card')) return 'Missing theorem card style';
  if (!content.includes('.module-layout') && !content.includes('.module-content-pane')) return 'Missing module style';
  if (!content.includes('.sim-canvas-box') && !content.includes('.sim-container')) return 'Missing simulator style';

  return true;
});

// 3. Check Manifest data integrity
check('manifest.json payload completeness', () => {
  const manifestPath = path.join(WEB_DIR, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return 'manifest.json does not exist';
  const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  let symCount = 0;
  if (data.mathSymbols && Array.isArray(data.mathSymbols.categories)) {
    data.mathSymbols.categories.forEach((c: any) => {
      if (Array.isArray(c.symbols)) symCount += c.symbols.length;
    });
  }

  if (symCount < 50) {
    return `Expected at least 50 symbols, got ${symCount}`;
  }
  if (!data.mathTheorems || !Array.isArray(data.mathTheorems.theorems) || data.mathTheorems.theorems.length < 10) {
    return `Expected at least 10 theorems, got ${data.mathTheorems ? data.mathTheorems.theorems?.length : 0}`;
  }
  if (!data.electrical || !Array.isArray(data.electrical.modules) || data.electrical.modules.length < 8) {
    return `Expected at least 8 electrical modules, got ${data.electrical ? data.electrical.modules?.length : 0}`;
  }
  if (!data.electronics || !Array.isArray(data.electronics.modules) || data.electronics.modules.length < 8) {
    return `Expected at least 8 electronics modules, got ${data.electronics ? data.electronics.modules?.length : 0}`;
  }

  return true;
});

// 4. Check Offline KaTeX assets
check('offline KaTeX assets complete', () => {
  const katexDir = path.join(WEB_DIR, 'katex');
  const requiredFiles = ['katex.min.css', 'katex.min.js', 'auto-render.min.js', 'fonts'];
  for (const f of requiredFiles) {
    if (!fs.existsSync(path.join(katexDir, f))) {
      return `Missing KaTeX asset: ${f}`;
    }
  }
  const fontFiles = fs.readdirSync(path.join(katexDir, 'fonts'));
  if (fontFiles.length === 0) return 'KaTeX fonts directory is empty';

  return true;
});

// 5. Check Simulators files
check('interactive simulators on disk', () => {
  const eeSims = ['ee-sim-core.js', 'rlc-transient.js', 'phasor-power.js', 'three-phase.js', 'relay-sequence.js'];
  for (const sim of eeSims) {
    const p = path.join(SIM_DIR, 'ee', sim);
    if (!fs.existsSync(p)) return `Missing EE simulator file: ${sim}`;
  }

  const elSims = ['electronics-sim-core.js', 'logic-sim.js', 'opamp-bode.js', 'transistor-curves.js', 'timer555.js'];
  for (const sim of elSims) {
    const p = path.join(SIM_DIR, 'electronics', sim);
    if (!fs.existsSync(p)) return `Missing Electronics simulator file: ${sim}`;
  }

  return true;
});

// 6. Check viewer.js exports/handlers
check('viewer.js functionality checks', () => {
  const viewerJsPath = path.join(WEB_DIR, 'viewer.js');
  if (!fs.existsSync(viewerJsPath)) return 'viewer.js does not exist';
  const content = fs.readFileSync(viewerJsPath, 'utf8');

  if (!content.includes('renderMathSymbols')) return 'Missing renderMathSymbols';
  if (!content.includes('renderMathTheorems')) return 'Missing renderMathTheorems';
  if (!content.includes('renderElectrical')) return 'Missing renderElectrical';
  if (!content.includes('renderElectronics')) return 'Missing renderElectronics';
  if (!content.includes('attachEESimulatorHandlers')) return 'Missing attachEESimulatorHandlers';
  if (!content.includes('attachELSimulatorHandlers')) return 'Missing attachELSimulatorHandlers';

  return true;
});

// Report Results
console.log('=== Web Interactive Viewer Integration Verification ===\n');
let allPassed = true;
for (const r of results) {
  const status = r.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`[${status}] ${r.name}: ${r.message}`);
  if (!r.passed) allPassed = false;
}

console.log('\n------------------------------------------------------');
if (allPassed) {
  console.log('All Web Viewer checks PASSED successfully! (100%)');
  process.exit(0);
} else {
  console.error('Some Web Viewer checks FAILED.');
  process.exit(1);
}
