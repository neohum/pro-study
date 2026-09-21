// 02-type-validator (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): BaseSchema 추상 클래스
abstract class BaseSchema<T> {
  abstract parse(val: unknown): T;
}

// TODO(step-2): StringSchema 및 NumberSchema
class StringSchema extends BaseSchema<string> {
  parse(val: unknown): string { return ""; }
}

class NumberSchema extends BaseSchema<number> {
  parse(val: unknown): number { return 0; }
}

// TODO(step-3): ObjectSchema 복합 타입
class ObjectSchema<T extends Record<string, BaseSchema<any>>> {
  shape: T;
  constructor(shape: T) {
    this.shape = shape;
  }
  parse(val: unknown): any { return {}; }
}

// TODO(step-4): 스키마 팩토리 z
const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
};

// TODO(step-5): REPL 검증 실행기
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
