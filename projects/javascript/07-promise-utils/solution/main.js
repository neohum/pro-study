// 07-promise-utils (solution)
const readline = require('readline');

function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);
    const results = [];
    let completed = 0;
    promises.forEach((p, idx) => {
      Promise.resolve(p).then(
        (val) => {
          results[idx] = val;
          completed++;
          if (completed === promises.length) resolve(results);
        },
        (err) => reject(err)
      );
    });
  });
}

function promiseAllSettled(promises) {
  return new Promise((resolve) => {
    if (promises.length === 0) return resolve([]);
    const results = [];
    let completed = 0;
    promises.forEach((p, idx) => {
      Promise.resolve(p).then(
        (val) => {
          results[idx] = { status: 'fulfilled', value: val };
          completed++;
          if (completed === promises.length) resolve(results);
        },
        (err) => {
          results[idx] = { status: 'rejected', reason: err };
          completed++;
          if (completed === promises.length) resolve(results);
        }
      );
    });
  });
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const parts = line.trim().split(' ');
    const cmd = parts[0];
    if (cmd === 'all') {
      const vals = parts.slice(1).map((x) => Promise.resolve(Number(x)));
      const res = await promiseAll(vals);
      console.log('All: ' + res.join(', '));
    } else if (cmd === 'allSettled') {
      const vals = parts.slice(1).map((x, i) => i % 2 === 0 ? Promise.resolve(x) : Promise.reject(x));
      const res = await promiseAllSettled(vals);
      console.log('Settled: ' + res.map((r) => r.status).join(', '));
    }
  }
}

main();
