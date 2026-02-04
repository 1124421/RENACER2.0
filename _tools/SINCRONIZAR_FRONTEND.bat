@echo off
setlocal enabledelayedexpansion

set "MODE=%~1"
if "%MODE%"=="" set "MODE=--watch"

set "TOOLS_DIR=%~dp0"
for %%I in ("%TOOLS_DIR%..") do set "ROOT=%%~fI"

set "FRONTEND_PATH=%ROOT%\Frontend"
set "BACKEND_STATIC=%ROOT%\Backend\src\main\resources\static"

if not exist "%BACKEND_STATIC%" mkdir "%BACKEND_STATIC%" >nul 2>&1

REM =========================================================
REM SINCRONIZACION INCREMENTAL (robocopy)
REM - Evita reescribir TODO siempre (xcopy /Y) => menos locks
REM - Reduce fallos de Gradle (:processResources) en Windows
REM =========================================================

if /I "%MODE%"=="--once" (
  call :sync_once
  exit /b 0
)

title Renacer Sync Frontend
color 0A

echo.
echo ============================================
echo    SINCRONIZACION AUTOMATICA FRONTEND
echo ============================================
echo.
echo Modo: %MODE%
echo Presiona Ctrl+C para detener.
echo.

REM Sync inicial (bloqueante)
call :sync_once

:loop
REM Sync incremental cada ~2s (solo copia cambios)
call :sync_once >nul 2>&1
timeout /t 2 /nobreak >nul 2>&1
goto loop

exit /b 0

:sync_once
echo [%time%] Sincronizando (incremental)...

REM VIEW -> static root
if exist "%FRONTEND_PATH%\VIEW" (
  robocopy "%FRONTEND_PATH%\VIEW" "%BACKEND_STATIC%" /E /XO /XN /XC /R:1 /W:1 /NFL /NDL /NJH /NJS /NP >nul
)

REM controller -> static\controller
if exist "%FRONTEND_PATH%\controller" (
  if not exist "%BACKEND_STATIC%\controller" mkdir "%BACKEND_STATIC%\controller" >nul 2>&1
  robocopy "%FRONTEND_PATH%\controller" "%BACKEND_STATIC%\controller" /E /XO /XN /XC /R:1 /W:1 /NFL /NDL /NJH /NJS /NP >nul
)

REM components -> static\components
if exist "%FRONTEND_PATH%\components" (
  if not exist "%BACKEND_STATIC%\components" mkdir "%BACKEND_STATIC%\components" >nul 2>&1
  robocopy "%FRONTEND_PATH%\components" "%BACKEND_STATIC%\components" /E /XO /XN /XC /R:1 /W:1 /NFL /NDL /NJH /NJS /NP >nul
)

REM css/assets directos (si existen)
if exist "%FRONTEND_PATH%\css" (
  if not exist "%BACKEND_STATIC%\css" mkdir "%BACKEND_STATIC%\css" >nul 2>&1
  robocopy "%FRONTEND_PATH%\css" "%BACKEND_STATIC%\css" /E /XO /XN /XC /R:1 /W:1 /NFL /NDL /NJH /NJS /NP >nul
)

if exist "%FRONTEND_PATH%\assets" (
  if not exist "%BACKEND_STATIC%\assets" mkdir "%BACKEND_STATIC%\assets" >nul 2>&1
  robocopy "%FRONTEND_PATH%\assets" "%BACKEND_STATIC%\assets" /E /XO /XN /XC /R:1 /W:1 /NFL /NDL /NJH /NJS /NP >nul
)

exit /b 0


