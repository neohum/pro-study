// 05-reactive-store (starter)
const readline = require('readline');

// TODO(step-1): 의존성 관리자 (Dep & Target)
let activeEffect = null;

// TODO(step-2): effect 등록 함수
function effect(fn) {}

// TODO(step-3): reactive Proxy 생성기
function reactive(target) {
  return target;
}

// TODO(step-4): get/set 트랩과 의존성 수집 및 트리거
function track(target, key) {}
function trigger(target, key) {}

// TODO(step-5): REPL 상태 변경 테스트
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
