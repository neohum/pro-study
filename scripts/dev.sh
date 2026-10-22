#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-8787}"
OPEN_BROWSER="${OPEN_BROWSER:-true}"

echo "== 환경 점검 =="
MISSING=0

check_tool() {
  local name="$1"
  local cmd="$2"
  local hint="$3"
  if command -v "$cmd" >/dev/null 2>&1; then
    local ver
    ver="$("$cmd" --version 2>&1 | head -n 1)"
    printf "  [OK]   %-12s %s\n" "$name" "$ver"
  else
    printf "  [없음] %-12s %s\n" "$name" "$hint"
    MISSING=$((MISSING + 1))
  fi
}

check_tool "gcc/clang" "gcc" "C23 컴파일러(gcc 또는 clang)를 설치하세요."
check_tool "go" "go" "https://go.dev/dl 에서 Go를 설치하세요."
check_tool "VS Code" "code" "VS Code 설치 후 PATH에 등록하세요."

echo ""
echo "== 사이트 빌드 =="
mkdir -p "$ROOT_DIR/build"
(cd "$ROOT_DIR/site" && go build -o "$ROOT_DIR/build/pro-study" .)

echo ""
echo "== 서버 시작: http://127.0.0.1:${PORT}/ (Ctrl+C 로 종료) =="
exec "$ROOT_DIR/build/pro-study" -root "$ROOT_DIR" -addr "127.0.0.1:${PORT}" -open="${OPEN_BROWSER}"
