package com.prostudy.eink.data.model

import org.json.JSONObject

data class ProjectSummary(
    val id: String,
    val lang: String,
    val order: Int,
    val title: String,
    val summary: String,
    val difficulty: Int,
    val concepts: List<String>,
    val entry: String,
    val assetFile: String
) {
    companion object {
        fun fromJson(obj: JSONObject): ProjectSummary {
            val conceptsArr = obj.optJSONArray("concepts")
            val concepts = mutableListOf<String>()
            if (conceptsArr != null) {
                for (i in 0 until conceptsArr.length()) {
                    concepts.add(conceptsArr.getString(i))
                }
            }
            return ProjectSummary(
                id = obj.getString("id"),
                lang = obj.getString("lang"),
                order = obj.getInt("order"),
                title = obj.getString("title"),
                summary = obj.optString("summary", ""),
                difficulty = obj.optInt("difficulty", 1),
                concepts = concepts,
                entry = obj.optString("entry", "main.c"),
                assetFile = obj.optString("assetFile", "")
            )
        }
    }
}

data class ProjectDetail(
    val id: String,
    val lang: String,
    val order: Int,
    val title: String,
    val summary: String,
    val difficulty: Int,
    val concepts: List<String>,
    val entry: String,
    val readme: String,
    val starterCode: Map<String, String>,
    val solutionCode: Map<String, String>
) {
    companion object {
        fun fromJson(obj: JSONObject): ProjectDetail {
            val conceptsArr = obj.optJSONArray("concepts")
            val concepts = mutableListOf<String>()
            if (conceptsArr != null) {
                for (i in 0 until conceptsArr.length()) {
                    concepts.add(conceptsArr.getString(i))
                }
            }

            fun parseCodeMap(key: String): Map<String, String> {
                val map = mutableMapOf<String, String>()
                val codeObj = obj.optJSONObject(key) ?: return map
                val keys = codeObj.keys()
                while (keys.hasNext()) {
                    val k = keys.next()
                    map[k] = codeObj.getString(k)
                }
                return map
            }

            return ProjectDetail(
                id = obj.getString("id"),
                lang = obj.getString("lang"),
                order = obj.getInt("order"),
                title = obj.getString("title"),
                summary = obj.optString("summary", ""),
                difficulty = obj.optInt("difficulty", 1),
                concepts = concepts,
                entry = obj.optString("entry", "main.c"),
                readme = obj.optString("readme", ""),
                starterCode = parseCodeMap("starterCode"),
                solutionCode = parseCodeMap("solutionCode")
            )
        }
    }
}
