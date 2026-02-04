@echo off
title Eliminar Base de Datos y Reiniciar
color 0C
echo.
echo ============================================
echo    ELIMINAR BASE DE DATOS Y REINICIAR
echo ============================================
echo.
echo ADVERTENCIA: Esto eliminara TODOS los datos
echo de la base de datos y la recreara desde cero.
echo.
echo Presiona Ctrl+C para cancelar o...
pause

set "TOOLS_DIR=%~dp0"
for %%I in ("%TOOLS_DIR%..") do set "ROOT=%%~fI"

echo.
echo [1/3] Verificando si el servidor esta corriendo...
netstat -ano | findstr :8080 >nul 2>nul
if %errorlevel%==0 (
    echo    [ADVERTENCIA] El servidor esta corriendo en el puerto 8080
    echo    Por favor detenlo primero (Ctrl+C en la ventana del servidor)
    echo.
    pause
    exit /b 1
)

echo    [OK] El servidor no esta corriendo
echo.

echo [2/3] Eliminando base de datos...
if exist "%ROOT%\Backend\renacer.db" (
    del /F /Q "%ROOT%\Backend\renacer.db" 2>nul
    del /F /Q "%ROOT%\Backend\renacer.db-shm" 2>nul
    del /F /Q "%ROOT%\Backend\renacer.db-wal" 2>nul
    if %errorlevel%==0 (
        echo    [OK] Base de datos eliminada: Backend\renacer.db
    ) else (
        echo    [ERROR] No se pudo eliminar la base de datos
        echo    Por favor eliminala manualmente: Backend\renacer.db
        pause
        exit /b 1
    )
) else (
    echo    [INFO] La base de datos no existe (esto es normal la primera vez)
)

echo.

echo [3/3] Ahora inicia el servidor...
echo.
echo Ejecuta: INICIAR_SERVIDOR.bat
echo.
echo El servidor creara automaticamente:
echo - Base de datos nueva
echo - Rol ADMIN
echo - Usuario Brandon (contrasena: brandon256)
echo.
pause

