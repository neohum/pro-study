package com.prostudy.eink.update

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

data class UpdateInfo(
    val versionCode: Int,
    val versionName: String,
    val builtAt: Long,
    val sizeBytes: Long,
    val downloadUrl: String,
    val notes: String? = null,
)

class UpdateChecker(
    private val context: Context,
    private val serverUrl: String = DEFAULT_SERVER_URL,
) {

    fun check(): UpdateInfo? = runCatching {
        val manifestUrl = if (serverUrl.endsWith("/version.json")) {
            serverUrl
        } else {
            "${serverUrl.trimEnd('/')}/version.json"
        }
        val connection = (URL(manifestUrl).openConnection() as HttpURLConnection).apply {
            connectTimeout = TIMEOUT_MS
            readTimeout = TIMEOUT_MS
            requestMethod = "GET"
            instanceFollowRedirects = true
        }
        val body = connection.use { it.inputStream.bufferedReader().readText() }
        val json = JSONObject(body)

        val size = when {
            json.has("sizeBytes") -> json.getLong("sizeBytes")
            json.has("size") -> json.getLong("size")
            else -> 0L
        }
        val downloadPath = when {
            json.has("latestApkUrl") -> json.getString("latestApkUrl")
            json.has("url") -> json.getString("url")
            else -> ""
        }

        UpdateInfo(
            versionCode = json.optInt("versionCode", 0),
            versionName = json.optString("versionName", ""),
            builtAt = json.optLong("builtAt", 0L),
            sizeBytes = size,
            downloadUrl = downloadPath,
            notes = if (json.has("notes")) json.optString("notes") else null,
        )
    }.getOrNull()

    fun isNewer(info: UpdateInfo): Boolean {
        val installed = installedVersionCode()
        if (info.versionCode.toLong() > installed) return true
        if (info.versionCode.toLong() == installed && info.builtAt > lastSeenBuild()) return true
        return false
    }

    fun rememberBuild(info: UpdateInfo) {
        context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
            .edit()
            .putLong(KEY_LAST_BUILD, info.builtAt)
            .apply()
    }

    fun download(info: UpdateInfo, onProgress: ((Int) -> Unit)? = null): File? = runCatching {
        val target = File(context.cacheDir, "update.apk")
        val fullUrl = if (info.downloadUrl.startsWith("http://") || info.downloadUrl.startsWith("https://")) {
            info.downloadUrl
        } else {
            "${serverUrl.trimEnd('/')}/${info.downloadUrl.trimStart('/')}"
        }

        val connection = (URL(fullUrl).openConnection() as HttpURLConnection).apply {
            connectTimeout = TIMEOUT_MS
            readTimeout = DOWNLOAD_TIMEOUT_MS
            instanceFollowRedirects = true
        }

        connection.use { conn ->
            val totalBytes = if (info.sizeBytes > 0) info.sizeBytes else conn.contentLength.toLong()
            var downloadedBytes = 0L
            conn.inputStream.use { input ->
                target.outputStream().use { output ->
                    val buffer = ByteArray(8192)
                    var bytesRead: Int
                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                        downloadedBytes += bytesRead
                        if (totalBytes > 0) {
                            val progress = ((downloadedBytes * 100) / totalBytes).toInt()
                            onProgress?.invoke(progress)
                        }
                    }
                    output.flush()
                }
            }
        }
        if (target.length() == 0L) null else target
    }.getOrNull()

    fun installerIntent(apk: File): Intent {
        val authority = "${context.packageName}.updates"
        val uri: Uri = FileProvider.getUriForFile(context, authority, apk)
        return Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        }
    }

    private fun installedVersionCode(): Long = runCatching {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            context.packageManager.getPackageInfo(context.packageName, 0).longVersionCode
        } else {
            @Suppress("DEPRECATION")
            context.packageManager.getPackageInfo(context.packageName, 0).versionCode.toLong()
        }
    }.getOrDefault(0L)

    private fun lastSeenBuild(): Long =
        context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
            .getLong(KEY_LAST_BUILD, 0L)

    private inline fun <T> HttpURLConnection.use(block: (HttpURLConnection) -> T): T =
        try {
            block(this)
        } finally {
            disconnect()
        }

    companion object {
        const val DEFAULT_SERVER_URL = "https://pub-9d5d05a9b5b1b7fde0163c4d83849cab.r2.dev/pro-study"
        private const val PREFERENCES = "pro_study_prefs"
        private const val KEY_LAST_BUILD = "last_seen_build"
        private const val TIMEOUT_MS = 5000
        private const val DOWNLOAD_TIMEOUT_MS = 60000
    }
}
