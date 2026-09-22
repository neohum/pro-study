package com.prostudy.eink.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.InputStreamReader

data class MathManifest(
    val courseId: String,
    val title: String,
    val description: String,
    val totalStages: Int,
    val totalModules: Int,
    val stages: List<MathStage>
)

data class MathStage(
    val id: String,
    val title: String,
    val curriculumOrigin: String,
    val modules: List<MathModuleMeta>
)

data class MathModuleMeta(
    val id: String,
    val order: Int,
    val titleKo: String,
    val mathConcept: String,
    val targetAlgorithms: String
)

data class MathTerm(
    val term: String,
    val definition: String
)

data class MathFormula(
    val title: String,
    val latex: String,
    val explanation: String
)

data class MathDerivationStep(
    val stepNumber: Int,
    val mathExpression: String,
    val justification: String
)

data class MathWorkedExample(
    val problem: String,
    val stepsToTrace: List<String>,
    val finalAnswer: String
)

data class MathCodeImpl(
    val lang: String,
    val entryFile: String,
    val code: String,
    val notes: String
)

data class MathProblemItem(
    val problemNumber: Int,
    val title: String,
    val question: String,
    val interpretation: String,
    val solutionSteps: List<String>,
    val answer: String,
    val keyPoint: String
)

data class MathDerivationDetail(
    val title: String,
    val backgroundStory: String,
    val steps: List<MathDerivationStep>,
    val conclusion: String
)

data class MathSymbolGuide(
    val symbol: String,
    val name: String,
    val meaning: String
)

data class MathLesson(
    val id: String,
    val stage: String,
    val order: Int,
    val titleKo: String,
    val titleEn: String,
    val koreanCurriculumUnit: String,
    val graphType: String,
    val graphCaption: String,
    val terms: List<MathTerm>,
    val mathExplanation: String,
    val mathFormulas: List<MathFormula>,
    val symbolGuide: List<MathSymbolGuide> = emptyList(),
    val derivationSteps: List<MathDerivationStep>,
    val derivationDetail: MathDerivationDetail?,
    val workedExample: MathWorkedExample,
    val practiceProblems: List<MathProblemItem>,
    val csIntuition: String,
    val codeImplementations: Map<String, MathCodeImpl>
)

class MathRepository(private val context: Context) {

    private var cachedManifest: MathManifest? = null
    private var cachedLessons: List<MathLesson>? = null

    fun getManifest(): MathManifest {
        cachedManifest?.let { return it }

        val jsonStr = context.assets.open("math-cs/manifest.json").use {
            InputStreamReader(it, "UTF-8").readText()
        }
        val obj = JSONObject(jsonStr)
        val stagesJson = obj.getJSONArray("stages")
        val stages = mutableListOf<MathStage>()

        for (i in 0 until stagesJson.length()) {
            val stObj = stagesJson.getJSONObject(i)
            val modsJson = stObj.getJSONArray("modules")
            val mods = mutableListOf<MathModuleMeta>()

            for (j in 0 until modsJson.length()) {
                val mObj = modsJson.getJSONObject(j)
                mods.add(
                    MathModuleMeta(
                        id = mObj.getString("id"),
                        order = mObj.getInt("order"),
                        titleKo = mObj.getString("titleKo"),
                        mathConcept = mObj.getString("mathConcept"),
                        targetAlgorithms = mObj.getString("targetAlgorithms")
                    )
                )
            }

            stages.add(
                MathStage(
                    id = stObj.getString("id"),
                    title = stObj.getString("title"),
                    curriculumOrigin = stObj.getString("curriculumOrigin"),
                    modules = mods
                )
            )
        }

        val manifest = MathManifest(
            courseId = obj.getString("courseId"),
            title = obj.getString("title"),
            description = obj.getString("description"),
            totalStages = obj.getInt("totalStages"),
            totalModules = obj.getInt("totalModules"),
            stages = stages
        )
        cachedManifest = manifest
        return manifest
    }

