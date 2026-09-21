package com.prostudy.eink.ui.tracing

import android.app.AlertDialog
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.prostudy.eink.R
import com.prostudy.eink.data.TourLesson
import com.prostudy.eink.data.TourRepository
import com.prostudy.eink.util.EinkHelper

class TourTraceActivity : AppCompatActivity() {

    private lateinit var repository: TourRepository
    private var allLessons: List<TourLesson> = emptyList()
    private var currentIndex: Int = 0

    private lateinit var btnBack: Button
    private lateinit var tvTitle: TextView
    private lateinit var btnSelectLesson: Button
    private lateinit var btnClearCanvas: Button
    private lateinit var btnRefresh: Button

    private lateinit var tvChapterBadge: TextView
    private lateinit var tvLessonOrder: TextView
    private lateinit var tvLessonSummary: TextView
    private lateinit var tvGhostCode: TextView
    private lateinit var drawingView: TracingDrawingView

    private lateinit var btnPrev: Button
    private lateinit var btnNext: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        EinkHelper.applyActivityOptimizations(this)
        setContentView(R.layout.activity_trace)

        repository = TourRepository(this)
        allLessons = repository.getAllLessons()

        bindViews()
        setupListeners()

        val initialLessonId = intent.getStringExtra("EXTRA_LESSON_ID")
        if (initialLessonId != null) {
            val found = allLessons.indexOfFirst { it.id == initialLessonId }
            if (found != -1) currentIndex = found
        }

        EinkHelper.applyFastDrawingMode(drawingView)
        renderCurrentLesson()
    }

    private fun bindViews() {
        btnBack = findViewById(R.id.btn_trace_back)
        tvTitle = findViewById(R.id.tv_trace_title)
        btnSelectLesson = findViewById(R.id.btn_select_lesson)
        btnClearCanvas = findViewById(R.id.btn_clear_canvas)
        btnRefresh = findViewById(R.id.btn_refresh_trace)

        tvChapterBadge = findViewById(R.id.tv_chapter_badge)
        tvLessonOrder = findViewById(R.id.tv_lesson_order)
        tvLessonSummary = findViewById(R.id.tv_lesson_summary)
        tvGhostCode = findViewById(R.id.tv_ghost_code)
        drawingView = findViewById(R.id.drawing_view)

        btnPrev = findViewById(R.id.btn_prev_lesson)
        btnNext = findViewById(R.id.btn_next_lesson)
    }

    private fun setupListeners() {
        btnBack.setOnClickListener { finish() }

        btnRefresh.setOnClickListener {
            flashScreenRefresh()
        }

        btnClearCanvas.setOnClickListener {
            drawingView.clearCanvas()
        }

        btnSelectLesson.setOnClickListener {
            showLessonPicker()
        }

        btnPrev.setOnClickListener {
            if (currentIndex > 0) {
                currentIndex--
                renderCurrentLesson()
            }
        }

        btnNext.setOnClickListener {
            if (currentIndex < allLessons.size - 1) {
                currentIndex++
                renderCurrentLesson()
            }
        }
    }

    private fun renderCurrentLesson() {
        if (allLessons.isEmpty()) return

        val lesson = allLessons[currentIndex]
        tvTitle.text = "${lesson.title} (${lesson.titleKo})"
        tvChapterBadge.text = lesson.chapterTitle
        tvLessonOrder.text = "Lesson ${currentIndex + 1} / ${allLessons.size}"
        tvLessonSummary.text = "${lesson.summaryKo}\n\n핵심 개념: ${lesson.concepts.joinToString(", ")}"
        tvGhostCode.text = lesson.code

        drawingView.clearCanvas()

        btnPrev.isEnabled = currentIndex > 0
        btnNext.isEnabled = currentIndex < allLessons.size - 1
    }

    private fun showLessonPicker() {
        val items = allLessons.map { "${it.order}. [${it.chapter}] ${it.title} - ${it.titleKo}" }.toTypedArray()
        AlertDialog.Builder(this)
            .setTitle("Tour of Go 레슨 선택")
            .setItems(items) { _, which ->
                currentIndex = which
                renderCurrentLesson()
            }
            .setNegativeButton("닫기", null)
            .show()
    }

    private fun flashScreenRefresh() {
        val root = findViewById<android.view.View>(android.R.id.content)
        root.setBackgroundColor(android.graphics.Color.BLACK)
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            root.setBackgroundColor(android.graphics.Color.WHITE)
            root.invalidate()
        }, 50)
    }
}
