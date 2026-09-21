// 04-state-machine (solution)
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
      console.log(`State: ${fsm.getState()}`);
    }
  });
}

main();
