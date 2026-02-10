@echo off
setlocal

set PROJECT_PATH=%~dp0

if not "%UNITY_BIN%"=="" (
    if exist "%UNITY_BIN%" (
        "%UNITY_BIN%" -projectPath "%PROJECT_PATH%"
        exit /b %errorlevel%
    )
)

where Unity >nul 2>nul
if %errorlevel%==0 (
    Unity -projectPath "%PROJECT_PATH%"
    exit /b %errorlevel%
)

echo Unity executable не найден.
echo Укажи путь так:
echo   set UNITY_BIN=C:\Path\To\Unity.exe
echo   start_unity_project.bat
exit /b 1
