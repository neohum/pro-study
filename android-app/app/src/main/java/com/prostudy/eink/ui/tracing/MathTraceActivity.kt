package com.prostudy.eink.ui.tracing

import android.app.AlertDialog
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.prostudy.eink.R
import com.prostudy.eink.data.MathLesson
import com.prostudy.eink.data.MathProblemItem
import com.prostudy.eink.data.MathRepository
import com.prostudy.eink.ui.math.GraphType
import com.prostudy.eink.ui.math.MathGraphView
import com.prostudy.eink.util.EinkHelper

class MathTraceActivity : AppCompatActivity() {

    private lateinit var repository: MathRepository
    private var allLessons: List<MathLesson> = emptyList()
    private var currentIndex: Int = 0
    private var isMathMode: Boolean = true
    private var currentLang: String = "c"
    private var isAnimPlaying: Boolean = true

    // Top Bar
    private lateinit var btnBack: Button
    private lateinit var tvHeaderTitle: TextView
    private lateinit var btnAnimToggle: Button
    private lateinit var btnSelectModule: Button

    // Module Meta
    private lateinit var tvCurriculumBadge: TextView
    private lateinit var tvOrder: TextView
    private lateinit var tvTitle: TextView

    // Mode Buttons
    private lateinit var btnModeMathFormula: Button
    private lateinit var btnModeMathCode: Button
    private lateinit var scrollLangs: HorizontalScrollView
    private lateinit var langButtons: Map<String, Button>

    // Concept Mode Views
    private lateinit var layoutConceptContainer: LinearLayout
    private lateinit var layoutGraphBox: LinearLayout
    private lateinit var mathGraphView: MathGraphView
    private lateinit var tvGraphCaption: TextView

    private lateinit var cardTerms: LinearLayout
    private lateinit var tvTermsContent: TextView

    private lateinit var cardFormulas: LinearLayout
    private lateinit var tvFormulasContent: TextView

    private lateinit var cardSymbolGuide: LinearLayout
    private lateinit var tvSymbolGuideContent: TextView

    // Formula Derivation (Why & How)
    private lateinit var cardDerivation: LinearLayout
    private lateinit var tvDerivationHeader: TextView
    private lateinit var tvDerivationStory: TextView
    private lateinit var tvDerivationStepsContent: TextView
    private lateinit var tvDerivationConclusion: TextView

    private lateinit var cardIntuition: LinearLayout
    private lateinit var tvExplanationContent: TextView
    private lateinit var tvCsContent: TextView

    // Problems container
    private lateinit var cardExample: LinearLayout
    private lateinit var layoutProblemsContainer: LinearLayout

    // Code Mode Views
    private lateinit var layoutCodeContainer: LinearLayout
    private lateinit var tvCodeHeader: TextView
    private lateinit var tvCodeContent: TextView

    // Bottom Navigation
    private lateinit var btnPrev: Button
    private lateinit var btnNext: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        EinkHelper.applyActivityOptimizations(this)
        setContentView(R.layout.activity_math_trace)

        repository = MathRepository(this)
        allLessons = repository.getAllLessons()

        bindViews()
        setupListeners()

        val initialId = intent.getStringExtra("EXTRA_MATH_ID")
        if (initialId != null) {
            val idx = allLessons.indexOfFirst { it.id == initialId }
            if (idx != -1) currentIndex = idx
        }

