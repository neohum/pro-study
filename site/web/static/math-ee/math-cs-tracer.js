/**
 * math-cs-tracer.js
 * E-ink 고대비 수식-코드 2중 필사(LaTeX 수식 + 다국어 코드 타이핑 + 빈칸 유도 + 체크포인트 퀴즈) 컨트롤러
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MathCsTracer = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function normalizeLatex(str) {
    return String(str || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function verifyLatexStep(expected, actual) {
    const exp = normalizeLatex(expected);
    const act = normalizeLatex(actual);
    return {
      matched: exp === act,
      prefixValid: exp.startsWith(act),
      expected: exp,
      actual: act,
    };
  }

  function verifyCodeLine(expectedLine, actualLine) {
    const exp = String(expectedLine || '').trimEnd();
    const act = String(actualLine || '').trimEnd();
    if (exp.trim() === '') {
      return { matched: true, prefixValid: true };
    }
    return {
      matched: exp === act || exp.trim() === act.trim(),
      prefixValid: exp.startsWith(act) || exp.trim().startsWith(act.trim()),
    };
  }

  function verifyFillBlanks(expectedBlanks, userAnswers) {
    if (!Array.isArray(expectedBlanks) || expectedBlanks.length === 0) {
      return { allCorrect: true, results: [] };
    }
    const results = expectedBlanks.map((exp, idx) => {
      const userVal = Array.isArray(userAnswers) ? userAnswers[idx] : '';
      const normExp = normalizeLatex(exp).replace(/\s+/g, '');
      const normAct = normalizeLatex(userVal).replace(/\s+/g, '');
      return normExp.length > 0 && normExp === normAct;
    });
    return {
      allCorrect: results.every(Boolean),
      results,
    };
  }

  function gradeQuizAnswers(questions, selectedIndices) {
    if (!Array.isArray(questions) || questions.length === 0) {
      return { score: 0, total: 0, passed: true, details: [] };
    }
    let score = 0;
    const details = questions.map((q, idx) => {
      const chosen = Array.isArray(selectedIndices) ? Number(selectedIndices[idx]) : -1;
      const correct = chosen === Number(q.answerIndex);
      if (correct) score++;
      return {
        id: q.id,
        chosen,
        answerIndex: q.answerIndex,
        correct,
        explanation: q.explanation,
      };
    });
    return {
      score,
      total: questions.length,
      passed: score === questions.length,
      details,
    };
  }

  function initBrowser() {
    if (typeof document === 'undefined') return;
    const appEl = document.getElementById('mathCsApp');
    if (!appEl || !window.__MATH_CS_LESSON__) return;

    const lesson = window.__MATH_CS_LESSON__;
    const allProgress = window.__MATH_CS_PROGRESS__ || {};
    let currentLang = appEl.dataset.initialLang || 'python';

    if (window.renderMathInElement) {
      window.renderMathInElement(appEl, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
        ],
        throwOnError: false,
      });
    }

    async function saveProgress(patch) {
      const payload = Object.assign({ lessonId: lesson.id }, patch);
      try {
        const res = await fetch('/api/math-cs/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          allProgress[lesson.id] = data;
          updateProgressPills();
        }
      } catch (_) {
        // 오프라인/로컬 폴백
      }
      try {
        localStorage.setItem('proStudyMathCsProgress', JSON.stringify(allProgress));
      } catch (_) {}
    }

    function updateProgressPills() {
      const p = allProgress[lesson.id] || {};
      const fStatus = document.getElementById('formulaTraceStatus');
      if (fStatus) {
        fStatus.textContent = p.formulaTraced ? '수식 필사 완료' : '미완료';
        fStatus.classList.toggle('done', !!p.formulaTraced);
      }

      const cStatus = document.getElementById('codeTraceStatus');
      const tracedLangs = Object.keys(p.codeTracedLangs || {}).filter((k) => p.codeTracedLangs[k]);
      if (cStatus) {
        cStatus.textContent =
          tracedLangs.length > 0 ? `코드 완료 (${tracedLangs.join(', ')})` : '미완료';
        cStatus.classList.toggle('done', tracedLangs.length > 0);
      }

      const bStatus = document.getElementById('blankStatusPill');
      if (bStatus) {
        bStatus.textContent = p.blankSolved ? '유도 통과' : '미완료';
        bStatus.classList.toggle('done', !!p.blankSolved);
      }

      const qStatus = document.getElementById('quizStatusPill');
      if (qStatus && p.quizTotal > 0) {
        qStatus.textContent = `퀴즈 ${p.quizScore}/${p.quizTotal}`;
        qStatus.classList.toggle('done', !!p.quizPassed);
      }

      const overallEl = document.getElementById('overallProgressBadge');
      if (overallEl) {
        const completedCount = Object.values(allProgress).filter(
          (item) => item && (item.formulaTraced || item.blankSolved || item.quizPassed),
        ).length;
        overallEl.textContent = `학습 진도: ${completedCount}개 모듈 진행`;
      }
    }

    // 1. LaTeX 수식 필사
    const formulas = Array.isArray(lesson.mathFormulasToTrace) ? lesson.mathFormulasToTrace : [];
    let formulaIdx = 0;
    const formulaGhostEl = document.getElementById('formulaGhostTarget');
    const formulaInputEl = document.getElementById('formulaTraceInput');
    const formulaStepIdxEl = document.getElementById('formulaStepIdx');
    const formulaStepTotalEl = document.getElementById('formulaStepTotal');
    const formulaFeedbackEl = document.getElementById('formulaFeedback');
    const btnFillFormula = document.getElementById('btnFillFormulaGhost');

    if (formulaStepTotalEl) formulaStepTotalEl.textContent = String(Math.max(1, formulas.length));

    function renderFormulaStep() {
      if (!formulaGhostEl || !formulaInputEl) return;
      if (formulaIdx >= formulas.length) {
        formulaGhostEl.textContent = '모든 핵심 수식 LaTeX 필사를 완료했습니다!';
        formulaInputEl.value = '';
        formulaInputEl.disabled = true;
        if (formulaFeedbackEl) {
          formulaFeedbackEl.textContent = '✓ 수식 정합 필사 100% 완료';
        }
        saveProgress({ formulaTraced: true });
        return;
      }
      const cur = formulas[formulaIdx];
      if (formulaStepIdxEl) formulaStepIdxEl.textContent = String(formulaIdx + 1);
      formulaGhostEl.textContent = cur.latex;
      formulaInputEl.disabled = false;
      formulaInputEl.value = '';
      formulaInputEl.classList.remove('mismatch', 'matched');
    }

    if (formulaInputEl) {
      formulaInputEl.addEventListener('input', () => {
        if (formulaIdx >= formulas.length) return;
        const res = verifyLatexStep(formulas[formulaIdx].latex, formulaInputEl.value);
        formulaInputEl.classList.toggle('mismatch', !res.prefixValid);
        formulaInputEl.classList.toggle('matched', res.matched);
      });
      formulaInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (formulaIdx >= formulas.length) return;
          const res = verifyLatexStep(formulas[formulaIdx].latex, formulaInputEl.value);
          if (res.matched) {
            formulaIdx++;
            if (formulaFeedbackEl) {
              formulaFeedbackEl.textContent = '✓ 수식이 정확히 일치합니다.';
            }
            renderFormulaStep();
          } else {
            formulaInputEl.classList.add('mismatch');
            if (formulaFeedbackEl) {
              formulaFeedbackEl.textContent = '✗ 수식이 일치하지 않습니다. 공백과 기호를 확인하세요.';
            }
          }
        }
      });
    }

    if (btnFillFormula && formulaInputEl) {
      btnFillFormula.addEventListener('click', () => {
        if (formulaIdx >= formulas.length) return;
        formulaInputEl.value = formulas[formulaIdx].latex;
        formulaIdx++;
        renderFormulaStep();
      });
    }

    // 2. 6+ 언어 코드 타이핑 필사
    const langTabs = Array.from(document.querySelectorAll('.mathcs-lang-tab'));
    const codeEntryEl = document.getElementById('codeEntryFile');
    const codeNotesEl = document.getElementById('codeImplNotes');
    const codePreviewEl = document.getElementById('codeFullPreview');
    const codeGhostEl = document.getElementById('codeGhostTarget');
    const codeInputEl = document.getElementById('codeTraceInput');
    const codeLineIdxEl = document.getElementById('codeLineIdx');
    const codeLineTotalEl = document.getElementById('codeLineTotal');
    const codeFeedbackEl = document.getElementById('codeTraceFeedback');
    const btnResetCode = document.getElementById('btnResetCodeTrace');
    const btnCompleteCodeLine = document.getElementById('btnCompleteCodeLine');

    let codeLines = [];
    let curCodeLine = 0;

    function selectLanguage(lang) {
      currentLang = lang;
      langTabs.forEach((btn) => btn.classList.toggle('active', btn.dataset.lang === lang));
      const impls = lesson.codeImplementations || {};
      const impl = impls[lang] || impls.python || { entryFile: 'main.txt', code: '', notes: '' };
      if (codeEntryEl) codeEntryEl.textContent = impl.entryFile || `main.${lang}`;
      if (codeNotesEl) codeNotesEl.textContent = impl.notes || '';
      if (codePreviewEl) codePreviewEl.textContent = impl.code || '';

      codeLines = String(impl.code || '')
        .split('\n')
        .map((l) => l.replace(/\r$/, ''))
        .filter((l) => l.trim().length > 0);
      curCodeLine = 0;
      if (codeLineTotalEl) codeLineTotalEl.textContent = String(Math.max(1, codeLines.length));
      renderCodeLine();
    }

    function renderCodeLine() {
      if (!codeGhostEl || !codeInputEl) return;
      if (curCodeLine >= codeLines.length) {
        codeGhostEl.textContent = `[${currentLang.toUpperCase()}] 전체 코드 라인 필사를 완료했습니다!`;
        codeInputEl.value = '';
        codeInputEl.disabled = true;
        if (codeFeedbackEl) {
          codeFeedbackEl.textContent = `✓ ${currentLang.toUpperCase()} 코드 필사 완료`;
        }
        saveProgress({ codeLang: currentLang });
        return;
      }
      if (codeLineIdxEl) codeLineIdxEl.textContent = String(curCodeLine + 1);
      codeGhostEl.textContent = codeLines[curCodeLine];
      codeInputEl.disabled = false;
      codeInputEl.value = '';
      codeInputEl.classList.remove('mismatch', 'matched');
    }

    langTabs.forEach((btn) => {
      btn.addEventListener('click', () => selectLanguage(btn.dataset.lang));
    });

    if (codeInputEl) {
      codeInputEl.addEventListener('input', () => {
        if (curCodeLine >= codeLines.length) return;
        const res = verifyCodeLine(codeLines[curCodeLine], codeInputEl.value);
        codeInputEl.classList.toggle('mismatch', !res.prefixValid);
        codeInputEl.classList.toggle('matched', res.matched);
      });
      codeInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (curCodeLine >= codeLines.length) return;
          const res = verifyCodeLine(codeLines[curCodeLine], codeInputEl.value);
          if (res.matched) {
            curCodeLine++;
            if (codeFeedbackEl) codeFeedbackEl.textContent = '✓ 코드 라인 통과';
            renderCodeLine();
          } else {
            codeInputEl.classList.add('mismatch');
            if (codeFeedbackEl) codeFeedbackEl.textContent = '✗ 코드 라인 오타가 있습니다.';
          }
        }
      });
    }

    if (btnResetCode) {
      btnResetCode.addEventListener('click', () => {
        curCodeLine = 0;
        renderCodeLine();
      });
    }

    if (btnCompleteCodeLine) {
      btnCompleteCodeLine.addEventListener('click', () => {
        if (curCodeLine >= codeLines.length) return;
        curCodeLine++;
        renderCodeLine();
      });
    }

    // 3. 수식 빈칸 유도 검증
    const blankContainer = document.getElementById('blankInputsContainer');
    const btnCheckBlanks = document.getElementById('btnCheckBlanks');
    const btnRevealBlanks = document.getElementById('btnRevealBlanks');
    const blankFeedback = document.getElementById('blankVerifyFeedback');
    const expectedBlanks = (lesson.fillBlank && lesson.fillBlank.blanks) || [];

    if (blankContainer && expectedBlanks.length > 0) {
      blankContainer.innerHTML = expectedBlanks
        .map(
          (_, idx) => `
        <div style="display:flex;align-items:center;gap:10px;">
          <label style="font-weight:800;min-width:90px;">[BLANK_${idx + 1}]</label>
          <input type="text" class="mathcs-input blank-answer-input" data-blank-idx="${idx}"
                 placeholder="빈칸 ${idx + 1}의 LaTeX 식을 입력하세요">
        </div>
      `,
        )
        .join('');
    }

    if (btnCheckBlanks) {
      btnCheckBlanks.addEventListener('click', () => {
        const inputs = Array.from(document.querySelectorAll('.blank-answer-input'));
        const vals = inputs.map((el) => el.value);
        const res = verifyFillBlanks(expectedBlanks, vals);
        inputs.forEach((el, idx) => {
          el.classList.toggle('matched', !!res.results[idx]);
          el.classList.toggle('mismatch', !res.results[idx]);
        });
        if (res.allCorrect) {
          if (blankFeedback) blankFeedback.textContent = '✓ 모든 빈칸 유도 정답입니다!';
          saveProgress({ blankSolved: true });
        } else {
          if (blankFeedback) blankFeedback.textContent = '✗ 일부 빈칸이 일치하지 않습니다.';
        }
      });
    }

    if (btnRevealBlanks) {
      btnRevealBlanks.addEventListener('click', () => {
        const inputs = Array.from(document.querySelectorAll('.blank-answer-input'));
        inputs.forEach((el, idx) => {
          el.value = expectedBlanks[idx] || '';
          el.classList.remove('mismatch');
          el.classList.add('matched');
        });
        if (blankFeedback) blankFeedback.textContent = '✓ 정답이 입력되었습니다.';
        saveProgress({ blankSolved: true });
      });
    }

    // 4. 체크포인트 퀴즈 렌더링 및 채점
    const quizContainer = document.getElementById('quizListContainer');
    const btnSubmitQuiz = document.getElementById('btnSubmitQuiz');
    const quizSummaryEl = document.getElementById('quizResultSummary');
    const quizzes = Array.isArray(lesson.quizzes) ? lesson.quizzes : [];

    if (quizContainer && quizzes.length > 0) {
      quizContainer.innerHTML = quizzes
        .map(
          (q, qIdx) => `
        <div class="quiz-card" style="border:2px solid #0f172a;margin-bottom:12px;" data-quiz-idx="${qIdx}">
          <div class="quiz-question">Q${qIdx + 1}. ${q.question}</div>
          <div style="display:grid;gap:6px;margin-top:8px;">
            ${(q.options || [])
              .map(
                (opt, oIdx) => `
              <label style="display:flex;align-items:center;gap:8px;padding:6px 10px;border:1.5px solid #0f172a;border-radius:4px;cursor:pointer;font-size:0.9rem;font-weight:600;">
                <input type="radio" name="mathcs-quiz-${qIdx}" value="${oIdx}" ${oIdx === 0 ? 'checked' : ''}>
                <span>${opt}</span>
              </label>
            `,
              )
              .join('')}
          </div>
          <div class="quiz-explanation-box" id="quizExp-${qIdx}" hidden
               style="margin-top:8px;border:2px solid #0f172a;padding:8px 10px;border-radius:4px;font-size:0.85rem;background:#f8fafc;">
            <strong>해설:</strong> ${q.explanation}
          </div>
        </div>
      `,
        )
        .join('');
    }

    if (btnSubmitQuiz) {
      btnSubmitQuiz.addEventListener('click', () => {
        const chosen = quizzes.map((_, qIdx) => {
          const checked = document.querySelector(`input[name="mathcs-quiz-${qIdx}"]:checked`);
          return checked ? Number(checked.value) : -1;
        });
        const grade = gradeQuizAnswers(quizzes, chosen);
        quizzes.forEach((_, qIdx) => {
          const expEl = document.getElementById(`quizExp-${qIdx}`);
          if (expEl) expEl.hidden = false;
        });
        if (quizSummaryEl) {
          quizSummaryEl.textContent = `채점 결과: ${grade.score} / ${grade.total}점 (${grade.passed ? '마스터 통과' : '재도전 권장'})`;
        }
        saveProgress({ quizScore: grade.score, quizTotal: grade.total });
      });
    }

    // 5. 복습 북마크 버튼 연결
    const btnBookmarkFormula = document.getElementById('btnBookmarkFormula');
    if (btnBookmarkFormula) {
      btnBookmarkFormula.addEventListener('click', () => {
        const curFormula = formulas[Math.min(formulaIdx, Math.max(0, formulas.length - 1))];
        if (window.ProStudyReviewDeck) {
          window.ProStudyReviewDeck.addBookmark({
            lessonId: lesson.id,
            category: 'math-formula',
            title: `${lesson.titleKo} — ${curFormula ? curFormula.title : '핵심 수식'}`,
            prompt: curFormula ? curFormula.explanation : lesson.mathExplanation,
            answerSnippet: curFormula ? curFormula.latex : '',
            memo: 'LaTeX 수식 유도와 기호 정의를 다시 확인하세요.',
          });
        }
      });
    }

    const btnBookmarkCode = document.getElementById('btnBookmarkCode');
    if (btnBookmarkCode) {
      btnBookmarkCode.addEventListener('click', () => {
        const impl = (lesson.codeImplementations || {})[currentLang] || {};
        if (window.ProStudyReviewDeck) {
          window.ProStudyReviewDeck.addBookmark({
            lessonId: lesson.id,
            category: `code-${currentLang}`,
            title: `${lesson.titleKo} (${currentLang.toUpperCase()} 구현)`,
            prompt: `${lesson.titleKo} 알고리즘을 ${currentLang.toUpperCase()} 표준 코드로 작성하시오.`,
            answerSnippet: impl.code || '',
            memo: impl.notes || '',
          });
        }
      });
    }

    renderFormulaStep();
    selectLanguage(currentLang);
    updateProgressPills();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBrowser);
    } else {
      initBrowser();
    }
  }

  return {
    normalizeLatex,
    verifyLatexStep,
    verifyCodeLine,
    verifyFillBlanks,
    gradeQuizAnswers,
  };
});
