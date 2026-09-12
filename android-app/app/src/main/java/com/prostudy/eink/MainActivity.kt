package com.prostudy.eink

import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.prostudy.eink.data.ContentRepository
import com.prostudy.eink.data.model.ProjectDetail
import com.prostudy.eink.data.model.ProjectSummary
import com.prostudy.eink.ui.catalog.ProjectAdapter
import com.prostudy.eink.ui.ink.InkingOverlayView
import com.prostudy.eink.ui.tracing.CodeTraceView

class MainActivity : AppCompatActivity() {

    private lateinit var repository: ContentRepository
    private lateinit var adapter: ProjectAdapter

    // 컨테이너들
    private lateinit var containerCatalog: LinearLayout
    private lateinit var containerDetail: LinearLayout
    private lateinit var containerTracing: LinearLayout

    // 카탈로그 뷰
    private lateinit var btnTabC: Button
    private lateinit var btnTabGo: Button
    private lateinit var rvProjects: RecyclerView

    // 상세 뷰
    private lateinit var btnDetailBack: Button
    private lateinit var tvDetailTitle: TextView
    private lateinit var btnPenToggle: Button
    private lateinit var btnClearDetailInk: Button
    private lateinit var btnViewTrace: Button
    private lateinit var tvReaderBody: TextView
    private lateinit var inkingOverlay: InkingOverlayView

    // 따라쓰기 뷰
    private lateinit var btnTraceBack: Button
    private lateinit var tvTraceTitle: TextView
    private lateinit var btnTraceToggleGhost: Button
    private lateinit var btnTraceEraser: Button
    private lateinit var btnTraceClear: Button
    private lateinit var codeTraceView: CodeTraceView

    private var currentLang = "c"
    private var currentProject: ProjectDetail? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        repository = ContentRepository(this)

        bindViews()
        setupListeners()
        setupBackNavigation()

