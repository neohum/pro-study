// 05-query-builder (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): QueryState 인터페이스
interface QueryState {
  table: string;
  selectCols: string[];
  whereClauses: string[];
}

// TODO(step-2): QueryBuilder 클래스
class QueryBuilder<T> {
  private state: QueryState;
  constructor(table: string) {
    this.state = { table, selectCols: [], whereClauses: [] };
  }

  // TODO(step-3): select 체이닝 메서드
  select<K extends keyof T>(...cols: K[]): this {
    return this;
  }

  // TODO(step-4): where 체이닝 메서드
  where<K extends keyof T>(col: K, op: string, val: unknown): this {
    return this;
  }

  // TODO(step-5): toSQL 빌드 메서드
  toSQL(): string {
    return "";
  }
}

function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
