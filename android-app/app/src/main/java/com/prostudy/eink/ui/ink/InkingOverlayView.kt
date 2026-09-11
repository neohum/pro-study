package com.prostudy.eink.ui.ink

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Rect
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View

/**
 * InkingOverlayView
 * 
 * E-ink 디바이스를 위한 고속 투명 잉킹 오버레이 뷰.
 * 
 * 핵심 메커니즘 (Palm Rejection & Touch/Stylus 분리):
 * 1. MotionEvent.TOOL_TYPE_STYLUS / TOOL_TYPE_ERASER:
 *    - 펜 또는 지우개 도구로 인식되면 이벤트를 완전히 가로채어(return true) 부드러운 베지어 획을 드로잉.
 *    - 스타일러스가 터치 중일 때는 손바닥(Palm) 터치를 완전히 차단.
 * 2. MotionEvent.TOOL_TYPE_FINGER:
 *    - 손가락 터치는 이벤트를 소비하지 않고(return false) 부모 뷰(NestedScrollView 등)로 전달하여
 *      손가락으로 본문과 코드를 부드럽게 스크롤할 수 있도록 허용.
 */
class InkingOverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    val strokeManager = StrokeManager(context)

    var isEraserMode: Boolean = false
    var currentPenWidth: Float = 3.5f
    var currentPenColor: Int = Color.BLACK // E-ink 고대비 순흑색

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

    private val inkPaint = Paint().apply {
        isAntiAlias = false
        isDither = false
        color = Color.BLACK
        style = Paint.Style.STROKE
        strokeJoin = Paint.Join.ROUND
        strokeCap = Paint.Cap.ROUND
        strokeWidth = currentPenWidth
    }

    private val eraserIndicatorPaint = Paint().apply {
        isAntiAlias = false
        color = Color.GRAY
        style = Paint.Style.STROKE
        strokeWidth = 2.0f
    }

    private fun addQuadSegment(x: Float, y: Float) {
        val midX = (lastPointX + x) / 2f
        val midY = (lastPointY + y) / 2f
        activePath.quadTo(lastPointX, lastPointY, midX, midY)
        lastPointX = x
        lastPointY = y
    }

    @Suppress("DEPRECATION")
    private fun invalidateStroke(minX: Float, minY: Float, maxX: Float, maxY: Float) {
        val pad = (currentPenWidth + 12f).toInt()
        dirtyRect.set(
            (minX - pad).toInt().coerceAtLeast(0),
            (minY - pad).toInt().coerceAtLeast(0),
            (maxX + pad).toInt().coerceAtMost(width),
            (maxY + pad).toInt().coerceAtMost(height)
        )
        if (dirtyRect.width() > 0 && dirtyRect.height() > 0) {
            invalidate(dirtyRect)
        } else {
            invalidate()
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        val action = event.actionMasked
        val pointerIndex = event.actionIndex
        val toolType = event.getToolType(pointerIndex)

        val isStylusOrEraser = (toolType == MotionEvent.TOOL_TYPE_STYLUS ||
                toolType == MotionEvent.TOOL_TYPE_ERASER ||
                (event.buttonState and MotionEvent.BUTTON_STYLUS_PRIMARY != 0))

        // 1. 손가락 터치(FINGER) 처리:
        // 스타일러스가 화면에 닿아있지 않은 상태에서 손가락이 들어오면 스크롤 뷰로 전달 (return false)
        if (!isStylusOrEraser) {
            if (isStylusActive) {
                // 스타일러스 입력 도중 손바닥이 닿았을 때 완벽한 Palm Rejection
                return true
            }
            return false
        }

        // 2. 스타일러스 입력 처리 (펜 및 지우개)
        val x = event.getX(pointerIndex)
        val y = event.getY(pointerIndex)
        val pressure = event.getPressure(pointerIndex).coerceIn(0.1f, 1.5f)
        val isHardwareEraser = (toolType == MotionEvent.TOOL_TYPE_ERASER) ||
                ((event.buttonState and MotionEvent.BUTTON_STYLUS_PRIMARY) != 0)
        val effectiveEraser = isEraserMode || isHardwareEraser

        when (action) {
            MotionEvent.ACTION_DOWN -> {
                isStylusActive = true
                parent?.requestDisallowInterceptTouchEvent(true)

                if (effectiveEraser) {
                    if (strokeManager.removeStrokesNear(x, y)) {
                        invalidate()
                    }
                } else {
                    activePath.reset()
                    activePath.moveTo(x, y)
                    lastPointX = x
                    lastPointY = y

                    val stroke = Stroke(
                        color = currentPenColor,
                        baseWidth = currentPenWidth,
                        isEraser = false
                    )
                    stroke.addPoint(InkPoint(x, y, pressure))
                    activeStroke = stroke
                    invalidateStroke(x, y, x, y)
                }
                return true
            }

            MotionEvent.ACTION_MOVE -> {
                val historySize = event.historySize
                if (effectiveEraser) {
                    var changed = false
                    for (h in 0 until historySize) {
                        val hx = event.getHistoricalX(pointerIndex, h)
                        val hy = event.getHistoricalY(pointerIndex, h)
                        if (strokeManager.removeStrokesNear(hx, hy)) {
                            changed = true
                        }
                    }
                    if (strokeManager.removeStrokesNear(x, y)) {
                        changed = true
                    }
                    if (changed) invalidate()
                } else {
                    activeStroke?.let { stroke ->
                        var minX = lastPointX
                        var maxX = lastPointX
                        var minY = lastPointY
                        var maxY = lastPointY

                        for (h in 0 until historySize) {
                            val hx = event.getHistoricalX(pointerIndex, h)
                            val hy = event.getHistoricalY(pointerIndex, h)
                            val hp = event.getHistoricalPressure(pointerIndex, h)
                            addQuadSegment(hx, hy)
                            stroke.addPoint(InkPoint(hx, hy, hp))
                            if (hx < minX) minX = hx
                            if (hx > maxX) maxX = hx
                            if (hy < minY) minY = hy
                            if (hy > maxY) maxY = hy
                        }
                        addQuadSegment(x, y)
                        stroke.addPoint(InkPoint(x, y, pressure))
                        if (x < minX) minX = x
                        if (x > maxX) maxX = x
                        if (y < minY) minY = y
                        if (y > maxY) maxY = y

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
                        addQuadSegment(x, y)
                        stroke.addPoint(InkPoint(x, y, pressure))
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

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // 저장된 기존 획 렌더링
        for (stroke in strokeManager.getStrokes()) {
            if (stroke.isEraser) continue
            inkPaint.color = stroke.color
            inkPaint.strokeWidth = stroke.baseWidth
            canvas.drawPath(stroke.toPath(), inkPaint)
        }

        // 현재 그리는 중인 실시간 획 렌더링 (증분 Path로 딜레이 없는 즉시 렌더링)
        if (activeStroke != null && !activePath.isEmpty) {
            inkPaint.color = activeStroke?.color ?: currentPenColor
            inkPaint.strokeWidth = activeStroke?.baseWidth ?: currentPenWidth
            canvas.drawPath(activePath, inkPaint)
        }
    }

    fun clearAll() {
        strokeManager.clear()
        activeStroke = null
        activePath.reset()
        invalidate()
    }
}
