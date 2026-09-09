<#
.SYNOPSIS
  pro-study E-ink Android 애플리케이션 빌드 및 에셋 동기화 도구.
.EXAMPLE
  pwsh scripts/build-android.ps1 -DoctorOnly
  pwsh scripts/build-android.ps1 -SyncAssets
#>
[CmdletBinding()]
param(
  [switch]$DoctorOnly,
  [switch]$SyncAssets
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "== Android 빌드 환경 점검 ==" -ForegroundColor Cyan

$hasJava = Get-Command java -ErrorAction SilentlyContinue
$hasAdb = Get-Command adb -ErrorAction SilentlyContinue
$androidHome = $env:ANDROID_HOME

if ($hasJava) {
  $jVer = (& java -version 2>&1 | Select-Object -First 1)
  Write-Host "  [OK]   Java: $jVer"
} else {
  Write-Host "  [안내] Java가 PATH에 없습니다 (Android Studio 내장 JDK 또는 OpenJDK 17 필요)." -ForegroundColor Yellow
}

if ($androidHome -and (Test-Path $androidHome)) {
  Write-Host "  [OK]   ANDROID_HOME: $androidHome"
} else {
  Write-Host "  [안내] ANDROID_HOME 환경 변수가 설정되지 않았습니다 (Android Studio 설치 권장)." -ForegroundColor Yellow
}

if ($hasAdb) {
  Write-Host "  [OK]   ADB: 사용 가능"
} else {
  Write-Host "  [안내] ADB가 PATH에 없습니다." -ForegroundColor Gray
}

if ($DoctorOnly) {
  Write-Host "`n점검 완료." -ForegroundColor Green
  exit 0
}

Write-Host "`n== 20개 프로젝트 에셋 패키징 동기화 ==" -ForegroundColor Cyan
& node scripts/package-android-assets.js
if ($LASTEXITCODE -ne 0) {
  Write-Host "에셋 패키징 실패" -ForegroundColor Red
  exit 1
}

Write-Host "`n== Android Studio 빌드 준비 완료 ==" -ForegroundColor Green
Write-Host "Android Studio에서 'android-app' 디렉터리를 열어 빌드하거나, 다음 명령어로 APK를 빌드하세요:"
Write-Host "  cd android-app"
Write-Host "  ./gradlew assembleDebug"
Write-Host "`n자세한 E-ink 최적화 가이드는 docs/EINK_APP_GUIDE.md를 참조하세요."
