@echo off
setlocal

set PROJECT_PATH=%~dp0

REM 1) Explicit override
if not "%UNITY_BIN%"=="" (
    if exist "%UNITY_BIN%" (
        "%UNITY_BIN%" -projectPath "%PROJECT_PATH%"
        exit /b %errorlevel%
    )
)

REM 2) PATH lookup
where Unity >nul 2>nul
if %errorlevel%==0 (
    Unity -projectPath "%PROJECT_PATH%"
    exit /b %errorlevel%
)

REM 3) Common install locations without Unity Hub
if exist "C:\Program Files\Unity\Editor\Unity.exe" (
    "C:\Program Files\Unity\Editor\Unity.exe" -projectPath "%PROJECT_PATH%"
    exit /b %errorlevel%
)
if exist "C:\Program Files\Unity Hub\Editor\2022.3.0f1\Editor\Unity.exe" (
    "C:\Program Files\Unity Hub\Editor\2022.3.0f1\Editor\Unity.exe" -projectPath "%PROJECT_PATH%"
    exit /b %errorlevel%
)

echo Unity executable не найден.
echo Unity Hub НЕ обязателен: можно поставить Unity Editor отдельно.
echo Вариант 1: добавь Unity в PATH.
echo Вариант 2: укажи путь вручную:
echo   set UNITY_BIN=C:\Path\To\Unity.exe
echo   start_unity_project.bat
exit /b 1
