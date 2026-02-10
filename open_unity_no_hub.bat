@echo off
setlocal EnableDelayedExpansion

set PROJECT_PATH=%~dp0

if not "%UNITY_BIN%"=="" (
  if exist "%UNITY_BIN%" (
    echo Using UNITY_BIN: %UNITY_BIN%
    "%UNITY_BIN%" -projectPath "%PROJECT_PATH%"
    exit /b %errorlevel%
  )
)

set CANDIDATE=
for /f "delims=" %%D in ('dir /b /ad "C:\Program Files\Unity\Hub\Editor" 2^>nul') do (
  set CANDIDATE=C:\Program Files\Unity\Hub\Editor\%%D\Editor\Unity.exe
)
if defined CANDIDATE if exist "!CANDIDATE!" (
  echo Found Unity Editor: !CANDIDATE!
  "!CANDIDATE!" -projectPath "%PROJECT_PATH%"
  exit /b %errorlevel%
)

for %%P in (
  "C:\Program Files\Unity\Editor\Unity.exe"
  "C:\Program Files\Unity\2022.3.0f1\Editor\Unity.exe"
  "C:\Program Files\Unity\2021.3.0f1\Editor\Unity.exe"
) do (
  if exist %%~P (
    echo Found Unity Editor: %%~P
    %%~P -projectPath "%PROJECT_PATH%"
    exit /b %errorlevel%
  )
)

echo Unity Editor not found.
echo Unity Hub is NOT required, but Unity Editor itself must be installed.
echo Option 1: set UNITY_BIN to your Unity.exe path and run this file again.
echo Option 2: just run built game without Unity using play_now.bat
exit /b 1
