<#
.SYNOPSIS
  프로젝트 콘텐츠 품질 게이트. README 7개 절, TODO(step-N) 대응, starter 무경고 빌드, solution 테스트 통과.
.EXAMPLE
  pwsh scripts/verify-projects.ps1 -All
  pwsh scripts/verify-projects.ps1 -Lang c -Range 1..5
  pwsh scripts/verify-projects.ps1 -Only c/01-calc,go/02-wordfreq
#>
[CmdletBinding()]
param(
  [switch]$All,
  [ValidateSet('c', 'go', '')][string]$Lang = '',
  [string]$Range = '',
  [string]$Only = ''
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$args = @('-root', $root)
if ($Lang)  { $args += @('-lang', $Lang) }
if ($Range) { $args += @('-range', $Range) }
if ($Only)  { $args += @('-only', $Only) }
& go -C site run ./cmd/verify @args
exit $LASTEXITCODE
