// 02-event-emitter (starter)
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
