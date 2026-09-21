// 07-lru-cache (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): Generic LruNode 클래스
class LruNode<K, V> {
  prev: LruNode<K, V> | null = null;
  next: LruNode<K, V> | null = null;
  key: K;
  val: V;
  constructor(key: K, val: V) {
    this.key = key;
    this.val = val;
  }
}

// TODO(step-2): Generic LRUCache 클래스
class LRUCache<K, V> {
  private map = new Map<K, LruNode<K, V>>();
  private head = new LruNode<any, any>(null, null);
  private tail = new LruNode<any, any>(null, null);
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  // TODO(step-3): 노드 분리 및 헤드 이동
  private remove(node: LruNode<K, V>): void {}
  private addToHead(node: LruNode<K, V>): void {}

  // TODO(step-4): get 및 put 구현
  get(key: K): V | undefined {
    return undefined;
  }

  put(key: K, val: V): void {}
}

// TODO(step-5): REPL CLI
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
