// 03-functional-utils (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

type Option<T> = { tag: 'some'; value: T } | { tag: 'none' };
const some = <T>(value: T): Option<T> => ({ tag: 'some', value });
const none = (): Option<never> => ({ tag: 'none' });

function mapOption<T, U>(opt: Option<T>, fn: (val: T) => U): Option<U> {
  return opt.tag === 'some' ? some(fn(opt.value)) : none();
}

function unwrapOr<T>(opt: Option<T>, fallback: T): T {
  return opt.tag === 'some' ? opt.value : fallback;
}

function parseNum(s: string): Option<number> {
  const n = Number(s);
  return isNaN(n) ? none() : some(n);
}

function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    const opt = parseNum(line);
    const doubled = mapOption(opt, (x) => x * 2);
    console.log(`Result: ${unwrapOr(doubled, -1)}`);
  });
}

main();
