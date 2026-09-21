// 01-todo-cli (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

type Action =
  | { type: 'ADD'; title: string }
  | { type: 'DONE'; id: number }
  | { type: 'LIST' };

function formatList(items: TodoItem[]): string {
  return items.map((it) => `${it.id}. [${it.completed ? 'x' : ' '}] ${it.title}`).join('\n');
}

function main(): void {
  const items: TodoItem[] = [];
  const rl = readline.createInterface({ input: process.stdin });

  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(' ');
    const cmd = parts[0];
    if (cmd === 'add') {
      const title = parts.slice(1).join(' ');
      const item: TodoItem = { id: items.length + 1, title, completed: false };
      items.push(item);
      console.log(`Added: ${title}`);
    } else if (cmd === 'done') {
      const id = parseInt(parts[1], 10);
      const found = items.find((it) => it.id === id);
      if (found) {
        found.completed = true;
        console.log(`Done: ${found.title}`);
      }
    } else if (cmd === 'list') {
      console.log(formatList(items));
    }
  });
}

main();
