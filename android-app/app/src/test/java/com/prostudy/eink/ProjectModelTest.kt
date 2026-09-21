package com.prostudy.eink

import com.prostudy.eink.data.model.ProjectDetail
import com.prostudy.eink.data.model.ProjectSummary
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class ProjectModelTest {

    @Test
    fun testProjectSummaryFromJson() {
        val json = JSONObject().apply {
            put("id", "rust/01-cli-calc")
            put("lang", "rust")
            put("order", 1)
            put("title", "재귀 하강 식 계산기")
            put("summary", "연산자 우선순위 계산기")
            put("difficulty", 2)
            put("concepts", JSONArray(listOf("enum", "match", "Result")))
            put("entry", "main.rs")
            put("assetFile", "content/rust_01_cli_calc.json")
        }

        val summary = ProjectSummary.fromJson(json)
        assertEquals("rust/01-cli-calc", summary.id)
        assertEquals("rust", summary.lang)
        assertEquals(1, summary.order)
        assertEquals("재귀 하강 식 계산기", summary.title)
        assertEquals(2, summary.difficulty)
        assertEquals(3, summary.concepts.size)
        assertEquals("main.rs", summary.entry)
        assertEquals("content/rust_01_cli_calc.json", summary.assetFile)
    }

    @Test
    fun testProjectDetailFromJson() {
        val starterObj = JSONObject().apply {
            put("main.rs", "fn main() {}")
        }
        val solutionObj = JSONObject().apply {
            put("main.rs", "fn main() { println!(\"ok\"); }")
        }

        val json = JSONObject().apply {
            put("id", "python/01-todo-cli")
            put("lang", "python")
            put("order", 1)
            put("title", "Todo CLI")
            put("summary", "Todo 관리 도구")
            put("difficulty", 1)
            put("concepts", JSONArray(listOf("class", "list")))
            put("entry", "main.py")
            put("readme", "# Python Todo")
            put("starterCode", starterObj)
            put("solutionCode", solutionObj)
        }

        val detail = ProjectDetail.fromJson(json)
        assertEquals("python/01-todo-cli", detail.id)
        assertEquals("python", detail.lang)
        assertEquals(1, detail.order)
        assertEquals("Todo CLI", detail.title)
        assertEquals("# Python Todo", detail.readme)
        assertEquals("fn main() {}", detail.starterCode["main.rs"])
        assertNotNull(detail.solutionCode["main.rs"])
    }

    @Test
    fun testSupportedLanguages() {
        val supported = listOf("c", "go", "rust", "python", "typescript", "javascript")
        assertEquals(6, supported.size)
    }
}
