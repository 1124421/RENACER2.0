@echo off
title Abrir Frontend Renacer
color 0B
echo.
echo ============================================
echo    ABRIENDO FRONTEND RENACER
echo ============================================
echo.

REM Verificar si el servidor está corriendo
netstat -ano | findstr :8080 >nul 2>nul
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] El servidor backend no parece estar corriendo
    echo.
    echo Por favor ejecuta primero: INICIAR_SERVIDOR.bat
    echo.
    pause
    exit /b 1
)

echo [OK] Servidor backend detectado en puerto 8080
echo.
echo Abriendo navegador en: http://localhost:8080
echo.

REM Abrir en el navegador predeterminado
start http://localhost:8080

echo Frontend abierto en el navegador
echo.
echo Usuario: Brandon
echo Contrasena: brandon256
echo.
timeout /t 3 >nul

