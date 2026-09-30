package com.prostudy.eink.ui.code

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.VelocityTracker
import android.view.View
import android.view.ViewConfiguration
import android.widget.OverScroller
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min

/**
 * CodeViewer
 * 
 * 스마트폰 및 E-ink 전자책 태블릿 겸용 반응형 고대비 소스 코드 뷰어.
 * 
 * 주요 혁신 기능:
 * 1. 2차원(상하/좌우) 부드러운 스크롤 & 플링(Fling) 지원으로 스마트폰에서도 코드가 절대 잘리지 않음.
 * 2. 좌측 줄 번호 거터(Gutter) 고정(Sticky Pin) — 가로로 스크롤해도 줄 번호는 왼쪽에 완벽히 고정됨.
 * 3. 스마트폰 너비 자동 감지 및 맞춤형 기본 폰트 크기(13.5sp) 적용 (태블릿은 16sp).
 * 4. 자동 줄바꿈(Soft Wrap) 모드 토글 지원 — 가로 스크롤 없이 스마트폰 화면 안에서 모든 코드를 위아래로 완독 가능.
 * 5. 글자 크기 동적 조절 (A- / A+) 지원.
 * 6. 가시 영역(Viewport) 선별 렌더링으로 수천 줄의 코드도 60fps 무지연 렌더링.
 */
