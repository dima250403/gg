@echo off
setlocal

set PROJECT_PATH=%~dp0
set LOG_FILE=%PROJECT_PATH%Build\windows_build.log

REM Auto-detect Unity when UNITY_BIN is not provided
if "%UNITY_BIN%"=="" (
  where Unity >nul 2>nul
  if %errorlevel%==0 (
    set UNITY_BIN=Unity
  ) else (
    if exist "C:\Program Files\Unity\Editor\Unity.exe" (
      set UNITY_BIN=C:\Program Files\Unity\Editor\Unity.exe
    ) else (
      if exist "C:\Program Files\Unity Hub\Editor\2022.3.0f1\Editor\Unity.exe" (
        set UNITY_BIN=C:\Program Files\Unity Hub\Editor\2022.3.0f1\Editor\Unity.exe
      )
    )
  )
)

if "%UNITY_BIN%"=="" (
  echo Unity not found.
  echo Unity Hub НЕ обязателен, но нужен Unity Editor.
  echo Example manual setup:
  echo   set UNITY_BIN=C:\Program Files\Unity\Editor\Unity.exe
  exit /b 1
)

if not "%UNITY_BIN%"=="Unity" (
  if not exist "%UNITY_BIN%" (
    echo Unity not found: %UNITY_BIN%
    exit /b 1
  )
)

"%UNITY_BIN%" -batchmode -nographics -quit -projectPath "%PROJECT_PATH%" -executeMethod BuildWindows.Build -logFile "%LOG_FILE%"
if %errorlevel% neq 0 (
  echo Build failed. See log: %LOG_FILE%
  exit /b %errorlevel%
)

echo Build success: Build\Windows\UnityShooter.exe
exit /b 0
