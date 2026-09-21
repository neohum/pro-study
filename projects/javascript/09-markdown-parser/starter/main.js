// 09-markdown-parser (starter)
const readline = require('readline');

// TODO(step-1): 인라인 태그 변환 (볼드, 코드, 링크)
function parseInline(text) {
  return text;
}

// TODO(step-2): 코드 블록 (```) 상태 머신
function parseCodeBlock(lines) {
  return [];
}

// TODO(step-3): 리스트 (ul, ol) 중첩 처리
function parseList(lines) {
  return [];
}

// TODO(step-4): 헤더 및 단락 분기 처리
function parseBlock(line) {
  return line;
}

// TODO(step-5): 파서 메인 파이프라인
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
