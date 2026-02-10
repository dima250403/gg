@echo off
setlocal
set SCRIPT=%~dp0Standalone\StandaloneShooter.ps1
if not exist "%SCRIPT%" (
  echo Script not found: %SCRIPT%
  exit /b 1
)
powershell -ExecutionPolicy Bypass -NoProfile -File "%SCRIPT%"
