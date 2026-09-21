// gen-typescript.js - Generate 10 TypeScript study projects
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = path.join(ROOT, 'projects', 'typescript');

const vscodeSettings = {
  "editor.tabSize": 2,
  "editor.insertSpaces": true
};

const vscodeTasks = {
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "tsc --noEmit main.ts",
      "group": { "kind": "build", "isDefault": true }
    },
    {
      "label": "run",
      "type": "shell",
      "command": "node main.ts",
      "group": "test"
    }
  ]
};

const projects = [
  {
    slug: '01-todo-cli',
    title: '강타입 TODO CLI',
    summary: '인터페이스, 유니언 타입, 타입 가드로 견고하게 작성하는 할 일 목록 관리 CLI',
    order: 1,
    difficulty: 1,
    concepts: ['Interface & Type Alias', 'Discriminated Unions', 'Strict Null Checks', 'Type Guards', 'Generic Functions'],
    starter: `// 01-todo-cli (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): TodoItem 인터페이스 정의
interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

// TODO(step-2): 액션 유니언 타입 (Action)
type Action =
  | { type: 'ADD'; title: string }
  | { type: 'DONE'; id: number }
  | { type: 'LIST' };

// TODO(step-3): 타입 가드 isAction
function isAction(cmd: string): boolean {
  return false;
}

// TODO(step-4): 상태 갱신 함수 reducer
function todoReducer(items: TodoItem[], action: Action): TodoItem[] {
  return items;
}

// TODO(step-5): REPL CLI 루프
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
`,
    solution: `// 01-todo-cli (solution)
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
  return items.map((it) => \`\${it.id}. [\${it.completed ? 'x' : ' '}] \${it.title}\`).join('\\n');
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
      console.log(\`Added: \${title}\`);
    } else if (cmd === 'done') {
      const id = parseInt(parts[1], 10);
      const found = items.find((it) => it.id === id);
      if (found) {
        found.completed = true;
        console.log(\`Done: \${found.title}\`);
      }
    } else if (cmd === 'list') {
      console.log(formatList(items));
    }
  });
}

main();
`,
    cases: [
      {
        in: "add TypeScript Study\nadd Build Project\nlist\n",
        out: "Added: TypeScript Study\nAdded: Build Project\n1. [ ] TypeScript Study\n2. [ ] Build Project\n"
      },
      {
        in: "add Task 1\ndone 1\nlist\n",
        out: "Added: Task 1\nDone: Task 1\n1. [x] Task 1\n"
      }
    ]
  },
  {
    slug: '02-type-validator',
    title: '런타임 스키마 검증기 (Zod-like)',
    summary: '정적 타입 추론(infer)과 런타임 유효성 검증을 결합한 타입스크립트 스키마 라이브러리',
    order: 2,
    difficulty: 1,
    concepts: ['Type Inference (infer)', 'Generic Constraints', 'Conditional Types', '타입 서술어(is)', 'Builder Pattern'],
    starter: `// 02-type-validator (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): BaseSchema 추상 클래스
abstract class BaseSchema<T> {
  abstract parse(val: unknown): T;
}

// TODO(step-2): StringSchema 및 NumberSchema
class StringSchema extends BaseSchema<string> {
  parse(val: unknown): string { return ""; }
}

class NumberSchema extends BaseSchema<number> {
  parse(val: unknown): number { return 0; }
}

// TODO(step-3): ObjectSchema 복합 타입
class ObjectSchema<T extends Record<string, BaseSchema<any>>> {
  shape: T;
  constructor(shape: T) {
    this.shape = shape;
  }
  parse(val: unknown): any { return {}; }
}

// TODO(step-4): 스키마 팩토리 z
const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
};

// TODO(step-5): REPL 검증 실행기
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
`,
    solution: `// 02-type-validator (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

abstract class BaseSchema<T> {
  abstract parse(val: unknown): { success: true; data: T } | { success: false; error: string };
}

class StringSchema extends BaseSchema<string> {
  parse(val: unknown) {
    if (typeof val === 'string') return { success: true as const, data: val };
    return { success: false as const, error: 'Expected string' };
  }
}

class NumberSchema extends BaseSchema<number> {
  parse(val: unknown) {
    if (typeof val === 'number' && !isNaN(val)) return { success: true as const, data: val };
    return { success: false as const, error: 'Expected number' };
  }
}

class ObjectSchema<T extends Record<string, BaseSchema<any>>> extends BaseSchema<any> {
  shape: T;
  constructor(shape: T) {
    super();
    this.shape = shape;
  }

  parse(val: unknown) {
    if (typeof val !== 'object' || val === null) {
      return { success: false as const, error: 'Expected object' };
    }
    const obj = val as Record<string, unknown>;
    const res: Record<string, any> = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      const fieldRes = schema.parse(obj[key]);
      if (!fieldRes.success) {
        return { success: false as const, error: \`\${key}: \${fieldRes.error}\` };
      }
      res[key] = fieldRes.data;
    }
    return { success: true as const, data: res };
  }
}

const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  object: <T extends Record<string, BaseSchema<any>>>(shape: T) => new ObjectSchema(shape)
};

function main(): void {
  const userSchema = z.object({
    name: z.string(),
    age: z.number()
  });

  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    try {
      const data = JSON.parse(line);
      const res = userSchema.parse(data);
      if (res.success) {
        console.log(\`VALID: \${res.data.name} (\${res.data.age})\`);
      } else {
        console.log(\`INVALID: \${res.error}\`);
      }
    } catch {
      console.log('INVALID: JSON parse error');
    }
  });
}

main();
`,
    cases: [
      {
        in: '{"name": "Alice", "age": 25}\n',
        out: "VALID: Alice (25)\n"
      },
      {
        in: '{"name": "Bob", "age": "twenty"}\n',
        out: "INVALID: age: Expected number\n"
      }
    ]
  },
  {
    slug: '03-functional-utils',
    title: '타입 안전 함수형 유틸리티',
    summary: 'pipe, compose, curry, Option, Either 모나드를 타입 추론과 함께 구현',
    order: 3,
    difficulty: 2,
    concepts: ['Variadic Tuple Types', 'Higher-Order Functions', 'Option & Either Monad', 'Currying', 'Pipe/Compose'],
    starter: `// 03-functional-utils (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): Option 모나드 (Some, None)
type Option<T> = { tag: 'some'; value: T } | { tag: 'none' };
const some = <T>(value: T): Option<T> => ({ tag: 'some', value });
const none = (): Option<never> => ({ tag: 'none' });

// TODO(step-2): mapOption
function mapOption<T, U>(opt: Option<T>, fn: (val: T) => U): Option<U> {
  return none();
}

// TODO(step-3): Either 모나드 (Left, Right)
type Either<E, A> = { tag: 'left'; error: E } | { tag: 'right'; value: A };

// TODO(step-4): pipe 함수
function pipe<T, A, B>(val: T, fn1: (x: T) => A, fn2: (x: A) => B): B {
  return fn2(fn1(val));
}

// TODO(step-5): REPL 파이프라인
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
`,
    solution: `// 03-functional-utils (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

type Option<T> = { tag: 'some'; value: T } | { tag: 'none' };
const some = <T>(value: T): Option<T> => ({ tag: 'some', value });
const none = (): Option<never> => ({ tag: 'none' });

function mapOption<T, U>(opt: Option<T>, fn: (val: T) => U): Option<U> {
  return opt.tag === 'some' ? some(fn(opt.value)) : none();
}

function unwrapOr<T>(opt: Option<T>, fallback: T): T {
  return opt.tag === 'some' ? opt.value : fallback;
}

function parseNum(s: string): Option<number> {
  const n = Number(s);
  return isNaN(n) ? none() : some(n);
}

function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    const opt = parseNum(line);
    const doubled = mapOption(opt, (x) => x * 2);
    console.log(\`Result: \${unwrapOr(doubled, -1)}\`);
  });
}

main();
`,
    cases: [
      {
        in: "21\n100\n",
        out: "Result: 42\nResult: 200\n"
      },
      {
        in: "abc\n5\n",
        out: "Result: -1\nResult: 10\n"
      }
    ]
  },
  {
    slug: '04-state-machine',
    title: '타입 안전 유한 상태 머신 (FSM)',
    summary: '상태(States)와 전이(Transitions)를 타입 수준에서 강제하는 결정론적 상태 머신',
    order: 4,
    difficulty: 2,
    concepts: ['Mapped Types', 'Keyof & Indexed Access', 'Exhaustive Check (never)', 'Event Mapping', 'State Pattern'],
    starter: `// 04-state-machine (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): 상태 및 이벤트 타입 유니언 정의
type TrafficLightState = 'RED' | 'GREEN' | 'YELLOW';
type TrafficEvent = 'TIMER' | 'EMERGENCY';

// TODO(step-2): TransitionMap 타입 매핑
type TransitionMap = {
  [K in TrafficLightState]: Partial<{ [E in TrafficEvent]: TrafficLightState }>;
};

// TODO(step-3): StateMachine 클래스
class StateMachine {
  current: TrafficLightState;
  transitions: TransitionMap;
  constructor(current: TrafficLightState, transitions: TransitionMap) {
    this.current = current;
    this.transitions = transitions;
  }

  // TODO(step-4): transition 메서드 및 never 체크
  transition(event: TrafficEvent): boolean {
    return false;
  }

  getState(): TrafficLightState {
    return this.current;
  }
}

// TODO(step-5): REPL CLI
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
`,
    solution: `// 04-state-machine (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

type TrafficLightState = 'RED' | 'GREEN' | 'YELLOW';
type TrafficEvent = 'TIMER' | 'EMERGENCY';

type TransitionMap = {
  [K in TrafficLightState]: Partial<{ [E in TrafficEvent]: TrafficLightState }>;
};

const transitions: TransitionMap = {
  RED: { TIMER: 'GREEN', EMERGENCY: 'RED' },
  GREEN: { TIMER: 'YELLOW', EMERGENCY: 'RED' },
  YELLOW: { TIMER: 'RED', EMERGENCY: 'RED' }
};

class StateMachine {
  current: TrafficLightState;
  constructor(current: TrafficLightState) {
    this.current = current;
  }

  transition(event: TrafficEvent): boolean {
    const next = transitions[this.current]?.[event];
    if (next) {
      this.current = next;
      return true;
    }
    return false;
  }

  getState(): TrafficLightState {
    return this.current;
  }
}

function main(): void {
  const fsm = new StateMachine('RED');
  const rl = readline.createInterface({ input: process.stdin });

  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    if (line === 'TIMER' || line === 'EMERGENCY') {
      fsm.transition(line);
      console.log(\`State: \${fsm.getState()}\`);
    }
  });
}

main();
`,
    cases: [
      {
        in: "TIMER\nTIMER\nTIMER\n",
        out: "State: GREEN\nState: YELLOW\nState: RED\n"
      },
      {
        in: "TIMER\nEMERGENCY\n",
        out: "State: GREEN\nState: RED\n"
      }
    ]
  },
  {
    slug: '05-query-builder',
    title: '타입 안전 SQL 쿼리 빌더',
    summary: '테이블 스키마의 컬럼 타입에 맞춰 SELECT, WHERE 절의 자동 완성과 타입 안전성을 보장',
    order: 5,
    difficulty: 3,
    concepts: ['Template Literal Types', 'Conditional Types', 'Fluent Interface', 'Partial & Pick', 'AST Construction'],
    starter: `// 05-query-builder (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): QueryState 인터페이스
interface QueryState {
  table: string;
  selectCols: string[];
  whereClauses: string[];
}

// TODO(step-2): QueryBuilder 클래스
class QueryBuilder<T> {
  private state: QueryState;
  constructor(table: string) {
    this.state = { table, selectCols: [], whereClauses: [] };
  }

  // TODO(step-3): select 체이닝 메서드
  select<K extends keyof T>(...cols: K[]): this {
    return this;
  }

  // TODO(step-4): where 체이닝 메서드
  where<K extends keyof T>(col: K, op: string, val: unknown): this {
    return this;
  }

  // TODO(step-5): toSQL 빌드 메서드
  toSQL(): string {
    return "";
  }
}

function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
`,
    solution: `// 05-query-builder (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

interface User {
  id: number;
  name: string;
  age: number;
}

class QueryBuilder<T> {
  private selectCols: string[] = [];
  private whereClauses: string[] = [];
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  select<K extends keyof T>(...cols: K[]): this {
    this.selectCols = cols as string[];
    return this;
  }

  where<K extends keyof T>(col: K, op: string, val: unknown): this {
    const formatted = typeof val === 'string' ? \`'\${val}'\` : String(val);
    this.whereClauses.push(\`\${String(col)} \${op} \${formatted}\`);
    return this;
  }

  toSQL(): string {
    const cols = this.selectCols.length > 0 ? this.selectCols.join(', ') : '*';
    let sql = \`SELECT \${cols} FROM \${this.table}\`;
    if (this.whereClauses.length > 0) {
      sql += \` WHERE \${this.whereClauses.join(' AND ')}\`;
    }
    return sql;
  }
}

function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(' ');
    const qb = new QueryBuilder<User>('users');
    if (parts[0] === 'all') {
      console.log(qb.select('id', 'name').toSQL());
    } else if (parts[0] === 'filter') {
      console.log(qb.select('name', 'age').where('age', '>=', parseInt(parts[1], 10)).toSQL());
    }
  });
}

main();
`,
    cases: [
      {
        in: "all\n",
        out: "SELECT id, name FROM users\n"
      },
      {
        in: "filter 20\n",
        out: "SELECT name, age FROM users WHERE age >= 20\n"
      }
    ]
  },
  {
    slug: '06-event-emitter',
    title: '타입 안전 Event Emitter',
    summary: '이벤트 맵(EventMap) 제네릭을 기반으로 이벤트 이름과 페이로드 타입을 100% 검증',
    order: 6,
    difficulty: 3,
    concepts: ['Generic EventMap', 'Indexed Access Types', 'Rest Parameters with Tuples', 'Once & Off', 'Pub/Sub'],
    starter: `// 06-event-emitter (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): EventMap 제네릭 타입
type Listener<T> = (data: T) => void;

// TODO(step-2): TypedEventEmitter 클래스
class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  // TODO(step-3): on 메서드
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {}

  // TODO(step-4): emit 메서드
  emit<K extends keyof Events>(event: K, data: Events[K]): void {}
}

// TODO(step-5): REPL 실행기
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
`,
    solution: `// 06-event-emitter (solution)
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
  emitter.on('login', (d) => console.log(\`User logged in: \${d.user}\`));
  emitter.on('msg', (d) => console.log(\`Message: \${d.text} (\${d.count})\`));

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
`,
    cases: [
      {
        in: "login Alice\nlogin Bob\n",
        out: "User logged in: Alice\nUser logged in: Bob\n"
      },
      {
        in: "msg hello 3\n",
        out: "Message: hello (3)\n"
      }
    ]
  },
  {
    slug: '07-lru-cache',
    title: '제네릭 LRU 캐시',
    summary: '제네릭 키-값 <K, V> 타입과 이중 연결 리스트로 구현하는 타입 세이프 캐시',
    order: 7,
    difficulty: 3,
    concepts: ['Generic Classes <K, V>', 'Doubly Linked List', 'O(1) Map Lookup', 'Capacity Eviction', 'Iterator'],
    starter: `// 07-lru-cache (starter)
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
`,
    solution: `// 07-lru-cache (solution)
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
`,
    cases: [
      {
        in: "cap 2\nput a 10\nput b 20\nget a\nput c 30\nget b\nget c\n",
        out: "10\n-1\n30\n"
      },
      {
        in: "cap 1\nput x 99\nget x\nput y 100\nget x\nget y\n",
        out: "99\n-1\n100\n"
      }
    ]
  },
  {
    slug: '08-di-container',
    title: '타입 안전 의존성 주입 (DI) 컨테이너',
    summary: '서비스 토큰과 생성자 주입을 통해 Singleton/Transient 수명 주기를 제어하는 IoC 컨테이너',
    order: 8,
    difficulty: 4,
    concepts: ['Constructor Type (new (...args: any[]) => T)', 'InjectionToken<T>', 'Inversion of Control', 'Factory Pattern', 'Lifetime Management'],
    starter: `// 08-di-container (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): ServiceToken 타입 및 생성자 타입
type Constructor<T> = new (...args: any[]) => T;

// TODO(step-2): Container 클래스 구조
class Container {
  private singletons = new Map<any, any>();
  private factories = new Map<any, () => any>();

  // TODO(step-3): registerSingleton 등록
  registerSingleton<T>(token: any, instance: T): void {}

  // TODO(step-4): resolve 인스턴스 해결
  resolve<T>(token: any): T | undefined {
    return undefined;
  }
}

// TODO(step-5): REPL CLI
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
`,
    solution: `// 08-di-container (solution)
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
        console.log(\`Resolved: \${JSON.stringify(res)}\`);
      } else {
        console.log('Not Found');
      }
    }
  });
}

main();
`,
    cases: [
      {
        in: "get db\nget random\n",
        out: "Resolved: {\"connected\":true,\"id\":\"db-master\"}\nResolved: {\"value\":42}\n"
      },
      {
        in: "get redis\n",
        out: "Not Found\n"
      }
    ]
  },
  {
    slug: '09-json-ast',
    title: 'JSON AST 파서 & 타입 변환기',
    summary: 'JSON 문자열을 구문 분석하여 강력한 타입의 AST 노드 트리로 변환하고 순회',
    order: 9,
    difficulty: 4,
    concepts: ['Recursive Type Definition', 'Tagged Union AST', 'Visitor Pattern', 'Recursive Descent Parsing', 'JSON Serialization'],
    starter: `// 09-json-ast (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): AST 노드 Tagged Union 타입
type JsonAst =
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'null' }
  | { kind: 'array'; items: JsonAst[] }
  | { kind: 'object'; fields: { key: string; value: JsonAst }[] };

// TODO(step-2): parseJsonAst 함수
function parseJsonAst(raw: unknown): JsonAst {
  return { kind: 'null' };
}

// TODO(step-3): AST Visitor 인터페이스
interface AstVisitor<R> {
  visitString(node: { value: string }): R;
  visitNumber(node: { value: number }): R;
}

// TODO(step-4): stringifyAst 직렬화기
function stringifyAst(ast: JsonAst): string {
  return "";
}

// TODO(step-5): REPL 파이프라인
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
`,
    solution: `// 09-json-ast (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

type JsonAst =
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'null' }
  | { kind: 'array'; items: JsonAst[] }
  | { kind: 'object'; fields: { key: string; value: JsonAst }[] };

function parseJsonAst(raw: unknown): JsonAst {
  if (raw === null) return { kind: 'null' };
  if (typeof raw === 'string') return { kind: 'string', value: raw };
  if (typeof raw === 'number') return { kind: 'number', value: raw };
  if (typeof raw === 'boolean') return { kind: 'boolean', value: raw };
  if (Array.isArray(raw)) {
    return { kind: 'array', items: raw.map(parseJsonAst) };
  }
  if (typeof raw === 'object') {
    const fields = Object.entries(raw as Record<string, unknown>).map(([key, val]) => ({
      key,
      value: parseJsonAst(val)
    }));
    return { kind: 'object', fields };
  }
  return { kind: 'null' };
}

function countNodes(ast: JsonAst): number {
  let cnt = 1;
  if (ast.kind === 'array') {
    for (const it of ast.items) cnt += countNodes(it);
  } else if (ast.kind === 'object') {
    for (const f of ast.fields) cnt += 1 + countNodes(f.value);
  }
  return cnt;
}

function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    try {
      const obj = JSON.parse(line);
      const ast = parseJsonAst(obj);
      console.log(\`Root: \${ast.kind}, Nodes: \${countNodes(ast)}\`);
    } catch {
      console.log('Error');
    }
  });
}

main();
`,
    cases: [
      {
        in: '{"a": 1, "b": "hello"}\n',
        out: "Root: object, Nodes: 5\n"
      },
      {
        in: '[1, 2, 3]\n',
        out: "Root: array, Nodes: 4\n"
      }
    ]
  },
  {
    slug: '10-http-router',
    title: '타입 안전 Trie 기반 HTTP 라우터',
    summary: 'URL 경로의 파라미터(:id) 타입을 추출하고 핸들러 매핑을 검증하는 고속 라우팅 엔진',
    order: 10,
    difficulty: 5,
    concepts: ['Template Literal Param Extraction', 'Radix/Trie Tree', 'Route Match Result', 'Middleware Pipeline', 'HTTP Methods'],
    starter: `// 10-http-router (starter)
declare const require: any;
declare const process: any;
const readline = require('readline');

// TODO(step-1): RouteMatch 결과 타입
interface RouteMatch {
  handlerName: string;
  params: Record<string, string>;
}

// TODO(step-2): TrieNode 구조
class TrieNode {
  children = new Map<string, TrieNode>();
  paramChild: TrieNode | null = null;
  paramName = '';
  handlerName: string | null = null;
}

// TODO(step-3): Router 클래스 및 addRoute
class Router {
  private root = new TrieNode();
  add(path: string, handlerName: string): void {}

  // TODO(step-4): match 메서드 (경로 분기 및 파라미터 바인딩)
  match(path: string): RouteMatch | null {
    return null;
  }
}

// TODO(step-5): REPL CLI
function main(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', () => {});
}

main();
`,
    solution: `// 10-http-router (solution)
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
      console.log(\`Matched: \${m.handler} \${JSON.stringify(m.params)}\`);
    } else {
      console.log('404 Not Found');
    }
  });
}

main();
`,
    cases: [
      {
        in: "/users\n/users/123\n",
        out: "Matched: GetUsers {}\nMatched: GetUserById {\"id\":\"123\"}\n"
      },
      {
        in: "/posts/my-first-post/comments\n/not-found\n",
        out: "Matched: GetComments {\"slug\":\"my-first-post\"}\n404 Not Found\n"
      }
    ]
  }
];

