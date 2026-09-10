<#
.SYNOPSIS
  pro-study E-ink Android 애플리케이션 빌드 및 에셋 동기화 도구 (Android Studio 없이 로컬 CLI 빌드 지원).
.EXAMPLE
  pwsh scripts/build-android.ps1 -DoctorOnly
  pwsh scripts/build-android.ps1 -Build
#>
[CmdletBinding()]
param(
  [switch]$DoctorOnly,
  [switch]$Build,
  [switch]$SyncAssets
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# Scoop 설치 환경 자동 감지 및 환경 변수 연결
$scoopJava = "$HOME\scoop\apps\openjdk17\current"
$scoopAndroid = "$HOME\scoop\apps\android-clt\current"

if (Test-Path $scoopJava) {
  $env:JAVA_HOME = $scoopJava
  $env:PATH = "$scoopJava\bin;$env:PATH"
}
if (Test-Path $scoopAndroid) {
  $env:ANDROID_HOME = $scoopAndroid
  $env:PATH = "$scoopAndroid\cmdline-tools\latest\bin;$scoopAndroid\platform-tools;$env:PATH"
}

Write-Host "== Android 빌드 환경 점검 ==" -ForegroundColor Cyan

$hasJava = Get-Command java -ErrorAction SilentlyContinue
$hasAdb = Get-Command adb -ErrorAction SilentlyContinue
$androidHome = $env:ANDROID_HOME

if ($hasJava) {
  $jVer = (& java -version 2>&1 | Select-Object -First 1)
  Write-Host "  [OK]   Java: $jVer"
} else {
  Write-Host "  [안내] Java가 없습니다." -ForegroundColor Yellow
}

if ($androidHome -and (Test-Path $androidHome)) {
  Write-Host "  [OK]   ANDROID_HOME: $androidHome"
} else {
  Write-Host "  [안내] ANDROID_HOME 환경 변수가 설정되지 않았습니다." -ForegroundColor Yellow
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

if ($Build) {
  Write-Host "`n== APK 빌드 시작 (assembleDebug) ==" -ForegroundColor Cyan
  Push-Location "$root\android-app"
  try {
    & .\gradlew.bat assembleDebug
    if ($LASTEXITCODE -ne 0) {
      Write-Host "APK 빌드 실패" -ForegroundColor Red
      exit 1
    }
  } finally {
    Pop-Location
  }

  $apkPath = "$root\android-app\app\build\outputs\apk\debug\app-debug.apk"
  if (Test-Path $apkPath) {
    $len = (Get-Item $apkPath).Length / 1MB
    Write-Host "`n[성공] APK 빌드 완료!" -ForegroundColor Green
    Write-Host ("  파일: {0}" -f $apkPath)
    Write-Host ("  용량: {0:N2} MB" -f $len)
  }
  exit 0
}

Write-Host "`n== 안내 ==" -ForegroundColor Green
Write-Host "APK를 바로 빌드하려면 다음 명령을 실행하세요:"
Write-Host "  pwsh scripts/build-android.ps1 -Build"
Write-Host "`n자세한 E-ink 최적화 가이드는 docs/EINK_APP_GUIDE.md를 참조하세요."
