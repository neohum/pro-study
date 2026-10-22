package com.prostudy.eink.ui.ink

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.InputDevice
import android.view.MotionEvent
import android.view.View

/**
 * InkingOverlayView
 * 
 * E-ink 디바이스를 위한 고속 투명 잉킹 오버레이 뷰.
 * 
 * 핵심 메커니즘 (Palm Rejection & Touch/Stylus 분리 & 스크롤 동기화):
 * 1. MotionEvent.TOOL_TYPE_STYLUS / TOOL_TYPE_ERASER:
 *    - 펜 또는 지우개 도구로 인식되면 이벤트를 완전히 가로채어(return true) 부드러운 베지어 획을 드로잉.
 *    - 문서 좌표계(docY = screenY + scrollYOffset)로 기록되어 손가락 스크롤 시에도 텍스트 위치에 정확히 고정.
 *    - 스타일러스가 터치 중일 때는 손바닥(Palm) 터치를 완전히 차단.
 * 2. MotionEvent.TOOL_TYPE_FINGER:
 *    - 손가락 터치는 이벤트를 소비하지 않고(return false) 하위 뷰(NestedScrollView 등)로 전달하여
 *      손가락으로 본문과 코드를 부드럽게 스크롤 및 메뉴 클릭할 수 있도록 허용.
 */
class InkingOverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    init {
        setLayerType(LAYER_TYPE_HARDWARE, null)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        OnyxEPDHelper.applyFastDrawingMode(this)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        OnyxEPDHelper.stopFastDrawingMode(this)
    }

    val strokeManager = StrokeManager(context)

    var isEraserMode: Boolean = false
    var currentPenWidth: Float = 3.5f
    var currentPenColor: Int = Color.BLACK // E-ink 고대비 순흑색
    var forceTouchDrawing: Boolean = false // 기기에 스타일러스가 없을 때 테스트/수동 허용용

    var scrollYOffset: Int = 0
        set(value) {
            if (field != value) {
                field = value
                invalidate()
            }
        }

    private var activeStroke: Stroke? = null
    private var isStylusActive = false

    private val inkPaint = Paint().apply {
        isAntiAlias = true
        color = Color.BLACK
        style = Paint.Style.STROKE
        strokeJoin = Paint.Join.ROUND
        strokeCap = Paint.Cap.ROUND
        strokeWidth = currentPenWidth
    }

    private fun isStylusOrEraserEvent(event: MotionEvent, pointerIndex: Int): Boolean {
        if (forceTouchDrawing) return true

        val toolType = event.getToolType(pointerIndex)
        if (toolType == MotionEvent.TOOL_TYPE_STYLUS || toolType == MotionEvent.TOOL_TYPE_ERASER) {
            return true
        }

        val buttonState = event.buttonState
        if ((buttonState and MotionEvent.BUTTON_STYLUS_PRIMARY) != 0 ||
            (buttonState and MotionEvent.BUTTON_STYLUS_SECONDARY) != 0) {
            return true
        }

        return false
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        val action = event.actionMasked
        val pointerIndex = event.actionIndex
        val toolType = event.getToolType(pointerIndex)
        val isStylusOrEraser = isStylusOrEraserEvent(event, pointerIndex)

        // 1. 손가락 터치(FINGER) 처리:
        // 스타일러스가 화면에 닿아있지 않은 상태에서 손가락이 들어오면 하위 스크롤 뷰/버튼으로 전달 (return false)
        if (!isStylusOrEraser) {
            if (isStylusActive) {
                // 스타일러스 입력 도중 손바닥이 닿았을 때 완벽한 Palm Rejection (이벤트 차단)
                return true
            }
            return false
        }

        // 2. 스타일러스 입력 처리 (펜 및 지우개) -> 스크롤 오프셋을 반영한 문서 좌표로 변환
        val screenX = event.getX(pointerIndex)
        val screenY = event.getY(pointerIndex)
        val docX = screenX
        val docY = screenY + scrollYOffset.toFloat()

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
                    val stroke = Stroke(
                        color = currentPenColor,
                        baseWidth = currentPenWidth,
                        isEraser = false
                    )
                    stroke.addPoint(InkPoint(docX, docY, pressure))
                    activeStroke = stroke
                    invalidate()
                }
                return true
            }

            MotionEvent.ACTION_MOVE -> {
                val historySize = event.historySize
                if (effectiveEraser) {
                    var changed = false
                    for (h in 0 until historySize) {
                        val hx = event.getHistoricalX(pointerIndex, h)
                        val hy = event.getHistoricalY(pointerIndex, h) + scrollYOffset.toFloat()
                        if (strokeManager.removeStrokesNear(hx, hy)) {
                            changed = true
                        }
                    }
                    if (strokeManager.removeStrokesNear(docX, docY)) {
                        changed = true
                    }
                    if (changed) invalidate()
                } else {
                    activeStroke?.let { stroke ->
                        for (h in 0 until historySize) {
                            val hx = event.getHistoricalX(pointerIndex, h)
                            val hy = event.getHistoricalY(pointerIndex, h) + scrollYOffset.toFloat()
                            val hp = event.getHistoricalPressure(pointerIndex, h)
                            stroke.addPoint(InkPoint(hx, hy, hp))
                        }
                        stroke.addPoint(InkPoint(docX, docY, pressure))
                        invalidate()
                    }
                }
                return true
            }

            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                isStylusActive = false
                parent?.requestDisallowInterceptTouchEvent(false)

                if (!effectiveEraser) {
                    activeStroke?.let { stroke ->
                        stroke.finish(InkPoint(docX, docY, pressure))
                        strokeManager.addStroke(stroke)
                        activeStroke = null
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

        canvas.save()
        // 스크롤 오프셋을 역방향으로 이동하여 스크롤 위치와 완벽히 일치시킴
        canvas.translate(0f, -scrollYOffset.toFloat())

        // 저장된 기존 획 렌더링
        for (stroke in strokeManager.getStrokes()) {
            if (stroke.isEraser) continue
            inkPaint.color = stroke.color
            inkPaint.strokeWidth = stroke.baseWidth
            canvas.drawPath(stroke.toPath(), inkPaint)
        }

        // 현재 그리는 중인 실시간 획 렌더링 (지연 없는 즉시 렌더링)
        activeStroke?.let { stroke ->
            inkPaint.color = stroke.color
            inkPaint.strokeWidth = stroke.baseWidth
            canvas.drawPath(stroke.toPath(), inkPaint)
        }

        canvas.restore()
    }

    fun undo(): Boolean {
        val res = strokeManager.undo()
        if (res) invalidate()
        return res
    }

    fun redo(): Boolean {
        val res = strokeManager.redo()
        if (res) invalidate()
        return res
    }

    fun clearAll() {
        strokeManager.clear()
        activeStroke = null
        invalidate()
    }
}
