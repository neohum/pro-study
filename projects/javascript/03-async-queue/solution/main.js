// 03-async-queue (solution)
const readline = require('readline');

class TaskQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
  }

  add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.#next();
    });
  }

  #next() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const { fn, resolve, reject } = this.queue.shift();
      this.running++;
      Promise.resolve()
        .then(() => fn())
        .then(resolve, reject)
        .finally(() => {
          this.running--;
          this.#next();
        });
    }
  }
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  const lines = [];
  for await (const line of rl) {
    if (line.trim()) lines.push(line.trim());
  }

  if (lines.length === 0) return;
  const cap = parseInt(lines[0].replace('concurrency ', ''), 10) || 1;
  const q = new TaskQueue(cap);

  const tasks = lines.slice(1).map((name) => () => {
    return new Promise((resolve) => {
      console.log(`Task ${name} done`);
      resolve();
    });
  });

  await Promise.all(tasks.map((t) => q.add(t)));
}

main();
