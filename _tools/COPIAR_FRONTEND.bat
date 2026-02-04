@echo off
title Copiar Frontend a Backend
color 0B
echo.
echo ============================================
echo    COPIANDO FRONTEND A BACKEND
echo ============================================
echo.

set "TOOLS_DIR=%~dp0"
for %%I in ("%TOOLS_DIR%..") do set "ROOT=%%~fI"
set "FRONTEND_DIR=%ROOT%\Frontend"
set "BACKEND_STATIC=%ROOT%\Backend\src\main\resources\static"

if not exist "%FRONTEND_DIR%\VIEW" (
    echo [ERROR] No se encuentra la carpeta Frontend\VIEW
    pause
    exit /b 1
)

if not exist "%BACKEND_STATIC%" (
    mkdir "%BACKEND_STATIC%"
    echo [OK] Carpeta static creada
)

echo Limpiando contenido anterior...
del /S /Q "%BACKEND_STATIC%\*" >nul 2>&1
for /d %%d in ("%BACKEND_STATIC%\*") do rmdir /s /q "%%d" >nul 2>&1

echo Copiando archivos del frontend desde Frontend\VIEW...
xcopy /E /I /Y "%FRONTEND_DIR%\VIEW\*" "%BACKEND_STATIC%\"

echo Copiando archivos JavaScript del controller...
if exist "%FRONTEND_DIR%\controller" (
    xcopy /E /I /Y "%FRONTEND_DIR%\controller\*" "%BACKEND_STATIC%\controller\"
)

echo Copiando componentes...
if exist "%FRONTEND_DIR%\components" (
    xcopy /E /I /Y "%FRONTEND_DIR%\components\*" "%BACKEND_STATIC%\components\"
)

if %errorlevel%==0 (
    echo.
    echo ============================================
    echo    [OK] Archivos copiados correctamente
    echo ============================================
    echo.
    echo IMPORTANTE: Debes reiniciar el servidor para
    echo que los cambios surtan efecto.
    echo.
) else (
    echo.
    echo [ERROR] Hubo un problema al copiar los archivos
    echo.
)

pause