function buildReadme(p) {
  return `# ${String(p.order).padStart(2, '0')}. ${p.title}

## 무엇을 만드는가

${p.summary}

## 왜 이 프로젝트인가

타입스크립트의 정적 타입 시스템과 고급 타입 기법(제네릭, 조건부 타입, 템플릿 리터럴)을 실전 구현을 통해 체화합니다.
런타임 에러를 컴파일 타임으로 앞당기는 타입 중심 설계(Type-Driven Design)를 학습합니다.

## 핵심 개념

${p.concepts.map((c, i) => `### 개념 ${i+1}: ${c}\n\n- ${c}에 대한 심층 원리와 설계 패턴을 다룹니다.\n`).join('\n')}

## 단계별 구현

### Step 1: 핵심 타입 및 인터페이스 정의

자료구조와 도메인 모델의 타입을 정밀하게 선언합니다.

### Step 2: 기본 클래스 및 팩토리 구현

타입 제약 조건을 만족하는 기본 인스턴스 생성 로직을 작성합니다.

### Step 3: 고급 타입 연산 및 제네릭 메서드

타입 추론과 유연성을 극대화하는 제네릭 메서드를 추가합니다.

### Step 4: 예외 검증 및 타입 단언

런타임 불일치 및 엣지 케이스를 안전하게 가드하는 로직을 보강합니다.

### Step 5: REPL 파이프라인 및 CLI 연동

표준 입출력 스트림을 통해 입력을 받고 결과를 출력하는 루프를 완성합니다.

## 막혔을 때

| 증상 | 원인 | 해결책 |
| --- | --- | --- |
| TS2322: Type is not assignable | 유니언 타입 불일치 또는 널 가능성 | 타입 가드(Type Guard) 또는 옵셔널 체이닝으로 좁히기를 수행합니다. |
| TS2339: Property does not exist | 제네릭 제약(extends) 누락 | 제네릭 파라미터에 적절한 제약 조건(extends Record<...>)을 부여합니다. |

## 더 나아가기

- Conditional Types와 infer를 활용한 복합 반환형 추출
- 데코레이터(Decorators) 기반 메타데이터 주입

## 참고

- TypeScript 핸드북: <https://www.typescriptlang.org/docs/handbook/intro.html>
`;
}

for (const p of projects) {
  const pDir = path.join(BASE, p.slug);
  fs.mkdirSync(path.join(pDir, '.vscode'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'starter'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'solution'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'tests', 'cases'), { recursive: true });

  const meta = {
    id: `typescript/${p.slug}`,
    title: p.title,
    summary: p.summary,
    lang: 'typescript',
    order: p.order,
    difficulty: p.difficulty,
    concepts: p.concepts,
    entry: 'main.ts',
    build: ['tsc', '--noEmit', 'main.ts'],
    run: ['node', 'main.ts'],
    test: {
      kind: 'stdio-cases',
      dir: 'tests/cases'
    }
  };

  fs.writeFileSync(path.join(pDir, 'project.json'), JSON.stringify(meta, null, 2) + '\n');
  fs.writeFileSync(path.join(pDir, 'README.md'), buildReadme(p));
  fs.writeFileSync(path.join(pDir, '.vscode', 'settings.json'), JSON.stringify(vscodeSettings, null, 2) + '\n');
  fs.writeFileSync(path.join(pDir, '.vscode', 'tasks.json'), JSON.stringify(vscodeTasks, null, 2) + '\n');
  fs.writeFileSync(path.join(pDir, 'starter', 'main.ts'), p.starter);
  fs.writeFileSync(path.join(pDir, 'solution', 'main.ts'), p.solution);

  p.cases.forEach((c, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const name = idx === 0 ? `${num}-basic` : `${num}-advanced`;
    fs.writeFileSync(path.join(pDir, 'tests', 'cases', `${name}.in`), c.in);
    fs.writeFileSync(path.join(pDir, 'tests', 'cases', `${name}.out`), c.out);
  });

  console.log(`Created typescript/${p.slug}`);
}

console.log('TypeScript projects generation complete!');
