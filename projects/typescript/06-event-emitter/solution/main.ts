// 06-event-emitter (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

type Listener<T> = (data: T) => void;

interface AppEvents {
  login: { user: string };
  msg: { text: string; count: number };
}

class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Listener<any>[]>();

  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(fn);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const fns = this.listeners.get(event);
    if (fns) {
      fns.forEach((fn) => fn(data));
    }
  }
}

function main(): void {
  const emitter = new TypedEventEmitter<AppEvents>();
  emitter.on('login', (d) => console.log(`User logged in: ${d.user}`));
  emitter.on('msg', (d) => console.log(`Message: ${d.text} (${d.count})`));

  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(' ');
    if (parts[0] === 'login') {
      emitter.emit('login', { user: parts[1] });
    } else if (parts[0] === 'msg') {
      emitter.emit('msg', { text: parts[1], count: parseInt(parts[2], 10) });
    }
  });
}

main();
