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
import com.prostudy.eink.ui.code.CodeViewer
import com.prostudy.eink.util.EinkHelper

class MainActivity : AppCompatActivity() {

    private lateinit var repository: ContentRepository
    private lateinit var adapter: ProjectAdapter

    // 컨테이너들
    private lateinit var containerCatalog: LinearLayout
    private lateinit var containerDetail: LinearLayout
    private lateinit var containerCode: LinearLayout

    // 카탈로그 뷰
    private lateinit var btnTabC: Button
    private lateinit var btnTabGo: Button
    private lateinit var rvProjects: RecyclerView

    // 상세 뷰
    private lateinit var btnDetailBack: Button
    private lateinit var tvDetailTitle: TextView
    private lateinit var btnViewCode: Button
    private lateinit var tvReaderBody: TextView

    // 소스 코드 뷰
    private lateinit var btnCodeBack: Button
    private lateinit var tvCodeTitle: TextView
    private lateinit var codeViewer: CodeViewer

    private var currentLang = "c"
    private var currentProject: ProjectDetail? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        EinkHelper.applyActivityOptimizations(this)
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
        containerCode = findViewById(R.id.container_code)

        btnTabC = findViewById(R.id.btn_tab_c)
        btnTabGo = findViewById(R.id.btn_tab_go)
        rvProjects = findViewById(R.id.rv_projects)

        btnDetailBack = findViewById(R.id.btn_detail_back)
        tvDetailTitle = findViewById(R.id.tv_detail_title)
        btnViewCode = findViewById(R.id.btn_view_code)
        tvReaderBody = findViewById(R.id.tv_reader_body)

        btnCodeBack = findViewById(R.id.btn_code_back)
        tvCodeTitle = findViewById(R.id.tv_code_title)
        codeViewer = findViewById(R.id.code_viewer)

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

        // 소스 코드 화면 열기
        btnViewCode.setOnClickListener {
            openCodeMode()
        }

        // 소스 코드 뒤로가기
        btnCodeBack.setOnClickListener {
            closeCodeMode()
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
        containerCode.visibility = View.GONE

        tvDetailTitle.text = "[${detail.lang.uppercase()}] ${detail.title}"
        tvReaderBody.text = detail.readme
        tvReaderBody.typeface = android.graphics.Typeface.DEFAULT
    }

    private fun openCodeMode() {
        val p = currentProject ?: return
        containerDetail.visibility = View.GONE
        containerCode.visibility = View.VISIBLE

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
                "// ${p.title} (${p.entry})\n// 표시할 코드가 없습니다."
            }
        }

        // 탭(\t) 문자를 공백 4개로 변환
        val lines = rawCode.lines().map { line ->
            line.replace("\t", "    ")
        }
        tvCodeTitle.text = "소스 코드: ${p.title} (${lines.size}줄)"
        codeViewer.codeLines = lines
    }

    private fun closeCodeMode() {
        containerCode.visibility = View.GONE
        containerDetail.visibility = View.VISIBLE
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
        containerCatalog.visibility = View.VISIBLE
        containerDetail.visibility = View.GONE
        containerCode.visibility = View.GONE
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (containerCode.visibility == View.VISIBLE) {
                    closeCodeMode()
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
}
