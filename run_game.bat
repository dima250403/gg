@echo off
setlocal

set EXE_PATH=%~dp0Build\Windows\UnityShooter.exe

if not exist "%EXE_PATH%" (
  echo EXE not found: %EXE_PATH%
  echo First build the game using build_windows.bat
  exit /b 1
)

start "UnityShooter" "%EXE_PATH%"
exit /b 0
