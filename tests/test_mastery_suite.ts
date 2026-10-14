/**
 * tests/test_mastery_suite.ts
 * CS 수학 마스터리 알고리즘 + 8개 언어 80개 프로젝트 워크스페이스 +
 * 수식-코드 2중 필사(math-cs-tracer) + 시뮬레이터 프리셋 & 복습 플래시카드 덱(review-bookmarks) 통합 검증 스위트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT_DIR = path.resolve(__dirname, '..');

const MathCsTracer = require(
  path.join(ROOT_DIR, 'site', 'web', 'static', 'math-ee', 'math-cs-tracer.js'),
);
const ReviewBookmarks = require(
  path.join(ROOT_DIR, 'site', 'web', 'static', 'math-ee', 'review-bookmarks.js'),
);

// 1. 유클리드 호제법 (GCD & LCM) 알고리즘 검증
function tsGcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a < 0n ? -a : a;
}

function tsLcm(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  return (a / tsGcd(a, b)) * b;
}

// 2. 피타고라스 거리 및 반경 판정
function distanceSquared(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

function euclideanDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(distanceSquared(p1, p2));
}

function isWithinRadius(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  r: number,
): boolean {
  return distanceSquared(p1, p2) <= r * r;
}

// 3. 비트마스크 집합
class BitSet {
  constructor(public readonly mask: bigint = 0n) {}
  add(elem: number): BitSet {
    return new BitSet(this.mask | (1n << BigInt(elem)));
  }
  remove(elem: number): BitSet {
    return new BitSet(this.mask & ~(1n << BigInt(elem)));
  }
  has(elem: number): boolean {
    return (this.mask & (1n << BigInt(elem))) !== 0n;
  }
  union(other: BitSet): BitSet {
    return new BitSet(this.mask | other.mask);
  }
  intersect(other: BitSet): BitSet {
    return new BitSet(this.mask & other.mask);
  }
  diff(other: BitSet): BitSet {
    return new BitSet(this.mask & ~other.mask);
  }
  count(): number {
    let m = this.mask,
      cnt = 0;
    while (m > 0n) {
      cnt += Number(m & 1n);
      m >>= 1n;
    }
    return cnt;
  }
}

// 4. 가우스-조던 소거법 (RREF)
function gaussianSolve(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let k = 0; k < n; k++) {
    let maxRow = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) > Math.abs(M[maxRow][k])) maxRow = i;
    }
    [M[k], M[maxRow]] = [M[maxRow], M[k]];
    if (Math.abs(M[k][k]) < 1e-12) return null;

    const pivot = M[k][k];
    for (let j = k; j <= n; j++) M[k][j] /= pivot;
    for (let i = 0; i < n; i++) {
      if (i !== k) {
        const factor = M[i][k];
        for (let j = k; j <= n; j++) M[i][j] -= factor * M[k][j];
      }
    }
  }
  return M.map((row) => row[n]);
}

describe('CS 수학 마스터리 자동 채점 및 북마크·필사 통합 테스트 스위트', () => {
  it('[Stage 1] 유클리드 호제법 (GCD/LCM) 정확성 검증', () => {
    assert.equal(tsGcd(48n, 18n), 6n);
    assert.equal(tsGcd(1071n, 462n), 21n);
    assert.equal(tsGcd(13n, 17n), 1n);
    assert.equal(tsGcd(0n, 5n), 5n);
    assert.equal(tsLcm(4n, 6n), 12n);
    assert.equal(tsLcm(21n, 6n), 42n);
  });

  it('[Stage 1] 피타고라스 유클리드 거리 및 제곱 최적화 검증', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 3, y: 4 };
    assert.equal(euclideanDistance(p1, p2), 5.0);
    assert.equal(isWithinRadius(p1, p2, 5.0), true);
    assert.equal(isWithinRadius(p1, p2, 4.9), false);
    assert.equal(isWithinRadius(p1, p2, 5.1), true);
  });

  it('[Stage 2] 비트마스크 집합 연산 무결성 검증', () => {
    const a = new BitSet().add(1).add(3).add(5);
    const b = new BitSet().add(3).add(4).add(5);

    assert.equal(a.has(1), true);
    assert.equal(a.has(2), false);
    assert.equal(a.count(), 3);

    const u = a.union(b);
    assert.equal(u.count(), 4);
    assert.equal(u.has(4), true);

    const inter = a.intersect(b);
    assert.equal(inter.count(), 2);
    assert.equal(inter.has(3), true);
    assert.equal(inter.has(5), true);
    assert.equal(inter.has(1), false);

    const diff = a.diff(b);
    assert.equal(diff.count(), 1);
    assert.equal(diff.has(1), true);
  });

  it('[Stage 4] 가우스 소거법 3x3 연립일차방정식 수치 정밀도 검증', () => {
    const A = [
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2],
    ];
    const b = [8, -11, -3];
    const sol = gaussianSolve(A, b);

    assert.ok(sol !== null);
    assert.ok(Math.abs(sol[0] - 2.0) < 1e-9);
    assert.ok(Math.abs(sol[1] - 3.0) < 1e-9);
    assert.ok(Math.abs(sol[2] - -1.0) < 1e-9);
  });

  it('[Step 1] Lisp 및 NASM 포함 8개 언어 80개 로컬 프로젝트 워크스페이스 무결성 검증', () => {
    const langs = ['c', 'go', 'rust', 'python', 'typescript', 'javascript', 'lisp', 'nasm'];
    let totalProjects = 0;

    for (const lang of langs) {
      const langDir = path.join(ROOT_DIR, 'projects', lang);
      assert.ok(fs.existsSync(langDir), `Missing language directory: ${langDir}`);
      const slugs = fs
        .readdirSync(langDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
        .map((d) => d.name);

      assert.equal(slugs.length, 10, `Expected 10 projects for ${lang}, got ${slugs.length}`);
      for (const slug of slugs) {
        const pDir = path.join(langDir, slug);
        assert.ok(fs.existsSync(path.join(pDir, 'project.json')), `${lang}/${slug} missing project.json`);
        assert.ok(fs.existsSync(path.join(pDir, 'README.md')), `${lang}/${slug} missing README.md`);
        assert.ok(fs.existsSync(path.join(pDir, 'starter')), `${lang}/${slug} missing starter/`);
        assert.ok(fs.existsSync(path.join(pDir, 'solution')), `${lang}/${slug} missing solution/`);
        assert.ok(fs.existsSync(path.join(pDir, 'tests')), `${lang}/${slug} missing tests/`);
        totalProjects++;
      }
    }

    assert.equal(totalProjects, 80);
  });

  it('[Step 2] 수식-코드 2중 필사(math-cs-tracer) LaTeX·코드·빈칸·퀴즈 검증', () => {
    const latexRes = MathCsTracer.verifyLatexStep(
      '\\gcd(a, b) = \\gcd(b, a \\bmod b)',
      '  \\gcd(a, b) =   \\gcd(b, a \\bmod b) ',
    );
    assert.equal(latexRes.matched, true);

    const codeRes = MathCsTracer.verifyCodeLine(
      '  return euclid_gcd(b, a % b)',
      'return euclid_gcd(b, a % b)',
    );
    assert.equal(codeRes.matched, true);

    const blankRes = MathCsTracer.verifyFillBlanks(
      ['a \\pmod b', 'r'],
      ['a \\pmod b', ' r '],
    );
    assert.equal(blankRes.allCorrect, true);

    const quizRes = MathCsTracer.gradeQuizAnswers(
      [
        { id: 'q1', answerIndex: 0, explanation: 'e1' },
        { id: 'q2', answerIndex: 2, explanation: 'e2' },
      ],
      [0, 2],
    );
    assert.equal(quizRes.score, 2);
    assert.equal(quizRes.passed, true);
  });

  it('[Step 3] 시뮬레이터 프리셋 북마크(proStudyBookmarks) 및 E-ink 플래시카드 복습 루프 검증', () => {
    const store = ReviewBookmarks.createReviewDeckStore();

    // 1. 필사 뷰어 북마크 추가
    const mathCard = store.addBookmark({
      lessonId: 'mod-1-1-gcd-euclid',
      category: 'math-formula',
      title: '유클리드 호제법 점화식',
      prompt: 'a를 b로 나눈 나머지가 r일 때 gcd(a, b)의 등식은?',
      answerSnippet: '\\gcd(a, b) = \\gcd(b, a \\bmod b)',
      memo: '나머지가 0이 될 때까지 반복',
    });
    assert.equal(mathCard.lessonId, 'mod-1-1-gcd-euclid');
    assert.equal(mathCard.mastered, false);

    // 2. 시뮬레이터 실험 프리셋 북마크 추가 (CPU, 회로, 인버터)
    const cpuPreset = ReviewBookmarks.captureSimulatorPreset(
      'sim-computer',
      { program: 'alu-add', acc: 42, pc: 6 },
      'ALU 덧셈 후 Z/C 플래그 변화 확인',
    );
    const savedCpu = store.addBookmark(cpuPreset);
    assert.equal(savedCpu.category, 'simulator-cpu');
    assert.ok(savedCpu.answerSnippet.includes('"acc": 42'));

    // 3. 플래시카드 복습 루프: 문제 보기 -> 정답 펼치기 -> 완전히 이해함 체크
    let state = store.startCardSession(0);
    assert.equal(state.total, 2);
    assert.equal(state.answerRevealed, false);

    state = store.revealAnswer();
    assert.equal(state.answerRevealed, true);

    const updated = store.markMastered(state.card.id, true);
    assert.ok(updated);
    assert.equal(updated.mastered, true);

    state = store.getCurrentCardState();
    assert.equal(state.masteredCount, 1);
    assert.equal(state.pendingCount, 1);

    // 4. E-ink 무잔상 스타일(viewer.css) 규칙 확인
    const cssContent = fs.readFileSync(
      path.join(ROOT_DIR, 'site', 'web', 'static', 'math-ee', 'viewer.css'),
      'utf8',
    );
    assert.ok(cssContent.includes('.review-deck-modal'));
    assert.ok(cssContent.includes('.review-flashcard'));
    assert.ok(cssContent.includes('transition: none !important'));
    assert.ok(cssContent.includes('animation: none !important'));
  });
});