class CodeViewer @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    data class VisualLine(
        val lineIndex: Int,          // 원본 라인 번호 (0-based)
        val isFirstSubLine: Boolean,  // 원본 라인의 첫 번째 줄인지 여부 (줄 번호 표시용)
        val text: String
    )

    var codeLines: List<String> = emptyList()
        set(value) {
            field = value
            rebuildVisualLines()
            resetScroll()
            requestLayout()
            invalidate()
        }

    // 뷰포트 & 디바이스 메트릭스
    private val density = resources.displayMetrics.density
    private val screenWidthDp = resources.displayMetrics.widthPixels / density
    private val isSmartphone = screenWidthDp < 600f

    // 폰트 크기 (기본값: 스마트폰 13.5sp, 태블릿 16sp)
    var fontSizeSp: Float = if (isSmartphone) 13.5f else 16.0f
        private set

    // 자동 줄바꿈(Soft Wrap) 모드
    var isWrapMode: Boolean = false
        set(value) {
            if (field != value) {
                field = value
                rebuildVisualLines()
                resetScroll()
                invalidate()
            }
        }

    // 시각적 라인 리스트 및 레이아웃 캐시
    private var visualLines: List<VisualLine> = emptyList()
    private var maxLineWidthPx: Float = 0f
    private var lineHeightPx: Float = 0f
    private var lineNumberWidthPx: Float = 0f
    private val paddingLeftPx = 8f * density
    private val paddingTopPx = 16f * density
    private var sepX: Float = 0f

    // 스크롤 제어 (2D 스크롤)
    private val scroller = OverScroller(context)
    private var velocityTracker: VelocityTracker? = null
    private var scrollXOffset: Float = 0f
    private var scrollYOffset: Float = 0f
    private var lastTouchX: Float = 0f
    private var lastTouchY: Float = 0f
    private var isDragging = false
    private val touchSlop = ViewConfiguration.get(context).scaledTouchSlop

    // 페인트 객체
    private val lineNumPaint = Paint().apply {
        isAntiAlias = true
        color = Color.parseColor("#777777")
        typeface = Typeface.MONOSPACE
        textAlign = Paint.Align.RIGHT
    }

    private val gutterBgPaint = Paint().apply {
        isAntiAlias = false
        color = Color.parseColor("#F5F5F5")
    }

    private val separatorPaint = Paint().apply {
        isAntiAlias = false
        color = Color.parseColor("#CCCCCC")
        strokeWidth = 1.5f * density
    }

    private val ruledLinePaint = Paint().apply {
        isAntiAlias = false
        color = Color.parseColor("#ECECEC")
        strokeWidth = 1f * density
    }

    private val codePaint = Paint().apply {
        isAntiAlias = true
        color = Color.parseColor("#111111")
        typeface = Typeface.MONOSPACE
        isFakeBoldText = true // E-ink 패널 및 모바일 화면에서 또렷한 시인성
    }

    private val scrollbarPaint = Paint().apply {
        isAntiAlias = true
        color = Color.parseColor("#888888")
        strokeWidth = 3f * density
        strokeCap = Paint.Cap.ROUND
    }

    init {
        setBackgroundColor(Color.WHITE)
        setLayerType(LAYER_TYPE_SOFTWARE, null)
        updatePaintSizes()
    }

    fun setFontSize(sp: Float) {
        val clamped = sp.coerceIn(10f, 24f)
        if (abs(fontSizeSp - clamped) > 0.1f) {
            fontSizeSp = clamped
            updatePaintSizes()
            rebuildVisualLines()
            invalidate()
        }
    }

    fun zoomIn(): Float {
        setFontSize(fontSizeSp + 1.5f)
        return fontSizeSp
    }

    fun zoomOut(): Float {
        setFontSize(fontSizeSp - 1.5f)
        return fontSizeSp
    }

    fun toggleWrap(): Boolean {
        isWrapMode = !isWrapMode
        return isWrapMode
    }

    private fun updatePaintSizes() {
        codePaint.textSize = fontSizeSp * density
        lineNumPaint.textSize = (fontSizeSp - 2f).coerceAtLeast(9.5f) * density
        lineHeightPx = (fontSizeSp * 1.65f + 8f) * density

        // 줄 번호 자리수 측정
        val maxDigits = max(2, codeLines.size.toString().length)
        val sampleDigits = "9".repeat(maxDigits)
        val textWidth = lineNumPaint.measureText(sampleDigits)
        lineNumberWidthPx = textWidth + 14f * density
        sepX = lineNumberWidthPx + paddingLeftPx
    }

    private fun resetScroll() {
        scrollXOffset = 0f
        scrollYOffset = 0f
        if (!scroller.isFinished) {
            scroller.abortAnimation()
        }
    }

    private fun rebuildVisualLines() {
        updatePaintSizes()

        if (codeLines.isEmpty()) {
            visualLines = emptyList()
            maxLineWidthPx = 0f
            return
        }

        val list = ArrayList<VisualLine>(codeLines.size)
        var maxW = 0f

        val viewW = width.toFloat()
        val availCodeWidth = if (viewW > sepX + 40f * density) {
            viewW - sepX - 20f * density
        } else {
            (screenWidthDp * density) - sepX - 20f * density
        }

        for ((idx, line) in codeLines.withIndex()) {
            if (line.isEmpty()) {
                list.add(VisualLine(idx, true, ""))
                continue
            }

            val measured = codePaint.measureText(line)
            if (measured > maxW) {
                maxW = measured
            }

            if (!isWrapMode || availCodeWidth <= 50f || measured <= availCodeWidth) {
                // 줄바꿈 모드가 아니거나 가용 폭 내에 들어오는 경우
                list.add(VisualLine(idx, true, line))
            } else {
                // 가용 폭을 초과하여 자동 줄바꿈(Soft Wrap) 분할
                var remaining = line
                var isFirst = true

                while (remaining.isNotEmpty()) {
                    val count = codePaint.breakText(remaining, true, availCodeWidth, null)
                    if (count <= 0) {
                        list.add(VisualLine(idx, isFirst, remaining))
                        break
                    }
                    val sub = remaining.substring(0, count)
                    list.add(VisualLine(idx, isFirst, if (isFirst) sub else "  $sub"))
                    remaining = remaining.substring(count)
                    isFirst = false
                }
            }
        }

        visualLines = list
        maxLineWidthPx = maxW
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        rebuildVisualLines()
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val width = MeasureSpec.getSize(widthMeasureSpec)
        val height = MeasureSpec.getSize(heightMeasureSpec)
        setMeasuredDimension(width, height)
    }

    // ==========================================
    // 2D 제스처 및 스크롤 (가로 + 세로)
    // ==========================================

    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (velocityTracker == null) {
            velocityTracker = VelocityTracker.obtain()
        }
        velocityTracker?.addMovement(event)

        val rawX = event.x
        val rawY = event.y

        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                if (!scroller.isFinished) {
                    scroller.abortAnimation()
                }
                lastTouchX = rawX
                lastTouchY = rawY
                isDragging = true
                parent?.requestDisallowInterceptTouchEvent(true)
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                if (isDragging) {
                    val dx = rawX - lastTouchX
                    val dy = rawY - lastTouchY
                    lastTouchX = rawX
                    lastTouchY = rawY
                    scrollByOffset(dx, dy)
                    return true
                }
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                if (isDragging) {
                    isDragging = false
                    parent?.requestDisallowInterceptTouchEvent(false)
                    velocityTracker?.computeCurrentVelocity(1000)
                    val xVel = velocityTracker?.xVelocity ?: 0f
                    val yVel = velocityTracker?.yVelocity ?: 0f
                    fling(xVel, yVel)
                    velocityTracker?.recycle()
                    velocityTracker = null
                    return true
                }
            }
        }
        return true
    }

    private fun getMaxScrollY(): Float {
        val totalHeight = (visualLines.size + 4) * lineHeightPx + paddingTopPx
        return max(0f, totalHeight - height)
    }

    private fun getMaxScrollX(): Float {
        if (isWrapMode) return 0f
        val availCodeWidth = width.toFloat() - sepX
        val totalCodeWidth = maxLineWidthPx + 32f * density
        return max(0f, totalCodeWidth - availCodeWidth)
    }

    private fun scrollByOffset(dx: Float, dy: Float) {
        val maxScrollY = getMaxScrollY()
        scrollYOffset = (scrollYOffset + dy).coerceIn(-maxScrollY, 0f)

        val maxScrollX = getMaxScrollX()
        scrollXOffset = (scrollXOffset + dx).coerceIn(-maxScrollX, 0f)

        invalidate()
    }

    private fun fling(xVel: Float, yVel: Float) {
        val maxScrollX = getMaxScrollX()
        val maxScrollY = getMaxScrollY()

        scroller.fling(
            (-scrollXOffset).toInt(),
            (-scrollYOffset).toInt(),
            (-xVel).toInt(),
            (-yVel).toInt(),
            0, maxScrollX.toInt(),
            0, maxScrollY.toInt()
        )
        postInvalidateOnAnimation()
    }

    override fun computeScroll() {
        if (scroller.computeScrollOffset()) {
            scrollXOffset = -scroller.currX.toFloat()
            scrollYOffset = -scroller.currY.toFloat()
            postInvalidateOnAnimation()
        }
    }

    // ==========================================
    // 렌더링 (Sticky 줄 번호 + 2D 스크롤 코드)
    // ==========================================

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0 || h <= 0) return

        if (visualLines.isEmpty()) {
            val emptyPaint = Paint().apply {
                isAntiAlias = true
                color = Color.parseColor("#666666")
                textSize = 15f * density
                textAlign = Paint.Align.CENTER
            }
            canvas.drawText("표시할 소스 코드가 없습니다.", w / 2f, h / 2f, emptyPaint)
            return
        }

        val viewportTop = -scrollYOffset
        val viewportBottom = -scrollYOffset + h

        val firstVisible = max(0, ((viewportTop - paddingTopPx) / lineHeightPx).toInt() - 1)
        val lastVisible = min(visualLines.size - 1, ((viewportBottom - paddingTopPx) / lineHeightPx).toInt() + 2)

        // ----------------------------------------------------
        // 1. 소스 코드 본문 영역 (가로 + 세로 2D 스크롤 적용)
        // ----------------------------------------------------
        canvas.save()
        // 줄 번호 거터를 침범하지 않도록 코드 영역만 클리핑
        canvas.clipRect(sepX, 0f, w, h)
        // 코드 영역은 X축 오프셋(scrollXOffset)과 Y축 오프셋(scrollYOffset) 적용
        val effectiveX = if (isWrapMode) sepX else (sepX + scrollXOffset)
        canvas.translate(effectiveX, scrollYOffset)

        val contentRight = max(w - sepX, maxLineWidthPx + 40f * density)

        for (i in firstVisible..lastVisible) {
            val y = paddingTopPx + (i + 1) * lineHeightPx
            val baseline = y - 9f * density

            // 가로 구분선 (코드 영역)
            canvas.drawLine(0f, y, contentRight, y, ruledLinePaint)

            // 소스 코드 문자열 출력
            val vLine = visualLines[i]
            if (vLine.text.isNotEmpty()) {
                canvas.drawText(vLine.text, 12f * density, baseline, codePaint)
            }
        }
        canvas.restore()

        // ----------------------------------------------------
        // 2. 좌측 줄 번호 거터 영역 (X축 고정! Sticky Pinned Gutter)
        // ----------------------------------------------------
        canvas.save()
        canvas.clipRect(0f, 0f, sepX, h)
        // 줄 번호 배경 채우기 (뒤로 스크롤되는 코드가 완전히 가려지도록)
        canvas.drawRect(0f, 0f, sepX, h, gutterBgPaint)

        // 줄 번호는 오직 Y축(상하)으로만 이동
        canvas.translate(0f, scrollYOffset)

        for (i in firstVisible..lastVisible) {
            val y = paddingTopPx + (i + 1) * lineHeightPx
            val baseline = y - 9f * density

            // 거터 내부의 가로 밑선
            canvas.drawLine(0f, y, sepX, y, ruledLinePaint)

            val vLine = visualLines[i]
            // 원본 라인의 첫 번째 서브라인에만 줄 번호 인쇄
            if (vLine.isFirstSubLine) {
                canvas.drawText("${vLine.lineIndex + 1}", sepX - 8f * density, baseline, lineNumPaint)
            } else {
                // 래핑된 하위 라인은 작은 점(·)으로 부속 라인임을 명시
                canvas.drawText("·", sepX - 10f * density, baseline, lineNumPaint)
            }
        }
        canvas.restore()

        // ----------------------------------------------------
        // 3. 세로 구분선 (X축 고정)
        // ----------------------------------------------------
        canvas.drawLine(sepX, 0f, sepX, h, separatorPaint)

        // ----------------------------------------------------
        // 4. 모바일 및 E-ink 스크롤 인디케이터 (현재 위치 파악용)
        // ----------------------------------------------------
        drawScrollbars(canvas, w, h)
    }

    private fun drawScrollbars(canvas: Canvas, w: Float, h: Float) {
        val maxScrollY = getMaxScrollY()
        val maxScrollX = getMaxScrollX()

        // 세로 스크롤바
        if (maxScrollY > 10f) {
            val totalH = maxScrollY + h
            val thumbH = max(24f * density, (h / totalH) * h)
            val thumbY = (-scrollYOffset / maxScrollY) * (h - thumbH)
            val barX = w - 4f * density
            canvas.drawLine(barX, thumbY, barX, thumbY + thumbH, scrollbarPaint)
        }

        // 가로 스크롤바 (줄바꿈 모드가 아니고 내용이 화면보다 넓을 때만 표시)
        if (!isWrapMode && maxScrollX > 10f) {
            val codeW = w - sepX
            val totalW = maxScrollX + codeW
            val thumbW = max(24f * density, (codeW / totalW) * codeW)
            val thumbX = sepX + (-scrollXOffset / maxScrollX) * (codeW - thumbW)
            val barY = h - 4f * density
            canvas.drawLine(thumbX, barY, thumbX + thumbW, barY, scrollbarPaint)
        }
    }
}
