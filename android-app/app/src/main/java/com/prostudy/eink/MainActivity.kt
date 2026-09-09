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
    private lateinit var btnViewGuide: Button
    private lateinit var btnViewStarter: Button
    private lateinit var btnViewSolution: Button
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
    private var currentDetailMode = DetailMode.GUIDE

    private enum class DetailMode {
        GUIDE, STARTER, SOLUTION
    }

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
        btnViewGuide = findViewById(R.id.btn_view_guide)
        btnViewStarter = findViewById(R.id.btn_view_starter)
        btnViewSolution = findViewById(R.id.btn_view_solution)
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

        // 상세 하위 탭 전환
        btnViewGuide.setOnClickListener { switchDetailMode(DetailMode.GUIDE) }
        btnViewStarter.setOnClickListener { switchDetailMode(DetailMode.STARTER) }
        btnViewSolution.setOnClickListener { switchDetailMode(DetailMode.SOLUTION) }

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
        switchDetailMode(DetailMode.GUIDE)

        // 이전 세션 필기 복원
        inkingOverlay.strokeManager.loadFromFile("detail_${detail.id}")
        inkingOverlay.invalidate()
    }

    private fun switchDetailMode(mode: DetailMode) {
        currentDetailMode = mode
        val p = currentProject ?: return

        // 탭 스타일 초기화
        btnViewGuide.setBackgroundColor(if (mode == DetailMode.GUIDE) Color.BLACK else Color.TRANSPARENT)
        btnViewGuide.setTextColor(if (mode == DetailMode.GUIDE) Color.WHITE else Color.BLACK)

        btnViewStarter.setBackgroundColor(if (mode == DetailMode.STARTER) Color.BLACK else Color.TRANSPARENT)
        btnViewStarter.setTextColor(if (mode == DetailMode.STARTER) Color.WHITE else Color.BLACK)

        btnViewSolution.setBackgroundColor(if (mode == DetailMode.SOLUTION) Color.BLACK else Color.TRANSPARENT)
        btnViewSolution.setTextColor(if (mode == DetailMode.SOLUTION) Color.WHITE else Color.BLACK)

        when (mode) {
            DetailMode.GUIDE -> {
                tvReaderBody.text = p.readme
                tvReaderBody.typeface = android.graphics.Typeface.DEFAULT
            }
            DetailMode.STARTER -> {
                val code = p.starterCode[p.entry] ?: p.starterCode.values.firstOrNull() ?: "(스켈레톤 코드 없음)"
                tvReaderBody.text = code
                tvReaderBody.typeface = android.graphics.Typeface.MONOSPACE
            }
            DetailMode.SOLUTION -> {
                val code = p.solutionCode[p.entry] ?: p.solutionCode.values.firstOrNull() ?: "(정답 코드 없음)"
                tvReaderBody.text = code
                tvReaderBody.typeface = android.graphics.Typeface.MONOSPACE
            }
        }
    }

    private fun openTraceMode() {
        val p = currentProject ?: return
        containerDetail.visibility = View.GONE
        containerTracing.visibility = View.VISIBLE

        tvTraceTitle.text = "따라쓰기: ${p.title} (${p.entry})"

        val rawCode = p.solutionCode[p.entry]
            ?: p.starterCode[p.entry]
            ?: p.solutionCode.values.firstOrNull()
            ?: "int main() {\n    return 0;\n}"

        val lines = rawCode.lines()
        codeTraceView.codeLines = lines

        // 따라쓰기 필기 복원
        codeTraceView.strokeManager.loadFromFile("trace_${p.id}")
        codeTraceView.invalidate()
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
