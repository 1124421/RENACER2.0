@echo off
title Agregar Java al PATH
color 0A
echo.
echo ============================================
echo    AGREGANDO JAVA AL PATH DEL SISTEMA
echo ============================================
echo.

REM Verificar si Java ya esta en el PATH
where java >nul 2>nul
if %errorlevel%==0 (
    echo [OK] Java ya esta en el PATH
    java -version
    echo.
    echo No es necesario agregarlo.
    pause
    exit /b 0
)

REM Buscar Java en ubicaciones comunes
set JAVA_PATH=

if exist "C:\Program Files\Java\jdk-25\bin\java.exe" (
    set "JAVA_PATH=C:\Program Files\Java\jdk-25\bin"
    echo [OK] Java encontrado: jdk-25
    goto :agregar_path
)

if exist "C:\Program Files\Java\jdk-21\bin\java.exe" (
    set "JAVA_PATH=C:\Program Files\Java\jdk-21\bin"
    echo [OK] Java encontrado: jdk-21
    goto :agregar_path
)

REM Buscar cualquier JDK
for /d %%d in ("C:\Program Files\Java\jdk*") do (
    if exist "%%d\bin\java.exe" (
        set "JAVA_PATH=%%d\bin"
        echo [OK] Java encontrado: %%d
        goto :agregar_path
    )
)

echo [ERROR] No se encontro Java instalado
echo.
echo Por favor instala Java 21 desde:
echo https://www.oracle.com/java/technologies/downloads/#java21
pause
exit /b 1

:agregar_path
echo.
echo Agregando al PATH del usuario: %JAVA_PATH%
echo.
echo NOTA: Esto requiere permisos de administrador
echo.

REM Intentar agregar al PATH del usuario (no requiere admin)
setx PATH "%PATH%;%JAVA_PATH%" >nul 2>nul
if %errorlevel%==0 (
    echo [OK] Java agregado al PATH correctamente
    echo.
    echo IMPORTANTE: Debes cerrar y reabrir todas las ventanas de CMD/PowerShell
    echo para que el cambio tenga efecto.
    echo.
    echo Verificando version de Java...
    "%JAVA_PATH%\java.exe" -version
    echo.
) else (
    echo [ERROR] No se pudo agregar al PATH automaticamente
    echo.
    echo SOLUCION MANUAL:
    echo 1. Presiona Win + R
    echo 2. Escribe: sysdm.cpl
    echo 3. Ve a "Opciones avanzadas" ^> "Variables de entorno"
    echo 4. En "Variables de usuario", busca "Path"
    echo 5. Agrega esta ruta: %JAVA_PATH%
    echo.
)

pause


