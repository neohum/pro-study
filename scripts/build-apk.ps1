# pro-study Android E-ink 앱 패키징 및 APK 빌드 스크립트
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 1. 최신 학습 콘텐츠 Android assets 패키징" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
node scripts/package-android-assets.js

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 2. Gradle Debug APK 빌드 (assembleDebug)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
$AndroidDir = Join-Path $Root "android-app"
Set-Location $AndroidDir
& .\gradlew.bat assembleDebug

Set-Location $Root
$ApkPath = Join-Path $AndroidDir "app\build\outputs\apk\debug\app-debug.apk"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
if (Test-Path $ApkPath) {
    $BuildDir = Join-Path $Root "build"
    if (-not (Test-Path $BuildDir)) { New-Item -ItemType Directory -Path $BuildDir | Out-Null }

    # Gradle 파일에서 버전 정보 추출
    $gradleFile = Join-Path $AndroidDir "app\build.gradle.kts"
    $versionName = "1.1.0"
    if (Test-Path $gradleFile) {
        $content = Get-Content -Raw $gradleFile
        if ($content -match 'versionName\s*=\s*"([^"]+)"') {
            $versionName = $Matches[1]
        }
    }

    $VersionedName = "pro-study-v${versionName}.apk"
    $VersionedPath = Join-Path $BuildDir $VersionedName

    Copy-Item $ApkPath $VersionedPath -Force
    Copy-Item $ApkPath (Join-Path $BuildDir "pro-study-eink.apk") -Force
    Copy-Item $ApkPath (Join-Path $BuildDir "app-debug.apk") -Force

    $item = Get-Item $VersionedPath
    $sizeMB = [math]::Round($item.Length / 1MB, 2)
    Write-Host " [성공] APK 빌드 완료: $VersionedName ($sizeMB MB)" -ForegroundColor Green
    Write-Host " 저장 위치: $VersionedPath" -ForegroundColor Green
    Write-Host " 로컬 사이트(http://localhost:8787/apk)에서 디바이스로 바로 다운로드할 수 있습니다." -ForegroundColor Yellow
} else {
    Write-Host " [경고] APK 파일을 찾을 수 없습니다: $ApkPath" -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan
