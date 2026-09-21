// 01-calculator-cli (starter)
const readline = require('readline');

// TODO(step-1): 토큰 정의 및 렉서(Lexer)
function tokenize(input) {
  return [];
}

// TODO(step-2): 숫자 및 괄호 처리 (parseFactor)
function parseFactor(tokens) {
  return 0;
}

// TODO(step-3): 곱셈, 나눗셈 우선순위 처리 (parseTerm)
function parseTerm(tokens) {
  return 0;
}

// TODO(step-4): 덧셈, 뺄셈 표현식 파싱 (parseExpr)
function parseExpr(tokens) {
  return 0;
}

// TODO(step-5): REPL 입출력 인터페이스
function main() {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line) => {
    // 식 계산 및 출력
  });
}

main();
