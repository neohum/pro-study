// 01-todo-cli (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): TodoItem 인터페이스 정의
interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

// TODO(step-2): 액션 유니언 타입 (Action)
type Action =
  | { type: 'ADD'; title: string }
  | { type: 'DONE'; id: number }
  | { type: 'LIST' };

// TODO(step-3): 타입 가드 isAction
function isAction(cmd: string): boolean {
  return false;
}

// TODO(step-4): 상태 갱신 함수 reducer
function todoReducer(items: TodoItem[], action: Action): TodoItem[] {
  return items;
}

// TODO(step-5): REPL CLI 루프
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
