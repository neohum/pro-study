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
import android.widget.OverScroller
import kotlin.math.max
import kotlin.math.min

/**
 * CodeViewer
 * 
 * E-ink 전자책용 고대비 소스 코드 열람 전용 뷰어.
 * 
 * 필기/드로잉 기능을 완전히 배제하고, E-ink 패널 특성에 맞춘 초경량 가독성 최적화:
 * 1. 1.5배 확대 폰트(21sp) 및 MONOSPACE + FakeBold로 E-ink에서 글자가 또렷하고 선명함.
 * 2. 좌측 줄 번호와 세로 구분선, 가로 가이드 밑선 제공.
 * 3. 뷰포트 내 가시 영역(Visible Range)만 선별 렌더링하여 줄 수가 많아도 렌더링 부하 0화.
 * 4. 부드러운 손가락 터치 스크롤 및 Fling 지원.
 */
class CodeViewer @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    var codeLines: List<String> = emptyList()
        set(value) {
            field = value
            scrollYOffset = 0f
            requestLayout()
            invalidate()
        }

    // 스크롤 제어
    private val scroller = OverScroller(context)
    private var velocityTracker: VelocityTracker? = null
    private var scrollYOffset: Float = 0f
    private var lastTouchY: Float = 0f
    private var isDragging = false

    // 레이아웃 수치 (글자 크기 1.5배 대응)
    private val lineHeightDp = 48f
    private val lineNumberWidthDp = 54f
    private val density = resources.displayMetrics.density
    private val lineHeightPx = lineHeightDp * density
    private val lineNumberWidthPx = lineNumberWidthDp * density
    private val paddingLeftPx = 16f * density
    private val paddingTopPx = 24f * density

    // 페인트
    private val lineNumPaint = Paint().apply {
        isAntiAlias = true
        color = Color.parseColor("#666666")
        textSize = 15f * density
        typeface = Typeface.MONOSPACE
        textAlign = Paint.Align.RIGHT
    }

    private val separatorPaint = Paint().apply {
        isAntiAlias = false
        color = Color.parseColor("#9E9E9E")
        strokeWidth = 2f * density
    }

    private val ruledLinePaint = Paint().apply {
        isAntiAlias = false
        color = Color.parseColor("#E0E0E0")
        strokeWidth = 1f * density
    }

    private val codePaint = Paint().apply {
        isAntiAlias = true
        color = Color.parseColor("#111111") // 진하고 선명한 검은색 폰트
        textSize = 21f * density // 가이드와 동일한 1.5배 확대 크기
        typeface = Typeface.MONOSPACE
        isFakeBoldText = true // E-ink 패널에서 획이 날아가지 않고 또렷하게 표시
    }

    init {
        setBackgroundColor(Color.WHITE)
        setLayerType(LAYER_TYPE_SOFTWARE, null)
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val width = MeasureSpec.getSize(widthMeasureSpec)
        val height = MeasureSpec.getSize(heightMeasureSpec)
        setMeasuredDimension(width, height)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (velocityTracker == null) {
            velocityTracker = VelocityTracker.obtain()
        }
        velocityTracker?.addMovement(event)

        val rawY = event.y
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                if (!scroller.isFinished) {
                    scroller.abortAnimation()
                }
                lastTouchY = rawY
                isDragging = true
                parent?.requestDisallowInterceptTouchEvent(true)
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                if (isDragging) {
                    val dy = rawY - lastTouchY
                    lastTouchY = rawY
                    scrollByOffset(dy)
                    return true
                }
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                if (isDragging) {
                    isDragging = false
                    parent?.requestDisallowInterceptTouchEvent(false)
                    velocityTracker?.computeCurrentVelocity(1000)
                    val yVel = velocityTracker?.yVelocity ?: 0f
                    fling(-yVel)
                    velocityTracker?.recycle()
                    velocityTracker = null
                    return true
                }
            }
        }
        return true
    }

    private fun scrollByOffset(dy: Float) {
        val totalHeight = (codeLines.size + 4) * lineHeightPx + paddingTopPx
        val maxScroll = max(0f, totalHeight - height)
        scrollYOffset = (scrollYOffset + dy).coerceIn(-maxScroll, 0f)
        invalidate()
    }

    private fun fling(yVelocity: Float) {
        val totalHeight = (codeLines.size + 4) * lineHeightPx + paddingTopPx
        val maxScroll = max(0f, totalHeight - height)
        scroller.fling(
            0, (-scrollYOffset).toInt(),
            0, yVelocity.toInt(),
            0, 0,
            0, maxScroll.toInt()
        )
        postInvalidateOnAnimation()
    }

    override fun computeScroll() {
        if (scroller.computeScrollOffset()) {
            scrollYOffset = -scroller.currY.toFloat()
            postInvalidateOnAnimation()
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0 || h <= 0) return

        val sepX = lineNumberWidthPx + paddingLeftPx

        if (codeLines.isEmpty()) {
            val emptyPaint = Paint().apply {
                isAntiAlias = true
                color = Color.parseColor("#666666")
                textSize = 18f * density
                textAlign = Paint.Align.CENTER
            }
            canvas.drawText("표시할 소스 코드가 없습니다.", w / 2f, h / 2f, emptyPaint)
            return
        }

        canvas.save()
        canvas.translate(0f, scrollYOffset)

        val viewportTop = -scrollYOffset
        val viewportBottom = -scrollYOffset + h

        // 1. 세로 구분선 (줄 번호 영역과 코드 영역 구분)
        val totalHeight = max(h, (codeLines.size + 4) * lineHeightPx + paddingTopPx)
        canvas.drawLine(sepX, 0f, sepX, totalHeight, separatorPaint)

        // 2. 가로 가이드선, 줄 번호, 소스 코드 (가시 영역만 선별 렌더링)
        val firstVisible = max(0, ((viewportTop - paddingTopPx) / lineHeightPx).toInt() - 1)
        val lastVisible = min(codeLines.size - 1, ((viewportBottom - paddingTopPx) / lineHeightPx).toInt() + 2)

        for (i in firstVisible..lastVisible) {
            val y = paddingTopPx + (i + 1) * lineHeightPx
            val baseline = y - 12f * density

            // 가로 구분선
            canvas.drawLine(sepX, y, w, y, ruledLinePaint)

            // 줄 번호
            canvas.drawText("${i + 1}", sepX - 10f * density, baseline, lineNumPaint)

            // 소스 코드
            if (i in codeLines.indices) {
                canvas.drawText(codeLines[i], sepX + 16f * density, baseline, codePaint)
            }
        }

        canvas.restore()
    }
}
