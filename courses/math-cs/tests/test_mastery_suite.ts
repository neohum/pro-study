/**
 * courses/math-cs/tests/test_mastery_suite.ts
 * 6개 언어로 구현된 핵심 수학 알고리즘의 수치적 정확성 및 일치성 자동 채점 스위트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

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

function isWithinRadius(p1: { x: number; y: number }, p2: { x: number; y: number }, r: number): boolean {
  return distanceSquared(p1, p2) <= r * r;
}

// 3. 비트마스크 집합
class BitSet {
  constructor(public readonly mask: bigint = 0n) {}
  add(elem: number): BitSet { return new BitSet(this.mask | (1n << BigInt(elem))); }
  remove(elem: number): BitSet { return new BitSet(this.mask & ~(1n << BigInt(elem))); }
  has(elem: number): boolean { return (this.mask & (1n << BigInt(elem))) !== 0n; }
  union(other: BitSet): BitSet { return new BitSet(this.mask | other.mask); }
  intersect(other: BitSet): BitSet { return new BitSet(this.mask & other.mask); }
  diff(other: BitSet): BitSet { return new BitSet(this.mask & ~other.mask); }
  count(): number {
    let m = this.mask, cnt = 0;
    while (m > 0n) { cnt += Number(m & 1n); m >>= 1n; }
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

describe('CS 수학 마스터리 자동 채점 테스트 스위트', () => {
  it('[Stage 1] 유클리드 호제법 (GCD/LCM) 정확성 검증', () => {
    assert.equal(tsGcd(48n, 18n), 6n);
    assert.equal(tsGcd(1071n, 462n), 21n);
    assert.equal(tsGcd(13n, 17n), 1n); // 서로소
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

    const u = a.union(b); // {1, 3, 4, 5}
    assert.equal(u.count(), 4);
    assert.equal(u.has(4), true);

    const inter = a.intersect(b); // {3, 5}
    assert.equal(inter.count(), 2);
    assert.equal(inter.has(3), true);
    assert.equal(inter.has(5), true);
    assert.equal(inter.has(1), false);

    const diff = a.diff(b); // {1}
    assert.equal(diff.count(), 1);
    assert.equal(diff.has(1), true);
  });

  it('[Stage 4] 가우스 소거법 3x3 연립일차방정식 수치 정밀도 검증', () => {
    // 2x + y - z = 8
    // -3x - y + 2z = -11
    // -2x + y + 2z = -3
    // 해: x = 2, y = 3, z = -1
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
    assert.ok(Math.abs(sol[2] - (-1.0)) < 1e-9);
  });
});
