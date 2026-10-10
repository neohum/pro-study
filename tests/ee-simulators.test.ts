import { test } from 'node:test';
import assert from 'node:assert';

// Load EE simulator modules
const RLCTransientSim = require('../site/web/static/simulators/ee/rlc-transient.js');
const PhasorPowerSim = require('../site/web/static/simulators/ee/phasor-power.js');
const ThreePhaseSim = require('../site/web/static/simulators/ee/three-phase.js');
const RelaySequenceSim = require('../site/web/static/simulators/ee/relay-sequence.js');

test('EE Sim 1: RLC Transient Response Damping and Conservation', () => {
  // 1. Underdamped test: R=10, L=0.1, C=100uF => alpha=50, omega0=316.2 => underdamped
  const under = RLCTransientSim.computeRLCTransient({ R: 10, L: 0.1, C: 0.0001, Vin: 10, tMax: 0.1 });
  assert.strictEqual(under.dampingType, 'underdamped');
  assert.strictEqual(under.vcValues[0], 0, 'Initial capacitor voltage must be 0');
  assert.strictEqual(under.iValues[0], 0, 'Initial inductor current must be 0');
  
  // Steady state should approach Vin
  const finalVc = under.vcValues[under.vcValues.length - 1];
  assert.ok(Math.abs(finalVc - 10) < 0.2, `Final voltage should settle near Vin (got ${finalVc})`);

  // 2. Overdamped test: R=200, L=0.01, C=100uF => alpha=10000, omega0=1000 => overdamped
  const over = RLCTransientSim.computeRLCTransient({ R: 200, L: 0.01, C: 0.0001, Vin: 5, tMax: 0.05 });
  assert.strictEqual(over.dampingType, 'overdamped');
  assert.strictEqual(over.vcValues[0], 0);
  assert.ok(over.vcValues[over.vcValues.length - 1] > 0);
});

test('EE Sim 2: AC Phasor & Power Triangle Consistency', () => {
  const res = PhasorPowerSim.computePhasorPower({
    Vrms: 220,
    frequency: 60,
    R: 20,
    L: 0.1,
    C: 0,
    C_corr: 0.00003
  });

  // Verify XL and XC
  const omega = 2 * Math.PI * 60;
  assert.ok(Math.abs(res.XL - omega * 0.1) < 1e-4);
  assert.strictEqual(res.XC, 0);

  // Power Triangle Pythagorean: S^2 == P^2 + Q^2
  const calcS = Math.sqrt(res.P * res.P + res.Q * res.Q);
  assert.ok(Math.abs(res.S - calcS) < 1e-3, `Apparent power S (${res.S}) must equal sqrt(P^2 + Q^2) (${calcS})`);

  // Verify Power Factor is between 0 and 1
  assert.ok(res.PF >= 0 && res.PF <= 1);
  assert.ok(Math.abs(res.PF - (res.P / res.S)) < 1e-3);

  // Verify Power Factor Improvement with C_corr
  assert.ok(res.PF_new > res.PF, `PF_new (${res.PF_new}) must be improved over original PF (${res.PF})`);
});

test('EE Sim 3: 3-Phase Y and Delta Line-to-Phase Voltage Ratio', () => {
  // Y-connection: Vline = sqrt(3) * Vphase
  const resY = ThreePhaseSim.computeThreePhase({
    Vphase: 220,
    connection: 'Y',
    loadZ: 10,
    powerFactor: 0.9
  });
  const expectedVlineY = 220 * Math.sqrt(3);
  assert.ok(Math.abs(resY.Vline - expectedVlineY) < 1e-3, `Y-line voltage must be sqrt(3)*Vphase (got ${resY.Vline})`);
  assert.ok(Math.abs(resY.Iline - resY.Iphase) < 1e-4, 'In Y-connection, Iline must equal Iphase');

  // Delta-connection: Vline = Vphase, Iline = sqrt(3) * Iphase
  const resDelta = ThreePhaseSim.computeThreePhase({
    Vphase: 220,
    connection: 'Delta',
    loadZ: 10,
    powerFactor: 0.9
  });
  assert.strictEqual(resDelta.Vline, 220, 'In Delta-connection, Vline must equal Vphase');
  assert.ok(Math.abs(resDelta.Iline - Math.sqrt(3) * resDelta.Iphase) < 1e-3);
});

test('EE Sim 4: Relay Sequence Logic State Machine (Self-Holding & Interlock)', () => {
  let s = RelaySequenceSim.createInitialState();
  assert.strictEqual(s.mcFwd, false);
  assert.strictEqual(s.motorState, 'STOP');
  assert.strictEqual(s.lampRed, true);

  // 1. Press PB_start (Forward)
  s = RelaySequenceSim.updateRelayLogic(s, { pbFwdStart: true });
  assert.strictEqual(s.mcFwd, true);
  assert.strictEqual(s.motorState, 'FWD');
  assert.strictEqual(s.lampGreen, true);

  // 2. Release PB_start -> MUST stay Latched (Self-Holding!)
  s = RelaySequenceSim.updateRelayLogic(s, { pbFwdStart: false });
  assert.strictEqual(s.mcFwd, true, 'Relay must remain latched via self-holding contact');
  assert.strictEqual(s.motorState, 'FWD');

  // 3. Attempt Reverse Start while Forward is running -> Blocked by electrical interlock
  s = RelaySequenceSim.updateRelayLogic(s, { pbRevStart: true });
  assert.strictEqual(s.mcRev, false, 'Reverse relay MUST be blocked by forward interlock b-contact');
  assert.strictEqual(s.mcFwd, true);

  // 4. Press Stop Button -> All Relays Drop
  s = RelaySequenceSim.updateRelayLogic(s, { pbRevStart: false, pbStop: true });
  assert.strictEqual(s.mcFwd, false);
  assert.strictEqual(s.motorState, 'STOP');
  assert.strictEqual(s.lampRed, true);
});
