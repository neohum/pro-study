// 06-event-emitter (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): EventMap 제네릭 타입
type Listener<T> = (data: T) => void;

// TODO(step-2): TypedEventEmitter 클래스
class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  // TODO(step-3): on 메서드
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {}

  // TODO(step-4): emit 메서드
  emit<K extends keyof Events>(event: K, data: Events[K]): void {}
}

// TODO(step-5): REPL 실행기
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
