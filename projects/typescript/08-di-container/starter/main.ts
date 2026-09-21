// 08-di-container (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): ServiceToken 타입 및 생성자 타입
type Constructor<T> = new (...args: any[]) => T;

// TODO(step-2): Container 클래스 구조
class Container {
  private singletons = new Map<any, any>();
  private factories = new Map<any, () => any>();

  // TODO(step-3): registerSingleton 등록
  registerSingleton<T>(token: any, instance: T): void {}

  // TODO(step-4): resolve 인스턴스 해결
  resolve<T>(token: any): T | undefined {
    return undefined;
  }
}

// TODO(step-5): REPL CLI
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
