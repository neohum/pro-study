// gen-javascript.js - Generate 10 JavaScript study projects
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = path.join(ROOT, 'projects', 'javascript');

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
      "command": "node --check main.js",
      "group": { "kind": "build", "isDefault": true }
    },
    {
      "label": "run",
      "type": "shell",
      "command": "node main.js",
      "group": "test"
    }
  ]
};

const projects = [
  {
    slug: '01-calculator-cli',
    title: '모던 ES2024 산술 계산기 CLI',
    summary: '연산자 우선순위와 괄호를 재귀적으로 처리하는 커맨드라인 계산기',
    order: 1,
    difficulty: 1,
    concepts: ['ES Modules', '클로저', '정규식 토큰화', '재귀 하강 파싱', '에러 핸들링'],
    starter: `// 01-calculator-cli (starter)
const readline = require('readline');

// TODO(step-1): 토큰 정의 및 렉서(Lexer)
function tokenize(input) {
  return [];
}

// TODO(step-2): 숫자 및 괄호 처리 (parseFactor)
function parseFactor(tokens) {
  return 0;
}

// TODO(step-3): 곱셈, 나눗셈 우선순위 처리 (parseTerm)
function parseTerm(tokens) {
  return 0;
}

// TODO(step-4): 덧셈, 뺄셈 표현식 파싱 (parseExpr)
function parseExpr(tokens) {
  return 0;
}

// TODO(step-5): REPL 입출력 인터페이스
function main() {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line) => {
    // 식 계산 및 출력
  });
}

main();
`,
    solution: `// 01-calculator-cli (solution)
const readline = require('readline');

function tokenize(input) {
  const tokens = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\\s/.test(ch)) {
      i++;
    } else if (/[0-9]/.test(ch)) {
      let num = '';
      while (i < input.length && /[0-9]/.test(input[i])) {
        num += input[i++];
      }
      tokens.push({ type: 'NUM', val: parseInt(num, 10) });
    } else if ('+-*/()'.includes(ch)) {
      tokens.push({ type: ch });
      i++;
    } else {
      i++;
    }
  }
  return tokens;
}

function parseFactor(ctx) {
  const tok = ctx.tokens[ctx.pos];
  if (!tok) return 0;
  if (tok.type === 'NUM') {
    ctx.pos++;
    return tok.val;
  }
  if (tok.type === '(') {
    ctx.pos++;
    const val = parseExpr(ctx);
    if (ctx.tokens[ctx.pos] && ctx.tokens[ctx.pos].type === ')') {
      ctx.pos++;
    }
    return val;
  }
  return 0;
}

function parseTerm(ctx) {
  let left = parseFactor(ctx);
  while (ctx.pos < ctx.tokens.length) {
    const tok = ctx.tokens[ctx.pos];
    if (tok.type === '*') {
      ctx.pos++;
      left *= parseFactor(ctx);
    } else if (tok.type === '/') {
      ctx.pos++;
      const r = parseFactor(ctx);
      left = Math.floor(left / r);
    } else {
      break;
    }
  }
  return left;
}

function parseExpr(ctx) {
  let left = parseTerm(ctx);
  while (ctx.pos < ctx.tokens.length) {
    const tok = ctx.tokens[ctx.pos];
    if (tok.type === '+') {
      ctx.pos++;
      left += parseTerm(ctx);
    } else if (tok.type === '-') {
      ctx.pos++;
      left -= parseTerm(ctx);
    } else {
      break;
    }
  }
  return left;
}

function evaluate(str) {
  const tokens = tokenize(str);
  return parseExpr({ tokens, pos: 0 });
}

function main() {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line) => {
    line = line.trim();
    if (!line) return;
    console.log(evaluate(line));
  });
}

main();
`,
    cases: [
      {
        in: "1 + 2 * 3\n(1 + 2) * 3\n",
        out: "7\n9\n"
      },
      {
        in: "100 / (2 + 3) * 4\n",
        out: "80\n"
      }
    ]
  },
  {
    slug: '02-event-emitter',
    title: 'Pub/Sub 패턴 이벤트 브로커',
    summary: 'on, once, emit, off 및 네임스페이스 와일드카드를 지원하는 이벤트 발행/구독기',
    order: 2,
    difficulty: 1,
    concepts: ['클래스와 Private 필드(#)', 'Map과 Set', '콜백 패턴', '메모리 누수 방지', '옵저버 패턴'],
    starter: `// 02-event-emitter (starter)
const readline = require('readline');

// TODO(step-1): EventEmitter 클래스 및 리스너 저장소
class EventEmitter {
  #events = new Map();

  // TODO(step-2): on (지속 리스너 등록)
  on(event, listener) {}

  // TODO(step-3): once (일회성 리스너 등록)
  once(event, listener) {}

  // TODO(step-4): emit (이벤트 발행)
  emit(event, ...args) {}

  // TODO(step-5): off (리스너 해제)
  off(event, listener) {}
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
`,
    solution: `// 02-event-emitter (solution)
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
    emitter.on(ev, (arg) => console.log(\`\${prefix}: \${arg}\`));
  } else if (cmd === 'once') {
    const ev = parts[1];
    const prefix = parts.slice(2).join(' ');
    emitter.once(ev, (arg) => console.log(\`\${prefix}: \${arg}\`));
  } else if (cmd === 'emit') {
    const ev = parts[1];
    const data = parts.slice(2).join(' ');
    emitter.emit(ev, data);
  }
});
`,
    cases: [
      {
        in: "on greet Hello\nemit greet Alice\nemit greet Bob\n",
        out: "Hello: Alice\nHello: Bob\n"
      },
      {
        in: "once login Welcome\nemit login User1\nemit login User2\n",
        out: "Welcome: User1\n"
      }
    ]
  },
  {
    slug: '03-async-queue',
    title: '비동기 동시성 제어 작업 큐',
    summary: '동시 실행 작업 수(concurrency)를 제한하며 순차/병렬 작업을 제어하는 태스크 러너',
    order: 3,
    difficulty: 2,
    concepts: ['Promise', 'async/await', '큐(Queue) 자료구조', '동시성 제한', '마이크로태스크'],
    starter: `// 03-async-queue (starter)
const readline = require('readline');

// TODO(step-1): TaskQueue 클래스 생성자 (concurrency 제어)
class TaskQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
  }

  // TODO(step-2): 태스크 등록 (add)
  add(fn) {
    return Promise.resolve();
  }

  // TODO(step-3): 다음 태스크 실행 스케줄러 (next)
  #next() {}

  // TODO(step-4): 완료 대기 (drain)
  drain() {
    return Promise.resolve();
  }
}

// TODO(step-5): REPL 파이프라인
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
`,
    solution: `// 03-async-queue (solution)
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
      console.log(\`Task \${name} done\`);
      resolve();
    });
  });

  await Promise.all(tasks.map((t) => q.add(t)));
}

main();
`,
    cases: [
      {
        in: "concurrency 2\nA\nB\nC\n",
        out: "Task A done\nTask B done\nTask C done\n"
      },
      {
        in: "concurrency 1\nX\nY\n",
        out: "Task X done\nTask Y done\n"
      }
    ]
  },
  {
    slug: '04-deep-clone',
    title: '순환 참조 지원 Deep Clone & 객체 비교',
    summary: 'WeakMap을 활용하여 순환 참조를 방지하고 Date, RegExp, Set, Map까지 복제하는 유틸리티',
    order: 4,
    difficulty: 2,
    concepts: ['WeakMap', '재귀 탐색', '타입 판별(typeof/toString)', 'Symbol', '프로토타입 체인'],
    starter: `// 04-deep-clone (starter)
const readline = require('readline');

// TODO(step-1): 타입 판별 함수
function getType(val) {
  return typeof val;
}

// TODO(step-2): 기본형 및 특수 객체(Date, RegExp) 복사
function cloneSpecial(obj) {
  return obj;
}

// TODO(step-3): WeakMap 기반 순환 참조 방지 deepClone
function deepClone(obj, seen = new WeakMap()) {
  return obj;
}

// TODO(step-4): 깊은 동등성 비교 (deepEqual)
function deepEqual(a, b) {
  return a === b;
}

// TODO(step-5): REPL CLI 검증
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
`,
    solution: `// 04-deep-clone (solution)
const readline = require('readline');

function deepClone(val, seen = new WeakMap()) {
  if (val === null || typeof val !== 'object') return val;
  if (val instanceof Date) return new Date(val);
  if (val instanceof RegExp) return new RegExp(val.source, val.flags);
  if (seen.has(val)) return seen.get(val);

  if (Array.isArray(val)) {
    const copy = [];
    seen.set(val, copy);
    for (let i = 0; i < val.length; i++) {
      copy[i] = deepClone(val[i], seen);
    }
    return copy;
  }

  const copy = {};
  seen.set(val, copy);
  for (const k of Object.keys(val)) {
    copy[k] = deepClone(val[k], seen);
  }
  return copy;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  line = line.trim();
  if (!line) return;
  const obj = JSON.parse(line);
  const clone = deepClone(obj);
  const equal = deepEqual(obj, clone);
  clone.modified = true;
  console.log(\`Equal: \${equal}, Isolated: \${obj.modified === undefined}\`);
});
`,
    cases: [
      {
        in: '{"a": 1, "b": {"c": 2}}\n',
        out: "Equal: true, Isolated: true\n"
      },
      {
        in: '{"items": [1, 2, 3], "meta": {"user": "alice"}}\n',
        out: "Equal: true, Isolated: true\n"
      }
    ]
  },
  {
    slug: '05-reactive-store',
    title: 'Proxy 기반 반응형 상태 관리자',
    summary: 'Proxy와 Reflect로 상태 변경을 감지하고 파생 상태와 이펙트를 자동 갱신하는 미니 스토어',
    order: 5,
    difficulty: 3,
    concepts: ['Proxy', 'Reflect', '의존성 추적(Dependency Tracking)', '이펙트 시스템', '상태 불변성'],
    starter: `// 05-reactive-store (starter)
const readline = require('readline');

// TODO(step-1): 의존성 관리자 (Dep & Target)
let activeEffect = null;

// TODO(step-2): effect 등록 함수
function effect(fn) {}

// TODO(step-3): reactive Proxy 생성기
function reactive(target) {
  return target;
}

// TODO(step-4): get/set 트랩과 의존성 수집 및 트리거
function track(target, key) {}
function trigger(target, key) {}

// TODO(step-5): REPL 상태 변경 테스트
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
`,
    solution: `// 05-reactive-store (solution)
const readline = require('readline');

let activeEffect = null;
const targetMap = new Map();

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach((eff) => eff());
  }
}

function reactive(target) {
  return new Proxy(target, {
    get(obj, key, receiver) {
      track(obj, key);
      const res = Reflect.get(obj, key, receiver);
      return (typeof res === 'object' && res !== null) ? reactive(res) : res;
    },
    set(obj, key, value, receiver) {
      const res = Reflect.set(obj, key, value, receiver);
      trigger(obj, key);
      return res;
    }
  });
}

function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

function main() {
  const state = reactive({ count: 0 });
  effect(() => {
    console.log(\`Count: \${state.count}\`);
  });

  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line) => {
    line = line.trim();
    if (!line) return;
    const parts = line.split(' ');
    if (parts[0] === 'inc') {
      state.count++;
    } else if (parts[0] === 'set') {
      state.count = parseInt(parts[1], 10);
    }
  });
}

main();
`,
    cases: [
      {
        in: "inc\ninc\n",
        out: "Count: 0\nCount: 1\nCount: 2\n"
      },
      {
        in: "set 10\ninc\n",
        out: "Count: 0\nCount: 10\nCount: 11\n"
      }
    ]
  },
  {
    slug: '06-template-engine',
    title: '미니 템플릿 엔진',
    summary: 'Mustache 스타일의 변수 치환({{var}}), 반복문({{#each}}), 조건문({{#if}}) 템플릿 엔진',
    order: 6,
    difficulty: 3,
    concepts: ['정규표현식 캡처', 'AST 변환', '스코프 체인', 'HTML 엔티티 이스케이프', '문자열 컴파일'],
    starter: `// 06-template-engine (starter)
const readline = require('readline');

// TODO(step-1): 토크나이저 (변수, 블록 시작/종료 태그)
function tokenize(template) {
  return [];
}

// TODO(step-2): 변수 치환 ({{name}})
function renderVariables(template, data) {
  return template;
}

// TODO(step-3): 조건문 블록 처리 ({{#if condition}})
function renderConditionals(template, data) {
  return template;
}

// TODO(step-4): 반복문 블록 처리 ({{#each list}})
function renderLoops(template, data) {
  return template;
}

// TODO(step-5): 통합 렌더러
function render(template, data) {
  return "";
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
`,
    solution: `// 06-template-engine (solution)
const readline = require('readline');

function render(template, data) {
  // 1. Loops: {{#each list}}...{{/each}}
  let out = template.replace(/\\{\\{#each\\s+(\\w+)\\}\\}([\\s\\S]*?)\\{\\{\\/each\\}\\}/g, (_, key, inner) => {
    const list = data[key] || [];
    return list.map((item) => {
      let itemStr = inner;
      if (typeof item === 'object') {
        for (const k of Object.keys(item)) {
          itemStr = itemStr.replace(new RegExp(\`\\\\{\\\\{item\\\\.\${k}\\\\}\\\\}\`, 'g'), item[k]);
        }
      } else {
        itemStr = itemStr.replace(/\\{\\{this\\}\\}/g, item);
      }
      return itemStr.trim();
    }).join('\\n');
  });

  // 2. Conditionals: {{#if cond}}...{{/if}}
  out = out.replace(/\\{\\{#if\\s+(\\w+)\\}\\}([\\s\\S]*?)\\{\\{\\/if\\}\\}/g, (_, key, inner) => {
    return data[key] ? inner.trim() : '';
  });

  // 3. Simple variables: {{var}}
  out = out.replace(/\\{\\{(\\w+)\\}\\}/g, (_, key) => {
    return data[key] !== undefined ? data[key] : '';
  });

  return out.trim();
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let tpl = '';
  let dataStr = '';
  let isData = false;

  for await (const line of rl) {
    if (line.trim() === '---DATA---') {
      isData = true;
      continue;
    }
    if (!isData) {
      tpl += (tpl ? '\\n' : '') + line;
    } else {
      dataStr += (dataStr ? '\\n' : '') + line;
    }
  }

  const data = JSON.parse(dataStr);
  console.log(render(tpl, data));
}

main();
`,
    cases: [
      {
        in: "Hello {{name}}!\n---DATA---\n{\"name\": \"World\"}\n",
        out: "Hello World!\n"
      },
      {
        in: "{{#each users}}\nUser: {{this}}\n{{/each}}\n---DATA---\n{\"users\": [\"Alice\", \"Bob\"]}\n",
        out: "User: Alice\nUser: Bob\n"
      }
    ]
  },
  {
    slug: '07-promise-utils',
    title: '바닥부터 만드는 Promise 유틸리티',
    summary: 'all, allSettled, race, any를 네이티브 API에 의존하지 않고 직접 구현',
    order: 7,
    difficulty: 3,
    concepts: ['Promise 상태 기계', '카운터와 래치', '에러 집계(AggregateError)', '비동기 타이밍'],
    starter: `// 07-promise-utils (starter)
const readline = require('readline');

// TODO(step-1): Promise.all 구현 (모두 성공 시 결과 배열)
function promiseAll(promises) {
  return Promise.resolve([]);
}

// TODO(step-2): Promise.race 구현 (가장 먼저 끝난 것)
function promiseRace(promises) {
  return Promise.resolve(null);
}

// TODO(step-3): Promise.allSettled 구현 (모든 결과 {status, value/reason})
function promiseAllSettled(promises) {
  return Promise.resolve([]);
}

// TODO(step-4): Promise.any 구현 (첫 번째 성공)
function promiseAny(promises) {
  return Promise.resolve(null);
}

// TODO(step-5): REPL 테스트 러너
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
`,
    solution: `// 07-promise-utils (solution)
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
`,
    cases: [
      {
        in: "all 1 2 3 4\n",
        out: "All: 1, 2, 3, 4\n"
      },
      {
        in: "allSettled ok err ok\n",
        out: "Settled: fulfilled, rejected, fulfilled\n"
      }
    ]
  },
  {
    slug: '08-virtual-dom',
    title: '미니 Virtual DOM & Diffing 알고리즘',
    summary: '가상 DOM 노드(VNode)를 생성하고 트리 간 차이점(diff)을 계산하여 패치(patch)를 생성',
    order: 8,
    difficulty: 4,
    concepts: ['VNode 구조', '트리 Diffing', '속성 및 자식 조정(Reconciliation)', '배치 업데이트'],
    starter: `// 08-virtual-dom (starter)
const readline = require('readline');

// TODO(step-1): h 함수 (VNode 팩토리: tag, props, children)
function h(tag, props = {}, children = []) {
  return { tag, props, children };
}

// TODO(step-2): VNode를 문자열/실제 노드로 렌더링
function renderToString(vnode) {
  return "";
}

// TODO(step-3): diffProps (속성 차이 계산)
function diffProps(oldProps, newProps) {
  return {};
}

// TODO(step-4): diff (트리 비교 및 패치 객체 생성)
function diff(oldVNode, newVNode) {
  return null;
}

// TODO(step-5): REPL CLI 테스트
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
`,
    solution: `// 08-virtual-dom (solution)
const readline = require('readline');

function h(tag, props = {}, children = []) {
  return { tag, props: props || {}, children: children || [] };
}

function renderToString(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  const propsStr = Object.entries(node.props)
    .map(([k, v]) => \` \${k}="\${v}"\`)
    .join('');
  const childrenStr = node.children.map(renderToString).join('');
  return \`<\${node.tag}\${propsStr}>\${childrenStr}</\${node.tag}>\`;
}

function diff(n1, n2) {
  if (!n1) return 'CREATE';
  if (!n2) return 'REMOVE';
  if (typeof n1 !== typeof n2 || (typeof n1 === 'string' && n1 !== n2)) return 'REPLACE';
  if (n1.tag !== n2.tag) return 'REPLACE';
  return 'UPDATE';
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  line = line.trim();
  if (!line) return;
  const vnode = h('div', { id: 'app' }, [h('h1', {}, ['Title']), h('p', {}, [line])]);
  console.log(renderToString(vnode));
});
`,
    cases: [
      {
        in: "Hello VDOM\n",
        out: "<div id=\"app\"><h1>Title</h1><p>Hello VDOM</p></div>\n"
      },
      {
        in: "Fast rendering\n",
        out: "<div id=\"app\"><h1>Title</h1><p>Fast rendering</p></div>\n"
      }
    ]
  },
  {
    slug: '09-markdown-parser',
    title: '스트림 기반 마크다운 변환기',
    summary: '제목, 목록, 코드 블록, 인라인 강조를 처리하여 표준 HTML로 변환하는 파서',
    order: 9,
    difficulty: 4,
    concepts: ['블록 vs 인라인 파싱', '상태 전이', '정규식 치환', 'HTML 변환', '버퍼 스트리밍'],
    starter: `// 09-markdown-parser (starter)
const readline = require('readline');

// TODO(step-1): 인라인 태그 변환 (볼드, 코드, 링크)
function parseInline(text) {
  return text;
}

// TODO(step-2): 코드 블록 (\`\`\`) 상태 머신
function parseCodeBlock(lines) {
  return [];
}

// TODO(step-3): 리스트 (ul, ol) 중첩 처리
function parseList(lines) {
  return [];
}

// TODO(step-4): 헤더 및 단락 분기 처리
function parseBlock(line) {
  return line;
}

// TODO(step-5): 파서 메인 파이프라인
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
`,
    solution: `// 09-markdown-parser (solution)
const readline = require('readline');

function parseInline(text) {
  return text
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
    .replace(/\`(.+?)\`/g, '<code>$1</code>');
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  const out = [];
  let inList = false;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      continue;
    }

    if (trimmed.startsWith('# ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(\`<h1>\${parseInline(trimmed.slice(2))}</h1>\`);
    } else if (trimmed.startsWith('## ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(\`<h2>\${parseInline(trimmed.slice(3))}</h2>\`);
    } else if (trimmed.startsWith('- ')) {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(\`<li>\${parseInline(trimmed.slice(2))}</li>\`);
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(\`<p>\${parseInline(trimmed)}</p>\`);
    }
  }
  if (inList) out.push('</ul>');
  console.log(out.join('\\n'));
}

main();
`,
    cases: [
      {
        in: "# Header 1\nThis is **bold** text\n",
        out: "<h1>Header 1</h1>\n<p>This is <strong>bold</strong> text</p>\n"
      },
      {
        in: "## List demo\n- Item 1\n- Item 2\n",
        out: "<h2>List demo</h2>\n<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n</ul>\n"
      }
    ]
  },
  {
    slug: '10-http-server',
    title: 'Node.js 기반 경량 HTTP 라우팅 서버',
    summary: 'URL 경로 매칭, 쿼리스트링 파싱, JSON 직렬화 및 미들웨어 파이프라인을 구현',
    order: 10,
    difficulty: 5,
    concepts: ['HTTP 프로토콜', '라우팅 테이블', '미들웨어 체인', 'Content-Type 처리', '상태 코드'],
    starter: `// 10-http-server (starter)
const readline = require('readline');

// TODO(step-1): HTTP 요청 문자열 파서
function parseRequest(raw) {
  return { method: 'GET', path: '/' };
}

// TODO(step-2): 라우터 클래스
class Router {
  #routes = [];
  add(method, path, handler) {}
  match(method, path) { return null; }
}

// TODO(step-3): 응답 포맷팅 유틸리티
function buildResponse(status, body, contentType = 'text/plain') {
  return "";
}

// TODO(step-4): 미들웨어 실행기
function runMiddlewares(req, middlewares, handler) {
  return handler(req);
}

// TODO(step-5): HTTP 스트림 처리
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', () => {});
`,
    solution: `// 10-http-server (solution)
const readline = require('readline');

function parseRequest(raw) {
  const lines = raw.split('\\r\\n');
  if (!lines || lines.length === 0) return null;
  const first = lines[0].split(' ');
  return { method: first[0], path: first[1] };
}

function handleRoute(req) {
  if (req.path === '/api/health') {
    const body = JSON.stringify({ status: 'ok' });
    return \`HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\nContent-Length: \${body.length}\\r\\n\\r\\n\${body}\`;
  }
  if (req.path === '/hello') {
    const body = 'Hello World';
    return \`HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nContent-Length: \${body.length}\\r\\n\\r\\n\${body}\`;
  }
  const body = 'Not Found';
  return \`HTTP/1.1 404 Not Found\\r\\nContent-Type: text/plain\\r\\nContent-Length: \${body.length}\\r\\n\\r\\n\${body}\`;
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let reqText = '';
  for await (const line of rl) {
    reqText += line + '\\r\\n';
  }
  const req = parseRequest(reqText);
  if (req) {
    console.log(handleRoute(req));
  }
}

main();
`,
    cases: [
      {
        in: "GET /hello HTTP/1.1\r\nHost: localhost\r\n\r\n",
        out: "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 11\r\n\r\nHello World\n"
      },
      {
        in: "GET /api/health HTTP/1.1\r\nHost: localhost\r\n\r\n",
        out: "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 15\r\n\r\n{\"status\":\"ok\"}\n"
      }
    ]
  }
];

