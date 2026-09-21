#!/usr/bin/env bash
# pro-study Android E-ink 앱 패키징 및 APK 빌드 스크립트
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=========================================================="
echo " 1. 최신 학습 콘텐츠 Android assets 패키징"
echo "=========================================================="
node scripts/package-android-assets.js

echo ""
echo "=========================================================="
echo " 2. Gradle Debug APK 빌드 (assembleDebug)"
echo "=========================================================="
cd "$DIR/android-app"
chmod +x ./gradlew
./gradlew assembleDebug

APK_PATH="$DIR/android-app/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "=========================================================="
if [ -f "$APK_PATH" ]; then
  VERSION_NAME=$(grep -o 'versionName = "[^"]*"' "$DIR/android-app/app/build.gradle.kts" | cut -d'"' -f2 || echo "1.1.0")
  VERSIONED_NAME="pro-study-v${VERSION_NAME}.apk"
  mkdir -p "$DIR/build"
  cp "$APK_PATH" "$DIR/build/$VERSIONED_NAME"
  cp "$APK_PATH" "$DIR/build/pro-study-eink.apk"
  cp "$APK_PATH" "$DIR/build/app-debug.apk"
  FILE_SIZE=$(ls -lh "$DIR/build/$VERSIONED_NAME" | awk '{print $5}')
  echo " [성공] APK 빌드 완료: $DIR/build/$VERSIONED_NAME ($FILE_SIZE)"
  echo " 로컬 사이트(http://localhost:8787/apk)에서 디바이스로 바로 다운로드할 수 있습니다."
else
  echo " [경고] APK 파일을 찾을 수 없습니다: $APK_PATH"
fi
echo "=========================================================="
