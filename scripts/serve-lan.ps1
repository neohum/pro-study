# pro-study 내부 네트워크(LAN) 웹 서버 실행 스크립트
# 동일 Wi-Fi 망의 모바일/E-ink 디바이스에서 접속하여 APK 다운로드 및 학습 가능
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " pro-study 학습 사이트 (내부 네트워크 모드)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " - 동일 Wi-Fi에 연결된 태블릿/스마트폰에서 접속 가능합니다."
Write-Host " - 브라우저에서 /apk 페이지로 이동하여 APK 다운로드 가능"
Write-Host "=========================================================="
Write-Host ""

go -C site run . -root $Root -addr 0.0.0.0:8787 -lan -open=$false
