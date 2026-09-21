// 02-event-emitter (solution)
const readline = require('readline');

class EventEmitter {
  #events = new Map();

  on(event, fn) {
    if (!this.#events.has(event)) this.#events.set(event, []);
    this.#events.get(event).push({ fn, once: false });
  }

  once(event, fn) {
    if (!this.#events.has(event)) this.#events.set(event, []);
    this.#events.get(event).push({ fn, once: true });
  }

  emit(event, ...args) {
    if (!this.#events.has(event)) return;
    const listeners = this.#events.get(event);
    const keep = [];
    for (const item of listeners) {
      item.fn(...args);
      if (!item.once) keep.push(item);
    }
    this.#events.set(event, keep);
  }

  off(event) {
    this.#events.delete(event);
  }
}

const emitter = new EventEmitter();
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
  line = line.trim();
  if (!line) return;
  const parts = line.split(' ');
  const cmd = parts[0];
  if (cmd === 'on') {
    const ev = parts[1];
    const prefix = parts.slice(2).join(' ');
    emitter.on(ev, (arg) => console.log(`${prefix}: ${arg}`));
  } else if (cmd === 'once') {
    const ev = parts[1];
    const prefix = parts.slice(2).join(' ');
    emitter.once(ev, (arg) => console.log(`${prefix}: ${arg}`));
  } else if (cmd === 'emit') {
    const ev = parts[1];
    const data = parts.slice(2).join(' ');
    emitter.emit(ev, data);
  }
});
