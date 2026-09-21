// 04-deep-clone (solution)
const readline = require('readline');

function deepClone(val, seen = new WeakMap()) {
  if (val === null || typeof val !== 'object') return val;
  if (val instanceof Date) return new Date(val);
  if (val instanceof RegExp) return new RegExp(val.source, val.flags);
  if (seen.has(val)) return seen.get(val);

  if (Array.isArray(val)) {
    const copy = [];
    seen.set(val, copy);
    for (let i = 0; i < val.length; i++) {
      copy[i] = deepClone(val[i], seen);
    }
    return copy;
  }

  const copy = {};
  seen.set(val, copy);
  for (const k of Object.keys(val)) {
    copy[k] = deepClone(val[k], seen);
  }
  return copy;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  line = line.trim();
  if (!line) return;
  const obj = JSON.parse(line);
  const clone = deepClone(obj);
  const equal = deepEqual(obj, clone);
  clone.modified = true;
  console.log(`Equal: ${equal}, Isolated: ${obj.modified === undefined}`);
});
