// 04-state-machine (starter)
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
