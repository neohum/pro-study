package com.prostudy.eink.data

import android.content.Context
import com.prostudy.eink.data.model.ProjectDetail
import com.prostudy.eink.data.model.ProjectSummary
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader

class ContentRepository(private val context: Context) {

    private var cachedManifest: List<ProjectSummary>? = null

    fun getProjects(lang: String? = null): List<ProjectSummary> {
        val all = cachedManifest ?: loadManifest().also { cachedManifest = it }
        return if (lang != null) {
            all.filter { it.lang.equals(lang, ignoreCase = true) }
        } else {
            all
        }
    }

    fun getProjectDetail(id: String): ProjectDetail? {
        val summary = getProjects().find { it.id == id }
        val fileName = summary?.assetFile?.takeIf { it.isNotBlank() } ?: run {
            val parts = id.split("/")
            if (parts.size != 2) return null
            val lang = parts[0]
            val slug = parts[1].replace("-", "_")
            "content/${lang}_${slug}.json"
        }

        return try {
            val jsonStr = readAssetFile(fileName)
            val obj = JSONObject(jsonStr)
            ProjectDetail.fromJson(obj)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun loadManifest(): List<ProjectSummary> {
        return try {
            val jsonStr = readAssetFile("content/manifest.json")
            val obj = JSONObject(jsonStr)
            val arr = obj.getJSONArray("projects")
            val list = mutableListOf<ProjectSummary>()
            for (i in 0 until arr.length()) {
                list.add(ProjectSummary.fromJson(arr.getJSONObject(i)))
            }
            list
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    private fun readAssetFile(path: String): String {
        val inputStream = context.assets.open(path)
        val reader = BufferedReader(InputStreamReader(inputStream, Charsets.UTF_8))
        return reader.use { it.readText() }
    }
}
