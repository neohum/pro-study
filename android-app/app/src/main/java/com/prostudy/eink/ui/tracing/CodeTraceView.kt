package com.prostudy.eink.ui.tracing

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Rect
import android.graphics.Typeface
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.VelocityTracker
import android.view.View
import android.widget.OverScroller
import com.prostudy.eink.ui.ink.InkPoint
import com.prostudy.eink.ui.ink.Stroke
import com.prostudy.eink.ui.ink.StrokeManager
import kotlin.math.max
import kotlin.math.min

/**
 * CodeTraceView
 * 
 * E-ink 전자책용 코드 따라쓰기(Tracing) 전용 캔버스 뷰.
 * 
 * 기능:
 * 1. Ghost Code 렌더링: 코드를 옅은 회색으로 렌더링하여 따라쓸 수 있는 가이드라인 제공.
 * 2. 손가락 스크롤: MotionEvent.TOOL_TYPE_FINGER는 부드러운 관성 스크롤(OverScroller)을 수행.
 * 3. 펜 따라쓰기: MotionEvent.TOOL_TYPE_STYLUS / TOOL_TYPE_ERASER는 코드 위에 필기 획(Stroke)을 그림.
 * 4. 스크롤 동기화: 스크롤 시 코드 텍스트와 작성된 획이 하나의 문서처럼 함께 움직임.
 */
