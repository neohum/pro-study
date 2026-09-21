// 09-json-ast (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): AST 노드 Tagged Union 타입
type JsonAst =
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'null' }
  | { kind: 'array'; items: JsonAst[] }
  | { kind: 'object'; fields: { key: string; value: JsonAst }[] };

// TODO(step-2): parseJsonAst 함수
function parseJsonAst(raw: unknown): JsonAst {
  return { kind: 'null' };
}

// TODO(step-3): AST Visitor 인터페이스
interface AstVisitor<R> {
  visitString(node: { value: string }): R;
  visitNumber(node: { value: number }): R;
}

// TODO(step-4): stringifyAst 직렬화기
function stringifyAst(ast: JsonAst): string {
  return "";
}

// TODO(step-5): REPL 파이프라인
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
