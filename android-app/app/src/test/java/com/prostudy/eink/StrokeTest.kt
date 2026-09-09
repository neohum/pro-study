package com.prostudy.eink

import com.prostudy.eink.ui.ink.InkPoint
import com.prostudy.eink.ui.ink.Stroke
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class StrokeTest {

    @Test
    fun testPointJsonSerialization() {
        val pt = InkPoint(10.5f, 20.5f, 0.8f, 12345L)
        val json = pt.toJson()
        val restored = InkPoint.fromJson(json)

        assertEquals(10.5f, restored.x, 0.001f)
        assertEquals(20.5f, restored.y, 0.001f)
        assertEquals(0.8f, restored.pressure, 0.001f)
        assertEquals(12345L, restored.timestamp)
    }

    @Test
    fun testStrokeSerializationAndIntersection() {
        val stroke = Stroke(
            color = 0xFF000000.toInt(),
            baseWidth = 4.0f,
            isEraser = false
        )
        stroke.addPoint(InkPoint(100f, 100f))
        stroke.addPoint(InkPoint(150f, 100f))
        stroke.addPoint(InkPoint(200f, 100f))

        // Hit testing
        assertTrue(stroke.intersects(150f, 100f, 10f))
        assertTrue(stroke.intersects(105f, 105f, 10f))
        assertFalse(stroke.intersects(300f, 300f, 10f))

        // Serialization
        val json = stroke.toJson()
        val restored = Stroke.fromJson(json)

        assertEquals(3, restored.points.size)
        assertEquals(stroke.color, restored.color)
        assertEquals(stroke.baseWidth, restored.baseWidth, 0.001f)
        assertFalse(restored.isEraser)

        // Path generation
        val path = restored.toPath()
        assertNotNull(path)
    }
}
