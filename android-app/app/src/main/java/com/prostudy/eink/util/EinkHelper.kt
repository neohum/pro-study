package com.prostudy.eink.util

import android.app.Activity
import android.os.Build
import android.util.Log
import android.view.View
import android.view.WindowManager
import java.lang.reflect.Method

/**
 * EinkHelper
 * 
 * Onyx Boox 및 전자잉크(E-ink) 디바이스에서 펜 딜레이를 없애고 초고속 렌더링을 가능하게 하는
 * 시스템 레벨 EPD(Electronic Paper Display) 컨트롤러 및 윈도우 최적화 헬퍼.
 */
object EinkHelper {

    private const val TAG = "EinkHelper"
    val isOnyxDevice: Boolean by lazy {
        val m = Build.MANUFACTURER.lowercase()
        val b = Build.BRAND.lowercase()
        val d = Build.DEVICE.lowercase()
        m.contains("onyx") || b.contains("onyx") || d.contains("onyx") || b.contains("boox")
    }

    private var epdControllerClass: Class<*>? = null
    private var applyFastModeMethod: Method? = null
    private var setUpdateModeMethod: Method? = null
    private var enablePostMethod: Method? = null
    private var duModeObj: Any? = null

    init {
        if (isOnyxDevice) {
            tryInitOnyxSdk()
        }
    }

    private fun tryInitOnyxSdk() {
        try {
            // 1. Onyx EpdController 탐색
            val epdClass = Class.forName("com.onyx.android.sdk.api.device.epd.EpdController")
            epdControllerClass = epdClass

            // applyApplicationFastMode(String packageName, boolean enable, boolean fullScreen)
            applyFastModeMethod = epdClass.methods.firstOrNull { 
                it.name == "applyApplicationFastMode" && it.parameterTypes.size >= 2
            }

            // enablePost(View view, int mode)
            enablePostMethod = epdClass.methods.firstOrNull { 
                it.name == "enablePost" && it.parameterTypes.size == 2 
            }

            // UpdateMode enum
            val updateModeClass = try {
                Class.forName("com.onyx.android.sdk.api.device.epd.UpdateMode")
            } catch (e: Exception) {
                null
            }
            if (updateModeClass != null && updateModeClass.isEnum) {
                duModeObj = updateModeClass.enumConstants?.firstOrNull {
                    it.toString().equals("DU", ignoreCase = true) ||
                    it.toString().equals("A2", ignoreCase = true) ||
                    it.toString().equals("ANIMATION", ignoreCase = true)
                }
            }

            // setUpdateMode(View, UpdateMode)
            setUpdateModeMethod = epdClass.methods.firstOrNull {
                it.name == "setUpdateMode" && it.parameterTypes.size == 2
            }

            Log.i(TAG, "Onyx EPD SDK reflection initialized successfully. DU mode: $duModeObj")
        } catch (e: Throwable) {
            Log.w(TAG, "Onyx EPD SDK not found or reflection failed: ${e.message}")
        }
    }

    /**
     * 액티비티 윈도우 및 전체 화면 고속 새로고침 모드 활성화
     */
    fun applyActivityOptimizations(activity: Activity) {
        try {
            // 1. 하드웨어 가속 보장
            activity.window.setFlags(
                WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
                WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
            )

            // 2. Onyx 디바이스 고속 앱 모드 강제 적용
            if (isOnyxDevice) {
                applyFastModeMethod?.let { m ->
                    val pkg = activity.packageName
                    if (m.parameterTypes.size == 3) {
                        m.invoke(null, pkg, true, true)
                    } else if (m.parameterTypes.size == 2) {
                        m.invoke(null, pkg, true)
                    }
                    Log.i(TAG, "Applied Onyx Fast Mode for $pkg")
                }
            }
        } catch (e: Throwable) {
            Log.w(TAG, "Failed to apply activity optimizations: ${e.message}")
        }
    }

    /**
     * 펜 드로잉 캔버스 뷰에 대해 EPD 다이렉트 고속 갱신(A2/DU) 모드 적용
     */
    fun applyFastDrawingMode(view: View) {
        if (!isOnyxDevice) return

        try {
            // 1. enablePost(view, 1) -> 펜 드로잉 시 화면 갱신 딜레이 0화
            enablePostMethod?.invoke(null, view, 1)

            // 2. setUpdateMode(view, UpdateMode.DU) -> Direct Update 모드로 흑백 즉각 반영
            if (setUpdateModeMethod != null && duModeObj != null) {
                setUpdateModeMethod?.invoke(null, view, duModeObj)
            }
            Log.d(TAG, "Fast drawing mode applied to view: $view")
        } catch (e: Throwable) {
            Log.w(TAG, "Failed to apply fast drawing mode to view: ${e.message}")
        }
    }

    /**
     * 펜 드로잉이 끝났을 때 일반 모드로 복구하거나 화면 리프레시
     */
    fun resetDrawingMode(view: View) {
        if (!isOnyxDevice) return
        try {
            enablePostMethod?.invoke(null, view, 0)
        } catch (e: Throwable) {
            // ignore
        }
    }
}
