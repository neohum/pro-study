// 05-query-builder (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

interface User {
  id: number;
  name: string;
  age: number;
}

class QueryBuilder<T> {
  private selectCols: string[] = [];
  private whereClauses: string[] = [];
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  select<K extends keyof T>(...cols: K[]): this {
    this.selectCols = cols as string[];
    return this;
  }

  where<K extends keyof T>(col: K, op: string, val: unknown): this {
    const formatted = typeof val === 'string' ? `'${val}'` : String(val);
    this.whereClauses.push(`${String(col)} ${op} ${formatted}`);
    return this;
  }

  toSQL(): string {
    const cols = this.selectCols.length > 0 ? this.selectCols.join(', ') : '*';
    let sql = `SELECT ${cols} FROM ${this.table}`;
    if (this.whereClauses.length > 0) {
      sql += ` WHERE ${this.whereClauses.join(' AND ')}`;
    }
    return sql;
  }
}

function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(' ');
    const qb = new QueryBuilder<User>('users');
    if (parts[0] === 'all') {
      console.log(qb.select('id', 'name').toSQL());
    } else if (parts[0] === 'filter') {
      console.log(qb.select('name', 'age').where('age', '>=', parseInt(parts[1], 10)).toSQL());
    }
  });
}

main();
