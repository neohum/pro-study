package com.prostudy.eink.ui.math

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import android.view.animation.LinearInterpolator
import kotlin.math.*

enum class GraphType {
    NONE,
    NUMBER_LINE,          // 중1: 수직선과 정수/유리수/절댓값
    COORDINATE_PLANE,     // 중1: x, y 좌표평면, 사분면, 점 표시
    LINEAR_FUNCTION,      // 중2: 일차함수 y = ax + b 직선 및 기울기
    PYTHAGORAS,           // 중2: 피타고라스 직각삼각형 (3:4:5)
    PARABOLA,             // 중3: 이차함수 y = ax^2 포물선 및 꼭짓점
    SINE_COSINE,          // 고등: 사인 & 코사인 파동 주기 그래프
    UNIT_CIRCLE           // 고등: 단위원 및 각도 theta 회전
}

class MathGraphView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var graphType: GraphType = GraphType.COORDINATE_PLANE
    private var paramA: Float = 1f
    private var paramB: Float = 0f

    private var animProgress: Float = 0f
    private var animator: ValueAnimator? = null
    var isAnimationEnabled: Boolean = true
        set(value) {
            field = value
            if (value) startAnimation() else stopAnimation()
        }

    private val axisPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.BLACK
        strokeWidth = 3f
        style = Paint.Style.STROKE
    }

    private val gridPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.LTGRAY
        strokeWidth = 1.5f
        style = Paint.Style.STROKE
    }

    private val curvePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.BLACK
        strokeWidth = 4.5f
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
    }

    private val dashedCurvePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.DKGRAY
        strokeWidth = 3.5f
        style = Paint.Style.STROKE
        pathEffect = DashPathEffect(floatArrayOf(12f, 8f), 0f)
    }

    private val dotPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.BLACK
        style = Paint.Style.FILL
    }

    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.BLACK
        textSize = 28f
        typeface = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD)
    }

    private val subTextPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.DKGRAY
        textSize = 22f
        typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
    }

    init {
        startAnimation()
    }

    fun setGraphType(type: GraphType, a: Float = 1f, b: Float = 0f) {
        this.graphType = type
        this.paramA = a
        this.paramB = b
        visibility = if (type == GraphType.NONE) GONE else VISIBLE
        invalidate()
    }

    private fun startAnimation() {
        animator?.cancel()
        animator = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = 4000L
            repeatCount = ValueAnimator.INFINITE
            interpolator = LinearInterpolator()
            addUpdateListener {
                animProgress = it.animatedValue as Float
                invalidate()
            }
            start()
        }
    }

    private fun stopAnimation() {
        animator?.cancel()
        animator = null
        animProgress = 0.5f
        invalidate()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        stopAnimation()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (width <= 0 || height <= 0 || graphType == GraphType.NONE) return

        canvas.drawColor(Color.WHITE)

        when (graphType) {
            GraphType.NUMBER_LINE -> drawNumberLine(canvas)
            GraphType.COORDINATE_PLANE -> drawCoordinatePlane(canvas)
            GraphType.LINEAR_FUNCTION -> drawLinearFunction(canvas)
            GraphType.PYTHAGORAS -> drawPythagoras(canvas)
            GraphType.PARABOLA -> drawParabola(canvas)
            GraphType.SINE_COSINE -> drawSineCosine(canvas)
            GraphType.UNIT_CIRCLE -> drawUnitCircle(canvas)
            GraphType.NONE -> {}
        }
    }

    // 1. 중1: 수직선 (Number Line)
    private fun drawNumberLine(canvas: Canvas) {
        val cy = height / 2f
        val padding = 60f
        val startX = padding
        val endX = width - padding

        // 기준 가로선
        canvas.drawLine(startX, cy, endX, cy, axisPaint)
        // 양쪽 화살표
        canvas.drawLine(endX, cy, endX - 20f, cy - 12f, axisPaint)
        canvas.drawLine(endX, cy, endX - 20f, cy + 12f, axisPaint)

        val originX = width / 2f
        val step = (width - padding * 2) / 10f

        for (i in -4..4) {
            val x = originX + i * step
            canvas.drawLine(x, cy - 12f, x, cy + 12f, axisPaint)
            val label = i.toString()
            val textWidth = textPaint.measureText(label)
            canvas.drawText(label, x - textWidth / 2f, cy + 45f, textPaint)
        }

        // 움직이는 점과 절댓값 표시
        val animXVal = -3f + animProgress * 6f
        val curX = originX + animXVal * step
        canvas.drawCircle(curX, cy, 12f, dotPaint)

        val info = String.format("x = %.1f  (|x| = %.1f)", animXVal, abs(animXVal))
        canvas.drawText(info, 40f, 60f, textPaint)
        canvas.drawText("수직선: 0을 기준으로 오른쪽은 양의 부호(+), 왼쪽은 음의 부호(-)", 40f, height - 30f, subTextPaint)
    }

    // 2. 중1: x, y 좌표평면 (Coordinate Plane)
    private fun drawCoordinatePlane(canvas: Canvas) {
        val cx = width / 2f
        val cy = height / 2f
        val step = 45f

        // 보조 격자선
        var x = cx % step
        while (x < width) {
            canvas.drawLine(x, 0f, x, height.toFloat(), gridPaint)
            x += step
        }
        var y = cy % step
        while (y < height) {
            canvas.drawLine(0f, y, width.toFloat(), y, gridPaint)
            y += step
        }

        // X, Y축
        canvas.drawLine(0f, cy, width.toFloat(), cy, axisPaint)
        canvas.drawLine(cx, 0f, cx, height.toFloat(), axisPaint)

        // 축 화살표 & 라벨
        canvas.drawText("x", width - 35f, cy - 15f, textPaint)
        canvas.drawText("y", cx + 15f, 40f, textPaint)
        canvas.drawText("O (0,0)", cx - 80f, cy + 35f, textPaint)

        // 사분면 표기
        canvas.drawText("제1사분면 (+,+)", cx + 40f, cy - 80f, subTextPaint)
        canvas.drawText("제2사분면 (-,+)", cx - 180f, cy - 80f, subTextPaint)
        canvas.drawText("제3사분면 (-,-)", cx - 180f, cy + 90f, subTextPaint)
        canvas.drawText("제4사분면 (+,-)", cx + 40f, cy + 90f, subTextPaint)

        // 움직이는 점 P(x, y)
        val angle = animProgress * 2 * PI
        val px = (cx + cos(angle) * 120f).toFloat()
        val py = (cy - sin(angle) * 100f).toFloat()

        canvas.drawLine(px, cy, px, py, dashedCurvePaint)
        canvas.drawLine(cx, py, px, py, dashedCurvePaint)
        canvas.drawCircle(px, py, 11f, dotPaint)

        val ptLabel = String.format("P(%.1f, %.1f)", (px - cx) / step, -(py - cy) / step)
        canvas.drawText(ptLabel, px + 15f, py - 15f, textPaint)
    }

    // 3. 중2: 일차함수 y = ax + b (Linear Function)
    private fun drawLinearFunction(canvas: Canvas) {
        val cx = width / 2f
        val cy = height / 2f
        val scale = 35f

        // X, Y 축
        canvas.drawLine(0f, cy, width.toFloat(), cy, axisPaint)
        canvas.drawLine(cx, 0f, cx, height.toFloat(), axisPaint)

        val a = if (paramA != 0f) paramA else 2f  // 기본 기울기 2
        val b = paramB                            // 기본 절편 0

        // y = ax + b 직선 그리기
        val path = Path()
        val startX = -10f
        val endX = 10f
        val screenStartX = cx + startX * scale
        val screenStartY = cy - (a * startX + b) * scale
        val screenEndX = cx + endX * scale
        val screenEndY = cy - (a * endX + b) * scale

        path.moveTo(screenStartX, screenStartY)
        path.lineTo(screenEndX, screenEndY)
        canvas.drawPath(path, curvePaint)

        // y절편 표시 (0, b)
        val interceptY = cy - b * scale
        canvas.drawCircle(cx, interceptY, 9f, dotPaint)
        canvas.drawText(String.format("y절편(0, %.1f)", b), cx + 15f, interceptY + 10f, subTextPaint)

        // 직선 위를 움직이는 점
        val curXVal = -4f + animProgress * 8f
        val curYVal = a * curXVal + b
        val dotScreenX = cx + curXVal * scale
        val dotScreenY = cy - curYVal * scale

        canvas.drawCircle(dotScreenX, dotScreenY, 12f, dotPaint)

        val equation = String.format("y = %.1fx %s %.1f", a, if (b >= 0) "+" else "-", abs(b))
        canvas.drawText("일차함수 식: $equation", 40f, 50f, textPaint)
        val ptText = String.format("현재 점: (%.2f, %.2f) [기울기 m = %.1f]", curXVal, curYVal, a)
        canvas.drawText(ptText, 40f, 90f, subTextPaint)
    }

    // 4. 중2: 피타고라스 직각삼각형 (3:4:5)
    private fun drawPythagoras(canvas: Canvas) {
        val startX = width * 0.25f
        val startY = height * 0.75f
        val aLen = 220f  // 밑변 a = 3
        val bLen = 170f  // 높이 b = 4

        val cornerX = startX + aLen
        val cornerY = startY
        val topX = cornerX
        val topY = startY - bLen

        // 직각삼각형 패스
        val path = Path().apply {
            moveTo(startX, startY)
            lineTo(cornerX, cornerY)
            lineTo(topX, topY)
            close()
        }
        canvas.drawPath(path, curvePaint)

        // 직각 기호 표시
        val sq = 25f
        canvas.drawLine(cornerX - sq, cornerY, cornerX - sq, cornerY - sq, axisPaint)
        canvas.drawLine(cornerX - sq, cornerY - sq, cornerX, cornerY - sq, axisPaint)

        // 변 라벨
        canvas.drawText("밑변 a = 3", startX + aLen / 2f - 40f, startY + 40f, textPaint)
        canvas.drawText("높이 b = 4", cornerX + 20f, startY - bLen / 2f, textPaint)

        val hypMidX = (startX + topX) / 2f
        val hypMidY = (startY + topY) / 2f
        canvas.drawText("빗변 c = 5", hypMidX - 90f, hypMidY - 20f, textPaint)

        // 수식 텍스트
        canvas.drawText("피타고라스 정리: a² + b² = c²", 40f, 50f, textPaint)
        canvas.drawText("3² + 4² = 9 + 16 = 25 = 5²", 40f, 90f, subTextPaint)
        canvas.drawText("빗변 길이 c = √(3² + 4²) = √25 = 5 (L2 Norm)", 40f, 130f, subTextPaint)
    }

    // 5. 중3: 이차함수 포물선 (Parabola)
    private fun drawParabola(canvas: Canvas) {
        val cx = width / 2f
        val cy = height * 0.65f
        val scaleX = 35f
        val scaleY = 15f

        // X, Y축
        canvas.drawLine(0f, cy, width.toFloat(), cy, axisPaint)
        canvas.drawLine(cx, 0f, cx, height.toFloat(), axisPaint)
        canvas.drawText("x", width - 35f, cy - 10f, textPaint)
        canvas.drawText("y", cx + 15f, 40f, textPaint)

        // y = x^2 포물선
        val path = Path()
        var first = true
        var xVal = -6f
        while (xVal <= 6f) {
            val yVal = xVal * xVal
            val sx = cx + xVal * scaleX
            val sy = cy - yVal * scaleY
            if (first) {
                path.moveTo(sx, sy)
                first = false
            } else {
                path.lineTo(sx, sy)
            }
            xVal += 0.2f
        }
        canvas.drawPath(path, curvePaint)

        // 꼭짓점
        canvas.drawCircle(cx, cy, 9f, dotPaint)
        canvas.drawText("꼭짓점(0,0)", cx - 60f, cy + 35f, textPaint)

        // 포물선을 따라 롤러코스터처럼 움직이는 점
        val animX = -5f + animProgress * 10f
        val animY = animX * animX
        val dotX = cx + animX * scaleX
        val dotY = cy - animY * scaleY
        canvas.drawCircle(dotX, dotY, 12f, dotPaint)

        canvas.drawText("이차함수 포물선: y = x²", 40f, 50f, textPaint)
        val posText = String.format("현재 점: (%.2f, %.2f)", animX, animY)
        canvas.drawText(posText, 40f, 90f, subTextPaint)
        canvas.drawText("대칭축 x = 0을 기준으로 좌우 대칭인 포물선 곡선", 40f, height - 30f, subTextPaint)
    }

    // 6. 고등: 사인 & 코사인 주기 파동 그래프 (Sine & Cosine Waves)
    private fun drawSineCosine(canvas: Canvas) {
        val cx = 60f
        val cy = height / 2f
        val amplitude = height * 0.28f
        val wavelength = (width - 100f) / (2 * PI.toFloat())

        // X, Y 중심축
        canvas.drawLine(cx, cy, width.toFloat(), cy, axisPaint)
        canvas.drawLine(cx, 0f, cx, height.toFloat(), axisPaint)

        // +1, -1 진폭선
        canvas.drawLine(cx, cy - amplitude, width.toFloat(), cy - amplitude, gridPaint)
        canvas.drawLine(cx, cy + amplitude, width.toFloat(), cy + amplitude, gridPaint)
        canvas.drawText("+1", 15f, cy - amplitude + 10f, subTextPaint)
        canvas.drawText(" 0", 15f, cy + 10f, subTextPaint)
        canvas.drawText("-1", 15f, cy + amplitude + 10f, subTextPaint)

        // 주파수 파동: y = sin(x) 실선
        val sinPath = Path()
        var stepX = 0f
        var first = true
        while (stepX <= (width - cx)) {
            val angle = stepX / wavelength
            val y = cy - sin(angle) * amplitude
            if (first) {
                sinPath.moveTo(cx + stepX, y)
                first = false
            } else {
                sinPath.lineTo(cx + stepX, y)
            }
            stepX += 3f
        }
        canvas.drawPath(sinPath, curvePaint)

        // 주파수 파동: y = cos(x) 점선
        val cosPath = Path()
        stepX = 0f
        first = true
        while (stepX <= (width - cx)) {
            val angle = stepX / wavelength
            val y = cy - cos(angle) * amplitude
            if (first) {
                cosPath.moveTo(cx + stepX, y)
                first = false
            } else {
                cosPath.lineTo(cx + stepX, y)
            }
            stepX += 3f
        }
        canvas.drawPath(cosPath, dashedCurvePaint)

        // 주기 2π 표시
        val twoPiX = cx + (2 * PI.toFloat() * wavelength)
        canvas.drawLine(twoPiX, cy - 15f, twoPiX, cy + 15f, axisPaint)
        canvas.drawText("2π", twoPiX - 15f, cy + 45f, textPaint)

        // 파동을 타고 움직이는 점 (Sine & Cosine)
        val curAngle = animProgress * 2 * PI.toFloat()
        val dotX = cx + curAngle * wavelength
        val sinY = cy - sin(curAngle) * amplitude
        val cosY = cy - cos(curAngle) * amplitude

        canvas.drawCircle(dotX, sinY, 11f, dotPaint)
        canvas.drawCircle(dotX, cosY, 9f, dotPaint)

        // 범례 & 상태창
        canvas.drawText("삼각함수 파동 그래프 (주기 T = 2π)", 40f, 45f, textPaint)
        canvas.drawText("― 실선: y = sin(x)", 40f, 85f, textPaint)
        canvas.drawText("┄ 점선: y = cos(x)", 40f, 120f, subTextPaint)

        val statText = String.format("θ = %.2f rad  |  sin(θ) = %.2f  |  cos(θ) = %.2f", curAngle, sin(curAngle), cos(curAngle))
        canvas.drawText(statText, 40f, height - 30f, subTextPaint)
    }

    // 7. 고등: 단위원과 각도 회전 (Unit Circle)
    private fun drawUnitCircle(canvas: Canvas) {
        val cx = width / 2f
        val cy = height / 2f
        val radius = min(width, height) * 0.35f

        // X, Y축
        canvas.drawLine(0f, cy, width.toFloat(), cy, axisPaint)
        canvas.drawLine(cx, 0f, cx, height.toFloat(), axisPaint)

        // 단위원 r = 1 원 그리기
        canvas.drawCircle(cx, cy, radius, curvePaint)

        // 움직이는 각도 theta
        val theta = animProgress * 2 * PI.toFloat()
        val px = cx + cos(theta) * radius
        val py = cy - sin(theta) * radius

        // 반지름 선분
        canvas.drawLine(cx, cy, px, py, curvePaint)

        // 직각삼각형 밑변(cos)과 높이(sin)
        canvas.drawLine(cx, cy, px, cy, axisPaint)
        canvas.drawLine(px, cy, px, py, dashedCurvePaint)
        canvas.drawCircle(px, py, 11f, dotPaint)

        canvas.drawText("단위원 (r = 1)과 삼각비 성질", 40f, 45f, textPaint)
        canvas.drawText(String.format("각도 θ: %.1f° (%.2f rad)", Math.toDegrees(theta.toDouble()), theta), 40f, 85f, subTextPaint)
        canvas.drawText(String.format("x좌표 = cos(θ) = %.2f", cos(theta)), 40f, 120f, textPaint)
        canvas.drawText(String.format("y좌표 = sin(θ) = %.2f", sin(theta)), 40f, 155f, textPaint)
        canvas.drawText("피타고라스 항등식: cos²(θ) + sin²(θ) = 1.0", 40f, height - 30f, subTextPaint)
    }
}
