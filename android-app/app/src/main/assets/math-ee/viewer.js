/**
 * viewer.js — Controller and UI Renderer for Math & EE Master Suite
 */

(function () {
  'use strict';

  let manifestData = null;
  let currentTab = 'math-symbols';
  let activeEEModuleId = 'ee-01';
  let activeELModuleId = 'el-01';

  // Simulators state and instances
  let rlcParams = { R: 20, L: 0.1, C: 0.0001, Vin: 10, tMax: 0.05 };
  let phasorParams = { Vrms: 220, frequency: 60, R: 10, L: 0.05, C: 0, C_corr: 0 };
  let threePhaseParams = { Vphase: 220, frequency: 60, connection: 'Y', loadZ: 10, powerFactor: 0.85 };
  let relayState = null;

  let logicSimParams = { mode: 'half_adder', inA: 1, inB: 0, cin: 0 };
  let opampBodeParams = { filterType: 'lpf_1st', R1: 10000, Rf: 100000, C: 1e-8 };
  let transistorParams = { Vcc: 12, Rc: 1000, beta: 150, activeIb_uA: 30 };
  let timer555Params = { Vcc: 9, Ra: 10000, Rb: 10000, C: 1e-6 };

  document.addEventListener('DOMContentLoaded', initApp);

  async function initApp() {
    setupTabNavigation();
    await loadData();
    renderCurrentTab();
  }

  function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.getAttribute('data-tab');

        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        const activePane = document.getElementById(`tab-${currentTab}`);
        if (activePane) activePane.classList.add('active');

        renderCurrentTab();
      });
    });
  }

  async function loadData() {
    if (window.__MATH_EE_MANIFEST__) {
      manifestData = window.__MATH_EE_MANIFEST__;
      return;
    }
    try {
      const resp = await fetch('manifest.json');
      manifestData = await resp.json();
    } catch (e) {
      console.error('Failed to fetch manifest.json', e);
    }
  }

  function renderCurrentTab() {
    if (!manifestData) return;

    if (currentTab === 'math-symbols') {
      renderMathSymbols();
    } else if (currentTab === 'math-theorems') {
      renderMathTheorems();
    } else if (currentTab === 'electrical') {
      renderElectricalModules();
    } else if (currentTab === 'electronics') {
      renderElectronicsModules();
    } else if (currentTab === 'ee-compare') {
      renderEECompare();
    } else if (currentTab === 'ee-math') {
      renderEEMath();
    } else if (currentTab === 'classical-papers') {
      renderClassicalPapers();
    } else if (currentTab === 'sim-computer') {
      renderComputerSim();
    } else if (currentTab === 'sim-circuit') {
      renderCircuitSim();
    } else if (currentTab === 'sim-inverter') {
      renderInverterSim();
    }

    triggerKaTeX();
  }

  function triggerKaTeX(container) {
    if (window.renderMathInElement) {
      window.renderMathInElement(container || document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }
  }

  function speakText(text) {
    if (window.AndroidTTS && typeof window.AndroidTTS.speak === 'function') {
      window.AndroidTTS.speak(text);
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }

  // ==========================================
  // TAB 1: Math Symbols
  // ==========================================
  function renderMathSymbols() {
    const pane = document.getElementById('tab-math-symbols');
    if (!pane) return;

    const categories = manifestData.mathSymbols.categories;

    // Filter controls
    let html = `
      <div class="filter-bar">
        <input type="text" id="sym-search-input" class="search-input" placeholder="기호명, 한글/영문 또는 수식 검색 (예: integral, 합집합, 미분)...">
        <select id="sym-cat-select" class="category-select">
          <option value="all">전체 카테고리 (${categories.length}개)</option>
          ${categories.map(c => `<option value="${c.categoryId}">${c.categoryNameKo}</option>`).join('')}
        </select>
      </div>
      <div id="symbols-grid-container" class="symbols-grid"></div>
    `;
    pane.innerHTML = html;

    const searchInput = document.getElementById('sym-search-input');
    const catSelect = document.getElementById('sym-cat-select');

    function updateGrid() {
      const q = (searchInput.value || '').trim().toLowerCase();
      const selCat = catSelect.value;
      const grid = document.getElementById('symbols-grid-container');

      let allSymbols = [];
      for (const cat of categories) {
        if (selCat === 'all' || selCat === cat.categoryId) {
          allSymbols.push(...cat.symbols);
        }
      }

      if (q) {
        allSymbols = allSymbols.filter(s =>
          s.nameKo.toLowerCase().includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.symbol.toLowerCase().includes(q) ||
          s.typesetMath.toLowerCase().includes(q) ||
          s.howToReadEn.toLowerCase().includes(q)
        );
      }

      grid.innerHTML = allSymbols.map(s => `
        <div class="symbol-card">
          <div class="symbol-card-header">
            <div class="symbol-display">$${s.typesetMath}$</div>
            <div class="symbol-name-group">
              <div class="symbol-name-ko">${s.nameKo}</div>
              <div class="symbol-name-en">${s.nameEn}</div>
            </div>
          </div>
          <div class="symbol-read-en">
            <span>🗣️ <strong>How to read:</strong> "${s.howToReadEn}"</span>
            <button class="btn-action" style="padding:2px 8px;font-size:0.75rem;margin-left:auto;" onclick="window.__speakMath('${s.howToReadEn.replace(/'/g, "\\'")}')">🔊 듣기</button>
          </div>
          <div class="symbol-definition">
            <strong>엄밀한 정의:</strong> $${s.rigorousDefinition}$
          </div>
          <div class="symbol-origin">
            <strong>어원 및 역사:</strong> ${s.historyAndOrigin}
          </div>
        </div>
      `).join('');

      triggerKaTeX(grid);
    }

    searchInput.addEventListener('input', updateGrid);
    catSelect.addEventListener('change', updateGrid);
    window.__speakMath = speakText;

    updateGrid();
  }

  // ==========================================
  // TAB 2: Math Theorems & Proofs
  // ==========================================
  function renderMathTheorems() {
    const pane = document.getElementById('tab-math-theorems');
    if (!pane) return;

    const list = manifestData.mathTheorems.theorems;

    let html = `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size:1.3rem;margin-bottom:6px;">${manifestData.mathTheorems.title}</h2>
        <p style="color:var(--text-muted);font-size:0.95rem;">수학사상 가장 중요하고 아름다운 12대 핵심 정리의 직관적 원리와 비약 없는 단계별 엄밀 증명(Rigorous Proof)을 탐구합니다.</p>
      </div>
      <div class="theorems-container">
        ${list.map(th => `
          <div class="theorem-item" id="th-item-${th.id}">
            <div class="theorem-header" onclick="window.__toggleTheorem('${th.id}')">
              <div class="theorem-title">
                <span style="color:var(--accent-math);margin-right:8px;">#${th.order}</span>
                ${th.titleKo}
              </div>
              <div style="font-size:0.85rem;color:var(--text-muted);">${th.domain} ▼</div>
            </div>
            <div class="theorem-body" id="th-body-${th.id}">
              <div class="theorem-statement-box">
                <div style="font-weight:700;margin-bottom:6px;">정리 명제 (Statement):</div>
                <div style="font-size:1.3rem;margin-bottom:8px;">$$${th.statement.typesetMath}$$</div>
                <div style="font-size:0.95rem;color:#0f172a;">${th.statement.explanationKo}</div>
              </div>
              <div style="margin-bottom:14px;font-size:0.9rem;background:#ffffff;border:1.5px solid #0f172a;padding:10px 14px;border-radius:6px;color:#0f172a;">
                💡 <strong>직관적 핵심 아이디어:</strong> ${th.intuitiveIdea}
              </div>
              <div style="margin-bottom:16px;">
                <h4 style="font-size:1rem;margin-bottom:10px;color:#0f172a;">단계별 엄밀 증명 (${th.rigorousProof.proofType})</h4>
                ${th.rigorousProof.steps.map(step => `
                  <div class="proof-step-card">
                    <span class="step-badge">단계 ${step.stepNumber}: ${step.title}</span>
                    <div style="font-size:0.95rem;margin-bottom:6px;color:#0f172a;">${step.explanation}</div>
                    <div style="margin:8px 0;font-size:1.15rem;text-align:center;">$$${step.typesetMath}$$</div>
                    <div style="font-size:0.82rem;color:#334155;">근거: ${step.justification}</div>
                  </div>
                `).join('')}
                <div style="background:#ffffff;border:2px solid #16a34a;padding:12px 16px;border-radius:6px;font-weight:700;color:#166534;margin-top:12px;">
                  결론: ${th.rigorousProof.conclusion}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    pane.innerHTML = html;

    window.__toggleTheorem = function (id) {
      const header = document.querySelector(`#th-item-${id} .theorem-header`);
      const body = document.getElementById(`th-body-${id}`);
      if (header && body) {
        header.classList.toggle('open');
        body.classList.toggle('open');
        triggerKaTeX(body);
      }
    };

    triggerKaTeX(pane);
  }

  // ==========================================
  // TAB 3: Electrical Engineering
  // ==========================================
  function renderElectricalModules() {
    const pane = document.getElementById('tab-electrical');
    if (!pane) return;

    const modules = manifestData.electrical.modules;
    const activeMod = modules.find(m => m.id === activeEEModuleId) || modules[0];

    let html = `
      <div class="module-layout">
        <aside class="module-sidebar">
          <div style="font-weight:700;margin-bottom:12px;font-size:0.95rem;color:var(--accent-ee);">⚡ 전기공학 커리큘럼</div>
          ${modules.map(m => `
            <div class="module-nav-item ${m.id === activeMod.id ? 'active' : ''}" onclick="window.__selectEEModule('${m.id}')">
              ${m.order}. ${m.titleKo}
            </div>
          `).join('')}
        </aside>
        <section class="module-content-pane">
          <h2 style="font-size:1.3rem;margin-bottom:8px;">${activeMod.titleKo}</h2>
          <div style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">${activeMod.titleEn} (${activeMod.domain})</div>
          <p style="font-size:0.95rem;margin-bottom:20px;line-height:1.7;">${activeMod.overview}</p>

          <!-- Embedded Simulator Component -->
          ${renderEESimulatorCard(activeMod.simulationRef)}

          <div style="margin-top:24px;">
            <h3 style="font-size:1.1rem;margin-bottom:12px;color:#0f172a;">핵심 원리 및 수식 지배 방정식</h3>
            ${activeMod.coreConcepts.map(c => `
              <div class="concept-card">
                <div style="font-weight:700;font-size:1rem;color:#0f172a;margin-bottom:6px;">${c.titleKo}</div>
                <div style="font-size:0.9rem;color:#334155;margin-bottom:8px;">${c.principle}</div>
                ${c.equations.map(eq => `
                  <div class="math-formula-box">
                    <div style="font-size:0.85rem;font-weight:600;color:var(--accent-ee);">${eq.name}</div>
                    <div style="font-size:1.15rem;margin:6px 0;">$$${eq.typesetMath}$$</div>
                    <div style="font-size:0.82rem;color:#334155;">${eq.explanation}</div>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;

    pane.innerHTML = html;

    window.__selectEEModule = function (id) {
      activeEEModuleId = id;
      renderElectricalModules();
    };

    attachEESimulatorHandlers(activeMod.simulationRef);
    triggerKaTeX(pane);
  }

  function renderEESimulatorCard(simRef) {
    if (!simRef) return '';

    if (simRef.id === 'sim-rlc-transient') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">실시간 RK4 / 2계 미분방정식 수치해석</span>
          </div>
          <canvas id="ee-canvas-rlc" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <div class="control-group">
              <label>저항 R: <span id="val-rlc-r">${rlcParams.R}</span>Ω</label>
              <input type="range" id="slider-rlc-r" min="1" max="100" step="1" value="${rlcParams.R}">
            </div>
            <div class="control-group">
              <label>인덕턴스 L: <span id="val-rlc-l">${rlcParams.L}</span>H</label>
              <input type="range" id="slider-rlc-l" min="0.01" max="0.5" step="0.01" value="${rlcParams.L}">
            </div>
            <div class="control-group">
              <label>커패시턴스 C: <span id="val-rlc-c">${(rlcParams.C * 1e6).toFixed(0)}</span>µF</label>
              <input type="range" id="slider-rlc-c" min="10" max="500" step="10" value="${rlcParams.C * 1e6}">
            </div>
          </div>
        </div>
      `;
    } else if (simRef.id === 'sim-phasor-power') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">복소평면 페이저 & 전력 삼각형 역률 개선</span>
          </div>
          <canvas id="ee-canvas-phasor" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <div class="control-group">
              <label>저항 R: <span id="val-ph-r">${phasorParams.R}</span>Ω</label>
              <input type="range" id="slider-ph-r" min="1" max="50" step="1" value="${phasorParams.R}">
            </div>
            <div class="control-group">
              <label>인덕턴스 L: <span id="val-ph-l">${phasorParams.L}</span>H</label>
              <input type="range" id="slider-ph-l" min="0.01" max="0.3" step="0.01" value="${phasorParams.L}">
            </div>
            <div class="control-group">
              <label>진상 콘덴서 C: <span id="val-ph-c">${(phasorParams.C_corr * 1e6).toFixed(0)}</span>µF</label>
              <input type="range" id="slider-ph-c" min="0" max="150" step="5" value="${phasorParams.C_corr * 1e6}">
            </div>
          </div>
        </div>
      `;
    } else if (simRef.id === 'sim-three-phase') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">120° 3상 정현파 & Y/Δ 결선</span>
          </div>
          <canvas id="ee-canvas-threephase" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <div class="control-group">
              <label>결선 방식:</label>
              <button id="btn-tp-y" class="btn-action ${threePhaseParams.connection === 'Y' ? 'active' : ''}">Y (와이)</button>
              <button id="btn-tp-delta" class="btn-action ${threePhaseParams.connection === 'Delta' ? 'active' : ''}">Δ (델타)</button>
            </div>
            <div class="control-group">
              <label>상전압: <span id="val-tp-v">${threePhaseParams.Vphase}</span>V</label>
              <input type="range" id="slider-tp-v" min="100" max="380" step="10" value="${threePhaseParams.Vphase}">
            </div>
          </div>
        </div>
      `;
    } else if (simRef.id === 'sim-relay-sequence') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">산업용 모터 정역회전 자기유지 & 인터록</span>
          </div>
          <canvas id="ee-canvas-relay" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <button id="btn-relay-fwd" class="btn-action btn-success">▶ 정회전 기동 (PB-FWD)</button>
            <button id="btn-relay-rev" class="btn-action btn-success">◀ 역회전 기동 (PB-REV)</button>
            <button id="btn-relay-stop" class="btn-action btn-danger">⏹ 정지 (PB-STOP)</button>
            <button id="btn-relay-estop" class="btn-action btn-danger" style="background:#7f1d1d;">🚨 비상정지 (E-STOP)</button>
          </div>
        </div>
      `;
    }
    return '';
  }

  function attachEESimulatorHandlers(simRef) {
    if (!simRef) return;

    if (simRef.id === 'sim-rlc-transient') {
      const canvas = document.getElementById('ee-canvas-rlc');
      if (!canvas || !window.RLCTransientSim) return;

      const rSlider = document.getElementById('slider-rlc-r');
      const lSlider = document.getElementById('slider-rlc-l');
      const cSlider = document.getElementById('slider-rlc-c');

      function update() {
        rlcParams.R = Number(rSlider.value);
        rlcParams.L = Number(lSlider.value);
        rlcParams.C = Number(cSlider.value) * 1e-6;

        document.getElementById('val-rlc-r').innerText = rlcParams.R;
        document.getElementById('val-rlc-l').innerText = rlcParams.L;
        document.getElementById('val-rlc-c').innerText = (rlcParams.C * 1e6).toFixed(0);

        window.RLCTransientSim.renderRLCTransient(canvas, rlcParams);
      }

      rSlider.addEventListener('input', update);
      lSlider.addEventListener('input', update);
      cSlider.addEventListener('input', update);
      update();
    } else if (simRef.id === 'sim-phasor-power') {
      const canvas = document.getElementById('ee-canvas-phasor');
      if (!canvas || !window.PhasorPowerSim) return;

      const rSlider = document.getElementById('slider-ph-r');
      const lSlider = document.getElementById('slider-ph-l');
      const cSlider = document.getElementById('slider-ph-c');

      function update() {
        phasorParams.R = Number(rSlider.value);
        phasorParams.L = Number(lSlider.value);
        phasorParams.C_corr = Number(cSlider.value) * 1e-6;

        document.getElementById('val-ph-r').innerText = phasorParams.R;
        document.getElementById('val-ph-l').innerText = phasorParams.L;
        document.getElementById('val-ph-c').innerText = (phasorParams.C_corr * 1e6).toFixed(0);

        window.PhasorPowerSim.renderPhasorPower(canvas, phasorParams);
      }

      rSlider.addEventListener('input', update);
      lSlider.addEventListener('input', update);
      cSlider.addEventListener('input', update);
      update();
    } else if (simRef.id === 'sim-three-phase') {
      const canvas = document.getElementById('ee-canvas-threephase');
      if (!canvas || !window.ThreePhaseSim) return;

      const btnY = document.getElementById('btn-tp-y');
      const btnDelta = document.getElementById('btn-tp-delta');
      const vSlider = document.getElementById('slider-tp-v');

      function update() {
        threePhaseParams.Vphase = Number(vSlider.value);
        document.getElementById('val-tp-v').innerText = threePhaseParams.Vphase;
        window.ThreePhaseSim.renderThreePhase(canvas, threePhaseParams);
      }

      btnY.addEventListener('click', () => {
        threePhaseParams.connection = 'Y';
        btnY.classList.add('active');
        btnDelta.classList.remove('active');
        update();
      });

      btnDelta.addEventListener('click', () => {
        threePhaseParams.connection = 'Delta';
        btnDelta.classList.add('active');
        btnY.classList.remove('active');
        update();
      });

      vSlider.addEventListener('input', update);
      update();
    } else if (simRef.id === 'sim-relay-sequence') {
      const canvas = document.getElementById('ee-canvas-relay');
      if (!canvas || !window.RelaySequenceSim) return;

      if (!relayState) relayState = window.RelaySequenceSim.createInitialState();

      const btnFwd = document.getElementById('btn-relay-fwd');
      const btnRev = document.getElementById('btn-relay-rev');
      const btnStop = document.getElementById('btn-relay-stop');
      const btnEStop = document.getElementById('btn-relay-estop');

      function update() {
        window.RelaySequenceSim.renderRelaySequence(canvas, relayState);
      }

      btnFwd.addEventListener('click', () => {
        relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { pbFwdStart: true, pbStop: false, eStop: false });
        update();
        setTimeout(() => {
          relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { pbFwdStart: false });
          update();
        }, 300);
      });

      btnRev.addEventListener('click', () => {
        relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { pbRevStart: true, pbStop: false, eStop: false });
        update();
        setTimeout(() => {
          relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { pbRevStart: false });
          update();
        }, 300);
      });

      btnStop.addEventListener('click', () => {
        relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { pbStop: true });
        update();
        setTimeout(() => {
          relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { pbStop: false });
          update();
        }, 300);
      });

      btnEStop.addEventListener('click', () => {
        relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { eStop: !relayState.eStop });
        btnEStop.innerText = relayState.eStop ? '🚨 비상정지 해제 (E-RESET)' : '🚨 비상정지 (E-STOP)';
        update();
      });

      update();
    }
  }

  // ==========================================
  // TAB 4: Electronic Engineering
  // ==========================================
  function renderElectronicsModules() {
    const pane = document.getElementById('tab-electronics');
    if (!pane) return;

    const modules = manifestData.electronics.modules;
    const activeMod = modules.find(m => m.id === activeELModuleId) || modules[0];

    let html = `
      <div class="module-layout">
        <aside class="module-sidebar">
          <div style="font-weight:700;margin-bottom:12px;font-size:0.95rem;color:var(--accent-el);">💡 전자공학 커리큘럼</div>
          ${modules.map(m => `
            <div class="module-nav-item ${m.id === activeMod.id ? 'active' : ''}" onclick="window.__selectELModule('${m.id}')">
              ${m.order}. ${m.titleKo}
            </div>
          `).join('')}
        </aside>
        <section class="module-content-pane">
          <h2 style="font-size:1.3rem;margin-bottom:8px;">${activeMod.titleKo}</h2>
          <div style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">${activeMod.titleEn} (${activeMod.domain})</div>
          <p style="font-size:0.95rem;margin-bottom:20px;line-height:1.7;">${activeMod.overview}</p>

          <!-- Embedded Simulator Component -->
          ${renderELSimulatorCard(activeMod.simulationRef)}

          <div style="margin-top:24px;">
            <h3 style="font-size:1.1rem;margin-bottom:12px;color:#0f172a;">소자 물리 모델 및 핵심 방정식</h3>
            ${activeMod.coreConcepts.map(c => `
              <div class="concept-card">
                <div style="font-weight:700;font-size:1rem;color:#0f172a;margin-bottom:6px;">${c.titleKo}</div>
                <div style="font-size:0.9rem;color:#334155;margin-bottom:8px;">${c.principle}</div>
                ${c.equations.map(eq => `
                  <div class="math-formula-box">
                    <div style="font-size:0.85rem;font-weight:600;color:var(--accent-el);">${eq.name}</div>
                    <div style="font-size:1.15rem;margin:6px 0;">$$${eq.typesetMath}$$</div>
                    <div style="font-size:0.82rem;color:#334155;">${eq.explanation}</div>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;

    pane.innerHTML = html;

    window.__selectELModule = function (id) {
      activeELModuleId = id;
      renderElectronicsModules();
    };

    attachELSimulatorHandlers(activeMod.simulationRef);
    triggerKaTeX(pane);
  }

  function renderELSimulatorCard(simRef) {
    if (!simRef) return '';

    if (simRef.id === 'sim-logic-circuit') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">디지털 게이트 & 가산기 진리표 인터랙션</span>
          </div>
          <canvas id="el-canvas-logic" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <button id="btn-toggle-inA" class="btn-action ${logicSimParams.inA ? 'active' : ''}">입력 A 토글 (현재: 1)</button>
            <button id="btn-toggle-inB" class="btn-action ${logicSimParams.inB ? 'active' : ''}">입력 B 토글 (현재: 0)</button>
          </div>
        </div>
      `;
    } else if (simRef.id === 'sim-opamp-bode') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">주파수 응답 크기(dB) 및 차단 주파수(-3dB)</span>
          </div>
          <canvas id="el-canvas-opamp" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <div class="control-group">
              <label>입력 저항 R1: <span id="val-bode-r1">${opampBodeParams.R1 / 1000}</span>kΩ</label>
              <input type="range" id="slider-bode-r1" min="1" max="50" step="1" value="${opampBodeParams.R1 / 1000}">
            </div>
            <div class="control-group">
              <label>궤환 저항 Rf: <span id="val-bode-rf">${opampBodeParams.Rf / 1000}</span>kΩ</label>
              <input type="range" id="slider-bode-rf" min="10" max="500" step="10" value="${opampBodeParams.Rf / 1000}">
            </div>
            <div class="control-group">
              <label>필터 C: <span id="val-bode-c">${(opampBodeParams.C * 1e9).toFixed(0)}</span>nF</label>
              <input type="range" id="slider-bode-c" min="1" max="100" step="1" value="${opampBodeParams.C * 1e9}">
            </div>
          </div>
        </div>
      `;
    } else if (simRef.id === 'sim-transistor-curves') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">BJT 특성 곡선 & 직류 부하선(Q-Point)</span>
          </div>
          <canvas id="el-canvas-transistor" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <div class="control-group">
              <label>베이스 전류 Ib: <span id="val-trans-ib">${transistorParams.activeIb_uA}</span>µA</label>
              <input type="range" id="slider-trans-ib" min="10" max="50" step="10" value="${transistorParams.activeIb_uA}">
            </div>
            <div class="control-group">
              <label>전원 Vcc: <span id="val-trans-vcc">${transistorParams.Vcc}</span>V</label>
              <input type="range" id="slider-trans-vcc" min="6" max="24" step="1" value="${transistorParams.Vcc}">
            </div>
            <div class="control-group">
              <label>부하 저항 Rc: <span id="val-trans-rc">${transistorParams.Rc}</span>Ω</label>
              <input type="range" id="slider-trans-rc" min="500" max="3000" step="100" value="${transistorParams.Rc}">
            </div>
          </div>
        </div>
      `;
    } else if (simRef.id === 'sim-timer555') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">555 발진기 2채널 오실로스코프</span>
          </div>
          <canvas id="el-canvas-555" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <div class="control-group">
              <label>저항 Ra: <span id="val-555-ra">${timer555Params.Ra / 1000}</span>kΩ</label>
              <input type="range" id="slider-555-ra" min="1" max="50" step="1" value="${timer555Params.Ra / 1000}">
            </div>
            <div class="control-group">
              <label>저항 Rb: <span id="val-555-rb">${timer555Params.Rb / 1000}</span>kΩ</label>
              <input type="range" id="slider-555-rb" min="1" max="50" step="1" value="${timer555Params.Rb / 1000}">
            </div>
            <div class="control-group">
              <label>커패시터 C: <span id="val-555-c">${(timer555Params.C * 1e6).toFixed(1)}</span>µF</label>
              <input type="range" id="slider-555-c" min="0.1" max="10" step="0.1" value="${timer555Params.C * 1e6}">
            </div>
          </div>
        </div>
      `;
    }
    return '';
  }

  function attachELSimulatorHandlers(simRef) {
    if (!simRef) return;

    if (simRef.id === 'sim-logic-circuit') {
      const canvas = document.getElementById('el-canvas-logic');
      if (!canvas || !window.LogicSim) return;

      const btnA = document.getElementById('btn-toggle-inA');
      const btnB = document.getElementById('btn-toggle-inB');

      function update() {
        btnA.innerText = `입력 A 토글 (현재: ${logicSimParams.inA ? '1' : '0'})`;
        btnB.innerText = `입력 B 토글 (현재: ${logicSimParams.inB ? '1' : '0'})`;
        if (logicSimParams.inA) {
          btnA.classList.add('active');
        } else {
          btnA.classList.remove('active');
        }
        if (logicSimParams.inB) {
          btnB.classList.add('active');
        } else {
          btnB.classList.remove('active');
        }
        window.LogicSim.renderLogicSim(canvas, logicSimParams);
      }

      btnA.addEventListener('click', () => {
        logicSimParams.inA = !logicSimParams.inA;
        update();
      });

      btnB.addEventListener('click', () => {
        logicSimParams.inB = !logicSimParams.inB;
        update();
      });

      update();
    } else if (simRef.id === 'sim-opamp-bode') {
      const canvas = document.getElementById('el-canvas-opamp');
      if (!canvas || !window.OpampBodeSim) return;

      const r1Slider = document.getElementById('slider-bode-r1');
      const rfSlider = document.getElementById('slider-bode-rf');
      const cSlider = document.getElementById('slider-bode-c');

      function update() {
        opampBodeParams.R1 = Number(r1Slider.value) * 1000;
        opampBodeParams.Rf = Number(rfSlider.value) * 1000;
        opampBodeParams.C = Number(cSlider.value) * 1e-9;

        document.getElementById('val-bode-r1').innerText = (opampBodeParams.R1 / 1000).toFixed(0);
        document.getElementById('val-bode-rf').innerText = (opampBodeParams.Rf / 1000).toFixed(0);
        document.getElementById('val-bode-c').innerText = (opampBodeParams.C * 1e9).toFixed(0);

        window.OpampBodeSim.renderOpampBode(canvas, opampBodeParams);
      }

      r1Slider.addEventListener('input', update);
      rfSlider.addEventListener('input', update);
      cSlider.addEventListener('input', update);
      update();
    } else if (simRef.id === 'sim-transistor-curves') {
      const canvas = document.getElementById('el-canvas-transistor');
      if (!canvas || !window.TransistorCurvesSim) return;

      const ibSlider = document.getElementById('slider-trans-ib');
      const vccSlider = document.getElementById('slider-trans-vcc');
      const rcSlider = document.getElementById('slider-trans-rc');

      function update() {
        transistorParams.activeIb_uA = Number(ibSlider.value);
        transistorParams.Vcc = Number(vccSlider.value);
        transistorParams.Rc = Number(rcSlider.value);

        document.getElementById('val-trans-ib').innerText = transistorParams.activeIb_uA;
        document.getElementById('val-trans-vcc').innerText = transistorParams.Vcc;
        document.getElementById('val-trans-rc').innerText = transistorParams.Rc;

        window.TransistorCurvesSim.renderTransistorCurves(canvas, transistorParams);
      }

      ibSlider.addEventListener('input', update);
      vccSlider.addEventListener('input', update);
      rcSlider.addEventListener('input', update);
      update();
    } else if (simRef.id === 'sim-timer555') {
      const canvas = document.getElementById('el-canvas-555');
      if (!canvas || !window.Timer555Sim) return;

      const raSlider = document.getElementById('slider-555-ra');
      const rbSlider = document.getElementById('slider-555-rb');
      const cSlider = document.getElementById('slider-555-c');

      function update() {
        timer555Params.Ra = Number(raSlider.value) * 1000;
        timer555Params.Rb = Number(rbSlider.value) * 1000;
        timer555Params.C = Number(cSlider.value) * 1e-6;

        document.getElementById('val-555-ra').innerText = (timer555Params.Ra / 1000).toFixed(0);
        document.getElementById('val-555-rb').innerText = (timer555Params.Rb / 1000).toFixed(0);
        document.getElementById('val-555-c').innerText = (timer555Params.C * 1e6).toFixed(1);

        window.Timer555Sim.render555Timer(canvas, timer555Params);
      }

      raSlider.addEventListener('input', update);
      rbSlider.addEventListener('input', update);
      cSlider.addEventListener('input', update);
      update();
    }
  }

  // ==========================================
  // ==========================================
  // TAB 5: EE vs ECE Comparison & Roadmaps
  // ==========================================

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.__toggleCurriculumDrawer = function (drawerId, btnEl) {
    const el = document.getElementById(drawerId);
    const btnText = document.getElementById(`btn-text-${drawerId}`);
    const btn = btnEl || (btnText ? btnText.closest('.curriculum-toggle-btn') : null);
    if (!el) return;
    if (el.style.display === 'none' || !el.style.display) {
      el.style.display = 'block';
      if (btn) {
        btn.classList.add('active');
        btn.classList.add('open');
      }
      if (btnText) btnText.textContent = '상세 커리큘럼 & 실무 랩 접기 ▲';
      triggerKaTeX(el);
    } else {
      el.style.display = 'none';
      if (btn) {
        btn.classList.remove('active');
        btn.classList.remove('open');
      }
      if (btnText) btnText.textContent = '상세 커리큘럼 & 실무 랩 보기 (이론, 수식, 코드, 퀴즈) ▼';
    }
  };

  window.__toggleQuizAnswer = function (quizElId, btnEl) {
    const el = document.getElementById(quizElId);
    if (!el) return;
    const isHidden = (el.style.display === 'none' || !el.style.display);
    el.style.display = isHidden ? 'block' : 'none';
    if (btnEl) {
      if (isHidden) {
        btnEl.classList.add('active');
        btnEl.textContent = '정답 및 해설 접기 ▲';
      } else {
        btnEl.classList.remove('active');
        btnEl.textContent = '정답 및 해설 확인';
      }
    }
    if (isHidden) {
      triggerKaTeX(el);
    }
  };

  function renderCurriculumDrawer(modId) {
    if (!modId || !manifestData || !manifestData.eeRoadmapCurriculum || !manifestData.eeRoadmapCurriculum.modules) {
      return '';
    }
    const mod = manifestData.eeRoadmapCurriculum.modules.find(m => m.id === modId);
    if (!mod) return '';

    const drawerId = `curr-drawer-${modId}`;
    const deepTheoryEntries = mod.deepTheory ? Object.values(mod.deepTheory) : [];
    const equations = mod.equations || [];
    const lab = mod.practicalLab || null;
    const checklist = mod.keyChecklist || mod.checklist || [];
    const quizzes = mod.quiz || mod.quizQuestions || [];

    return `
      <div style="margin-top:12px;">
        <button class="curriculum-toggle-btn" onclick="window.__toggleCurriculumDrawer('${drawerId}', this)">
          <span>📖</span>
          <span id="btn-text-${drawerId}">상세 커리큘럼 &amp; 실무 랩 보기 (이론, 수식, 코드, 퀴즈) ▼</span>
        </button>
        <div id="${drawerId}" class="curriculum-content-body" style="display:none;">
          <div style="border-bottom:1px solid #cbd5e1;padding-bottom:10px;margin-bottom:14px;">
            <h4 style="font-size:1.05rem;color:#0f172a;margin-bottom:4px;">${mod.titleKo} <span style="font-size:0.85rem;color:var(--text-muted);font-weight:400;">(${mod.titleEn || ''})</span></h4>
            <p style="font-size:0.9rem;color:#334155;line-height:1.6;">${mod.overview || ''}</p>
          </div>

          <!-- 1. Learning Objectives & Prerequisites -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:12px;margin-bottom:16px;">
            ${mod.learningObjectives && mod.learningObjectives.length > 0 ? `
              <div style="background:#ffffff;border:1.5px solid #0f172a;border-radius:6px;padding:12px;">
                <div class="curriculum-section-title">🎯 학습 목표 (Learning Objectives)</div>
                <ul style="margin-left:18px;font-size:0.88rem;color:#0f172a;line-height:1.6;">
                  ${mod.learningObjectives.map(obj => `<li>${obj}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${mod.prerequisites && mod.prerequisites.length > 0 ? `
              <div style="background:#ffffff;border:1.5px solid #0f172a;border-radius:6px;padding:12px;">
                <div class="curriculum-section-title">📚 선수 지식 (Prerequisites)</div>
                <ul style="margin-left:18px;font-size:0.88rem;color:#0f172a;line-height:1.6;">
                  ${mod.prerequisites.map(p => `<li>${p}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <!-- 2. Deep Theory -->
          ${deepTheoryEntries.length > 0 ? `
            <div style="margin-bottom:16px;">
              <div class="curriculum-section-title">🔬 심층 이론 및 엔지니어링 메커니즘</div>
              ${deepTheoryEntries.map(th => `
                <div style="background:#ffffff;border:1.5px solid #0f172a;border-radius:6px;padding:12px 14px;margin-bottom:10px;">
                  <div style="font-weight:700;font-size:0.95rem;color:#0f172a;margin-bottom:4px;">${th.title}</div>
                  <p style="font-size:0.9rem;color:#334155;line-height:1.65;margin:0 0 6px 0;">${th.explanation}</p>
                  ${th.architecturePoints ? `
                    <ul style="margin-left:18px;font-size:0.86rem;color:#0f172a;line-height:1.5;">
                      ${th.architecturePoints.map(pt => `<li>${pt}</li>`).join('')}
                    </ul>
                  ` : ''}
                  ${th.keyMetrics ? `
                    <div style="font-size:0.82rem;color:#0f172a;background:#ffffff;border:1.5px solid #0f172a;padding:6px 10px;border-radius:4px;margin-top:6px;">
                      <strong>핵심 지표:</strong> ${Array.isArray(th.keyMetrics) ? th.keyMetrics.join(' | ') : th.keyMetrics}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- 3. Mathematical Equations -->
          ${equations.length > 0 ? `
            <div style="margin-bottom:16px;">
              <div class="curriculum-section-title">📐 핵심 수학적 정식화 및 지배 수식</div>
              ${equations.map(eq => `
                <div class="math-formula-box" style="margin-bottom:10px;">
                  <div style="font-weight:600;font-size:0.88rem;color:var(--primary);margin-bottom:4px;">${eq.name || ''}</div>
                  <div style="font-size:1.15rem;margin:6px 0;">$$${eq.latex || eq.typesetMath || ''}$$</div>
                  ${eq.physicalMeaning ? `<div style="font-size:0.88rem;color:#0f172a;line-height:1.5;margin-bottom:4px;">💡 <strong>물리적 의미:</strong> ${eq.physicalMeaning}</div>` : ''}
                  ${eq.derivationNotes ? `<div style="font-size:0.82rem;color:#334155;line-height:1.5;">🔍 <strong>유도 배경:</strong> ${eq.derivationNotes}</div>` : ''}
                  ${eq.variables ? `
                    <div style="margin-top:6px;font-size:0.82rem;color:#0f172a;background:#ffffff;border:1.5px solid #0f172a;border-radius:4px;padding:6px 10px;">
                      <strong>변수 정의:</strong>
                      <div style="margin-top:4px;">
                        ${Object.entries(eq.variables).map(([k, v]) => `<div><span style="font-family:monospace;font-weight:bold;">${k}</span>: ${v}</div>`).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- 4. Practical Lab Project -->
          ${lab ? `
            <div style="margin-bottom:16px;">
              <div class="curriculum-section-title">🛠️ 실무 랩 프로젝트 (Hands-on Engineering Lab)</div>
              <div class="lab-box">
                <h5>🧪 ${lab.labTitle || '실무 엔지니어링 프로젝트'}</h5>
                ${lab.objective ? `
                  <div style="font-size:0.88rem;color:#0f172a;margin-bottom:8px;line-height:1.5;">
                    <strong>랩 목표:</strong> ${lab.objective}
                  </div>
                ` : ''}
                ${lab.targetPlatformAndTools ? `
                  <div style="font-size:0.84rem;color:#334155;margin-bottom:8px;">
                    <strong>플랫폼 &amp; 도구:</strong> ${Array.isArray(lab.targetPlatformAndTools) ? lab.targetPlatformAndTools.join(', ') : lab.targetPlatformAndTools}
                  </div>
                ` : ''}
                ${lab.stepByStepGuide && lab.stepByStepGuide.length > 0 ? `
                  <div style="font-size:0.86rem;color:#0f172a;margin-bottom:10px;">
                    <strong>실행 단계 가이드:</strong>
                    <ol style="margin-left:18px;margin-top:4px;line-height:1.5;">
                      ${lab.stepByStepGuide.map(st => `<li>${st}</li>`).join('')}
                    </ol>
                  </div>
                ` : ''}
                ${lab.codeSnippet ? `
                  <div style="margin-top:10px;">
                    <div style="font-size:0.85rem;font-weight:700;color:#0f172a;margin-bottom:4px;">💻 소스 코드 / 벤치마크 스크립트</div>
                    <pre class="lab-code"><code>${escapeHtml(typeof lab.codeSnippet === 'string' ? lab.codeSnippet : (lab.codeSnippet.code || ''))}</code></pre>
                  </div>
                ` : ''}
                ${lab.expectedOutput ? `
                  <div style="font-size:0.84rem;color:#166534;background:#ffffff;border:1.5px solid #16a34a;border-left:5px solid #16a34a;padding:8px 12px;border-radius:6px;margin-top:8px;">
                    <strong>기대 결과:</strong> ${lab.expectedOutput}
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <!-- 5. Checklist -->
          ${checklist.length > 0 ? `
            <div style="margin-bottom:16px;background:#ffffff;border:1.5px solid #0f172a;border-radius:6px;padding:12px;">
              <div class="curriculum-section-title">✅ 핵심 점검 체크리스트 (Mastery Checklist)</div>
              <ul style="margin-left:18px;font-size:0.88rem;color:#0f172a;line-height:1.6;">
                ${checklist.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- 6. Quiz -->
          ${quizzes.length > 0 ? `
            <div>
              <div class="curriculum-section-title">🧠 개념 검증 퀴즈 (${quizzes.length}문항)</div>
              ${quizzes.map((q, qIdx) => {
                const quizElId = `quiz-${modId}-${qIdx}`;
                const ansIdx = q.correctIndex !== undefined ? q.correctIndex : (q.answerIndex !== undefined ? q.answerIndex : 0);
                return `
                  <div class="quiz-card">
                    <div class="quiz-question">Q${qIdx + 1}. ${q.question}</div>
                    <div style="font-size:0.88rem;color:#0f172a;margin-left:8px;line-height:1.6;">
                      ${(q.options || []).map((opt, optIdx) => `<div>(${optIdx + 1}) ${opt}</div>`).join('')}
                    </div>
                    <div style="margin-top:8px;">
                      <button class="quiz-btn" onclick="window.__toggleQuizAnswer('${quizElId}', this)">정답 및 해설 확인</button>
                    </div>
                    <div id="${quizElId}" class="quiz-answer-box" style="display:none;">
                      <strong>정답: (${ansIdx + 1})</strong> ${q.options ? q.options[ansIdx] : ''}<br>
                      <strong>해설:</strong> ${q.explanation || ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderEECompare() {
    const pane = document.getElementById('tab-ee-compare');
    if (!pane) return;
    const data = manifestData.eeComparative;
    if (!data) {
      pane.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:1.05rem;">전기공학 vs 전자공학 비교 및 로드맵 자료를 구성 중입니다...</div>`;
      return;
    }

    const title = data.titleKo || data.title || '전기공학(EE) vs 전자공학(ECE) 심층 비교 및 첨단 로드맵';
    const overview = (data.executiveSummary && data.executiveSummary.korean) || data.overview || '';
    const dichotomy = (data.executiveSummary && data.executiveSummary.coreDichotomy) || null;
    const matrix = data.detailedComparison || data.comparisonMatrix || [];
    const subdisciplines = data.subdisciplines || {};
    const roadmap = data.vlsiRoadmap || data.semiconductorRoadmap || [];
    const embedded = data.embeddedStack || data.embeddedFirmwareStack || [];
    const powerGrid = data.powerGridRoadmap || [];

    let html = `
      <div class="compare-container">
        <!-- 1. Executive Summary & Philosophy -->
        <div class="compare-intro-card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <span style="font-size:1.6rem;">⚡🔬</span>
            <h2 style="font-size:1.35rem;color:#0f172a;">${title}</h2>
          </div>
          <p style="font-size:0.95rem;color:#334155;line-height:1.75;margin-bottom:16px;">${overview}</p>

          ${dichotomy ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:16px;margin-top:16px;">
              <div style="background:#ffffff;border:1.5px solid #16a34a;border-radius:8px;padding:16px;">
                <div style="font-weight:700;color:#166534;font-size:1.05rem;margin-bottom:6px;">⚡ 전기공학 (EE) 패러다임</div>
                <div style="font-size:0.85rem;color:#15803d;font-weight:600;margin-bottom:8px;">${dichotomy.electricalEngineering.paradigm || ''}</div>
                <div style="font-size:0.88rem;color:#0f172a;line-height:1.6;">
                  <strong>핵심 미션:</strong> ${dichotomy.electricalEngineering.coreMission || ''}<br>
                  <strong>대상 객체:</strong> ${dichotomy.electricalEngineering.targetEntity || ''}<br>
                  <strong>운영 스케일:</strong> ${dichotomy.electricalEngineering.systemScales || ''}
                </div>
              </div>
              <div style="background:#ffffff;border:1.5px solid #d97706;border-radius:8px;padding:16px;">
                <div style="font-weight:700;color:#92400e;font-size:1.05rem;margin-bottom:6px;">🔬 전자공학 (ECE) 패러다임</div>
                <div style="font-size:0.85rem;color:#b45309;font-weight:600;margin-bottom:8px;">${dichotomy.electronicEngineering.paradigm || ''}</div>
                <div style="font-size:0.88rem;color:#0f172a;line-height:1.6;">
                  <strong>핵심 미션:</strong> ${dichotomy.electronicEngineering.coreMission || ''}<br>
                  <strong>대상 객체:</strong> ${dichotomy.electronicEngineering.targetEntity || ''}<br>
                  <strong>운영 스케일:</strong> ${dichotomy.electronicEngineering.systemScales || ''}
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- 2. Detailed Comparison Matrix Table -->
        <div class="compare-intro-card">
          <h3 style="font-size:1.2rem;color:#0f172a;margin-bottom:12px;">📊 두 분야의 본질적 차이 비교 매트릭스</h3>
          <div style="overflow-x:auto;">
            <table class="matrix-table">
              <thead>
                <tr>
                  <th style="width:20%;background:#ffffff;color:#0f172a;">비교 항목 (Category)</th>
                  <th style="width:40%;background:#ffffff;color:#166534;border-left:2px solid #16a34a;">⚡ 전기공학 (Electrical Engineering)</th>
                  <th style="width:40%;background:#ffffff;color:#92400e;border-left:2px solid #d97706;">🔬 전자공학 (Electronic Engineering)</th>
                </tr>
              </thead>
              <tbody>
                ${Array.isArray(matrix) ? matrix.map(m => `
                  <tr>
                    <td><strong>${m.category || m.dimensionKo || m.item || m.aspect || ''}</strong></td>
                    <td style="background:#ffffff;line-height:1.6;color:#0f172a;">${typeof m.electricalEngineering === 'object' ? (m.electricalEngineering.korean || '') : (m.ee || m.electrical || m.electricalEngineering || '')}</td>
                    <td style="background:#ffffff;line-height:1.6;color:#0f172a;">${typeof m.electronicEngineering === 'object' ? (m.electronicEngineering.korean || '') : (m.ece || m.electronics || m.electronicEngineering || '')}</td>
                  </tr>
                `).join('') : ''}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. Subdisciplines Breakdown -->
        <div class="compare-intro-card">
          <h3 style="font-size:1.2rem;color:#0f172a;margin-bottom:12px;">🏛️ 주요 세부 분야 정밀 분석</h3>

          <div style="margin-top:16px;">
            <h4 style="color:#059669;font-size:1.05rem;margin-bottom:10px;">⚡ 전기공학의 핵심 세부 분과</h4>
            <div class="subdisc-grid">
              ${(subdisciplines.electrical || subdisciplines.ee || []).map(s => `
                <div class="subdisc-card" style="border-top:3px solid #059669;">
                  <h4>${s.nameKo || s.title || s.name || ''} <span style="font-size:0.8rem;color:var(--text-muted);font-weight:400;">(${s.nameEn || ''})</span></h4>
                  <p style="font-size:0.88rem;color:#475569;margin-bottom:8px;line-height:1.6;">${s.description || s.overview || ''}</p>
                  ${s.topics ? `<div style="font-size:0.82rem;color:#334155;"><strong>주요 주제:</strong> ${Array.isArray(s.topics) ? s.topics.join(', ') : s.topics}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <div style="margin-top:24px;">
            <h4 style="color:#d97706;font-size:1.05rem;margin-bottom:10px;">🔬 전자공학의 핵심 세부 분과</h4>
            <div class="subdisc-grid">
              ${(subdisciplines.electronics || subdisciplines.ece || []).map(s => `
                <div class="subdisc-card" style="border-top:3px solid #d97706;">
                  <h4>${s.nameKo || s.title || s.name || ''} <span style="font-size:0.8rem;color:var(--text-muted);font-weight:400;">(${s.nameEn || ''})</span></h4>
                  <p style="font-size:0.88rem;color:#475569;margin-bottom:8px;line-height:1.6;">${s.description || s.overview || ''}</p>
                  ${s.topics ? `<div style="font-size:0.82rem;color:#334155;"><strong>주요 주제:</strong> ${Array.isArray(s.topics) ? s.topics.join(', ') : s.topics}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 4. VLSI Semiconductor Roadmap -->
        <div class="compare-intro-card">
          <h3 style="font-size:1.2rem;color:#0f172a;margin-bottom:12px;">🏭 반도체 공정 및 설계(VLSI) 진로 로드맵 (4단계)</h3>
          <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:16px;">학부 기초 역량부터 프론트엔드 RTL 설계, 백엔드 물리적 구현(P&R), 첨단 Fab 단위 공정, 패키징 및 테스트까지의 전주기 커리어 가이드</p>
          <div class="roadmap-list">
            ${(Array.isArray(roadmap) ? roadmap : (roadmap.stages || roadmap.steps || [])).map((step, idx) => `
              <div class="roadmap-step">
                <div class="step-badge">${step.order || step.step || (idx + 1)}</div>
                <div class="step-content">
                  <div style="font-weight:700;font-size:1.05rem;color:#0f172a;margin-bottom:4px;">${step.titleKo || step.stageNameKo || step.title || ''} <span style="font-size:0.85rem;color:var(--text-muted);font-weight:400;">(${step.titleEn || ''})</span></div>
                  <div style="font-size:0.85rem;color:var(--primary);margin-bottom:8px;">${step.roleDefinition || step.targetRole || step.domain || ''}</div>
                  ${step.curriculumSummary ? `<p style="font-size:0.9rem;color:#334155;line-height:1.6;margin-bottom:10px;">${step.curriculumSummary}</p>` : (step.description ? `<p style="font-size:0.9rem;color:#334155;line-height:1.6;margin-bottom:10px;">${step.description}</p>` : '')}
                  ${step.requiredCompetencies || step.industryStandardToolchain ? `
                    <div style="margin-bottom:8px;">
                      ${(step.requiredCompetencies || step.coreSkills || []).map(t => `<span class="tech-tag">${t}</span>`).join('')}
                      ${(step.industryStandardToolchain || step.tools || []).map(t => `<span class="tech-tag" style="background:#e0f2fe;color:#0369a1;">${t}</span>`).join('')}
                    </div>
                  ` : ''}
                  ${renderCurriculumDrawer(step.curriculumModuleId)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 5. Embedded HW/FW Tech Stack -->
        <div class="compare-intro-card">
          <h3 style="font-size:1.2rem;color:#0f172a;margin-bottom:12px;">💻 임베디드 하드웨어·펌웨어 개발 5대 기둥 스택</h3>
          <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:16px;">ARM Cortex-M SoC 구조, 실시간 선점형 RTOS, 통신 필드버스, 온칩 디버깅/추적 장비 및 고속 PCB SI/PI 신호 무결성</p>
          <div class="subdisc-grid">
            ${(Array.isArray(embedded) ? embedded : (embedded.layers || embedded.stacks || [])).map(layer => `
              <div class="subdisc-card" style="border-left:4px solid var(--primary);">
                <div style="font-weight:700;font-size:1rem;color:#0f172a;margin-bottom:4px;">${layer.order ? `${layer.order}. ` : ''}${layer.titleKo || layer.layerNameKo || layer.category || ''} <span style="font-size:0.8rem;color:var(--text-muted);font-weight:400;">(${layer.titleEn || ''})</span></div>
                <p style="font-size:0.88rem;color:#475569;margin-bottom:8px;line-height:1.6;">${layer.coreArchitecturalPrinciples || layer.description || ''}</p>
                ${layer.industryStandardHardwareAndSoftware ? `
                  <div style="font-size:0.82rem;color:#0369a1;margin-bottom:8px;"><strong>표준 환경:</strong> ${layer.industryStandardHardwareAndSoftware}</div>
                ` : ''}
                ${renderCurriculumDrawer(layer.curriculumModuleId)}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 6. Power Grid & Energy Systems Roadmap -->
        <div class="compare-intro-card">
          <h3 style="font-size:1.2rem;color:#0f172a;margin-bottom:12px;">⚡ 차세대 전력망 및 신재생 에너지 4단계 로드맵</h3>
          <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:16px;">대규모 전력 조류 계산, 대칭 좌표법 고장 해석 및 보호 협조, 계통연계형 인버터(dq 제어), IEC 61850 디지털 변전소 및 마이크로그리드 블랙 스타트까지</p>
          <div class="roadmap-list">
            ${(Array.isArray(powerGrid) ? powerGrid : []).map((step, idx) => `
              <div class="roadmap-step">
                <div class="step-badge" style="background:#059669;">${step.order || (idx + 1)}</div>
                <div class="step-content">
                  <div style="font-weight:700;font-size:1.05rem;color:#0f172a;margin-bottom:4px;">${step.titleKo || ''} <span style="font-size:0.85rem;color:var(--text-muted);font-weight:400;">(${step.titleEn || ''})</span></div>
                  <div style="font-size:0.85rem;color:#059669;margin-bottom:8px;">${step.roleDefinition || ''}</div>
                  ${step.curriculumSummary ? `<p style="font-size:0.9rem;color:#334155;line-height:1.6;margin-bottom:10px;">${step.curriculumSummary}</p>` : ''}
                  ${step.requiredCompetencies || step.industryStandardToolchain ? `
                    <div style="margin-bottom:8px;">
                      ${(step.requiredCompetencies || []).map(t => `<span class="tech-tag">${t}</span>`).join('')}
                      ${(step.industryStandardToolchain || []).map(t => `<span class="tech-tag" style="background:#ecfdf5;color:#047857;">${t}</span>`).join('')}
                    </div>
                  ` : ''}
                  ${renderCurriculumDrawer(step.curriculumModuleId)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    pane.innerHTML = html;
    triggerKaTeX(pane);
  }

  // ==========================================
  // NEW SIMULATOR RENDERERS (Tabs 8, 9, 10)
  // ==========================================
  let cpuSimInstance = null;
  let circuitSimInstance = null;
  let inverterSimInstance = null;

  function renderComputerSim() {
    const pane = document.getElementById('tab-sim-computer');
    if (!pane) return;
    if (!window.CpuComputerSim) {
      pane.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);">가상 CPU 컴퓨터 시뮬레이터를 로딩 중입니다...</div>`;
      return;
    }
    if (!pane.dataset.initialized) {
      pane.innerHTML = '';
      cpuSimInstance = window.CpuComputerSim.init(pane);
      pane.dataset.initialized = 'true';
    }
  }

  function renderCircuitSim() {
    const pane = document.getElementById('tab-sim-circuit');
    if (!pane) return;
    if (!window.CircuitSandboxSim) {
      pane.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);">회로 샌드박스 & 오실로스코프 시뮬레이터를 로딩 중입니다...</div>`;
      return;
    }
    if (!pane.dataset.initialized) {
      pane.innerHTML = '';
      circuitSimInstance = window.CircuitSandboxSim.init(pane);
      pane.dataset.initialized = 'true';
    }
  }

  function renderInverterSim() {
    const pane = document.getElementById('tab-sim-inverter');
    if (!pane) return;
    if (!window.InverterMotorSim) {
      pane.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);">3상 인버터 & 모터 동역학 시뮬레이터를 로딩 중입니다...</div>`;
      return;
    }
    if (!pane.dataset.initialized) {
      pane.innerHTML = '';
      inverterSimInstance = window.InverterMotorSim.init(pane);
      pane.dataset.initialized = 'true';
    }
  }

  // ==========================================
  // TAB 6: EE Advanced Math Derivations
  // ==========================================
  function renderEEMath() {
    const pane = document.getElementById('tab-ee-math');
    if (!pane) return;
    const data = manifestData.eeAdvancedMath;
    if (!data) {
      pane.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:1.05rem;">핵심 공학수학 심층 유도 자료를 준비하는 중입니다...</div>`;
      return;
    }

    const modules = data.modules || data.mathModules || [];
    let html = `
      <div style="margin-bottom:20px;">
        <h2 style="font-size:1.4rem;color:#0f172a;margin-bottom:6px;">📐 ${data.titleKo || data.title || '전기·전자공학 핵심 공학수학 심층 유도'}</h2>
        <p style="font-size:0.95rem;color:#475569;line-height:1.7;">전기 및 전자공학의 근간을 이루는 8대 지배 방정식의 엄밀한 수학적 유도, 물리적 통찰 및 공학적 응용</p>
      </div>
      <div>
        ${modules.map((m, idx) => `
          <div class="math-module-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
              <h3 style="font-size:1.15rem;color:#0f172a;">${m.moduleNumber || (idx + 1)}. ${m.titleKo || m.title || ''}</h3>
              <span style="font-size:0.8rem;background:#f3e8ff;color:#7c3aed;padding:3px 10px;border-radius:12px;font-weight:600;">${m.category || '공학수학'}</span>
            </div>
            <div style="font-size:0.88rem;color:var(--text-muted);margin-bottom:12px;">${m.titleEn || ''}</div>
            <p style="font-size:0.92rem;color:#334155;line-height:1.7;margin-bottom:14px;">${m.overview || ''}</p>

            ${m.governingEquations ? `
              <div style="margin-bottom:16px;">
                <h4 style="font-size:0.95rem;color:#1e293b;margin-bottom:8px;">📌 기본 지배 방정식</h4>
                ${m.governingEquations.map(eq => `
                  <div class="math-formula-box">
                    <div style="font-weight:600;font-size:0.88rem;color:var(--primary);margin-bottom:4px;">${eq.name || ''}</div>
                    <div style="font-size:1.15rem;margin:6px 0;">$$${eq.typesetMath || eq.differentialForm || eq.equation || ''}$$</div>
                    ${eq.integralForm ? `<div style="font-size:1.1rem;margin:6px 0;">$$${eq.integralForm}$$</div>` : ''}
                    <div style="font-size:0.82rem;color:#64748b;">${eq.explanation || ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${m.derivations ? `
              <div style="margin-top:16px;">
                <h4 style="font-size:1rem;color:var(--accent-math);margin-bottom:12px;">🔍 단계별 엄밀 수학 유도 과정</h4>
                ${m.derivations.map(d => `
                  <div style="background:#ffffff;border:1.5px solid #0f172a;border-radius:8px;padding:16px;margin-bottom:16px;">
                    <div style="font-weight:700;font-size:1rem;color:#0f172a;margin-bottom:6px;">${d.title}</div>
                    ${d.targetResult ? `<div style="background:#ffffff;padding:8px 12px;border-radius:6px;border:1.5px solid #0f172a;margin-bottom:10px;font-size:1.1rem;color:#0f172a;"><strong>도출 목표 수식:</strong> $$${d.targetResult}$$</div>` : ''}
                    ${d.prerequisites ? `
                      <div style="font-size:0.83rem;color:#334155;margin-bottom:10px;">
                        <strong>선수 지식 / 공리:</strong>
                        <ul style="margin-left:18px;margin-top:4px;">
                          ${d.prerequisites.map(pr => `<li>${pr}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}
                    <div>
                      ${(d.steps || []).map(step => `
                        <div class="derivation-step">
                          <div class="step-title">Step ${step.stepNumber}: ${step.stepTitle}</div>
                          ${step.mathExpression ? `
                            <div class="math-formula-box">
                              <div style="font-size:1.15rem;">$$${step.mathExpression}$$</div>
                            </div>
                          ` : ''}
                          <p style="font-size:0.88rem;color:#0f172a;margin-bottom:6px;line-height:1.6;">${step.mathematicalExplanation || ''}</p>
                          ${step.physicalInterpretation ? `<div style="font-size:0.82rem;color:#059669;margin-top:4px;">💡 <strong>물리적 해석:</strong> ${step.physicalInterpretation}</div>` : ''}
                          ${step.engineeringApplication ? `<div style="font-size:0.82rem;color:#0284c7;margin-top:4px;">🚀 <strong>실무 응용:</strong> ${step.engineeringApplication}</div>` : ''}
                        </div>
                      `).join('')}
                    </div>
                    ${d.conclusion ? `<div style="background:#ffffff;border:1.5px solid #16a34a;border-left:5px solid #16a34a;padding:8px 12px;border-radius:6px;margin-top:10px;font-size:0.88rem;color:#166534;"><strong>결론 및 통찰:</strong> ${d.conclusion}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : (m.derivationSteps ? `
              <div>
                <h4 style="font-size:0.95rem;color:var(--accent-math);margin-bottom:8px;">🔍 단계별 엄밀 수학 유도 과정</h4>
                ${m.derivationSteps.map(step => `
                  <div class="derivation-step">
                    <div class="step-title">${step.stepNumber ? `Step ${step.stepNumber}: ` : ''}${step.titleKo || step.stepTitle || step.title || ''}</div>
                    <p style="font-size:0.88rem;color:#0f172a;margin-bottom:6px;line-height:1.6;">${step.explanation || step.description || ''}</p>
                    ${step.typesetMath || step.math ? `
                      <div class="math-formula-box">
                        <div style="font-size:1.15rem;">$$${step.typesetMath || step.math}$$</div>
                      </div>
                    ` : ''}
                    ${step.physicalMeaning ? `<div style="font-size:0.82rem;color:#059669;margin-top:4px;">💡 <strong>물리적 의미:</strong> ${step.physicalMeaning}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : '')}

            ${m.engineeringApplications || m.engineeringSignificance ? `
              <div style="background:#ffffff;border:1.5px solid #16a34a;border-radius:6px;padding:14px;margin-top:14px;font-size:0.88rem;color:#166534;">
                <div style="font-weight:700;font-size:0.95rem;margin-bottom:6px;">🚀 공학적 응용 및 산업적 의의</div>
                ${Array.isArray(m.engineeringApplications) ? `
                  <ul style="margin-left:18px;line-height:1.6;">
                    ${m.engineeringApplications.map(app => `<li><strong>${app.field || app.title || ''}:</strong> ${app.description || app}</li>`).join('')}
                  </ul>
                ` : `<div>${m.engineeringSignificance || ''}</div>`}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    pane.innerHTML = html;
    triggerKaTeX(pane);
  }

  // ==========================================
  // TAB 7: Classical Seminal Papers & Translations
  // ==========================================
  function renderClassicalPapers() {
    const pane = document.getElementById('tab-classical-papers');
    if (!pane) return;
    const data = manifestData.eeClassicalPapers;
    if (!data) {
      pane.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:1.05rem;">역사적 원전 논문 국역 자료를 준비하는 중입니다...</div>`;
      return;
    }

    const papers = data.papers || [];
    let html = `
      <div style="margin-bottom:20px;">
        <h2 style="font-size:1.4rem;color:#0f172a;margin-bottom:6px;">📜 ${data.titleKo || data.title || '전기·전자공학을 창시한 8대 역사적 원전 논문 국역 및 해설'}</h2>
        <p style="font-size:0.95rem;color:#475569;line-height:1.7;">맥스웰의 전자기학부터 샤논의 정보이론, 나이퀴스트·보드의 궤환제어, 쇼클리의 트랜지스터, 헤비사이드와 튜링·폰노이만의 컴퓨팅 원전까지</p>
      </div>
      <div>
        ${papers.map((p, idx) => {
          const meta = p.bibliographicMetadata || {};
          const authorName = (meta.authors && meta.authors[0] && meta.authors[0].nameKo) || (p.author && p.author.nameKo) || p.author || '';
          const authorEn = (meta.authors && meta.authors[0] && meta.authors[0].nameEn) || (p.author && p.author.nameEn) || '';
          const year = meta.publicationYear || p.year || '';
          const journal = meta.journalOrPublisher || p.originalJournal || '';
          const titleKo = meta.koreanTitle || p.titleKo || p.title || '';
          const titleEn = meta.originalTitle || p.titleEn || '';
          const hist = p.historicalContextAndMotivation || {};
          const excerpts = p.originalExcerptsTranslated || p.koreanExcerpts || [];
          const mathForm = p.mathematicalFormulation || {};
          const modernMath = mathForm.modernKaTeXFormulation || p.coreFormulas || [];
          const theorems = p.keyTheoremsAndPrinciples || [];
          const impact = p.engineeringSignificanceAndImpact || {};
          const essay = p.deepDiveEssay || '';

          return `
            <div class="paper-card">
              <div class="paper-meta">
                <span class="paper-year">${year}</span>
                <span class="paper-author">${authorName} ${authorEn ? `(${authorEn})` : ''}</span>
                <span style="font-size:0.85rem;color:var(--text-muted);">• ${journal}</span>
              </div>
              <h3 style="font-size:1.25rem;color:#0f172a;margin-bottom:4px;">${p.order || (idx + 1)}. ${titleKo}</h3>
              <div style="font-size:0.9rem;color:var(--text-muted);font-style:italic;margin-bottom:16px;">"${titleEn}"</div>

              <!-- Historical Context -->
              <div style="background:#ffffff;padding:14px 18px;border-radius:8px;border:1.5px solid #0f172a;margin-bottom:16px;">
                <div style="font-weight:700;font-size:0.95rem;color:#1e293b;margin-bottom:6px;">🏛️ 시대적 배경 및 연구 동기</div>
                <p style="font-size:0.88rem;color:#0f172a;line-height:1.65;margin-bottom:8px;">${hist.eraOverview || p.historicalContext || ''}</p>
                ${hist.precedingParadigm ? `<div style="font-size:0.84rem;color:#334155;margin-bottom:4px;"><strong>이전의 지배적 패러다임:</strong> ${hist.precedingParadigm}</div>` : ''}
                ${hist.coreResearchQuestion ? `<div style="font-size:0.84rem;color:#0284c7;margin-bottom:4px;"><strong>핵심 연구 질문:</strong> ${hist.coreResearchQuestion}</div>` : ''}
                ${hist.breakthroughMoment ? `<div style="font-size:0.84rem;color:#16a34a;"><strong>지적 돌파구 (Breakthrough):</strong> ${hist.breakthroughMoment}</div>` : ''}
              </div>

              <!-- Translated Excerpts -->
              ${excerpts.length > 0 ? `
                <div class="paper-quote-box">
                  <div style="font-weight:700;font-size:0.92rem;margin-bottom:8px;">📖 원전 본문 발췌 및 한국어 정밀 번역:</div>
                  ${excerpts.map(q => `
                    <div style="margin-bottom:12px;border-bottom:1px dashed #fde047;padding-bottom:10px;">
                      ${q.originalTextEn ? `<div style="font-size:0.82rem;color:#a16207;margin-bottom:4px;font-family:var(--font-mono);">[Original English] "${q.originalTextEn}"</div>` : ''}
                      <div style="font-size:0.93rem;font-weight:600;color:#713f12;line-height:1.6;">"${q.translatedTextKo || q.translationKo || q}"</div>
                      ${q.scholarlyCommentary ? `<div style="font-size:0.82rem;color:#854d0e;margin-top:4px;">💬 <strong>주해:</strong> ${q.scholarlyCommentary}</div>` : ''}
                      ${q.sourceSection ? `<div style="font-size:0.78rem;color:#a16207;text-align:right;margin-top:2px;">— ${q.sourceSection}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <!-- Mathematical Formulations -->
              ${modernMath.length > 0 ? `
                <div style="margin:16px 0;">
                  <h4 style="font-size:0.95rem;color:#0f172a;margin-bottom:8px;">📐 핵심 수학 정식화 및 현대적 KaTeX 표기</h4>
                  ${modernMath.map(m => `
                    <div class="math-formula-box">
                      <div style="font-weight:600;font-size:0.9rem;color:var(--primary);">${m.name || m.formulaName || ''}</div>
                      <div style="font-size:1.15rem;margin:6px 0;">$$${m.typesetMath || m.math || ''}$$</div>
                      ${m.variablesDefinition ? `<div style="font-size:0.8rem;color:#64748b;margin-bottom:4px;">${m.variablesDefinition}</div>` : ''}
                      <div style="font-size:0.84rem;color:#334155;line-height:1.5;">${m.explanation || m.modernMeaning || ''}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <!-- Key Theorems -->
              ${theorems.length > 0 ? `
                <div style="margin:16px 0;">
                  <h4 style="font-size:0.95rem;color:var(--accent-math);margin-bottom:8px;">🏆 논문의 핵심 정리 (Theorems)</h4>
                  ${theorems.map(thm => `
                    <div style="background:#ffffff;border:1.5px solid #0f172a;border-left:5px solid var(--accent-math);border-radius:6px;padding:12px 14px;margin-bottom:8px;">
                      <div style="font-weight:700;font-size:0.9rem;color:#6b21a8;">${thm.nameKo} <span style="font-size:0.8rem;color:#9333ea;font-weight:400;">(${thm.nameEn || ''})</span></div>
                      <div style="font-size:1.05rem;margin:6px 0;">$$${thm.formalStatement}$$</div>
                      <div style="font-size:0.84rem;color:#0f172a;line-height:1.5;"><strong>증명 개요:</strong> ${thm.proofSketchOrReasoning}</div>
                      ${thm.engineeringInterpretation ? `<div style="font-size:0.82rem;color:#7e22ce;margin-top:4px;"><strong>공학적 해석:</strong> ${thm.engineeringInterpretation}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <!-- Engineering Significance & Modern Descendants -->
              <div class="paper-impact-box">
                <div style="font-weight:700;font-size:0.92rem;margin-bottom:6px;">🌟 현대 공학적 의의 및 기술적 후예</div>
                <div style="margin-bottom:6px;line-height:1.6;">${impact.paradigmShift || p.engineeringSignificance || ''}</div>
                ${impact.modernTechnologicalDescendants ? `
                  <div style="margin-top:8px;">
                    <div style="font-weight:600;font-size:0.85rem;color:#15803d;margin-bottom:4px;">현대 직계 후속 기술:</div>
                    <ul style="margin-left:18px;font-size:0.84rem;color:#166534;line-height:1.5;">
                      ${(Array.isArray(impact.modernTechnologicalDescendants) ? impact.modernTechnologicalDescendants : [impact.modernTechnologicalDescendants]).map(t => `<li>${t}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>

              <!-- Deep Dive Essay -->
              ${essay ? `
                <div style="margin-top:16px;background:#ffffff;border:1.5px solid #0f172a;border-left:5px solid #2563eb;padding:14px 18px;border-radius:6px;">
                  <div style="font-weight:700;font-size:0.9rem;color:#0f172a;margin-bottom:6px;">📝 과학사적 종합 평가 에세이</div>
                  <div style="font-size:0.88rem;color:#0f172a;line-height:1.75;white-space:pre-line;">${essay}</div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    pane.innerHTML = html;
    triggerKaTeX(pane);
  }

})();
