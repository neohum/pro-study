package com.prostudy.eink.ui.ink

import android.graphics.Path
import org.json.JSONArray
import org.json.JSONObject

data class InkPoint(
    val x: Float,
    val y: Float,
    val pressure: Float = 1.0f,
    val timestamp: Long = System.currentTimeMillis()
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("x", x.toDouble())
        put("y", y.toDouble())
        put("p", pressure.toDouble())
        put("t", timestamp)
    }

    companion object {
        fun fromJson(obj: JSONObject): InkPoint {
            return InkPoint(
                x = obj.getDouble("x").toFloat(),
                y = obj.getDouble("y").toFloat(),
                pressure = obj.optDouble("p", 1.0).toFloat(),
                timestamp = obj.optLong("t", 0L)
            )
        }
    }
}

data class Stroke(
    val points: MutableList<InkPoint> = mutableListOf(),
    val color: Int = 0xFF000000.toInt(), // E-ink 순흑색
    val baseWidth: Float = 3.0f,
    val isEraser: Boolean = false
) {
    @Transient
    private var cachedPath: Path? = null

    @Transient
    var minX: Float = Float.MAX_VALUE
        private set
    @Transient
    var minY: Float = Float.MAX_VALUE
        private set
    @Transient
    var maxX: Float = Float.MIN_VALUE
        private set
    @Transient
    var maxY: Float = Float.MIN_VALUE
        private set

    init {
        for (p in points) {
            updateBounds(p.x, p.y)
        }
    }

    private fun updateBounds(x: Float, y: Float) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
    }

    fun addPoint(p: InkPoint) {
        points.add(p)
        cachedPath = null
        updateBounds(p.x, p.y)
    }

    fun isVisibleIn(top: Float, bottom: Float): Boolean {
        if (points.isEmpty()) return false
        return maxY >= top && minY <= bottom
    }

    fun toPath(): Path {
        cachedPath?.let { return it }
        val path = Path()
        if (points.isEmpty()) return path

        path.moveTo(points[0].x, points[0].y)
        if (points.size == 1) {
            path.lineTo(points[0].x + 0.1f, points[0].y + 0.1f)
        } else {
            for (i in 1 until points.size) {
                val prev = points[i - 1]
                val curr = points[i]
                val midX = (prev.x + curr.x) / 2f
                val midY = (prev.y + curr.y) / 2f
                path.quadTo(prev.x, prev.y, midX, midY)
            }
            val last = points.last()
            path.lineTo(last.x, last.y)
        }
        cachedPath = path
        return path
    }

    fun intersects(x: Float, y: Float, threshold: Float = 15f): Boolean {
        for (p in points) {
            val dx = p.x - x
            val dy = p.y - y
            if (dx * dx + dy * dy <= threshold * threshold) {
                return true
            }
        }
        return false
    }

    fun toJson(): JSONObject = JSONObject().apply {
        val ptsArr = JSONArray()
        for (p in points) ptsArr.put(p.toJson())
        put("pts", ptsArr)
        put("c", color)
        put("w", baseWidth.toDouble())
        put("e", isEraser)
    }

    companion object {
        fun fromJson(obj: JSONObject): Stroke {
            val stroke = Stroke(
                color = obj.optInt("c", 0xFF000000.toInt()),
                baseWidth = obj.optDouble("w", 3.0).toFloat(),
                isEraser = obj.optBoolean("e", false)
            )
            val ptsArr = obj.optJSONArray("pts")
            if (ptsArr != null) {
                for (i in 0 until ptsArr.length()) {
                    stroke.points.add(InkPoint.fromJson(ptsArr.getJSONObject(i)))
                }
            }
            return stroke
        }
    }
}
