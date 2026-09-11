package com.prostudy.eink

import com.prostudy.eink.ui.ink.InkPoint
import com.prostudy.eink.ui.ink.Stroke
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class StrokeTest {

    @Test
    fun testPointCreationAndProperties() {
        val pt = InkPoint(10.5f, 20.5f, 0.8f, 12345L)
        assertEquals(10.5f, pt.x, 0.001f)
        assertEquals(20.5f, pt.y, 0.001f)
        assertEquals(0.8f, pt.pressure, 0.001f)
        assertEquals(12345L, pt.timestamp)
    }

    @Test
    fun testStrokeIntersectionHitTest() {
        val stroke = Stroke(
            color = 0xFF000000.toInt(),
            baseWidth = 4.0f,
            isEraser = false
        )
        stroke.addPoint(InkPoint(100f, 100f))
        stroke.addPoint(InkPoint(150f, 100f))
        stroke.addPoint(InkPoint(200f, 100f))

        assertEquals(3, stroke.points.size)

        // 150, 100 지점과 정확히 일치
        assertTrue(stroke.intersects(150f, 100f, 10f))
        // 105, 105 지점은 100, 100에서 sqrt(25+25)=7.07 거리 -> threshold 10 이내이므로 true
        assertTrue(stroke.intersects(105f, 105f, 10f))
        // 300, 300 지점은 멀리 떨어져 있으므로 false
        assertFalse(stroke.intersects(300f, 300f, 10f))
    }

    @Test
    fun testStrokeBoundsAndVisibility() {
        val stroke = Stroke()
        stroke.addPoint(InkPoint(50f, 100f))
        stroke.addPoint(InkPoint(120f, 250f))
        stroke.addPoint(InkPoint(80f, 180f))

        assertEquals(50f, stroke.minX, 0.001f)
        assertEquals(100f, stroke.minY, 0.001f)
        assertEquals(120f, stroke.maxX, 0.001f)
        assertEquals(250f, stroke.maxY, 0.001f)

        // 뷰포트 범위 0..80: maxY(250) >= 0 이지만 minY(100) > 80 이므로 false
        assertFalse(stroke.isVisibleIn(0f, 80f))
        // 뷰포트 범위 300..400: maxY(250) < 300 이므로 false
        assertFalse(stroke.isVisibleIn(300f, 400f))
        // 뷰포트 범위 50..150: 100..250과 교차하므로 true
        assertTrue(stroke.isVisibleIn(50f, 150f))
        // 뷰포트 범위 200..300: 100..250과 교차하므로 true
        assertTrue(stroke.isVisibleIn(200f, 300f))
    }
}