class CodeTraceView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    val strokeManager = StrokeManager(context)

    var codeLines: List<String> = emptyList()
        set(value) {
            field = value
            scrollYOffset = 0f
            requestLayout()
            invalidate()
        }

    var showGhostText: Boolean = true
        set(value) {
            field = value
            invalidate()
        }

    var isEraserMode: Boolean = false

    // 스크롤 제어
    private val scroller = OverScroller(context)
    private var velocityTracker: VelocityTracker? = null
    private var scrollYOffset: Float = 0f
    private var lastTouchY: Float = 0f
    private var isDragging = false

    // 레이아웃 수치
    private val lineHeightDp = 38f
    private val lineNumberWidthDp = 50f
    private val density = resources.displayMetrics.density
    private val lineHeightPx = lineHeightDp * density
    private val lineNumberWidthPx = lineNumberWidthDp * density
    private val paddingLeftPx = 16f * density
    private val paddingTopPx = 24f * density

    // 페인트 (E-ink 고속 렌더링 최적화: 불필요한 안티에일리어싱/디더링 제거)
    private val lineNumPaint = Paint().apply {
        isAntiAlias = false
        color = Color.parseColor("#9E9E9E")
        textSize = 14f * density
        typeface = Typeface.MONOSPACE
        textAlign = Paint.Align.RIGHT
    }

    private val separatorPaint = Paint().apply {
        isAntiAlias = false
        color = Color.parseColor("#E0E0E0")
        strokeWidth = 1f * density
    }

    private val ruledLinePaint = Paint().apply {
        isAntiAlias = false
        color = Color.parseColor("#EEEEEE")
        strokeWidth = 1f * density
    }

    private val ghostCodePaint = Paint().apply {
        isAntiAlias = true
        color = Color.parseColor("#757575") // E-ink 고대비 Ghost 텍스트
        textSize = 17f * density
        typeface = Typeface.MONOSPACE
    }

    private val inkPaint = Paint().apply {
        isAntiAlias = false
        isDither = false
        color = Color.BLACK
        style = Paint.Style.STROKE
        strokeJoin = Paint.Join.ROUND
        strokeCap = Paint.Cap.ROUND
        strokeWidth = 3.5f
    }

    private var activeStroke: Stroke? = null
    private var isStylusActive = false
    private val activePath = Path()
    private var lastPointX = 0f
    private var lastPointY = 0f
    private val dirtyRect = Rect()

    init {
        // E-ink 하드웨어 최적화: 소프트웨어 파이프라인으로 dirty rect 부분 갱신 레이턴시 최소화
        setLayerType(LAYER_TYPE_SOFTWARE, null)
    }

    private fun addQuadSegment(x: Float, y: Float) {
        val midX = (lastPointX + x) / 2f
        val midY = (lastPointY + y) / 2f
        activePath.quadTo(lastPointX, lastPointY, midX, midY)
        lastPointX = x
        lastPointY = y
    }

    @Suppress("DEPRECATION")
    private fun invalidateStroke(minDocX: Float, minDocY: Float, maxDocX: Float, maxDocY: Float) {
        val pad = (inkPaint.strokeWidth + 12f).toInt()
        val screenMinY = minDocY + scrollYOffset
        val screenMaxY = maxDocY + scrollYOffset
        dirtyRect.set(
            (minDocX - pad).toInt().coerceAtLeast(0),
            (screenMinY - pad).toInt().coerceAtLeast(0),
            (maxDocX + pad).toInt().coerceAtMost(width),
            (screenMaxY + pad).toInt().coerceAtMost(height)
        )
        if (dirtyRect.width() > 0 && dirtyRect.height() > 0) {
            invalidate(dirtyRect)
        } else {
            invalidate()
        }
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val width = MeasureSpec.getSize(widthMeasureSpec)
        val contentHeight = ((codeLines.size + 4) * lineHeightPx + paddingTopPx).toInt()
        val minHeight = MeasureSpec.getSize(heightMeasureSpec)
        setMeasuredDimension(width, max(contentHeight, minHeight))
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        val action = event.actionMasked
        val pointerIndex = event.actionIndex
        val toolType = event.getToolType(pointerIndex)

        val isStylusOrEraser = (toolType == MotionEvent.TOOL_TYPE_STYLUS ||
                toolType == MotionEvent.TOOL_TYPE_ERASER ||
                (event.buttonState and MotionEvent.BUTTON_STYLUS_PRIMARY != 0))

        // 1. 손가락 터치(FINGER) -> 본문 스크롤 처리
        if (!isStylusOrEraser) {
            if (isStylusActive) return true // Palm Rejection

            if (velocityTracker == null) {
                velocityTracker = VelocityTracker.obtain()
            }
            velocityTracker?.addMovement(event)

            val rawY = event.y
            when (action) {
                MotionEvent.ACTION_DOWN -> {
                    if (!scroller.isFinished) {
                        scroller.abortAnimation()
                    }
                    lastTouchY = rawY
                    isDragging = true
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

        // 2. 스타일러스 입력(STYLUS) -> 문서 상대 좌표로 변환하여 필기
        val screenX = event.getX(pointerIndex)
        val screenY = event.getY(pointerIndex)
        val docX = screenX
        val docY = screenY - scrollYOffset // 스크롤 오프셋을 반영한 문서 좌표

        val pressure = event.getPressure(pointerIndex).coerceIn(0.1f, 1.5f)
        val isHardwareEraser = (toolType == MotionEvent.TOOL_TYPE_ERASER) ||
                ((event.buttonState and MotionEvent.BUTTON_STYLUS_PRIMARY) != 0)
        val effectiveEraser = isEraserMode || isHardwareEraser

        when (action) {
            MotionEvent.ACTION_DOWN -> {
                isStylusActive = true
                parent?.requestDisallowInterceptTouchEvent(true)
                if (effectiveEraser) {
                    if (strokeManager.removeStrokesNear(docX, docY)) {
                        invalidate()
                    }
                } else {
                    activePath.reset()
                    activePath.moveTo(docX, docY)
                    lastPointX = docX
                    lastPointY = docY

                    val stroke = Stroke(
                        color = Color.BLACK,
                        baseWidth = 3.5f,
                        isEraser = false
                    )
                    stroke.addPoint(InkPoint(docX, docY, pressure))
                    activeStroke = stroke
                    invalidateStroke(docX, docY, docX, docY)
                }
                return true
            }

            MotionEvent.ACTION_MOVE -> {
                val historySize = event.historySize
                if (effectiveEraser) {
                    var changed = false
                    for (h in 0 until historySize) {
                        val hy = event.getHistoricalY(pointerIndex, h) - scrollYOffset
                        val hx = event.getHistoricalX(pointerIndex, h)
                        if (strokeManager.removeStrokesNear(hx, hy)) changed = true
                    }
                    if (strokeManager.removeStrokesNear(docX, docY)) changed = true
                    if (changed) invalidate()
                } else {
                    activeStroke?.let { stroke ->
                        var minX = lastPointX
                        var maxX = lastPointX
                        var minY = lastPointY
                        var maxY = lastPointY

                        for (h in 0 until historySize) {
                            val hx = event.getHistoricalX(pointerIndex, h)
                            val hy = event.getHistoricalY(pointerIndex, h) - scrollYOffset
                            val hp = event.getHistoricalPressure(pointerIndex, h)
                            addQuadSegment(hx, hy)
                            stroke.addPoint(InkPoint(hx, hy, hp))
                            if (hx < minX) minX = hx
                            if (hx > maxX) maxX = hx
                            if (hy < minY) minY = hy
                            if (hy > maxY) maxY = hy
                        }
                        addQuadSegment(docX, docY)
                        stroke.addPoint(InkPoint(docX, docY, pressure))
                        if (docX < minX) minX = docX
                        if (docX > maxX) maxX = docX
                        if (docY < minY) minY = docY
                        if (docY > maxY) maxY = docY

                        invalidateStroke(minX, minY, maxX, maxY)
                    }
                }
                return true
            }

            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                isStylusActive = false
                parent?.requestDisallowInterceptTouchEvent(false)
                if (!effectiveEraser) {
                    activeStroke?.let { stroke ->
                        addQuadSegment(docX, docY)
                        stroke.addPoint(InkPoint(docX, docY, pressure))
                        strokeManager.addStroke(stroke)
                        activeStroke = null
                        activePath.reset()
                        invalidate()
                    }
                }
                return true
            }
        }

        return super.onTouchEvent(event)
    }

    private fun scrollByOffset(dy: Float) {
        val maxScroll = max(0f, (codeLines.size * lineHeightPx + paddingTopPx * 2) - height)
        scrollYOffset = (scrollYOffset + dy).coerceIn(-maxScroll, 0f)
        invalidate()
    }

    private fun fling(yVelocity: Float) {
        val maxScroll = max(0f, (codeLines.size * lineHeightPx + paddingTopPx * 2) - height)
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

        canvas.save()
        canvas.translate(0f, scrollYOffset)

        val viewportTop = -scrollYOffset
        val viewportBottom = -scrollYOffset + height

        // 1. 세로 구분선 (줄 번호 영역과 코드 영역 구분)
        val sepX = lineNumberWidthPx + paddingLeftPx
        val totalHeight = (codeLines.size + 2) * lineHeightPx + paddingTopPx
        canvas.drawLine(sepX, 0f, sepX, totalHeight, separatorPaint)

        // 2. 가로 노트선(Ruled Line), 줄 번호, Ghost 소스 코드 렌더링 - 뷰포트 내 가시 영역만 렌더링
        val firstVisible = max(0, ((viewportTop - paddingTopPx) / lineHeightPx).toInt())
        val lastVisible = min(codeLines.size - 1, ((viewportBottom - paddingTopPx) / lineHeightPx).toInt() + 1)

        for (i in firstVisible..lastVisible) {
            val y = paddingTopPx + (i + 1) * lineHeightPx
            val baseline = y - 10f * density

            // 가로 공책 밑선
            canvas.drawLine(sepX, y, width.toFloat(), y, ruledLinePaint)

            // 줄 번호
            canvas.drawText("${i + 1}", sepX - 10f * density, baseline, lineNumPaint)

            // 따라쓸 Ghost 코드
            if (showGhostText) {
                canvas.drawText(codeLines[i], sepX + 16f * density, baseline, ghostCodePaint)
            }
        }

        // 3. 사용자 필기 획 렌더링 (뷰포트에 걸치는 획만 필터링하여 렌더링)
        for (stroke in strokeManager.getStrokes()) {
            if (stroke.isEraser) continue
            if (!stroke.isVisibleIn(viewportTop, viewportBottom)) continue
            inkPaint.color = stroke.color
            inkPaint.strokeWidth = stroke.baseWidth
            canvas.drawPath(stroke.toPath(), inkPaint)
        }

        // 4. 현재 입력 중인 실시간 획 (증분 Path로 렌더링하여 재계산 오버헤드 0화)
        if (activeStroke != null && !activePath.isEmpty) {
            activeStroke?.let { stroke ->
                inkPaint.color = stroke.color
                inkPaint.strokeWidth = stroke.baseWidth
            }
            canvas.drawPath(activePath, inkPaint)
        }

        canvas.restore()
    }
}
