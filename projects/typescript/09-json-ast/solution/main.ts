// 09-json-ast (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

type JsonAst =
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'null' }
  | { kind: 'array'; items: JsonAst[] }
  | { kind: 'object'; fields: { key: string; value: JsonAst }[] };

function parseJsonAst(raw: unknown): JsonAst {
  if (raw === null) return { kind: 'null' };
  if (typeof raw === 'string') return { kind: 'string', value: raw };
  if (typeof raw === 'number') return { kind: 'number', value: raw };
  if (typeof raw === 'boolean') return { kind: 'boolean', value: raw };
  if (Array.isArray(raw)) {
    return { kind: 'array', items: raw.map(parseJsonAst) };
  }
  if (typeof raw === 'object') {
    const fields = Object.entries(raw as Record<string, unknown>).map(([key, val]) => ({
      key,
      value: parseJsonAst(val)
    }));
    return { kind: 'object', fields };
  }
  return { kind: 'null' };
}

function countNodes(ast: JsonAst): number {
  let cnt = 1;
  if (ast.kind === 'array') {
    for (const it of ast.items) cnt += countNodes(it);
  } else if (ast.kind === 'object') {
    for (const f of ast.fields) cnt += 1 + countNodes(f.value);
  }
  return cnt;
}

function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    try {
      const obj = JSON.parse(line);
      const ast = parseJsonAst(obj);
      console.log(`Root: ${ast.kind}, Nodes: ${countNodes(ast)}`);
    } catch {
      console.log('Error');
    }
  });
}

main();
