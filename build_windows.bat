@echo off
setlocal

set PROJECT_PATH=%~dp0
set LOG_FILE=%PROJECT_PATH%Build\windows_build.log

if "%UNITY_BIN%"=="" (
  echo UNITY_BIN is not set.
  echo Example:
  echo   set UNITY_BIN=C:\Program Files\Unity\Hub\Editor\2022.3.0f1\Editor\Unity.exe
  exit /b 1
)

if not exist "%UNITY_BIN%" (
  echo Unity not found: %UNITY_BIN%
  exit /b 1
)

"%UNITY_BIN%" -batchmode -nographics -quit -projectPath "%PROJECT_PATH%" -executeMethod BuildWindows.Build -logFile "%LOG_FILE%"
if %errorlevel% neq 0 (
  echo Build failed. See log: %LOG_FILE%
  exit /b %errorlevel%
)

echo Build success: Build\Windows\UnityShooter.exe
exit /b 0
