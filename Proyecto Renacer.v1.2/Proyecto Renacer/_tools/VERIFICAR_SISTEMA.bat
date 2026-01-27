@echo off
title Verificacion del Sistema - Renacer
color 0B
echo.
echo ============================================
echo    VERIFICACION DEL SISTEMA
echo ============================================
echo.

set "TOOLS_DIR=%~dp0"
for %%I in ("%TOOLS_DIR%..") do set "ROOT=%%~fI"

REM Verificar Java
echo [1/3] Verificando Java...
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo    [X] Java NO esta instalado o no esta en el PATH
    echo.
    echo    SOLUCION: Instala Java 21 desde:
    echo    https://www.oracle.com/java/technologies/downloads/#java21
    echo.
    set JAVA_OK=0
) else (
    echo    [OK] Java encontrado
    java -version 2>&1 | findstr /i "version"
    echo.
    set JAVA_OK=1
)

REM Verificar Gradle Wrapper
echo [2/3] Verificando Gradle Wrapper...
if exist "%ROOT%\Backend\gradlew.bat" (
    echo    [OK] gradlew.bat encontrado
    set GRADLE_OK=1
) else (
    echo    [X] gradlew.bat NO encontrado
    set GRADLE_OK=0
)

REM Verificar Script
echo [3/3] Verificando Script de Inicio...
if exist "%ROOT%\INICIAR_SERVIDOR.bat" (
    echo    [OK] INICIAR_SERVIDOR.bat encontrado
    set SCRIPT_OK=1
) else (
    echo    [X] INICIAR_SERVIDOR.bat NO encontrado
    set SCRIPT_OK=0
)

echo.
echo ============================================
echo    RESUMEN
echo ============================================
echo.

if %JAVA_OK%==1 if %GRADLE_OK%==1 if %SCRIPT_OK%==1 (
    echo    [OK] Todo esta listo para iniciar el servidor
    echo.
    echo    Puedes ejecutar: INICIAR_SERVIDOR.bat
    echo.
) else (
    echo    [X] Hay problemas que resolver antes de continuar
    echo.
    if %JAVA_OK%==0 (
        echo    - Necesitas instalar Java 21
    )
    if %GRADLE_OK%==0 (
        echo    - Falta el archivo gradlew.bat
    )
    if %SCRIPT_OK%==0 (
        echo    - Falta el archivo INICIAR_SERVIDOR.bat
    )
    echo.
)

pause