    fun getAllLessons(): List<MathLesson> {
        cachedLessons?.let { return it }

        val jsonStr = context.assets.open("math-cs/lessons.json").use {
            InputStreamReader(it, "UTF-8").readText()
        }
        val arr = JSONArray(jsonStr)
        val list = mutableListOf<MathLesson>()

        for (i in 0 until arr.length()) {
            val obj = arr.getJSONObject(i)

            // Formulas
            val formulas = mutableListOf<MathFormula>()
            if (obj.has("mathFormulasToTrace")) {
                val fArr = obj.getJSONArray("mathFormulasToTrace")
                for (f in 0 until fArr.length()) {
                    val fo = fArr.getJSONObject(f)
                    formulas.add(
                        MathFormula(
                            title = fo.getString("title"),
                            latex = fo.getString("latex"),
                            explanation = fo.getString("explanation")
                        )
                    )
                }
            }

            // Symbol Guide (수식 기호 & 문자 뜻풀이)
            val symbolGuide = mutableListOf<MathSymbolGuide>()
            if (obj.has("symbolGuide")) {
                val sgArr = obj.getJSONArray("symbolGuide")
                for (s in 0 until sgArr.length()) {
                    val sObj = sgArr.getJSONObject(s)
                    symbolGuide.add(
                        MathSymbolGuide(
                            symbol = sObj.getString("symbol"),
                            name = sObj.getString("name"),
                            meaning = sObj.getString("meaning")
                        )
                    )
                }
            }

            // Derivation Steps
            val derivations = mutableListOf<MathDerivationStep>()
            if (obj.has("derivationStepsToTrace")) {
                val dArr = obj.getJSONArray("derivationStepsToTrace")
                for (d in 0 until dArr.length()) {
                    val dObj = dArr.getJSONObject(d)
                    derivations.add(
                        MathDerivationStep(
                            stepNumber = dObj.getInt("stepNumber"),
                            mathExpression = dObj.getString("mathExpression"),
                            justification = dObj.getString("justification")
                        )
                    )
                }
            }

            // Worked Example
            var workedExample = MathWorkedExample("", emptyList(), "")
            if (obj.has("workedExample")) {
                val weObj = obj.getJSONObject("workedExample")
                val steps = mutableListOf<String>()
                val sArr = weObj.getJSONArray("stepsToTrace")
                for (s in 0 until sArr.length()) {
                    steps.add(sArr.getString(s))
                }
                workedExample = MathWorkedExample(
                    problem = weObj.getString("problem"),
                    stepsToTrace = steps,
                    finalAnswer = weObj.getString("finalAnswer")
                )
            }

            // Code implementations
            val codeImplMap = mutableMapOf<String, MathCodeImpl>()
            if (obj.has("codeImplementations")) {
                val codeObj = obj.getJSONObject("codeImplementations")
                val langs = listOf("c", "go", "rust", "python", "typescript", "javascript")
                for (lang in langs) {
                    if (codeObj.has(lang)) {
                        val cObj = codeObj.getJSONObject(lang)
                        codeImplMap[lang] = MathCodeImpl(
                            lang = cObj.getString("lang"),
                            entryFile = cObj.getString("entryFile"),
                            code = cObj.getString("code"),
                            notes = cObj.optString("notes", "")
                        )
                    }
                }
            }

            // Terms (기초 용어 풀이)
            val terms = mutableListOf<MathTerm>()
            if (obj.has("terms")) {
                val tArr = obj.getJSONArray("terms")
                for (t in 0 until tArr.length()) {
                    val tObj = tArr.getJSONObject(t)
                    terms.add(
                        MathTerm(
                            term = tObj.getString("term"),
                            definition = tObj.getString("definition")
                        )
                    )
                }
            }

            val graphType = obj.optString("graphType", "NONE")
            val graphCaption = obj.optString("graphCaption", "")

            // Derivation Detail (수식 도출 상세 스토리 & 전개)
            var derivationDetail: MathDerivationDetail? = null
            if (obj.has("derivationDetail")) {
                val ddObj = obj.getJSONObject("derivationDetail")
                val ddSteps = mutableListOf<MathDerivationStep>()
                if (ddObj.has("steps")) {
                    val ddsArr = ddObj.getJSONArray("steps")
                    for (s in 0 until ddsArr.length()) {
                        val so = ddsArr.getJSONObject(s)
                        ddSteps.add(
                            MathDerivationStep(
                                stepNumber = so.getInt("stepNumber"),
                                mathExpression = so.getString("mathExpression"),
                                justification = so.getString("justification")
                            )
                        )
                    }
                }
                derivationDetail = MathDerivationDetail(
                    title = ddObj.optString("title", "수식 도출 원리"),
                    backgroundStory = ddObj.optString("backgroundStory", ""),
                    steps = ddSteps,
                    conclusion = ddObj.optString("conclusion", "")
                )
            }

            // Practice Problems (문제 해석 가이드 + 단계별 풀이 + 오답 방지 팁)
            val practiceProblems = mutableListOf<MathProblemItem>()
            if (obj.has("practiceProblems")) {
                val pArr = obj.getJSONArray("practiceProblems")
                for (p in 0 until pArr.length()) {
                    val pObj = pArr.getJSONObject(p)
                    val pSteps = mutableListOf<String>()
                    if (pObj.has("solutionSteps")) {
                        val psArr = pObj.getJSONArray("solutionSteps")
                        for (ps in 0 until psArr.length()) {
                            pSteps.add(psArr.getString(ps))
                        }
                    } else if (pObj.has("mathSteps")) {
                        val psArr = pObj.getJSONArray("mathSteps")
                        for (ps in 0 until psArr.length()) {
                            pSteps.add(psArr.getString(ps))
                        }
                    }
                    practiceProblems.add(
                        MathProblemItem(
                            problemNumber = pObj.optInt("problemNumber", p + 1),
                            title = pObj.optString("title", "실전 예제 ${p + 1}"),
                            question = pObj.optString("question", pObj.optString("problem", "")),
                            interpretation = pObj.optString("interpretation", pObj.optString("strategy", "")),
                            solutionSteps = pSteps,
                            answer = pObj.optString("answer", pObj.optString("finalAnswer", "")),
                            keyPoint = pObj.optString("keyPoint", pObj.optString("checkPoint", ""))
                        )
                    )
                }
            }

            list.add(
                MathLesson(
                    id = obj.getString("id"),
                    stage = obj.getString("stage"),
                    order = obj.getInt("order"),
                    titleKo = obj.getString("titleKo"),
                    titleEn = obj.getString("titleEn"),
                    koreanCurriculumUnit = obj.optString("koreanCurriculumUnit", ""),
                    graphType = graphType,
                    graphCaption = graphCaption,
                    terms = terms,
                    mathExplanation = obj.optString("mathExplanation", ""),
                    mathFormulas = formulas,
                    symbolGuide = symbolGuide,
                    derivationSteps = derivations,
                    derivationDetail = derivationDetail,
                    workedExample = workedExample,
                    practiceProblems = practiceProblems,
                    csIntuition = obj.optString("csIntuition", ""),
                    codeImplementations = codeImplMap
                )
            )
        }

        cachedLessons = list
        return list
    }
}
