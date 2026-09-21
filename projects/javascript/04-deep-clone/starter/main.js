// 04-deep-clone (starter)
const readline = require('readline');

// TODO(step-1): 타입 판별 함수
function getType(val) {
  return typeof val;
}

// TODO(step-2): 기본형 및 특수 객체(Date, RegExp) 복사
function cloneSpecial(obj) {
  return obj;
}

// TODO(step-3): WeakMap 기반 순환 참조 방지 deepClone
function deepClone(obj, seen = new WeakMap()) {
  return obj;
}

// TODO(step-4): 깊은 동등성 비교 (deepEqual)
function deepEqual(a, b) {
  return a === b;
}

// TODO(step-5): REPL CLI 검증
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
