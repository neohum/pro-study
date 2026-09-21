// 03-functional-utils (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): Option 모나드 (Some, None)
type Option<T> = { tag: 'some'; value: T } | { tag: 'none' };
const some = <T>(value: T): Option<T> => ({ tag: 'some', value });
const none = (): Option<never> => ({ tag: 'none' });

// TODO(step-2): mapOption
function mapOption<T, U>(opt: Option<T>, fn: (val: T) => U): Option<U> {
  return none();
}

// TODO(step-3): Either 모나드 (Left, Right)
type Either<E, A> = { tag: 'left'; error: E } | { tag: 'right'; value: A };

// TODO(step-4): pipe 함수
function pipe<T, A, B>(val: T, fn1: (x: T) => A, fn2: (x: A) => B): B {
  return fn2(fn1(val));
}

// TODO(step-5): REPL 파이프라인
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
