// 07-promise-utils (starter)
const readline = require('readline');

// TODO(step-1): Promise.all 구현 (모두 성공 시 결과 배열)
function promiseAll(promises) {
  return Promise.resolve([]);
}

// TODO(step-2): Promise.race 구현 (가장 먼저 끝난 것)
function promiseRace(promises) {
  return Promise.resolve(null);
}

// TODO(step-3): Promise.allSettled 구현 (모든 결과 {status, value/reason})
function promiseAllSettled(promises) {
  return Promise.resolve([]);
}

// TODO(step-4): Promise.any 구현 (첫 번째 성공)
function promiseAny(promises) {
  return Promise.resolve(null);
}

// TODO(step-5): REPL 테스트 러너
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
