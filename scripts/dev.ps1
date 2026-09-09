<#
.SYNOPSIS
  pro-study 학습 사이트를 띄운다: 도구 점검(doctor) → 빌드 → 서버 → 브라우저.
.EXAMPLE
  pwsh scripts/dev.ps1              # 점검 후 127.0.0.1:8787에 띄우고 브라우저를 연다
  pwsh scripts/dev.ps1 -DoctorOnly  # 점검만
  pwsh scripts/dev.ps1 -NoBrowser -Port 9000
#>
[CmdletBinding()]
param(
  [switch]$DoctorOnly,
  [switch]$NoBrowser,
  [int]$Port = 8787
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "== 환경 점검 ==" -ForegroundColor Cyan
$tools = @(
  @{ Name = 'gcc (C23)';   Cmd = 'gcc';  Args = @('--version'); Hint = 'MinGW-w64 gcc 13+ 를 설치하고 bin을 PATH에 추가하세요 (scoop install gcc).' },
  @{ Name = 'go';          Cmd = 'go';   Args = @('version');   Hint = 'https://go.dev/dl 에서 Go 1.22+ 를 설치하세요.' },
  @{ Name = 'VS Code CLI'; Cmd = 'code'; Args = @('--version'); Hint = "VS Code 설치 후 명령 팔레트 'Shell Command: Install code command in PATH' 를 실행하세요." }
)
$missing = 0
foreach ($t in $tools) {
  $found = Get-Command $t.Cmd -ErrorAction SilentlyContinue
  if ($found) {
    $ver = (& $t.Cmd @($t.Args) 2>&1 | Select-Object -First 1)
    Write-Host ("  [OK]   {0,-12} {1}" -f $t.Name, $ver)
  } else {
    Write-Host ("  [없음] {0,-12} {1}" -f $t.Name, $t.Hint) -ForegroundColor Yellow
    $missing++
  }
}
if ($missing -gt 0) {
  Write-Host "`n필요한 도구 $missing 개가 없습니다. 설치 후 다시 실행하세요." -ForegroundColor Red
  exit 1
}
if ($DoctorOnly) { exit 0 }

Write-Host "`n== 사이트 빌드 ==" -ForegroundColor Cyan
New-Item -ItemType Directory -Force build | Out-Null
& go -C site build -o ../build/pro-study.exe .
if ($LASTEXITCODE -ne 0) { Write-Host "빌드 실패" -ForegroundColor Red; exit 1 }

Write-Host "`n== 서버 시작: http://127.0.0.1:$Port/  (Ctrl+C 로 종료) ==" -ForegroundColor Cyan
$openFlag = if ($NoBrowser) { '-open=false' } else { '-open=true' }
& "$root/build/pro-study.exe" -root $root -addr "127.0.0.1:$Port" $openFlag
exit $LASTEXITCODE
