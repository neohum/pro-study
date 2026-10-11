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

    // Pure crisp white canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('⚡ 릴레이 시퀀스 모터 정·역회전 자기유지 및 인터록 제어반', 20, 25);

    // Power Rails (L1 Hot at top, N Neutral at bottom)
    const hotY = 55;
    const neutralY = height - 35;

    ctx.strokeStyle = '#dc2626'; // Hot rail red
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, hotY);
    ctx.lineTo(width - 30, hotY);
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('L1 (220V)', width - 30, hotY - 6);

    ctx.strokeStyle = '#2563eb'; // Neutral rail blue
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, neutralY);
    ctx.lineTo(width - 30, neutralY);
    ctx.stroke();
    ctx.fillStyle = '#2563eb';
    ctx.fillText('N (0V)', width - 30, neutralY + 16);

    // Component Positions
    // Column 1: Stop / Emergency Button
    // Column 2: Forward Branch (PB_fwd, MC_fwd contact, MC_rev b-contact, MC_fwd coil)
    // Column 3: Reverse Branch (PB_rev, MC_rev contact, MC_fwd b-contact, MC_rev coil)
    // Column 4: Motor & Lamps visual status
    const col1X = 65;
    const col2X = 165;
    const col3X = 285;
    const col4X = 415;

    // --- Branch 1: Stop Switch (NC) ---
    ctx.strokeStyle = s.pbStop || s.eStop ? '#94a3b8' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(col1X, hotY);
    ctx.lineTo(col1X, hotY + 28);
    ctx.stroke();

    // Draw NC contact box: White background, 2px solid #0f172a, #0f172a text
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(col1X - 22, hotY + 28, 44, 22);
    ctx.strokeStyle = s.pbStop || s.eStop ? '#dc2626' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(col1X - 22, hotY + 28, 44, 22);

    ctx.fillStyle = s.pbStop || s.eStop ? '#dc2626' : '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(s.pbStop ? 'OPEN' : 'STOP', col1X - 16, hotY + 43);

    // Wire from Stop switch to branches
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(col1X, hotY + 50);
    ctx.lineTo(col1X, hotY + 75);
    ctx.lineTo(col3X, hotY + 75);
    ctx.stroke();

    // --- Branch 2: Forward Circuit ---
    const fwdEnergized = s.mcFwd;

    // Wire to PB1
    ctx.strokeStyle = fwdEnergized ? '#16a34a' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(col2X, hotY + 75);
    ctx.lineTo(col2X, hotY + 105);
    ctx.stroke();

    // PB-FWD box: White background, 2px solid #0f172a, #0f172a text
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(col2X - 28, hotY + 105, 56, 22);
    ctx.strokeStyle = s.pbFwdStart || fwdEnergized ? '#16a34a' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(col2X - 28, hotY + 105, 56, 22);
    ctx.fillStyle = s.pbFwdStart || fwdEnergized ? '#16a34a' : '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('PB-FWD', col2X - 22, hotY + 120);

    // Wire to MC2-b interlock contact
    ctx.strokeStyle = fwdEnergized ? '#16a34a' : '#0f172a';
    ctx.beginPath();
    ctx.moveTo(col2X, hotY + 127);
    ctx.lineTo(col2X, hotY + 150);
    ctx.stroke();

    // MC2-b contact box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(col2X - 32, hotY + 150, 64, 20);
    ctx.strokeStyle = s.mcRev ? '#dc2626' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(col2X - 32, hotY + 150, 64, 20);
    ctx.fillStyle = s.mcRev ? '#dc2626' : '#0f172a';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(s.mcRev ? 'MC2-b[열림]' : 'MC2-b[닫힘]', col2X - 28, hotY + 164);

    // Wire to MC1 Coil and Neutral
    ctx.strokeStyle = fwdEnergized ? '#16a34a' : '#0f172a';
    ctx.beginPath();
    ctx.moveTo(col2X, hotY + 170);
    ctx.lineTo(col2X, hotY + 192);
    ctx.moveTo(col2X, hotY + 224);
    ctx.lineTo(col2X, neutralY);
    ctx.stroke();

    // MC1 Coil
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(col2X, hotY + 208, 16, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = fwdEnergized ? '#16a34a' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('MC-1', col2X - 13, hotY + 212);

    // --- Branch 3: Reverse Circuit ---
    const revEnergized = s.mcRev;

    // Wire to PB2
    ctx.strokeStyle = revEnergized ? '#16a34a' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(col3X, hotY + 75);
    ctx.lineTo(col3X, hotY + 105);
    ctx.stroke();

    // PB-REV box: White background, 2px solid #0f172a, #0f172a text
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(col3X - 28, hotY + 105, 56, 22);
    ctx.strokeStyle = s.pbRevStart || revEnergized ? '#16a34a' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(col3X - 28, hotY + 105, 56, 22);
    ctx.fillStyle = s.pbRevStart || revEnergized ? '#16a34a' : '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('PB-REV', col3X - 20, hotY + 120);

    // Wire to MC1-b interlock contact
    ctx.strokeStyle = revEnergized ? '#16a34a' : '#0f172a';
    ctx.beginPath();
    ctx.moveTo(col3X, hotY + 127);
    ctx.lineTo(col3X, hotY + 150);
    ctx.stroke();

    // MC1-b contact box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(col3X - 32, hotY + 150, 64, 20);
    ctx.strokeStyle = s.mcFwd ? '#dc2626' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(col3X - 32, hotY + 150, 64, 20);
    ctx.fillStyle = s.mcFwd ? '#dc2626' : '#0f172a';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(s.mcFwd ? 'MC1-b[열림]' : 'MC1-b[닫힘]', col3X - 28, hotY + 164);

    // Wire to MC2 Coil and Neutral
    ctx.strokeStyle = revEnergized ? '#16a34a' : '#0f172a';
    ctx.beginPath();
    ctx.moveTo(col3X, hotY + 170);
    ctx.lineTo(col3X, hotY + 192);
    ctx.moveTo(col3X, hotY + 224);
    ctx.lineTo(col3X, neutralY);
    ctx.stroke();

    // MC2 Coil
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(col3X, hotY + 208, 16, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = revEnergized ? '#16a34a' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('MC-2', col3X - 13, hotY + 212);

    // --- Branch 4: Motor & Lamp Status Display Box ---
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(col4X - 10, 75, width - col4X - 10, height - 125);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(col4X - 10, 75, width - col4X - 10, height - 125);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('3상 전동기 및 램프 상태', col4X + 6, 98);

    // Motor Icon
    const motorStatusColor = s.motorState === 'FWD' ? '#16a34a' : (s.motorState === 'REV' ? '#d97706' : '#64748b');
    ctx.beginPath();
    ctx.arc(col4X + 40, 150, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = motorStatusColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('M (3~)', col4X + 22, 155);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`상태: ${s.motorState}`, col4X + 80, 142);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#475569';
    const desc = s.motorState === 'FWD' ? '정회전 (시계방향)' : s.motorState === 'REV' ? '역회전 (반시계방향)' : '정지 상태';
    ctx.fillText(desc, col4X + 80, 160);

    // Lamps
    ctx.beginPath();
    ctx.arc(col4X + 20, 202, 8, 0, 2 * Math.PI);
    ctx.fillStyle = s.lampGreen ? '#16a34a' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = '11px sans-serif';
    ctx.fillText('운전 램프 (RL)', col4X + 36, 206);

    ctx.beginPath();
    ctx.arc(col4X + 20, 226, 8, 0, 2 * Math.PI);
    ctx.fillStyle = s.lampRed ? '#dc2626' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = '11px sans-serif';
    ctx.fillText('정지 램프 (GL)', col4X + 36, 230);

    ctx.restore();
    return s;
  }

  return {
    createInitialState,
    updateRelayLogic,
    renderRelaySequence
  };
}));
