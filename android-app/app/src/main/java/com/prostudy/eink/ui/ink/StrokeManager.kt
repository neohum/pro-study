package com.prostudy.eink.ui.ink

import android.content.Context
import org.json.JSONArray
import java.io.File

class StrokeManager(private val context: Context) {

    private val strokes = mutableListOf<Stroke>()
    private val undoStack = mutableListOf<List<Stroke>>()
    private val redoStack = mutableListOf<List<Stroke>>()

    fun getStrokes(): List<Stroke> = strokes

    fun addStroke(stroke: Stroke) {
        saveState()
        strokes.add(stroke)
        redoStack.clear()
    }

    fun removeStrokesNear(x: Float, y: Float, threshold: Float = 24f): Boolean {
        val toRemove = strokes.filter { it.intersects(x, y, threshold) }
        if (toRemove.isNotEmpty()) {
            saveState()
            strokes.removeAll(toRemove)
            redoStack.clear()
            return true
        }
        return false
    }

    fun clear() {
        if (strokes.isNotEmpty()) {
            saveState()
            strokes.clear()
            redoStack.clear()
        }
    }

    fun undo(): Boolean {
        if (undoStack.isEmpty()) return false
        redoStack.add(ArrayList(strokes))
        val prev = undoStack.removeAt(undoStack.size - 1)
        strokes.clear()
        strokes.addAll(prev)
        return true
    }

    fun redo(): Boolean {
        if (redoStack.isEmpty()) return false
        undoStack.add(ArrayList(strokes))
        val next = redoStack.removeAt(redoStack.size - 1)
        strokes.clear()
        strokes.addAll(next)
        return true
    }

    fun saveToFile(sessionId: String) {
        try {
            val file = getSessionFile(sessionId)
            val arr = JSONArray()
            for (s in strokes) {
                arr.put(s.toJson())
            }
            file.writeText(arr.toString(), Charsets.UTF_8)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun loadFromFile(sessionId: String) {
        strokes.clear()
        undoStack.clear()
        redoStack.clear()
        try {
            val file = getSessionFile(sessionId)
            if (!file.exists()) return
            val arr = JSONArray(file.readText(Charsets.UTF_8))
            for (i in 0 until arr.length()) {
                strokes.add(Stroke.fromJson(arr.getJSONObject(i)))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun saveState() {
        undoStack.add(ArrayList(strokes))
        if (undoStack.size > 20) {
            undoStack.removeAt(0)
        }
    }

    private fun getSessionFile(sessionId: String): File {
        val dir = File(context.filesDir, "ink_sessions")
        if (!dir.exists()) dir.mkdirs()
        val safeName = sessionId.replace("/", "_").replace(".", "_") + ".ink.json"
        return File(dir, safeName)
    }
}
