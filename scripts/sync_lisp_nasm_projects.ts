#!/usr/bin/env node
/**
 * scripts/sync_lisp_nasm_projects.ts
 *
 * android-app/app/src/main/assets/content/lisp_*.json 및 nasm_*.json 에셋으로부터
 * projects/lisp/01..10-* 및 projects/nasm/01..10-* 로컬 프로젝트 워크스페이스
 * (project.json, README.md, starter/, solution/, tests/cases/)를 동기화 및 복원한다.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_CONTENT_DIR = path.join(
  ROOT_DIR,
  'android-app',
  'app',
  'src',
  'main',
  'assets',
  'content',
);
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');

interface AssetProjectJson {
  id: string;
  lang: 'lisp' | 'nasm';
  order: number;
  title: string;
  summary: string;
  difficulty: number;
  concepts: string[];
  entry: string;
  readme: string;
  starterCode: Record<string, string>;
  solutionCode: Record<string, string>;
}

const DEFAULT_TEST_CASES: Record<string, Array<{ name: string; in: string; out: string }>> = {
  'lisp/01-calc': [
    { name: '01-basic', in: '(+ 1 2)\n', out: '3\n' },
    { name: '02-nested', in: '(* (+ 2 3) (- 10 4))\n', out: '30\n' },
    { name: '03-ratio', in: '(/ 9 6)\n', out: '3/2\n' },
    { name: '04-divzero', in: '(/ 5 0)\n', out: 'error: division by zero\n' },
  ],
  'lisp/02-textkit': [
    { name: '01-freq', in: 'Hello world! Hello Lisp.\n', out: 'hello: 2\nlisp: 1\nworld: 1\n' },
  ],
  'lisp/03-symbolic-math': [
    { name: '01-poly', in: '(+ (* 3 x) 5)\n', out: '3\n' },
  ],
  'lisp/04-unit-test-framework': [
    { name: '01-suite', in: '\n', out: 'PASS: arithmetic-suite (2/2)\n' },
  ],
  'lisp/05-html-dsl': [
    { name: '01-render', in: '\n', out: '<div class="card"><h1>Hello Lisp</h1><p>DSL</p></div>\n' },
  ],
  'lisp/06-resilient-crawler': [
    { name: '01-restart', in: '\n', out: 'Fetched 3 URLs (1 recovered via use-cached-response)\n' },
  ],
  'lisp/07-rpg-engine': [
    { name: '01-combat', in: '\n', out: 'Paladin attacks Dragon with HolyAvenger: 45 dmg!\n' },
  ],
  'lisp/08-query-engine': [
    { name: '01-select', in: '\n', out: 'Found 2 matching records: (ALICE BOB)\n' },
  ],
  'lisp/09-meta-circular-evaluator': [
    { name: '01-closure', in: '\n', out: 'Meta-Eval Result: 120\n' },
  ],
  'lisp/10-bytecode-vm': [
    { name: '01-calc-vm', in: '\n', out: '60\n' },
  ],
  'nasm/01-cli-calc': [
    { name: '01-calc', in: '\n', out: '46\n' },
  ],
  'nasm/02-string-toolkit': [
    { name: '01-len', in: '\n', out: 'Length: 21\n' },
  ],
  'nasm/03-buffered-io-cat': [
    { name: '01-cat', in: '\n', out: 'Buffered I/O Cat Ready: 65536 bytes buffer initialized.\n' },
  ],
  'nasm/04-sort-comparator': [
    { name: '01-sort', in: '\n', out: 'Sorted: 10 20 30 40 50\n' },
  ],
  'nasm/05-arena-allocator': [
    { name: '01-arena', in: '\n', out: 'Arena allocated 1024 bytes (16-byte aligned)\n' },
  ],
  'nasm/06-simd-vector-ops': [
    { name: '01-simd', in: '\n', out: 'SIMD Dot Product: 70.0\n' },
  ],
  'nasm/07-sha256-hasher': [
    { name: '01-sha256', in: '\n', out: 'SHA-256 H0 Initialized: 0x6a09e667\n' },
  ],
  'nasm/08-elf64-parser': [
    { name: '01-elf64', in: '\n', out: 'ELF64 Magic Verified: 0x7F 45 4C 46 (x86-64 Little Endian)\n' },
  ],
  'nasm/09-coroutine-scheduler': [
    { name: '01-coro', in: '\n', out: 'Coroutine Context Switch: Fiber A -> Fiber B -> Main\n' },
  ],
  'nasm/10-tiny-jit-vm': [
    { name: '01-jit', in: '\n', out: 'JIT Compiled Native Result: 55 (Execution: native call rax)\n' },
  ],
};

export function syncLispAndNasmProjects(): { synced: number; slugs: string[] } {
  if (!fs.existsSync(ASSETS_CONTENT_DIR)) {
    throw new Error(`Assets content directory not found: ${ASSETS_CONTENT_DIR}`);
  }

  const assetFiles = fs
    .readdirSync(ASSETS_CONTENT_DIR)
    .filter((f) => (f.startsWith('lisp_') || f.startsWith('nasm_')) && f.endsWith('.json'))
    .sort();

  const syncedSlugs: string[] = [];

  for (const file of assetFiles) {
    const fullPath = path.join(ASSETS_CONTENT_DIR, file);
    const asset: AssetProjectJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const [lang, slug] = asset.id.split('/');
    if (!lang || !slug) {
      throw new Error(`Invalid project id "${asset.id}" in ${file}`);
    }

    const projectDir = path.join(PROJECTS_DIR, lang, slug);
    const starterDir = path.join(projectDir, 'starter');
    const solutionDir = path.join(projectDir, 'solution');
    const casesDir = path.join(projectDir, 'tests', 'cases');

    fs.mkdirSync(starterDir, { recursive: true });
    fs.mkdirSync(solutionDir, { recursive: true });
    fs.mkdirSync(casesDir, { recursive: true });

    const buildCmd =
      lang === 'lisp'
        ? [
            'sbcl',
            '--noinform',
            '--non-interactive',
            '--load',
            asset.entry,
            '--eval',
            '(sb-ext:exit :code 0)',
          ]
        : ['nasm', '-f', 'elf64', '-o', 'build/main.o', asset.entry];

    const runCmd =
      lang === 'lisp'
        ? ['sbcl', '--script', asset.entry]
        : ['nasm', '-f', 'elf64', '-o', 'build/main.o', asset.entry];

    const projectJson = {
      id: asset.id,
      title: asset.title,
      summary: asset.summary,
      lang: asset.lang,
      order: asset.order,
      difficulty: asset.difficulty,
      concepts: asset.concepts,
      entry: asset.entry,
      build: buildCmd,
      run: runCmd,
      test: {
        kind: 'stdio-cases',
        dir: 'tests/cases',
      },
    };

    fs.writeFileSync(
      path.join(projectDir, 'project.json'),
      JSON.stringify(projectJson, null, 2) + '\n',
      'utf8',
    );
    fs.writeFileSync(path.join(projectDir, 'README.md'), asset.readme, 'utf8');

    for (const [relPath, code] of Object.entries(asset.starterCode || {})) {
      const target = path.join(starterDir, relPath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, code, 'utf8');
    }

    for (const [relPath, code] of Object.entries(asset.solutionCode || {})) {
      const target = path.join(solutionDir, relPath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, code, 'utf8');
    }

    const existingCases = fs.readdirSync(casesDir).filter((f) => f.endsWith('.in'));
    if (existingCases.length === 0) {
      const defaults = DEFAULT_TEST_CASES[asset.id] || [
        { name: '01-basic', in: '\n', out: '' },
      ];
      for (const tc of defaults) {
        fs.writeFileSync(path.join(casesDir, `${tc.name}.in`), tc.in, 'utf8');
        fs.writeFileSync(path.join(casesDir, `${tc.name}.out`), tc.out, 'utf8');
      }
    }

    syncedSlugs.push(asset.id);
  }

  return { synced: syncedSlugs.length, slugs: syncedSlugs };
}

if (require.main === module) {
  const res = syncLispAndNasmProjects();
  console.log(`=== Synced ${res.synced} Lisp & NASM project workspaces ===`);
  for (const s of res.slugs) {
    console.log(`  ✓ ${s}`);
  }
}
