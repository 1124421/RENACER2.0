@echo off
setlocal
title Servidor Renacer - Backend
color 0A

REM ============================================
REM  SERVIDOR RENACER (Backend) + Sync Frontend
REM  - Sync inicial bloqueante (una vez)
REM  - Sync incremental en segundo plano (robocopy)
REM  Evita locks que rompen Gradle :processResources
REM
REM  Uso:
REM    INICIAR_SERVIDOR.bat          -> inicia todo
REM    INICIAR_SERVIDOR.bat --diag   -> verifica prerequisitos y sale
REM ============================================

set "ARG1=%~1"

echo.
echo ============================================
echo    SERVIDOR RENACER - INICIANDO...
echo ============================================
echo.

REM Sync inicial BLOQUEANTE
echo [INFO] Sincronizando Frontend (una vez)...
call "%~dp0_tools\SINCRONIZAR_FRONTEND.bat" --once
if errorlevel 1 (
  echo [ERROR] Fallo la sincronizacion inicial.
  echo         Revisa permisos/antivirus o intenta ejecutar como Administrador.
  pause
  exit /b 1
)
echo [INFO] Sincronizacion inicial OK

REM Verificar Java
where java >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Java no esta instalado o no esta en el PATH
  echo.
  echo Instala Java 21+ y vuelve a intentar.
  pause
  exit /b 1
)

echo Verificando Java...
java -version
echo.

echo Puerto: http://localhost:8080
echo Usuario: Brandon
echo Contrasena: brandon256
echo.

REM Si solo es diagnostico, salir aqui
if /I "%ARG1%"=="--diag" (
  echo [INFO] Diagnostico OK. No se inicio Gradle.
  pause
  exit /b 0
)

REM Asegurar SOLO 1 proceso de sincronizacion incremental (solo cuando se inicia servidor)
taskkill /FI "WINDOWTITLE eq Renacer Sync Frontend*" /F >nul 2>&1
echo [INFO] Activando sincronizacion automatica (incremental)...
start "Sincronizacion Automatica Frontend" /MIN "%~dp0_tools\SINCRONIZAR_FRONTEND.bat" --watch
timeout /t 1 /nobreak >nul

REM Ir a Backend y validar wrapper
cd /d "%~dp0Backend"
if not exist "gradlew.bat" (
  echo [ERROR] No se encuentra gradlew.bat en la carpeta Backend
  pause
  exit /b 1
)

echo ============================================
echo Iniciando servidor backend...
echo [INFO] Sincronizacion automatica ACTIVADA
echo        Refresca el navegador con Ctrl+F5 para ver cambios
echo ============================================
echo.

call gradlew.bat bootRun
set "GRADLE_EXIT=%ERRORLEVEL%"

REM Detener la sincronizacion automatica cuando el servidor se cierre
echo.
echo [INFO] Deteniendo sincronizacion automatica...
taskkill /FI "WINDOWTITLE eq Renacer Sync Frontend*" /F >nul 2>&1

if not "%GRADLE_EXIT%"=="0" (
  echo.
  echo ============================================
  echo ERROR: El servidor no pudo iniciarse (codigo %GRADLE_EXIT%)
  echo ============================================
  echo.
  echo Verifica que:
  echo - No haya otro proceso usando el puerto 8080
  echo - No haya antivirus bloqueando archivos
  echo.
  pause
)

endlocal
exit /b %GRADLE_EXIT%


