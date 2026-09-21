// 06-template-engine (starter)
const readline = require('readline');

// TODO(step-1): 토크나이저 (변수, 블록 시작/종료 태그)
function tokenize(template) {
  return [];
}

// TODO(step-2): 변수 치환 ({{name}})
function renderVariables(template, data) {
  return template;
}

// TODO(step-3): 조건문 블록 처리 ({{#if condition}})
function renderConditionals(template, data) {
  return template;
}

// TODO(step-4): 반복문 블록 처리 ({{#each list}})
function renderLoops(template, data) {
  return template;
}

// TODO(step-5): 통합 렌더러
function render(template, data) {
  return "";
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
