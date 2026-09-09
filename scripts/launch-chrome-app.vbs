' pro-study 로컬 웹서버 + 크롬 앱 실행 래퍼 (콘솔창 없이 무음 실행)
Option Explicit
Dim objShell, objFSO, strScriptDir, strPs1, strCmd
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
strPs1 = objFSO.BuildPath(strScriptDir, "launch-chrome-app.ps1")
strCmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & strPs1 & """"

objShell.Run strCmd, 0, False