        loadCatalog(currentLang)
    }

    private fun bindViews() {
        containerCatalog = findViewById(R.id.container_catalog)
        containerDetail = findViewById(R.id.container_detail)
        containerTracing = findViewById(R.id.container_tracing)

        btnTabC = findViewById(R.id.btn_tab_c)
        btnTabGo = findViewById(R.id.btn_tab_go)
        rvProjects = findViewById(R.id.rv_projects)

        btnDetailBack = findViewById(R.id.btn_detail_back)
        tvDetailTitle = findViewById(R.id.tv_detail_title)
        btnPenToggle = findViewById(R.id.btn_pen_toggle)
        btnClearDetailInk = findViewById(R.id.btn_clear_detail_ink)
        btnViewTrace = findViewById(R.id.btn_view_trace)
        tvReaderBody = findViewById(R.id.tv_reader_body)
        inkingOverlay = findViewById(R.id.inking_overlay)

        btnTraceBack = findViewById(R.id.btn_trace_back)
        tvTraceTitle = findViewById(R.id.tv_trace_title)
        btnTraceToggleGhost = findViewById(R.id.btn_trace_toggle_ghost)
        btnTraceEraser = findViewById(R.id.btn_trace_eraser)
        btnTraceClear = findViewById(R.id.btn_trace_clear)
        codeTraceView = findViewById(R.id.code_trace_view)

        rvProjects.layoutManager = LinearLayoutManager(this)
        adapter = ProjectAdapter { item ->
            openProject(item)
        }
        rvProjects.adapter = adapter
    }

    private fun setupListeners() {
        // E-ink 화면 새로고침 (플래시 리프레시로 잔상 정리)
        findViewById<Button>(R.id.btn_refresh).setOnClickListener {
            flashScreenRefresh()
        }

        // 언어 탭 전환
        btnTabC.setOnClickListener {
            if (currentLang != "c") {
                currentLang = "c"
                btnTabC.setBackgroundColor(Color.BLACK)
                btnTabC.setTextColor(Color.WHITE)
                btnTabGo.setBackgroundColor(Color.TRANSPARENT)
                btnTabGo.setTextColor(Color.BLACK)
                loadCatalog(currentLang)
            }
        }

        btnTabGo.setOnClickListener {
            if (currentLang != "go") {
                currentLang = "go"
                btnTabGo.setBackgroundColor(Color.BLACK)
                btnTabGo.setTextColor(Color.WHITE)
                btnTabC.setBackgroundColor(Color.TRANSPARENT)
                btnTabC.setTextColor(Color.BLACK)
                loadCatalog(currentLang)
            }
        }

        // 상세 뒤로가기
        btnDetailBack.setOnClickListener {
            showCatalog()
        }

        // 상세 펜/지우개 전환
        btnPenToggle.setOnClickListener {
            inkingOverlay.isEraserMode = !inkingOverlay.isEraserMode
            btnPenToggle.text = if (inkingOverlay.isEraserMode) "지우개" else "펜"
        }

        // 상세 필기 전체 지우기
        btnClearDetailInk.setOnClickListener {
            inkingOverlay.clearAll()
        }

        // 따라쓰기 화면 열기
        btnViewTrace.setOnClickListener {
            openTraceMode()
        }

        // 따라쓰기 뒤로가기
        btnTraceBack.setOnClickListener {
            containerTracing.visibility = View.GONE
            containerDetail.visibility = View.VISIBLE
        }

        // 따라쓰기 원문 토글
        btnTraceToggleGhost.setOnClickListener {
            codeTraceView.showGhostText = !codeTraceView.showGhostText
            btnTraceToggleGhost.text = if (codeTraceView.showGhostText) "원문 토글 (ON)" else "원문 토글 (OFF)"
        }

        // 따라쓰기 지우개 토글
        btnTraceEraser.setOnClickListener {
            codeTraceView.isEraserMode = !codeTraceView.isEraserMode
            btnTraceEraser.text = if (codeTraceView.isEraserMode) "펜으로 전환" else "지우개"
        }

        // 따라쓰기 전체 삭제
        btnTraceClear.setOnClickListener {
            codeTraceView.strokeManager.clear()
            codeTraceView.invalidate()
        }
    }

    private fun loadCatalog(lang: String) {
        val list = repository.getProjects(lang)
        adapter.submitList(list)
    }

    private fun openProject(summary: ProjectSummary) {
        val detail = repository.getProjectDetail(summary.id) ?: return
        currentProject = detail

        containerCatalog.visibility = View.GONE
        containerDetail.visibility = View.VISIBLE
        containerTracing.visibility = View.GONE

        tvDetailTitle.text = "[${detail.lang.uppercase()}] ${detail.title}"
        tvReaderBody.text = detail.readme
        tvReaderBody.typeface = android.graphics.Typeface.DEFAULT

        // 이전 세션 필기 복원
        inkingOverlay.strokeManager.loadFromFile("detail_${detail.id}")
        inkingOverlay.invalidate()
    }

    private fun openTraceMode() {
        val p = currentProject ?: return
        containerDetail.visibility = View.GONE
        containerTracing.visibility = View.VISIBLE

        // 1. 완성 소스 코드 (solutionCode -> starterCode)
        // 2. 가이드 내 코드 블록
        // 3. 폴백
        var rawCode = p.solutionCode[p.entry]
            ?: p.solutionCode.entries.find { it.key.endsWith(p.entry) || p.entry.endsWith(it.key) }?.value
            ?: p.starterCode[p.entry]
            ?: p.starterCode.entries.find { it.key.endsWith(p.entry) || p.entry.endsWith(it.key) }?.value
            ?: p.solutionCode.values.firstOrNull()
            ?: p.starterCode.values.firstOrNull()
            ?: ""

        if (rawCode.isBlank()) {
            val codeBlocks = extractCodeBlocks(p.readme)
            rawCode = if (codeBlocks.isNotEmpty()) {
                codeBlocks.joinToString("\n\n// ----------------------------------------\n\n")
            } else {
                "// ${p.title} (${p.entry})\n// 따라쓸 코드가 없습니다."
            }
        }

        // 탭(\t) 문자를 공백 4개로 변환 (Canvas.drawText에서 탭 문자가 뭉개지거나 안 보이는 문제 방지)
        val lines = rawCode.lines().map { line ->
            line.replace("\t", "    ")
        }
        tvTraceTitle.text = "따라쓰기: ${p.title} (${lines.size}줄)"
        codeTraceView.codeLines = lines
        codeTraceView.showGhostText = true
        btnTraceToggleGhost.text = "원문 토글 (ON)"
        codeTraceView.isEraserMode = false
        btnTraceEraser.text = "지우개"

        // 따라쓰기 필기 복원
        codeTraceView.strokeManager.loadFromFile("trace_${p.id}")
        codeTraceView.invalidate()
    }

    private fun extractCodeBlocks(markdown: String): List<String> {
        val blocks = mutableListOf<String>()
        val regex = Regex("```(?:[a-zA-Z0-9_-]+)?\\s*\\r?\\n([\\s\\S]*?)```")
        val matches = regex.findAll(markdown)
        for (m in matches) {
            val code = m.groupValues[1].trimEnd()
            if (code.isNotBlank()) {
                blocks.add(code)
            }
        }
        return blocks
    }

    private fun showCatalog() {
        // 필기 저장
        currentProject?.let { p ->
            inkingOverlay.strokeManager.saveToFile("detail_${p.id}")
            codeTraceView.strokeManager.saveToFile("trace_${p.id}")
        }

        containerCatalog.visibility = View.VISIBLE
        containerDetail.visibility = View.GONE
        containerTracing.visibility = View.GONE
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (containerTracing.visibility == View.VISIBLE) {
                    containerTracing.visibility = View.GONE
                    containerDetail.visibility = View.VISIBLE
                } else if (containerDetail.visibility == View.VISIBLE) {
                    showCatalog()
                } else {
                    finish()
                }
            }
        })
    }

    /**
     * E-ink 패널의 잔상을 제거하기 위한 화면 전체 반전(Flash Invert) 기법
     */
    private fun flashScreenRefresh() {
        val root = findViewById<View>(R.id.root_layout)
        root.setBackgroundColor(Color.BLACK)
        Handler(Looper.getMainLooper()).postDelayed({
            root.setBackgroundColor(Color.WHITE)
            root.invalidate()
        }, 120)
    }

    override fun onPause() {
        super.onPause()
        currentProject?.let { p ->
            inkingOverlay.strokeManager.saveToFile("detail_${p.id}")
            codeTraceView.strokeManager.saveToFile("trace_${p.id}")
        }
    }
}
