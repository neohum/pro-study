// 10-http-router (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): RouteMatch 결과 타입
interface RouteMatch {
  handlerName: string;
  params: Record<string, string>;
}

// TODO(step-2): TrieNode 구조
class TrieNode {
  children = new Map<string, TrieNode>();
  paramChild: TrieNode | null = null;
  paramName = '';
  handlerName: string | null = null;
}

// TODO(step-3): Router 클래스 및 addRoute
class Router {
  private root = new TrieNode();
  add(path: string, handlerName: string): void {}

  // TODO(step-4): match 메서드 (경로 분기 및 파라미터 바인딩)
  match(path: string): RouteMatch | null {
    return null;
  }
}

// TODO(step-5): REPL CLI
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
