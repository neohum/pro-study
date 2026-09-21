// 10-http-router (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

interface RouteMatch {
  handler: string;
  params: Record<string, string>;
}

class TrieNode {
  children = new Map<string, TrieNode>();
  paramChild: TrieNode | null = null;
  paramName = '';
  handler: string | null = null;
}

class Router {
  private root = new TrieNode();

  add(pattern: string, handler: string): void {
    const parts = pattern.split('/').filter(Boolean);
    let curr = this.root;
    for (const part of parts) {
      if (part.startsWith(':')) {
        if (!curr.paramChild) {
          curr.paramChild = new TrieNode();
          curr.paramChild.paramName = part.slice(1);
        }
        curr = curr.paramChild;
      } else {
        if (!curr.children.has(part)) {
          curr.children.set(part, new TrieNode());
        }
        curr = curr.children.get(part)!;
      }
    }
    curr.handler = handler;
  }

  match(path: string): RouteMatch | null {
    const parts = path.split('/').filter(Boolean);
    let curr = this.root;
    const params: Record<string, string> = {};

    for (const part of parts) {
      if (curr.children.has(part)) {
        curr = curr.children.get(part)!;
      } else if (curr.paramChild) {
        params[curr.paramChild.paramName] = part;
        curr = curr.paramChild;
      } else {
        return null;
      }
    }

    if (!curr.handler) return null;
    return { handler: curr.handler, params };
  }
}

function main(): void {
  const router = new Router();
  router.add('/users', 'GetUsers');
  router.add('/users/:id', 'GetUserById');
  router.add('/posts/:slug/comments', 'GetComments');

  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    const m = router.match(line);
    if (m) {
      console.log(`Matched: ${m.handler} ${JSON.stringify(m.params)}`);
    } else {
      console.log('404 Not Found');
    }
  });
}

main();
