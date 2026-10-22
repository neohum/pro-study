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
    fun testStrokeMultiplePointsDistanceAndProperties() {
        val stroke = Stroke(
            color = 0xFF112233.toInt(),
            baseWidth = 5.0f,
            isEraser = false
        )
        stroke.addPoint(InkPoint(10f, 20f, 0.5f, 1000L))
        stroke.addPoint(InkPoint(30f, 40f, 0.9f, 2000L))

        assertEquals(2, stroke.points.size)
        assertEquals(0xFF112233.toInt(), stroke.color)
        assertEquals(5.0f, stroke.baseWidth, 0.001f)
        assertFalse(stroke.isEraser)

        assertEquals(10f, stroke.points[0].x, 0.001f)
        assertEquals(20f, stroke.points[0].y, 0.001f)
        assertEquals(0.5f, stroke.points[0].pressure, 0.001f)

        assertEquals(30f, stroke.points[1].x, 0.001f)
        assertEquals(40f, stroke.points[1].y, 0.001f)
        assertEquals(0.9f, stroke.points[1].pressure, 0.001f)

        // Near point 1 (within 5px)
        assertTrue(stroke.intersects(12f, 22f, 5f))
        // Near point 2 (within 5px)
        assertTrue(stroke.intersects(28f, 38f, 5f))
        // Far away point
        assertFalse(stroke.intersects(100f, 100f, 5f))
    }
}
