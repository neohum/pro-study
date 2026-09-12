#!/usr/bin/env bash
# pro-study 내부 네트워크(LAN) 웹 서버 실행 스크립트
# 동일 Wi-Fi 망의 모바일/E-ink 디바이스에서 접속하여 APK 다운로드 및 학습 가능
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=========================================================="
echo " pro-study 학습 사이트 (내부 네트워크 모드)"
echo "=========================================================="
echo " - 동일 Wi-Fi에 연결된 태블릿/스마트폰에서 접속 가능합니다."
echo " - 브라우저에서 /apk 페이지로 이동하여 APK 다운로드 가능"
echo "=========================================================="
echo ""

exec go -C site run . -root "$DIR" -addr 0.0.0.0:8787 -lan -open=false
