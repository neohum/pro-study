<#
.SYNOPSIS
  바탕화면에 pro-study 크롬 앱 실행 바로가기를 생성한다.
#>
[CmdletBinding()]
param(
  [string]$ShortcutName = "pro-study 학습 플랫폼.lnk"
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$desktop = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop $ShortcutName

$vbsPath = Join-Path $root "scripts\launch-chrome-app.vbs"
$icoPath = Join-Path $root "build\pro-study.ico"

# 1. 아이콘 생성 (build/pro-study.ico가 없으면 파비콘 기반으로 생성)
if (-not (Test-Path $icoPath)) {
  try {
    Add-Type -AssemblyName System.Drawing
    $size = 64
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::Transparent)

    # 둥근 모서리 배경 박스 (#0b0c0f)
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 11, 12, 15))
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $radius = 14
    $d = $radius * 2
    $path.AddArc(2, 2, $d, $d, 180, 90)
    $path.AddArc(($size - 2 - $d), 2, $d, $d, 270, 90)
    $path.AddArc(($size - 2 - $d), ($size - 2 - $d), $d, $d, 0, 90)
    $path.AddArc(2, ($size - 2 - $d), $d, $d, 90, 90)
    $path.CloseFigure()
    $g.FillPath($bgBrush, $path)

    # 코드 브래킷 (< >) 및 대시 (-) (#7c8cff)
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 124, 140, 255), 4.5)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    # <
    [System.Drawing.Point[]]$leftPts = @(
      (New-Object System.Drawing.Point(25, 20)),
      (New-Object System.Drawing.Point(14, 32)),
      (New-Object System.Drawing.Point(25, 44))
    )
    $g.DrawLines($pen, $leftPts)

    # >
    [System.Drawing.Point[]]$rightPts = @(
      (New-Object System.Drawing.Point(39, 20)),
      (New-Object System.Drawing.Point(50, 32)),
      (New-Object System.Drawing.Point(39, 44))
    )
    $g.DrawLines($pen, $rightPts)

    # -
    $g.DrawLine($pen, 27, 32, 37, 32)
    $g.Flush()

    # ICO 저장
    $hIcon = $bmp.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hIcon)
    $fs = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
    $icon.Save($fs)
    $fs.Close()
    $bmp.Dispose()
    $icon.Dispose()
    Write-Host "아이콘 파일 생성 완료: $icoPath" -ForegroundColor Cyan
  } catch {
    Write-Warning "아이콘 생성 중 오류 발생 (시스템 크롬 아이콘으로 대체): $_"
  }
}

# 2. WScript.Shell COM 객체로 바로가기 생성
$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "$env:SystemRoot\System32\wscript.exe"
$shortcut.Arguments = "`"$vbsPath`""
$shortcut.WorkingDirectory = $root
$shortcut.Description = "pro-study 학습 플랫폼 (로컬 웹서버 + 크롬 앱)"

if (Test-Path $icoPath) {
  $shortcut.IconLocation = "$icoPath,0"
} else {
  $chrome = (Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe' -ErrorAction SilentlyContinue).'(default)'
  if ($chrome -and (Test-Path $chrome)) {
    $shortcut.IconLocation = "$chrome,0"
  }
}

$shortcut.Save()
Write-Host "`n[성공] 바탕화면 바로가기가 생성되었습니다!" -ForegroundColor Green
Write-Host "  경로: $shortcutPath" -ForegroundColor Yellow
Write-Host "  대상: $vbsPath"
Write-Host "  기능: 로컬 웹서버(127.0.0.1:8787) 자동 실행 후 크롬 앱 모드로 실행"
