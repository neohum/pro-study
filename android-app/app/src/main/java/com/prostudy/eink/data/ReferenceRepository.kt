package com.prostudy.eink.data

import android.content.Context
import org.json.JSONObject
import java.io.InputStreamReader

data class GrammarItem(
    val id: String,
    val title: String,
    val category: String,
    val summary: String,
    val syntax: String,
    val example: String
)

data class FunctionItem(
    val name: String,
    val signature: String,
    val module: String,
    val description: String,
    val example: String
)

data class ReferenceDoc(
    val lang: String,
    val name: String,
    val version: String,
    val overview: String,
    val grammar: List<GrammarItem>,
    val functions: List<FunctionItem>
)

class ReferenceRepository(private val context: Context) {

    private val cache = mutableMapOf<String, ReferenceDoc>()

    val availableLangs = listOf(
        "c" to "C (C23)",
        "go" to "Go",
        "rust" to "Rust",
        "python" to "Python",
        "typescript" to "TypeScript",
        "javascript" to "JavaScript"
    )

    fun getReference(lang: String): ReferenceDoc? {
        cache[lang]?.let { return it }

        return try {
            val jsonStr = context.assets.open("reference/$lang.json").use {
                InputStreamReader(it, "UTF-8").readText()
            }
            val obj = JSONObject(jsonStr)

            val grammarList = mutableListOf<GrammarItem>()
            val gArr = obj.getJSONArray("grammar")
            for (i in 0 until gArr.length()) {
                val gObj = gArr.getJSONObject(i)
                grammarList.add(
                    GrammarItem(
                        id = gObj.getString("id"),
                        title = gObj.getString("title"),
                        category = gObj.getString("category"),
                        summary = gObj.getString("summary"),
                        syntax = gObj.getString("syntax"),
                        example = gObj.getString("example")
                    )
                )
            }

            val functionList = mutableListOf<FunctionItem>()
            val fArr = obj.getJSONArray("functions")
            for (i in 0 until fArr.length()) {
                val fObj = fArr.getJSONObject(i)
                functionList.add(
                    FunctionItem(
                        name = fObj.getString("name"),
                        signature = fObj.getString("signature"),
                        module = fObj.getString("module"),
                        description = fObj.getString("description"),
                        example = fObj.getString("example")
                    )
                )
            }

            val doc = ReferenceDoc(
                lang = obj.getString("lang"),
                name = obj.getString("name"),
                version = obj.getString("version"),
                overview = obj.getString("overview"),
                grammar = grammarList,
                functions = functionList
            )
            cache[lang] = doc
            doc
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
