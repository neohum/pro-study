package com.prostudy.eink.ui.mathee

import android.annotation.SuppressLint
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import com.prostudy.eink.R
import com.prostudy.eink.util.EinkHelper
import java.util.Locale

class MathEEViewerActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    private lateinit var webView: WebView
    private lateinit var btnBack: Button
    private lateinit var btnRefresh: Button
    private lateinit var btnTtsToggle: Button
    private lateinit var tvTitle: TextView

    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        EinkHelper.applyActivityOptimizations(this)
        setContentView(R.layout.activity_math_ee_viewer)

        initTts()
        bindViews()
        setupWebView()
        setupListeners()
        setupBackNavigation()

        // 오프라인 로컬 에셋 뷰어 로드 (0ms 비행기 모드 구동)
        webView.loadUrl("file:///android_asset/math-ee/viewer.html")
    }

    private fun initTts() {
        tts = TextToSpeech(this, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale.US)
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts?.setLanguage(Locale.getDefault())
            }
            tts?.setSpeechRate(0.9f)
            isTtsReady = true
            btnTtsToggle.text = "🔊 TTS 정상"
        } else {
            isTtsReady = false
            btnTtsToggle.text = "🔇 TTS 미지원"
        }
    }

    private fun bindViews() {
        webView = findViewById(R.id.wv_math_ee_viewer)
        btnBack = findViewById(R.id.btn_ee_back)
        btnRefresh = findViewById(R.id.btn_ee_refresh)
        btnTtsToggle = findViewById(R.id.btn_ee_tts_toggle)
        tvTitle = findViewById(R.id.tv_ee_title)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        @Suppress("DEPRECATION")
        settings.allowFileAccessFromFileURLs = true
        @Suppress("DEPRECATION")
        settings.allowUniversalAccessFromFileURLs = true
        settings.builtInZoomControls = true
        settings.displayZoomControls = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        val bridge = AndroidTTSBridge()
        webView.addJavascriptInterface(bridge, "AndroidTTS")
        webView.addJavascriptInterface(bridge, "AndroidBridge")

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                consoleMessage?.let {
                    android.util.Log.d("WebViewMathEE", "[JS] ${it.sourceId()}:${it.lineNumber()} -> ${it.message()}")
                }
                return true
            }
        }
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
            }
        }
    }

    private fun setupListeners() {
        btnBack.setOnClickListener {
            handleBackAction()
        }

        btnRefresh.setOnClickListener {
            EinkHelper.flashScreenRefresh(window.decorView)
            webView.reload()
            Toast.makeText(this, "화면 새로고침 완료", Toast.LENGTH_SHORT).show()
        }

        btnTtsToggle.setOnClickListener {
            if (isTtsReady) {
                tts?.speak("Text to speech is ready for mathematical notations and circuit theory.", TextToSpeech.QUEUE_FLUSH, null, "test")
            } else {
                initTts()
            }
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                handleBackAction()
            }
        })
    }

    private fun handleBackAction() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            finish()
        }
    }

    inner class AndroidTTSBridge {
        @JavascriptInterface
        fun speak(text: String?) {
            if (text.isNullOrBlank()) return
            Handler(Looper.getMainLooper()).post {
                if (isTtsReady && tts != null) {
                    tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "formula_tts")
                } else {
                    Toast.makeText(this@MathEEViewerActivity, "발음: $text", Toast.LENGTH_SHORT).show()
                }
            }
        }

        @JavascriptInterface
        fun getAssetJson(path: String?): String {
            if (path.isNullOrBlank()) return ""
            return try {
                val cleanPath = path.trim().removePrefix("/").removePrefix("math-ee/")
                assets.open("math-ee/$cleanPath").bufferedReader().use { it.readText() }
            } catch (e: Exception) {
                android.util.Log.e("MathEEViewer", "Failed to read asset: $path", e)
                ""
            }
        }
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        webView.destroy()
        super.onDestroy()
    }
}
