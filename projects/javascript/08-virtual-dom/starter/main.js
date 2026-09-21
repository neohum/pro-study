// 08-virtual-dom (starter)
const readline = require('readline');

// TODO(step-1): h 함수 (VNode 팩토리: tag, props, children)
function h(tag, props = {}, children = []) {
  return { tag, props, children };
}

// TODO(step-2): VNode를 문자열/실제 노드로 렌더링
function renderToString(vnode) {
  return "";
}

// TODO(step-3): diffProps (속성 차이 계산)
function diffProps(oldProps, newProps) {
  return {};
}

// TODO(step-4): diff (트리 비교 및 패치 객체 생성)
function diff(oldVNode, newVNode) {
  return null;
}

// TODO(step-5): REPL CLI 테스트
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
