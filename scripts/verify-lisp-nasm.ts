#!/usr/bin/env node
/**
 * scripts/verify-lisp-nasm.ts
 *
 * Verification script for Lisp (Common Lisp) and NASM (x86-64)
 * curriculum project suites in pro-study.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');
const SCHEMA_FILE = path.join(PROJECTS_DIR, '_schema', 'project.schema.json');

const args = process.argv.slice(2);
const runAll = args.includes('--all') || args.length === 0;
const runSchemaOnly = args.includes('--schema-only');
const runLispBasic = runAll || args.includes('--lisp-basic');
const runLispAdvanced = runAll || args.includes('--lisp-advanced');
const runNasmBasic = runAll || args.includes('--nasm-basic');
const runNasmAdvanced = runAll || args.includes('--nasm-advanced');

interface ValidationResult {
  title: string;
  passed: boolean;
  errors: string[];
}

const results: ValidationResult[] = [];

function check(title: string, fn: () => string[] | boolean): void {
  try {
    const res = fn();
    if (res === true || (Array.isArray(res) && res.length === 0)) {
      results.push({ title, passed: true, errors: [] });
    } else if (Array.isArray(res)) {
      results.push({ title, passed: false, errors: res });
    } else {
      results.push({ title, passed: false, errors: ['Failed'] });
    }
  } catch (err: any) {
    results.push({ title, passed: false, errors: [err.message || String(err)] });
  }
}

// -------------------------------------------------------------
// Gate 1: Schema & Integration Checks
// -------------------------------------------------------------
if (runSchemaOnly || runAll) {
  check('project.schema.json includes lisp and nasm', () => {
    const schemaRaw = fs.readFileSync(SCHEMA_FILE, 'utf8');
    const schema = JSON.parse(schemaRaw);
    const errors: string[] = [];

    const idPattern = schema.properties?.id?.pattern || '';
    if (!idPattern.includes('lisp') || !idPattern.includes('nasm')) {
      errors.push(`id pattern does not include lisp and nasm: ${idPattern}`);
    }

    const langEnum = schema.properties?.lang?.enum || [];
    if (!langEnum.includes('lisp') || !langEnum.includes('nasm')) {
      errors.push(`lang enum does not include lisp and nasm: ${JSON.stringify(langEnum)}`);
    }

    return errors;
  });

  check('site/internal/catalog/catalog.go includes lisp and nasm', () => {
    const catPath = path.join(ROOT_DIR, 'site', 'internal', 'catalog', 'catalog.go');
    const content = fs.readFileSync(catPath, 'utf8');
    const errors: string[] = [];
    if (!content.includes('"lisp"')) errors.push('catalog.go missing "lisp"');
    if (!content.includes('"nasm"')) errors.push('catalog.go missing "nasm"');
    return errors;
  });

  check('scripts/package-android-assets.js includes lisp and nasm', () => {
    const pkgPath = path.join(ROOT_DIR, 'scripts', 'package-android-assets.js');
    const content = fs.readFileSync(pkgPath, 'utf8');
    const errors: string[] = [];
    if (!content.includes("'lisp'")) errors.push('package-android-assets.js missing lisp');
    if (!content.includes("'nasm'")) errors.push('package-android-assets.js missing nasm');
    return errors;
  });

  check('Android layout and MainActivity bind lisp and nasm tabs', () => {
    const layoutPath = path.join(ROOT_DIR, 'android-app', 'app', 'src', 'main', 'res', 'layout', 'activity_main.xml');
    const mainKtPath = path.join(ROOT_DIR, 'android-app', 'app', 'src', 'main', 'java', 'com', 'prostudy', 'eink', 'MainActivity.kt');
    const layout = fs.readFileSync(layoutPath, 'utf8');
    const kt = fs.readFileSync(mainKtPath, 'utf8');
    const errors: string[] = [];

    if (!layout.includes('btn_tab_lisp')) errors.push('activity_main.xml missing btn_tab_lisp');
    if (!layout.includes('btn_tab_nasm')) errors.push('activity_main.xml missing btn_tab_nasm');
    if (!kt.includes('btn_tab_lisp')) errors.push('MainActivity.kt missing btn_tab_lisp binding');
    if (!kt.includes('btn_tab_nasm')) errors.push('MainActivity.kt missing btn_tab_nasm binding');

    return errors;
  });
}

function validateProject(lang: string, slug: string): string[] {
  const pDir = path.join(PROJECTS_DIR, lang, slug);
  const errors: string[] = [];

  if (!fs.existsSync(pDir)) {
    return [`Directory not found: ${pDir}`];
  }

  const jsonPath = path.join(pDir, 'project.json');
  const readmePath = path.join(pDir, 'README.md');
  const solutionDir = path.join(pDir, 'solution');
  const starterDir = path.join(pDir, 'starter');
  const testsDir = path.join(pDir, 'tests');

  if (!fs.existsSync(jsonPath)) errors.push(`Missing project.json in ${slug}`);
  if (!fs.existsSync(readmePath)) errors.push(`Missing README.md in ${slug}`);
  if (!fs.existsSync(solutionDir)) errors.push(`Missing solution/ in ${slug}`);
  if (!fs.existsSync(starterDir)) errors.push(`Missing starter/ in ${slug}`);
  if (!fs.existsSync(testsDir)) errors.push(`Missing tests/ in ${slug}`);

  if (fs.existsSync(jsonPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      if (meta.lang !== lang) errors.push(`Expected lang ${lang}, got ${meta.lang}`);
      if (!meta.id || !meta.id.startsWith(`${lang}/`)) errors.push(`Invalid id: ${meta.id}`);
      if (!meta.title) errors.push('Missing title');
      if (!meta.summary) errors.push('Missing summary');
      if (!Array.isArray(meta.concepts) || meta.concepts.length === 0) errors.push('Missing concepts array');
      if (!meta.entry) errors.push('Missing entry');
      if (!Array.isArray(meta.build)) errors.push('Missing build commands array');
      if (!Array.isArray(meta.run)) errors.push('Missing run commands array');
      if (!meta.test || !meta.test.kind) errors.push('Missing test specification');
    } catch (e: any) {
      errors.push(`Invalid JSON in ${jsonPath}: ${e.message}`);
    }
  }

  return errors;
}

// -------------------------------------------------------------
// Gate 2: Lisp Basic (01 to 05)
// -------------------------------------------------------------
if (!runSchemaOnly && runLispBasic) {
  const slugs = ['01-calc', '02-textkit', '03-symbolic-math', '04-unit-test-framework', '05-html-dsl'];
  for (const s of slugs) {
    check(`Lisp Project: lisp/${s}`, () => validateProject('lisp', s));
  }
}

// -------------------------------------------------------------
// Gate 3: Lisp Advanced (06 to 10)
// -------------------------------------------------------------
if (!runSchemaOnly && runLispAdvanced) {
  const slugs = ['06-resilient-crawler', '07-rpg-engine', '08-query-engine', '09-meta-circular-evaluator', '10-bytecode-vm'];
  for (const s of slugs) {
    check(`Lisp Project: lisp/${s}`, () => validateProject('lisp', s));
  }
}

// -------------------------------------------------------------
// Gate 4: NASM Basic (01 to 05)
// -------------------------------------------------------------
if (!runSchemaOnly && runNasmBasic) {
  const slugs = ['01-cli-calc', '02-string-toolkit', '03-buffered-io-cat', '04-sort-comparator', '05-arena-allocator'];
  for (const s of slugs) {
    check(`NASM Project: nasm/${s}`, () => validateProject('nasm', s));
  }
}

// -------------------------------------------------------------
// Gate 5: NASM Advanced (06 to 10)
// -------------------------------------------------------------
if (!runSchemaOnly && runNasmAdvanced) {
  const slugs = ['06-simd-vector-ops', '07-sha256-hasher', '08-elf64-parser', '09-coroutine-scheduler', '10-tiny-jit-vm'];
  for (const s of slugs) {
    check(`NASM Project: nasm/${s}`, () => validateProject('nasm', s));
  }
}

// -------------------------------------------------------------
// Execution & Reporting
// -------------------------------------------------------------
console.log('=== Lisp & NASM Curriculum Suite Verification ===\n');
let allPassed = true;

for (const r of results) {
  const status = r.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`[${status}] ${r.title}`);
  if (!r.passed) {
    allPassed = false;
    for (const e of r.errors) {
      console.log(`    - ${e}`);
    }
  }
}

console.log('\n------------------------------------------------');
if (allPassed) {
  console.log('All executed checks PASSED successfully! (100%)');
  process.exit(0);
} else {
  console.error('Some verification checks FAILED.');
  process.exit(1);
}
