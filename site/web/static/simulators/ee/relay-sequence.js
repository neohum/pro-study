/**
 * relay-sequence.js — Relay Ladder Sequence Control Simulator
 * Simulates standard industrial self-holding and interlock motor starter circuits.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const core = require('./ee-sim-core.js');
    module.exports = factory(core);
  } else {
    root.RelaySequenceSim = factory(root.EESimCore);
  }
}(typeof self !== 'undefined' ? self : this, function (core) {
  'use strict';

  function createInitialState() {
    return {
      pbFwdStart: false,   // PB1: Forward Start Pushbutton (Normally Open)
      pbRevStart: false,   // PB2: Reverse Start Pushbutton (Normally Open)
      pbStop: false,       // PB0: Stop Pushbutton (Normally Closed button pressed)
      eStop: false,        // Emergency Stop (NC opened)
      mcFwd: false,        // Forward Magnetic Contactor Relay Coil
      mcRev: false,        // Reverse Magnetic Contactor Relay Coil
      motorState: 'STOP',  // 'FWD', 'REV', 'STOP'
      lampGreen: false,    // Run Lamp
      lampRed: true,       // Stop Lamp
      fault: false         // Interlock short attempt fault
    };
  }

  function updateRelayLogic(state, inputs) {
    const s = Object.assign({}, state, inputs);

    // If emergency stop is pressed, instantly drop all relays
    if (s.eStop) {
      s.mcFwd = false;
      s.mcRev = false;
      s.motorState = 'EMERGENCY_STOP';
      s.lampGreen = false;
      s.lampRed = true;
      s.fault = true;
      return s;
    }

    // Normal Stop button pressed
    if (s.pbStop) {
      s.mcFwd = false;
      s.mcRev = false;
      s.motorState = 'STOP';
      s.lampGreen = false;
      s.lampRed = true;
      s.fault = false;
      return s;
    }

    // Forward Rung with Electrical Interlock (mcRev's b-contact):
    // MC_fwd = (PB_fwd || MC_fwd) && !MC_rev && !PB_stop
    const fwdRequest = s.pbFwdStart || s.mcFwd;
    const revRequest = s.pbRevStart || s.mcRev;

    if (fwdRequest && !s.mcRev) {
      s.mcFwd = true;
      s.mcRev = false;
      s.motorState = 'FWD';
      s.fault = false;
    } else if (revRequest && !s.mcFwd) {
      s.mcRev = true;
      s.mcFwd = false;
      s.motorState = 'REV';
      s.fault = false;
    }

    // Indicator lamps
    if (s.mcFwd || s.mcRev) {
      s.lampGreen = true;
      s.lampRed = false;
    } else {
      s.lampGreen = false;
      s.lampRed = true;
      s.motorState = 'STOP';
    }

    return s;
  }

  function renderRelaySequence(canvas, state) {
    if (!canvas) return;
    const s = state || createInitialState();
    const d = core.setupCanvasDPI(canvas);
    if (!d) return;
    const { ctx, width, height } = d;

    ctx.clearRect(0, 0, width, height);

    // Background panel
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('⚡ 릴레이 시퀀스 모터 정·역회전 자기유지 및 인터록 제어반', 20, 25);

    // Power Rails (L1 Hot at top, N Neutral at bottom)
    const hotY = 55;
    const neutralY = height - 40;

    ctx.strokeStyle = '#dc2626'; // Hot rail red
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, hotY);
    ctx.lineTo(width - 30, hotY);
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('L1 (220V)', width - 25, hotY - 5);

    ctx.strokeStyle = '#2563eb'; // Neutral rail blue
    ctx.beginPath();
    ctx.moveTo(30, neutralY);
    ctx.lineTo(width - 30, neutralY);
    ctx.stroke();
    ctx.fillStyle = '#2563eb';
    ctx.fillText('N (0V)', width - 25, neutralY + 15);

    // Component Positions
    // Column 1: Stop / Emergency Button
    // Column 2: Forward Branch (PB_fwd, MC_fwd contact, MC_rev b-contact, MC_fwd coil)
    // Column 3: Reverse Branch (PB_rev, MC_rev contact, MC_fwd b-contact, MC_rev coil)
    // Column 4: Motor & Lamps visual status

    const col1X = 70;
    const col2X = 180;
    const col3X = 320;
    const col4X = 460;

    // --- Branch 1: Stop Switch (NC) ---
    const stopColor = s.pbStop || s.eStop ? '#cbd5e1' : '#22c55e';
    ctx.strokeStyle = stopColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(col1X, hotY);
    ctx.lineTo(col1X, hotY + 30);
    ctx.stroke();

    // Draw NC contact symbol
    ctx.fillStyle = s.pbStop ? '#ef4444' : '#64748b';
    ctx.fillRect(col1X - 15, hotY + 30, 30, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.fillText(s.pbStop ? 'OPEN' : 'STOP', col1X - 14, hotY + 44);

    ctx.beginPath();
    ctx.moveTo(col1X, hotY + 50);
    ctx.lineTo(col1X, hotY + 80);
    ctx.lineTo(col3X + 40, hotY + 80);
    ctx.stroke();

    // --- Branch 2: Forward Circuit ---
    const fwdLive = !s.pbStop && !s.eStop;
    const fwdEnergized = s.mcFwd;

    // Draw PB1 and Self-holding contact
    ctx.strokeStyle = fwdEnergized ? '#dc2626' : '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(col2X, hotY + 80);
    ctx.lineTo(col2X, hotY + 110);
    ctx.stroke();

    // PB Fwd box
    ctx.fillStyle = s.pbFwdStart ? '#22c55e' : (fwdEnergized ? '#3b82f6' : '#e2e8f0');
    ctx.fillRect(col2X - 25, hotY + 110, 50, 22);
    ctx.fillStyle = '#0f172a';
    ctx.fillText('PB-FWD', col2X - 22, hotY + 125);

    // Interlock contact (MC_rev b-contact)
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(col2X, hotY + 132);
    ctx.lineTo(col2X, hotY + 155);
    ctx.stroke();

    ctx.fillStyle = s.mcRev ? '#ef4444' : '#22c55e'; // if MC_rev is on, b-contact opens (red)
    ctx.fillRect(col2X - 25, hotY + 155, 50, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(s.mcRev ? 'MC2-b [열림]' : 'MC2-b [닫힘]', col2X - 24, hotY + 168);

    // MC1 Coil
    ctx.beginPath();
    ctx.moveTo(col2X, hotY + 173);
    ctx.lineTo(col2X, neutralY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(col2X, hotY + 200, 16, 0, 2 * Math.PI);
    ctx.fillStyle = fwdEnergized ? '#22c55e' : '#f1f5f9';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();
    ctx.fillStyle = fwdEnergized ? '#ffffff' : '#0f172a';
    ctx.fillText('MC-1', col2X - 14, hotY + 204);

    // --- Branch 4: Motor & Lamp Status Display ---
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.fillRect(col4X - 20, 80, width - col4X - 20, height - 140);
    ctx.strokeRect(col4X - 20, 80, width - col4X - 20, height - 140);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('3상 전동기 및 램프 상태', col4X, 105);

    // Motor Icon
    ctx.beginPath();
    ctx.arc(col4X + 40, 160, 30, 0, 2 * Math.PI);
    ctx.fillStyle = s.motorState === 'FWD' ? '#22c55e' : (s.motorState === 'REV' ? '#f59e0b' : '#64748b');
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('M (3~)', col4X + 22, 165);

    ctx.fillStyle = '#0f172a';
    ctx.font = '12px sans-serif';
    ctx.fillText(`상태: ${s.motorState}`, col4X + 85, 155);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    const desc = s.motorState === 'FWD' ? '정회전 운전 중 (시계방향)' : s.motorState === 'REV' ? '역회전 운전 중 (반시계방향)' : '정지 상태';
    ctx.fillText(desc, col4X + 85, 175);

    // Lamps
    ctx.beginPath();
    ctx.arc(col4X + 25, 215, 10, 0, 2 * Math.PI);
    ctx.fillStyle = s.lampGreen ? '#22c55e' : '#e2e8f0';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.fillText('운전 램프 (RL)', col4X + 45, 219);

    ctx.beginPath();
    ctx.arc(col4X + 25, 240, 10, 0, 2 * Math.PI);
    ctx.fillStyle = s.lampRed ? '#ef4444' : '#e2e8f0';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.fillText('정지 램프 (GL)', col4X + 45, 244);

    ctx.restore();
    return s;
  }

  return {
    createInitialState,
    updateRelayLogic,
    renderRelaySequence
  };
}));
