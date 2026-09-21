package com.prostudy.eink.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.InputStreamReader

data class TourManifest(
    val courseId: String,
    val title: String,
    val totalChapters: Int,
    val totalLessons: Int,
    val chapters: List<TourChapter>
)

data class TourChapter(
    val id: String,
    val title: String,
    val lessons: List<TourLessonMeta>
)

data class TourLessonMeta(
    val id: String,
    val title: String,
    val titleKo: String
)

data class TourLesson(
    val id: String,
    val chapter: String,
    val chapterTitle: String,
    val order: Int,
    val title: String,
    val titleKo: String,
    val summaryKo: String,
    val code: String,
    val entry: String,
    val concepts: List<String>
)

class TourRepository(private val context: Context) {

    private var cachedManifest: TourManifest? = null
    private var cachedLessons: List<TourLesson>? = null

    fun getManifest(): TourManifest {
        cachedManifest?.let { return it }

        val jsonStr = context.assets.open("tour/manifest.json").use {
            InputStreamReader(it, "UTF-8").readText()
        }
        val obj = JSONObject(jsonStr)

        val chaptersJson = obj.getJSONArray("chapters")
        val chapters = mutableListOf<TourChapter>()

        for (i in 0 until chaptersJson.length()) {
            val chapObj = chaptersJson.getJSONObject(i)
            val lessonsJson = chapObj.getJSONArray("lessons")
            val lessons = mutableListOf<TourLessonMeta>()

            for (j in 0 until lessonsJson.length()) {
                val lObj = lessonsJson.getJSONObject(j)
                lessons.add(
                    TourLessonMeta(
                        id = lObj.getString("id"),
                        title = lObj.getString("title"),
                        titleKo = lObj.getString("titleKo")
                    )
                )
            }

            chapters.add(
                TourChapter(
                    id = chapObj.getString("id"),
                    title = chapObj.getString("title"),
                    lessons = lessons
                )
            )
        }

        val manifest = TourManifest(
            courseId = obj.getString("courseId"),
            title = obj.getString("title"),
            totalChapters = obj.getInt("totalChapters"),
            totalLessons = obj.getInt("totalLessons"),
            chapters = chapters
        )
        cachedManifest = manifest
        return manifest
    }

    fun getAllLessons(): List<TourLesson> {
        cachedLessons?.let { return it }

        val jsonStr = context.assets.open("tour/lessons.json").use {
            InputStreamReader(it, "UTF-8").readText()
        }
        val array = JSONArray(jsonStr)
        val list = mutableListOf<TourLesson>()

        for (i in 0 until array.length()) {
            val obj = array.getJSONObject(i)
            val conceptsJson = obj.optJSONArray("concepts")
            val concepts = mutableListOf<String>()
            if (conceptsJson != null) {
                for (k in 0 until conceptsJson.length()) {
                    concepts.add(conceptsJson.getString(k))
                }
            }

            list.add(
                TourLesson(
                    id = obj.getString("id"),
                    chapter = obj.getString("chapter"),
                    chapterTitle = obj.getString("chapterTitle"),
                    order = obj.getInt("order"),
                    title = obj.getString("title"),
                    titleKo = obj.getString("titleKo"),
                    summaryKo = obj.getString("summaryKo"),
                    code = obj.getString("code"),
                    entry = obj.getString("entry"),
                    concepts = concepts
                )
            )
        }

        cachedLessons = list
        return list
    }

    fun getLesson(id: String): TourLesson? {
        return getAllLessons().firstOrNull { it.id == id }
    }
}