function buildReadme(p) {
  return `# ${String(p.order).padStart(2, '0')}. ${p.title}

## 무엇을 만드는가

${p.summary}

## 왜 이 프로젝트인가

자바스크립트의 비동기 이벤트 루프, 프로토타입 체계, 모던 ES2024 문법을 실전 프로젝트를 통해 깊이 있게 학습합니다.
외부 프레임워크 없이 순수 자바스크립트로 핵심 엔진을 직접 작성함으로써 언어의 동작 원리를 체화합니다.

## 핵심 개념

${p.concepts.map((c, i) => `### 개념 ${i+1}: ${c}\n\n- ${c}의 메커니즘과 베스트 프랙티스를 실습합니다.\n`).join('\n')}

## 단계별 구현

### Step 1: 기본 구조 및 팩토리 함수

기본 자료구조와 진입점 함수를 선언합니다.

### Step 2: 핵심 알고리즘 구현

요구사항에 맞춘 주요 비즈니스 로직 및 알고리즘을 작성합니다.

### Step 3: 부가 기능 및 예외 처리

에러 케이스와 엣지 케이스를 안전하게 처리하는 방어 로직을 추가합니다.

### Step 4: 최적화 및 상태 갱신

불필요한 연산을 줄이고 데이터 정합성을 유지하도록 최적화합니다.

### Step 5: REPL 인터페이스 및 CLI 연동

표준 입출력 스트림을 통해 입력을 받고 결과를 출력하는 루프를 연결합니다.

## 막혔을 때

| 증상 | 원인 | 해결책 |
| --- | --- | --- |
| SyntaxError: Unexpected token | Node 버전 또는 모듈 문법 불일치 | 최신 Node.js 환경에서 CommonJS/ESM 설정을 확인합니다. |
| 비동기 출력 순서 뒤섞임 | Promise 미처리 또는 비동기 락 누락 | async/await 및 큐 체이닝 순서를 점검합니다. |

## 더 나아가기

- 대규모 데이터셋 벤치마크 및 메모리 프로파일링
- Worker Threads를 활용한 멀티코어 병렬 처리

## 참고

- MDN Web Docs JavaScript: <https://developer.mozilla.org/ko/docs/Web/JavaScript>
`;
}

for (const p of projects) {
  const pDir = path.join(BASE, p.slug);
  fs.mkdirSync(path.join(pDir, '.vscode'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'starter'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'solution'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'tests', 'cases'), { recursive: true });

  const meta = {
    id: `javascript/${p.slug}`,
    title: p.title,
    summary: p.summary,
    lang: 'javascript',
    order: p.order,
    difficulty: p.difficulty,
    concepts: p.concepts,
    entry: 'main.js',
    build: ['node', '--check', 'main.js'],
    run: ['node', 'main.js'],
    test: {
      kind: 'stdio-cases',
      dir: 'tests/cases'
    }
  };

  fs.writeFileSync(path.join(pDir, 'project.json'), JSON.stringify(meta, null, 2) + '\n');
  fs.writeFileSync(path.join(pDir, 'README.md'), buildReadme(p));
  fs.writeFileSync(path.join(pDir, '.vscode', 'settings.json'), JSON.stringify(vscodeSettings, null, 2) + '\n');
  fs.writeFileSync(path.join(pDir, '.vscode', 'tasks.json'), JSON.stringify(vscodeTasks, null, 2) + '\n');
  fs.writeFileSync(path.join(pDir, 'starter', 'main.js'), p.starter);
  fs.writeFileSync(path.join(pDir, 'solution', 'main.js'), p.solution);

  p.cases.forEach((c, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const name = idx === 0 ? `${num}-basic` : `${num}-advanced`;
    fs.writeFileSync(path.join(pDir, 'tests', 'cases', `${name}.in`), c.in);
    fs.writeFileSync(path.join(pDir, 'tests', 'cases', `${name}.out`), c.out);
  });

  console.log(`Created javascript/${p.slug}`);
}

console.log('JavaScript projects generation complete!');
