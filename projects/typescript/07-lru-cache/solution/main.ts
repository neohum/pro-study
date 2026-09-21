// 07-lru-cache (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

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

class LRUCache<K, V> {
  private map = new Map<K, LruNode<K, V>>();
  private head: LruNode<K, V>;
  private tail: LruNode<K, V>;
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head = new LruNode<any, any>(null, null);
    this.tail = new LruNode<any, any>(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private remove(node: LruNode<K, V>): void {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
  }

  private addToHead(node: LruNode<K, V>): void {
    node.next = this.head.next;
    node.prev = this.head;
    if (this.head.next) this.head.next.prev = node;
    this.head.next = node;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.remove(node);
    this.addToHead(node);
    return node.val;
  }

  put(key: K, val: V): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.val = val;
      this.remove(node);
      this.addToHead(node);
    } else {
      if (this.map.size >= this.capacity) {
        const lru = this.tail.prev!;
        this.remove(lru);
        this.map.delete(lru.key);
      }
      const node = new LruNode(key, val);
      this.map.set(key, node);
      this.addToHead(node);
    }
  }
}

function main(): void {
  let cache: LRUCache<string, number> | null = null;
  const rl = readline.createInterface({ input: process.stdin });

  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(' ');
    if (parts[0] === 'cap') {
      cache = new LRUCache<string, number>(parseInt(parts[1], 10));
    } else if (parts[0] === 'put' && cache) {
      cache.put(parts[1], parseInt(parts[2], 10));
    } else if (parts[0] === 'get' && cache) {
      const v = cache.get(parts[1]);
      console.log(v !== undefined ? v : -1);
    }
  });
}

main();
