<#
.SYNOPSIS
  pro-study 로컬 웹 서버를 백그라운드로 띄우고 크롬 앱(--app) 모드로 접속한다.
#>
[CmdletBinding()]
param(
  [int]$Port = 8787
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$url = "http://127.0.0.1:$Port/"

# 1. 로컬 웹 서버 응답 여부 확인 (빠른 TCP 소켓 체크)
function Test-ServerListening([string]$Address, [int]$CheckPort) {
  try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $iar = $tcp.BeginConnect($Address, $CheckPort, $null, $null)
    $success = $iar.AsyncWaitHandle.WaitOne(300, $false)
    if ($success) {
      $tcp.EndConnect($iar)
      $tcp.Close()
      return $true
    }
    $tcp.Close()
  } catch {
    # 연결 실패
  }
  return $false
}

$isListening = Test-ServerListening "127.0.0.1" $Port
$exePath = Join-Path $root "build\pro-study.exe"

# 실행 중인 기존 프로세스가 있더라도, 새 빌드 파일이 더 최신이면 프로세스를 자동 재기동
if ($isListening -and (Test-Path $exePath)) {
  $runningProc = Get-Process -Name "pro-study" -ErrorAction SilentlyContinue
  if ($runningProc) {
    $exeTime = (Get-Item $exePath).LastWriteTime
    $procTime = $runningProc[0].StartTime
    if ($exeTime -gt $procTime) {
      $runningProc | Stop-Process -Force -ErrorAction SilentlyContinue
      Start-Sleep -Milliseconds 300
      $isListening = $false
    }
  }
}

if (-not $isListening) {
  if (-not (Test-Path $exePath)) {
    Write-Verbose "빌드 실행 파일이 없어 새로 빌드합니다..."
    & go -C "$root\site" build -o "$root\build\pro-study.exe" .
  }

  if (Test-Path $exePath) {
    # WMI(Win32_Process)를 통해 부모 셸과 완전히 독립된 백그라운드 프로세스로 기동
    $cmd = "`"$exePath`" -root `"$root`" -addr `"127.0.0.1:$Port`" -open=false"
    try {
      Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmd; CurrentDirectory = $root } | Out-Null
    } catch {
      ([wmiclass]'Win32_Process').Create($cmd, $root, $null) | Out-Null
    }

    # 서버 준비 대기 (최대 5초)
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt 5) {
      Start-Sleep -Milliseconds 150
      if (Test-ServerListening "127.0.0.1" $Port) {
        break
      }
    }
  }
}

# 2. Chrome 브라우저 탐색 및 실행
function Get-ChromePath {
  $candidates = @(
    (Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe' -ErrorAction SilentlyContinue).'(default)',
    (Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe' -ErrorAction SilentlyContinue).'(default)',
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
  )
  foreach ($c in $candidates) {
    if ($c -and (Test-Path $c)) {
      return $c
    }
  }
  return $null
}

function Get-EdgePath {
  $candidates = @(
    (Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe' -ErrorAction SilentlyContinue).'(default)',
    (Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe' -ErrorAction SilentlyContinue).'(default)',
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
  )
  foreach ($c in $candidates) {
    if ($c -and (Test-Path $c)) {
      return $c
    }
  }
  return $null
}

$chrome = Get-ChromePath
if ($chrome) {
  Start-Process -FilePath $chrome -ArgumentList @("--app=$url")
} else {
  $edge = Get-EdgePath
  if ($edge) {
    Start-Process -FilePath $edge -ArgumentList @("--app=$url")
  } else {
    Start-Process $url
  }
}
