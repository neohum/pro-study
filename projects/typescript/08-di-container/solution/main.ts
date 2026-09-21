// 08-di-container (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

class Container {
  private singletons = new Map<string, any>();
  private factories = new Map<string, () => any>();

  registerSingleton<T>(token: string, instance: T): void {
    this.singletons.set(token, instance);
  }

  registerTransient<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory);
  }

  resolve<T>(token: string): T | null {
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }
    if (this.factories.has(token)) {
      return this.factories.get(token)!() as T;
    }
    return null;
  }
}

function main(): void {
  const container = new Container();
  container.registerSingleton('db', { connected: true, id: 'db-master' });
  container.registerTransient('random', () => ({ value: 42 }));

  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(' ');
    if (parts[0] === 'get') {
      const res = container.resolve<any>(parts[1]);
      if (res) {
        console.log(`Resolved: ${JSON.stringify(res)}`);
      } else {
        console.log('Not Found');
      }
    }
  });
}

main();
