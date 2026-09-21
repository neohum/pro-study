// 05-reactive-store (solution)
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
    console.log(`Count: ${state.count}`);
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