        renderLesson()
    }

    private fun bindViews() {
        btnBack = findViewById(R.id.btn_math_back)
        tvHeaderTitle = findViewById(R.id.tv_math_header_title)
        btnAnimToggle = findViewById(R.id.btn_math_anim_toggle)
        btnSelectModule = findViewById(R.id.btn_select_math_module)

        tvCurriculumBadge = findViewById(R.id.tv_curriculum_badge)
        tvOrder = findViewById(R.id.tv_math_order)
        tvTitle = findViewById(R.id.tv_math_title)

        btnModeMathFormula = findViewById(R.id.btn_mode_math_formula)
        btnModeMathCode = findViewById(R.id.btn_mode_math_code)
        scrollLangs = findViewById(R.id.scroll_math_langs)

        langButtons = mapOf(
            "c" to findViewById(R.id.btn_math_lang_c),
            "go" to findViewById(R.id.btn_math_lang_go),
            "rust" to findViewById(R.id.btn_math_lang_rust),
            "python" to findViewById(R.id.btn_math_lang_python),
            "typescript" to findViewById(R.id.btn_math_lang_ts),
            "javascript" to findViewById(R.id.btn_math_lang_js)
        )

        // Concept Views
        layoutConceptContainer = findViewById(R.id.layout_math_concept_container)
        layoutGraphBox = findViewById(R.id.layout_graph_box)
        mathGraphView = findViewById(R.id.math_graph_view)
        tvGraphCaption = findViewById(R.id.tv_graph_caption)

        cardTerms = findViewById(R.id.card_math_terms)
        tvTermsContent = findViewById(R.id.tv_math_terms_content)

        cardFormulas = findViewById(R.id.card_math_formulas)
        tvFormulasContent = findViewById(R.id.tv_math_formulas_content)

        cardSymbolGuide = findViewById(R.id.card_symbol_guide)
        tvSymbolGuideContent = findViewById(R.id.tv_symbol_guide_content)

        // Derivation views
        cardDerivation = findViewById(R.id.card_math_derivation)
        tvDerivationHeader = findViewById(R.id.tv_derivation_header)
        tvDerivationStory = findViewById(R.id.tv_derivation_story)
        tvDerivationStepsContent = findViewById(R.id.tv_derivation_steps_content)
        tvDerivationConclusion = findViewById(R.id.tv_derivation_conclusion)

        cardIntuition = findViewById(R.id.card_math_intuition)
        tvExplanationContent = findViewById(R.id.tv_math_explanation_content)
        tvCsContent = findViewById(R.id.tv_math_cs_content)

        cardExample = findViewById(R.id.card_math_example)
        layoutProblemsContainer = findViewById(R.id.layout_problems_container)

        // Code Views
        layoutCodeContainer = findViewById(R.id.layout_math_code_container)
        tvCodeHeader = findViewById(R.id.tv_code_header)
        tvCodeContent = findViewById(R.id.tv_code_content)

        // Navigation
        btnPrev = findViewById(R.id.btn_prev_math)
        btnNext = findViewById(R.id.btn_next_math)
    }

    private fun setupListeners() {
        btnBack.setOnClickListener { finish() }

        btnAnimToggle.setOnClickListener {
            isAnimPlaying = !isAnimPlaying
            mathGraphView.isAnimationEnabled = isAnimPlaying
            btnAnimToggle.text = if (isAnimPlaying) "⏸ 정지" else "▶ 재생"
        }

        btnSelectModule.setOnClickListener {
            showModulePicker()
        }

        btnModeMathFormula.setOnClickListener {
            isMathMode = true
            updateModeButtons()
        }

        btnModeMathCode.setOnClickListener {
            isMathMode = false
            updateModeButtons()
        }

        for ((lang, btn) in langButtons) {
            btn.setOnClickListener {
                currentLang = lang
                updateLangButtons()
                renderCodeView()
            }
        }

        btnPrev.setOnClickListener {
            if (currentIndex > 0) {
                currentIndex--
                renderLesson()
            }
        }

        btnNext.setOnClickListener {
            if (currentIndex < allLessons.size - 1) {
                currentIndex++
                renderLesson()
            }
        }
    }

    private fun updateModeButtons() {
        if (isMathMode) {
            btnModeMathFormula.setBackgroundColor(Color.BLACK)
            btnModeMathFormula.setTextColor(Color.WHITE)
            btnModeMathCode.setBackgroundColor(Color.TRANSPARENT)
            btnModeMathCode.setTextColor(Color.BLACK)
            scrollLangs.visibility = View.GONE
            layoutConceptContainer.visibility = View.VISIBLE
            layoutCodeContainer.visibility = View.GONE
        } else {
            btnModeMathFormula.setBackgroundColor(Color.TRANSPARENT)
            btnModeMathFormula.setTextColor(Color.BLACK)
            btnModeMathCode.setBackgroundColor(Color.BLACK)
            btnModeMathCode.setTextColor(Color.WHITE)
            scrollLangs.visibility = View.VISIBLE
            layoutConceptContainer.visibility = View.GONE
            layoutCodeContainer.visibility = View.VISIBLE
            updateLangButtons()
            renderCodeView()
        }
    }

    private fun updateLangButtons() {
        for ((lang, btn) in langButtons) {
            if (lang == currentLang) {
                btn.setBackgroundColor(Color.BLACK)
                btn.setTextColor(Color.WHITE)
            } else {
                btn.setBackgroundColor(Color.TRANSPARENT)
                btn.setTextColor(Color.BLACK)
            }
        }
    }

    private fun renderLesson() {
        if (allLessons.isEmpty()) {
            tvTitle.text = "수학 교육과정 데이터가 없습니다."
            return
        }

        val lesson = allLessons[currentIndex]
        tvCurriculumBadge.text = lesson.koreanCurriculumUnit.ifEmpty { lesson.stage }
        tvOrder.text = "단원 #${lesson.order} (${currentIndex + 1}/${allLessons.size})"
        tvTitle.text = "${lesson.titleKo} (${lesson.titleEn})"

        // 1. 시각화 인터랙티브 그래프 설정
        val gType = parseGraphType(lesson.graphType)
        if (gType == GraphType.NONE) {
            layoutGraphBox.visibility = View.GONE
        } else {
            layoutGraphBox.visibility = View.VISIBLE
            mathGraphView.setGraphType(gType)
            mathGraphView.isAnimationEnabled = isAnimPlaying
            tvGraphCaption.text = lesson.graphCaption.ifEmpty {
                when (gType) {
                    GraphType.NUMBER_LINE -> "수직선 위의 원점(0)과 양수·음수 및 절댓값 거리 표현"
                    GraphType.COORDINATE_PLANE -> "x, y 직교 좌표평면과 제1~4사분면"
                    GraphType.LINEAR_FUNCTION -> "일차함수 직선 y = ax + b와 기울기, x/y 절편"
                    GraphType.PYTHAGORAS -> "직각삼각형의 피타고라스 정리 (a² + b² = c²)"
                    GraphType.PARABOLA -> "이차함수 포물선 y = ax²과 꼭짓점"
                    GraphType.SINE_COSINE -> "삼각함수 사인(sin)과 코사인(cos) 주기 파동 곡선"
                    GraphType.UNIT_CIRCLE -> "단위원(Unit Circle)과 각도 θ의 회전 사상"
                    else -> "시각화 그래프"
                }
            }
        }

        // 2. 기초 용어 설명 카드
        if (lesson.terms.isNotEmpty()) {
            cardTerms.visibility = View.VISIBLE
            val sb = StringBuilder()
            lesson.terms.forEach { term ->
                sb.append("• ").append(term.term).append("\n")
                sb.append("   ↳ ").append(term.definition).append("\n\n")
            }
            tvTermsContent.text = sb.toString().trimEnd()
        } else {
            cardTerms.visibility = View.GONE
        }

        // 3. 핵심 공식 카드
        if (lesson.mathFormulas.isNotEmpty()) {
            cardFormulas.visibility = View.VISIBLE
            val sb = StringBuilder()
            lesson.mathFormulas.forEachIndexed { i, formula ->
                sb.append("[공식 ").append(i + 1).append("] ").append(formula.title).append("\n")
                sb.append("수식: ").append(formula.latex).append("\n")
                sb.append("설명: ").append(formula.explanation).append("\n\n")
            }
            tvFormulasContent.text = sb.toString().trimEnd()
        } else {
            cardFormulas.visibility = View.GONE
        }

        // 3.1 수식 기호 & 문자 뜻풀이 카드 (Symbol & Variable Guide)
        if (lesson.symbolGuide.isNotEmpty()) {
            cardSymbolGuide.visibility = View.VISIBLE
            val sb = StringBuilder()
            lesson.symbolGuide.forEach { sg ->
                sb.append("• ").append(sg.symbol)
                if (sg.name.isNotEmpty()) {
                    sb.append(" (").append(sg.name).append(")")
                }
                sb.append("\n")
                sb.append("   ↳ ").append(sg.meaning).append("\n\n")
            }
            tvSymbolGuideContent.text = sb.toString().trimEnd()
        } else {
            cardSymbolGuide.visibility = View.GONE
        }

        // 4. 수식 도출 원리 & 증명 과정 카드 (Why & How)
        val dd = lesson.derivationDetail
        if (dd != null) {
            cardDerivation.visibility = View.VISIBLE
            tvDerivationHeader.text = "🔍 3. 수식 도출 원리와 과정: ${dd.title}"
            tvDerivationStory.text = "🌱 [중1을 위한 직관적 배경 이야기]\n${dd.backgroundStory}"

            val sbSteps = StringBuilder()
            dd.steps.forEach { step ->
                sbSteps.append("▶ Step ${step.stepNumber}: ").append(step.mathExpression).append("\n")
                sbSteps.append("   ↳ 이유: ").append(step.justification).append("\n\n")
            }
            tvDerivationStepsContent.text = sbSteps.toString().trimEnd()
            tvDerivationConclusion.text = "★ 도출 결론: ${dd.conclusion}"
        } else if (lesson.derivationSteps.isNotEmpty()) {
            cardDerivation.visibility = View.VISIBLE
            tvDerivationHeader.text = "🔍 3. 수식 도출 원리와 과정 (Derivation Steps)"
            tvDerivationStory.text = "🌱 [수식 도출 배경]\n공식이 왜 성립하는지 단계별로 식을 전개해 봅니다."

            val sbSteps = StringBuilder()
            lesson.derivationSteps.forEach { step ->
                sbSteps.append("▶ Step ${step.stepNumber}: ").append(step.mathExpression).append("\n")
                sbSteps.append("   ↳ 이유: ").append(step.justification).append("\n\n")
            }
            tvDerivationStepsContent.text = sbSteps.toString().trimEnd()
            tvDerivationConclusion.text = "★ 정리: 위 전개 과정을 통해 핵심 공식이 수학적으로 완전히 증명됩니다."
        } else {
            cardDerivation.visibility = View.GONE
        }

        // 5. 개념 원리 & 컴퓨터 응용 카드
        tvExplanationContent.text = lesson.mathExplanation
        if (lesson.csIntuition.isNotEmpty()) {
            tvCsContent.visibility = View.VISIBLE
            tvCsContent.text = "💡 프로그래밍/컴퓨터공학 응용:\n" + lesson.csIntuition
        } else {
            tvCsContent.visibility = View.GONE
        }

        // 6. 단계별 예제 및 실전 연습 문제 세트 렌더링
        renderProblems(lesson)

        // 코드 뷰 갱신
        renderCodeView()

        btnPrev.isEnabled = currentIndex > 0
        btnNext.isEnabled = currentIndex < allLessons.size - 1

        updateModeButtons()
    }

    private fun renderProblems(lesson: MathLesson) {
        layoutProblemsContainer.removeAllViews()

        val problems = mutableListOf<MathProblemItem>()
        if (lesson.practiceProblems.isNotEmpty()) {
            problems.addAll(lesson.practiceProblems)
        } else if (lesson.workedExample.problem.isNotEmpty()) {
            // 호환성: 기존 단일 workedExample을 MathProblemItem으로 변환
            problems.add(
                MathProblemItem(
                    problemNumber = 1,
                    title = "대표 예제 문제",
                    question = lesson.workedExample.problem,
                    interpretation = "주어진 문제 조건을 파악하고 교과서 공식을 적용해 풀이 단계를 세웁니다.",
                    solutionSteps = lesson.workedExample.stepsToTrace,
                    answer = lesson.workedExample.finalAnswer,
                    keyPoint = "계산 실수를 방지하기 위해 각 풀이 단계마다 검산하는 습관을 들입니다."
                )
            )
        }

        if (problems.isEmpty()) {
            cardExample.visibility = View.GONE
            return
        }

        cardExample.visibility = View.VISIBLE

        problems.forEachIndexed { index, item ->
            val itemView = createProblemCardView(item, index + 1, problems.size)
            layoutProblemsContainer.addView(itemView)
        }
    }

    private fun createProblemCardView(item: MathProblemItem, index: Int, total: Int): View {
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = getDrawable(R.drawable.bg_eink_card)
            setPadding(24, 20, 24, 20)
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                if (index > 1) topMargin = 20
            }
            layoutParams = params
        }

        // 문제 제목 (뱃지 스타일)
        val tvTitle = TextView(this).apply {
            text = "✏️ [문제 ${item.problemNumber}] ${item.title}"
            setTextColor(Color.BLACK)
            textSize = 14f
            setTypeface(typeface, Typeface.BOLD)
        }
        container.addView(tvTitle)

        // 문제 질문
        val tvQuestion = TextView(this).apply {
            text = item.question
            setTextColor(Color.BLACK)
            textSize = 13.5f
            setLineSpacing(10f, 1f)
            val p = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 12 }
            layoutParams = p
        }
        container.addView(tvQuestion)

        // 💡 생각 열기 (문제 해석 및 접근 전략)
        if (item.interpretation.isNotEmpty()) {
            val tvStrategy = TextView(this).apply {
                text = "💡 [생각 열기: 문제 해석 전략]\n${item.interpretation}"
                setBackgroundColor(Color.parseColor("#F5F5F5"))
                setPadding(18, 14, 18, 14)
                setTextColor(Color.DKGRAY)
                textSize = 12.5f
                setLineSpacing(8f, 1f)
                val p = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 14 }
                layoutParams = p
            }
            container.addView(tvStrategy)
        }

        // ✍️ 단계별 풀이
        val tvSteps = TextView(this).apply {
            val sb = StringBuilder("✍️ [단계별 상세 풀이]\n")
            item.solutionSteps.forEach { step ->
                sb.append("▶ ").append(step).append("\n")
            }
            text = sb.toString().trimEnd()
            setTextColor(Color.BLACK)
            textSize = 13f
            setLineSpacing(12f, 1f)
            val p = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 14 }
            layoutParams = p
        }
        container.addView(tvSteps)

        // ★ 최종 정답 강조 박스
        val tvAnswer = TextView(this).apply {
            text = "★ 최종 정답: ${item.answer}"
            setBackgroundColor(Color.BLACK)
            setTextColor(Color.WHITE)
            setPadding(18, 14, 18, 14)
            textSize = 13f
            setTypeface(typeface, Typeface.BOLD)
            val p = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 14 }
            layoutParams = p
        }
        container.addView(tvAnswer)

        // ⚠️ 오답 방지 꿀팁 및 핵심 포인트
        if (item.keyPoint.isNotEmpty()) {
            val tvKeyPoint = TextView(this).apply {
                text = "⚠️ [핵심 체크 & 오답 방지 팁]\n${item.keyPoint}"
                setBackgroundColor(Color.parseColor("#EEEEEE"))
                setPadding(18, 14, 18, 14)
                setTextColor(Color.BLACK)
                textSize = 12f
                setLineSpacing(8f, 1f)
                val p = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 12 }
                layoutParams = p
            }
            container.addView(tvKeyPoint)
        }

        return container
    }

    private fun renderCodeView() {
        if (allLessons.isEmpty()) return
        val lesson = allLessons[currentIndex]
        val impl = lesson.codeImplementations[currentLang]

        if (impl != null) {
            tvCodeHeader.text = "// [${currentLang.uppercase()}] 파일: ${impl.entryFile}\n// 설명: ${impl.notes}"
            tvCodeContent.text = impl.code
        } else {
            tvCodeHeader.text = "// [${currentLang.uppercase()}] 구현 준비 중"
            tvCodeContent.text = "// 해당 언어의 최적화 코드가 준비 중입니다."
        }
    }

    private fun parseGraphType(typeStr: String): GraphType {
        return try {
            GraphType.valueOf(typeStr.uppercase())
        } catch (e: Exception) {
            when (typeStr.uppercase()) {
                "NUMBERLINE", "NUMBER_LINE" -> GraphType.NUMBER_LINE
                "COORDINATE", "COORDINATE_PLANE" -> GraphType.COORDINATE_PLANE
                "LINEAR", "LINEAR_FUNCTION" -> GraphType.LINEAR_FUNCTION
                "PYTHAGORAS", "TRIANGLE" -> GraphType.PYTHAGORAS
                "PARABOLA", "QUADRATIC" -> GraphType.PARABOLA
                "SINE", "COSINE", "SINE_COSINE" -> GraphType.SINE_COSINE
                "UNIT_CIRCLE", "CIRCLE" -> GraphType.UNIT_CIRCLE
                else -> GraphType.NONE
            }
        }
    }

    private fun showModulePicker() {
        val items = allLessons.map { "#${it.order} [${it.koreanCurriculumUnit.substringBefore(' ')}] ${it.titleKo}" }.toTypedArray()
        AlertDialog.Builder(this)
            .setTitle("대한민국 수학 교육과정 단원 선택 (${allLessons.size}개)")
            .setItems(items) { _, which ->
                currentIndex = which
                renderLesson()
            }
            .setNegativeButton("닫기", null)
            .show()
    }

    override fun onDestroy() {
        super.onDestroy()
        mathGraphView.isAnimationEnabled = false
    }
}
