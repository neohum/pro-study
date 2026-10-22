package com.prostudy.eink.ui.ink

import android.app.Activity
import android.view.View
import com.onyx.android.sdk.api.device.EpdDeviceManager
import com.onyx.android.sdk.api.device.epd.EpdController
import com.onyx.android.sdk.api.device.epd.UpdateMode
import com.onyx.android.sdk.api.device.epd.UpdateOption

object OnyxEPDHelper {

    val isOnyxDevice: Boolean by lazy {
        android.os.Build.BRAND.equals("Onyx", ignoreCase = true) ||
        android.os.Build.MANUFACTURER.equals("Onyx", ignoreCase = true) ||
        android.os.Build.MODEL.contains("Tab", ignoreCase = true) ||
        android.os.Build.MODEL.contains("Boox", ignoreCase = true)
    }

    fun initApp(activity: Activity) {
        if (!isOnyxDevice) return
        try {
            EpdController.setAppScopeRefreshMode(UpdateOption.FAST_QUALITY)
            EpdController.applySystemFastMode(true)
            EpdDeviceManager.enterAnimationUpdate(true)
        } catch (e: Throwable) {
            e.printStackTrace()
        }
    }

    fun applyFastDrawingMode(view: View) {
        if (!isOnyxDevice) return
        try {
            EpdDeviceManager.setUpdateMode(view, UpdateMode.DU)
            EpdDeviceManager.startScreenHandWriting(view)
        } catch (e: Throwable) {
            e.printStackTrace()
        }
    }

    fun stopFastDrawingMode(view: View) {
        if (!isOnyxDevice) return
        try {
            EpdDeviceManager.stopScreenHandWriting(view)
            EpdDeviceManager.resetUpdateMode(view)
        } catch (e: Throwable) {
            e.printStackTrace()
        }
    }

    fun fullRefresh(view: View? = null) {
        if (!isOnyxDevice) return
        try {
            EpdController.repaintEveryThing(UpdateMode.GC)
        } catch (e: Throwable) {
            e.printStackTrace()
        }
    }
}
