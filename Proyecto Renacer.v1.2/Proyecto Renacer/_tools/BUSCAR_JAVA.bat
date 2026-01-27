@echo off
title Buscando Java en el Sistema
color 0E
echo.
echo ============================================
echo    BUSCANDO INSTALACIONES DE JAVA
echo ============================================
echo.

set JAVA_ENCONTRADO=0

echo [1] Buscando en PATH del sistema...
where java >nul 2>nul
if %errorlevel%==0 (
    echo    [OK] Java encontrado en PATH
    java -version
    echo.
    set JAVA_ENCONTRADO=1
) else (
    echo    [X] Java no encontrado en PATH
    echo.
)

echo [2] Buscando en ubicaciones comunes...
echo.

REM Buscar en Program Files\Java
if exist "C:\Program Files\Java" (
    echo    [OK] Carpeta encontrada: C:\Program Files\Java
    dir "C:\Program Files\Java" /b /ad
    echo.
    set JAVA_ENCONTRADO=1
) else (
    echo    [X] No encontrado en: C:\Program Files\Java
    echo.
)

REM Buscar en Program Files (x86)\Java
if exist "C:\Program Files (x86)\Java" (
    echo    [OK] Carpeta encontrada: C:\Program Files (x86)\Java
    dir "C:\Program Files (x86)\Java" /b /ad
    echo.
    set JAVA_ENCONTRADO=1
) else (
    echo    [X] No encontrado en: C:\Program Files (x86)\Java
    echo.
)

REM Buscar en Eclipse Adoptium
if exist "C:\Program Files\Eclipse Adoptium" (
    echo    [OK] Carpeta encontrada: C:\Program Files\Eclipse Adoptium
    dir "C:\Program Files\Eclipse Adoptium" /b /ad
    echo.
    set JAVA_ENCONTRADO=1
) else (
    echo    [X] No encontrado en: C:\Program Files\Eclipse Adoptium
    echo.
)

REM Verificar JAVA_HOME
if defined JAVA_HOME (
    echo [3] Variable JAVA_HOME configurada:
    echo    %JAVA_HOME%
    if exist "%JAVA_HOME%\bin\java.exe" (
        echo    [OK] java.exe encontrado en JAVA_HOME
        "%JAVA_HOME%\bin\java.exe" -version
        echo.
        set JAVA_ENCONTRADO=1
    ) else (
        echo    [X] java.exe NO encontrado en JAVA_HOME
        echo.
    )
) else (
    echo [3] Variable JAVA_HOME no configurada
    echo.
)

echo ============================================
echo    RESUMEN
echo ============================================
echo.

if %JAVA_ENCONTRADO%==1 (
    echo    Java esta instalado pero NO esta en el PATH
    echo.
    echo    SOLUCION:
    echo    1. Encuentra la carpeta 'bin' de Java arriba
    echo    2. Agrega esa ruta al PATH del sistema
    echo    3. O ejecuta INSTALAR_JAVA.md para instrucciones
    echo.
) else (
    echo    Java NO esta instalado
    echo.
    echo    SOLUCION:
    echo    - Instala Java 21 desde:
    echo      https://www.oracle.com/java/technologies/downloads/#java21
    echo    - O ve a INSTALAR_JAVA.md para mas opciones
    echo.
)

pause


