package com.prostudy.eink.ui.reference

import android.graphics.Color
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.prostudy.eink.R
import com.prostudy.eink.data.ReferenceDoc
import com.prostudy.eink.data.ReferenceRepository
import com.prostudy.eink.util.EinkHelper

class ReferenceActivity : AppCompatActivity() {

    private lateinit var repository: ReferenceRepository
    private lateinit var adapter: ReferenceAdapter

    private var currentLang: String = "c"
    private var isGrammarMode: Boolean = true
    private var currentDoc: ReferenceDoc? = null

    private lateinit var btnBack: Button
    private lateinit var btnRefresh: Button
    private lateinit var etSearch: EditText
    private lateinit var btnModeGrammar: Button
    private lateinit var btnModeFunctions: Button

    private lateinit var tvLangName: TextView
    private lateinit var tvLangVersion: TextView
    private lateinit var tvLangOverview: TextView
    private lateinit var rvItems: RecyclerView

    private lateinit var tabButtons: List<Pair<String, Button>>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        EinkHelper.applyActivityOptimizations(this)
        setContentView(R.layout.activity_reference)

        repository = ReferenceRepository(this)
        adapter = ReferenceAdapter()

        bindViews()
        setupListeners()

        selectLanguage("c")
        updateModeButtons()
    }

    private fun bindViews() {
        btnBack = findViewById(R.id.btn_ref_back)
        btnRefresh = findViewById(R.id.btn_ref_refresh)
        etSearch = findViewById(R.id.et_ref_search)
        btnModeGrammar = findViewById(R.id.btn_mode_grammar)
        btnModeFunctions = findViewById(R.id.btn_mode_functions)

        tvLangName = findViewById(R.id.tv_lang_name)
        tvLangVersion = findViewById(R.id.tv_lang_version)
        tvLangOverview = findViewById(R.id.tv_lang_overview)

        rvItems = findViewById(R.id.rv_ref_items)
        rvItems.layoutManager = LinearLayoutManager(this)
        rvItems.adapter = adapter

        tabButtons = listOf(
            "c" to findViewById(R.id.btn_ref_tab_c),
            "go" to findViewById(R.id.btn_ref_tab_go),
            "rust" to findViewById(R.id.btn_ref_tab_rust),
            "python" to findViewById(R.id.btn_ref_tab_python),
            "typescript" to findViewById(R.id.btn_ref_tab_typescript),
            "javascript" to findViewById(R.id.btn_ref_tab_javascript),
            "lisp" to findViewById(R.id.btn_ref_tab_lisp),
            "nasm" to findViewById(R.id.btn_ref_tab_nasm)
        )
    }

    private fun setupListeners() {
        btnBack.setOnClickListener { finish() }

        btnRefresh.setOnClickListener {
            flashScreenRefresh()
        }

        for ((lang, btn) in tabButtons) {
            btn.setOnClickListener {
                selectLanguage(lang)
            }
        }

        findViewById<Button>(R.id.btn_ref_tab_math)?.setOnClickListener {
            val intent = android.content.Intent(this, com.prostudy.eink.ui.tracing.MathTraceActivity::class.java)
            startActivity(intent)
        }

        btnModeGrammar.setOnClickListener {
            if (!isGrammarMode) {
                isGrammarMode = true
                updateModeButtons()
                renderItems()
            }
        }

        btnModeFunctions.setOnClickListener {
            if (isGrammarMode) {
                isGrammarMode = false
                updateModeButtons()
                renderItems()
            }
        }

        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                adapter.filter(s?.toString() ?: "")
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun selectLanguage(lang: String) {
        currentLang = lang
        for ((l, btn) in tabButtons) {
            btn.backgroundTintList = null
            if (l == lang) {
                btn.setBackgroundResource(R.drawable.bg_eink_button_selected)
                btn.setTextColor(Color.WHITE)
            } else {
                btn.setBackgroundResource(R.drawable.bg_eink_button_unselected)
                btn.setTextColor(Color.BLACK)
            }
        }

        currentDoc = repository.getReference(lang)
        currentDoc?.let { doc ->
            tvLangName.text = doc.name
            tvLangVersion.text = doc.version
            tvLangOverview.text = doc.overview
        }

        etSearch.setText("")
        renderItems()
    }

    private fun updateModeButtons() {
        btnModeGrammar.backgroundTintList = null
        btnModeFunctions.backgroundTintList = null
        if (isGrammarMode) {
            btnModeGrammar.setBackgroundResource(R.drawable.bg_eink_button_selected)
            btnModeGrammar.setTextColor(Color.WHITE)
            btnModeFunctions.setBackgroundResource(R.drawable.bg_eink_button_unselected)
            btnModeFunctions.setTextColor(Color.BLACK)
        } else {
            btnModeGrammar.setBackgroundResource(R.drawable.bg_eink_button_unselected)
            btnModeGrammar.setTextColor(Color.BLACK)
            btnModeFunctions.setBackgroundResource(R.drawable.bg_eink_button_selected)
            btnModeFunctions.setTextColor(Color.WHITE)
        }
    }

    private fun renderItems() {
        val doc = currentDoc ?: return
        val items = if (isGrammarMode) {
            doc.grammar.map { ReferenceCardModel.Grammar(it) }
        } else {
            doc.functions.map { ReferenceCardModel.Function(it) }
        }
        adapter.submitList(items)
        val currentQuery = etSearch.text.toString()
        if (currentQuery.isNotEmpty()) {
            adapter.filter(currentQuery)
        }
    }

    private fun flashScreenRefresh() {
        val root = findViewById<View>(R.id.root_reference_layout)
        root.setBackgroundColor(android.graphics.Color.BLACK)
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            root.setBackgroundColor(resources.getColor(R.color.eink_bg, theme))
            root.invalidate()
        }, 50)
    }
}
