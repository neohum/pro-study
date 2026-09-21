// 03-async-queue (starter)
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
