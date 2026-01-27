@echo off
title Verificar Estado del Servidor
color 0B
echo.
echo ============================================
echo    VERIFICANDO ESTADO DEL SERVIDOR
echo ============================================
echo.

REM Verificar si el puerto 8080 esta en uso
echo [1/3] Verificando puerto 8080...
netstat -ano | findstr :8080 >nul 2>nul
if %errorlevel%==0 (
    echo    [OK] Puerto 8080 esta en uso
    netstat -ano | findstr :8080
    echo.
) else (
    echo    [X] Puerto 8080 NO esta en uso
    echo    El servidor no esta corriendo
    echo.
)

REM Verificar procesos Java
echo [2/3] Verificando procesos Java...
tasklist /FI "IMAGENAME eq java.exe" 2>NUL | find /I /N "java.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo    [OK] Procesos Java encontrados
    tasklist /FI "IMAGENAME eq java.exe"
    echo.
) else (
    echo    [X] No hay procesos Java corriendo
    echo.
)

REM Intentar conectar al servidor
echo [3/3] Intentando conectar al servidor...
echo.
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/api/usuarios' -Method GET -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; Write-Host '    [OK] Servidor respondiendo (Status:' $response.StatusCode ')' } catch { if ($_.Exception.Response.StatusCode -eq 401) { Write-Host '    [OK] Servidor funcionando (requiere autenticacion)' } else { Write-Host '    [X] No se pudo conectar al servidor' } }" 2>nul

echo.
echo ============================================
echo    RESUMEN
echo ============================================
echo.

netstat -ano | findstr :8080 >nul 2>nul
if %errorlevel%==0 (
    echo    [OK] El servidor parece estar corriendo
    echo.
    echo    Prueba acceder a:
    echo    http://localhost:8080/api/usuarios
    echo.
    echo    O abre el frontend y usa:
    echo    Usuario: Brandon
    echo    Contrasena: brandon256
    echo.
) else (
    echo    [X] El servidor NO esta corriendo
    echo.
    echo    Inicia el servidor ejecutando:
    echo    INICIAR_SERVIDOR.bat
    echo.
)

pause


