plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.prostudy.eink"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.prostudy.eink"
        minSdk = 26
        targetSdk = 34
        versionCode = 17
        versionName = "1.9.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        getByName("debug") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    buildTypes {
        debug {
            signingConfig = signingConfigs.getByName("debug")
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    packaging {
        jniLibs.pickFirsts += "lib/*/libc++_shared.so"
    }

    testOptions {
        unitTests.isReturnDefaultValues = true
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity.ktx)
    implementation(libs.androidx.fragment.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.kotlinx.coroutines.android)

    testImplementation(libs.junit)
    testImplementation("org.json:json:20240303")
}

afterEvaluate {
    tasks.findByName("assembleDebug")?.doLast {
        val apkDir = layout.buildDirectory.dir("outputs/apk/debug").get().asFile
        val src = File(apkDir, "app-debug.apk")
        if (src.exists()) {
            val ver = android.defaultConfig.versionName ?: "1.1.0"
            val verApk = File(apkDir, "pro-study-v$ver.apk")
            src.copyTo(verApk, overwrite = true)
            val rootBuild = rootProject.file("../build")
            if (!rootBuild.exists()) rootBuild.mkdirs()
            src.copyTo(File(rootBuild, "pro-study-v$ver.apk"), overwrite = true)
            src.copyTo(File(rootBuild, "pro-study-eink.apk"), overwrite = true)
            src.copyTo(File(rootBuild, "app-debug.apk"), overwrite = true)
        }
    }
}
