@echo off
title Servidor Renacer - Backend
color 0A
echo.
echo ============================================
echo    SERVIDOR RENACER - INICIANDO...
echo ============================================
echo.
echo [NOTA] Para sincronizacion automatica, usa el
echo        script INICIAR_SERVIDOR.bat en la raiz del proyecto
echo.

REM Verificar si Java esta instalado
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java no esta instalado o no esta en el PATH
    echo.
    echo Por favor instala Java 21 desde:
    echo https://www.oracle.com/java/technologies/downloads/#java21
    echo.
    echo O ejecuta VERIFICAR_SISTEMA.bat para mas informacion
    echo.
    pause
    exit /b 1
)

REM Verificar version de Java
echo Verificando Java...
java -version
echo.

echo Puerto: http://localhost:8080
echo Usuario: Brandon
echo Contrasena: brandon256
echo.
echo ============================================
echo.

if not exist "gradlew.bat" (
    echo ERROR: No se encuentra gradlew.bat
    echo Asegurate de ejecutar este archivo desde la carpeta Backend
    echo.
    pause
    exit /b 1
)

echo Iniciando servidor backend...
echo.
echo NOTA: Esta ventana debe permanecer abierta mientras uses la aplicacion
echo Para detener el servidor, presiona Ctrl+C
echo.
echo ============================================
echo.

call gradlew.bat bootRun

if errorlevel 1 (
    echo.
    echo ============================================
    echo ERROR: El servidor no pudo iniciarse
    echo ============================================
    echo.
    echo Verifica que:
    echo - Java 21 este instalado (ejecuta: java -version)
    echo - No haya otro proceso usando el puerto 8080
    echo.
    pause
)

