@echo off
setlocal EnableExtensions EnableDelayedExpansion

title Renacer - Instalar Dependencias y Ejecutar Servidor
color 0A

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%Backend"
set "PREREQ_DIR=%TEMP%\RenacerPrereq"

echo.
echo ============================================
echo   RENACER - INSTALAR Y EJECUTAR SERVIDOR
echo ============================================
echo.

REM -----------------------------
REM Args
REM   --solo-instalar : instala prerequisitos y dependencias, no ejecuta el servidor
REM -----------------------------
set "SOLO_INSTALAR=0"
if /I "%~1"=="--solo-instalar" set "SOLO_INSTALAR=1"

REM -----------------------------
REM Validaciones basicas de estructura
REM -----------------------------
if not exist "%BACKEND_DIR%\gradlew.bat" (
  echo [ERROR] No se encuentra: "%BACKEND_DIR%\gradlew.bat"
  echo Asegurate de ejecutar este .bat desde la carpeta raiz "Proyecto Renacer".
  echo.
  pause
  exit /b 1
)

REM -----------------------------
REM Elevacion a Administrador (necesaria para instalar Java / VC++)
REM -----------------------------
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo [INFO] Se requieren permisos de Administrador para instalar dependencias.
  echo [INFO] Solicitando elevacion...
  echo.
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs -ArgumentList @('%*')"
  exit /b 0
)

REM -----------------------------
REM Preparar carpeta temporal
REM -----------------------------
if not exist "%PREREQ_DIR%" mkdir "%PREREQ_DIR%" >nul 2>&1

REM -----------------------------
REM Chequeo simple de Internet (Gradle necesita descargar dependencias)
REM -----------------------------
echo [INFO] Verificando conexion a Internet...
ping -n 1 -w 2500 8.8.8.8 >nul 2>&1
if %errorlevel% neq 0 (
  echo [WARN] No se pudo verificar conectividad (ping bloqueado o sin Internet).
  echo        Si Gradle no puede descargar dependencias, el inicio fallara.
  echo.
) else (
  echo [OK] Conexion detectada.
  echo.
)

REM -----------------------------
REM Instalar Microsoft Visual C++ Redistributable (recomendado para librerias nativas)
REM -----------------------------
call :instalar_vcredist
if %errorlevel% neq 0 (
  echo.
  echo [WARN] No se pudo instalar VC++ Redistributable automaticamente.
  echo        Continuo igual; si falla SQLite/JDBC, instalalo manualmente:
  echo        https://aka.ms/vs/17/release/vc_redist.x64.exe
  echo.
)

REM -----------------------------
REM Asegurar Java 21+ (requerido por Spring Boot / Gradle Toolchain)
REM -----------------------------
call :asegurar_java21
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] No se pudo asegurar Java 21 o superior.
  echo        Soluciones:
  echo        - Instala Java 21 manualmente (Eclipse Temurin o Microsoft OpenJDK)
  echo        - Luego vuelve a ejecutar este script
  echo.
  pause
  exit /b 1
)

REM -----------------------------
REM Instalar dependencias del proyecto (Gradle descarga todo en primera ejecucion)
REM -----------------------------
echo [INFO] Preparando dependencias del proyecto (Gradle)...
pushd "%BACKEND_DIR%" >nul
call gradlew.bat --no-daemon --console=plain -q tasks >nul 2>&1
popd >nul
echo [OK] Gradle Wrapper listo (las descargas pueden ocurrir al compilar/bootRun).
echo.

if "%SOLO_INSTALAR%"=="1" (
  echo [OK] Instalacion completada. (Modo: --solo-instalar)
  echo.
  pause
  exit /b 0
)

REM -----------------------------
REM Verificar puerto 8080
REM -----------------------------
echo [INFO] Verificando puerto 8080...
netstat -ano | findstr /R /C:":8080 .*LISTENING" >nul 2>&1
if %errorlevel%==0 (
  echo [ERROR] El puerto 8080 ya esta en uso.
  echo        Cierra el proceso que lo usa o cambia el puerto en:
  echo        Backend\src\main\resources\application.properties
  echo.
  echo Para ver que proceso lo usa:
  echo   netstat -ano ^| findstr :8080
  echo.
  pause
  exit /b 1
)
echo [OK] Puerto 8080 libre.
echo.

REM -----------------------------
REM Ejecutar servidor
REM -----------------------------
echo ============================================
echo  Iniciando servidor en: http://localhost:8080
echo  Usuario: Brandon
echo  Contrasena: brandon256
echo ============================================
echo.
echo NOTA: Esta ventana debe permanecer abierta mientras uses la aplicacion.
echo Para detener el servidor, presiona Ctrl+C.
echo.

pushd "%BACKEND_DIR%"
call gradlew.bat bootRun
set "BOOTRUN_EXIT=%errorlevel%"
popd

if not "%BOOTRUN_EXIT%"=="0" (
  echo.
  echo ============================================
  echo ERROR: El servidor no pudo iniciarse (codigo: %BOOTRUN_EXIT%)
  echo ============================================
  echo.
  echo Verifica que:
  echo - Java sea 21 o superior
  echo - Tengas Internet para descargar dependencias
  echo - El puerto 8080 este libre
  echo.
  pause
)

exit /b %BOOTRUN_EXIT%

REM =========================================================
REM Funciones
REM =========================================================

:download
REM %1 = URL, %2 = OUTFILE
set "DL_URL=%~1"
set "DL_OUT=%~2"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ProgressPreference='SilentlyContinue';" ^
  "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;" ^
  "Invoke-WebRequest -UseBasicParsing -Uri '%DL_URL%' -OutFile '%DL_OUT%' -MaximumRedirection 20"
exit /b %errorlevel%

:instalar_vcredist
echo [INFO] Instalando VC++ Redistributable (x64)...
set "VCR_EXE=%PREREQ_DIR%\vc_redist.x64.exe"
if not exist "%VCR_EXE%" (
  call :download "https://aka.ms/vs/17/release/vc_redist.x64.exe" "%VCR_EXE%"
  if %errorlevel% neq 0 (
    echo [WARN] Descarga fallida: VC++ Redistributable
    exit /b 1
  )
)

"%VCR_EXE%" /install /quiet /norestart
set "VCR_RC=%errorlevel%"
if "%VCR_RC%"=="0" (
  echo [OK] VC++ Redistributable instalado.
  echo.
  exit /b 0
)
if "%VCR_RC%"=="3010" (
  echo [OK] VC++ Redistributable instalado (reinicio recomendado).
  echo.
  exit /b 0
)
if "%VCR_RC%"=="1638" (
  echo [OK] VC++ Redistributable ya estaba instalado (otra version detectada).
  echo.
  exit /b 0
)
if "%VCR_RC%"=="1641" (
  echo [OK] VC++ Redistributable instalado (reinicio iniciado/requerido).
  echo.
  exit /b 0
)
echo [WARN] Instalacion VC++ devolvio codigo: %VCR_RC%
exit /b 1

:get_java_major
REM %1 = nombre de variable de salida
set "%~1="
where java >nul 2>nul
if %errorlevel% neq 0 exit /b 0
for /f "usebackq delims=" %%m in (`powershell -NoProfile -Command "$line=(java -version 2^>^&1 | Select-Object -First 1); if($line -match '\"([0-9]+)'){ $Matches[1] }"`) do (
  set "%~1=%%m"
)
exit /b 0

:detect_java_home
set "JAVA_HOME="
for /f "usebackq delims=" %%p in (`powershell -NoProfile -Command ^
  "$c=@();" ^
  "$c+=Get-ChildItem 'C:\Program Files\Eclipse Adoptium' -Directory -ErrorAction SilentlyContinue ^| ?{ $_.Name -like 'jdk-21*' };" ^
  "$c+=Get-ChildItem 'C:\Program Files\Java' -Directory -ErrorAction SilentlyContinue ^| ?{ $_.Name -like 'jdk-21*' };" ^
  "$c+=Get-ChildItem 'C:\Program Files\Microsoft' -Directory -ErrorAction SilentlyContinue ^| ?{ $_.Name -like 'jdk-21*' };" ^
  "$d=$c ^| Sort-Object LastWriteTime -Descending ^| Select-Object -First 1;" ^
  "if($d){ $d.FullName }"`) do (
  set "JAVA_HOME=%%p"
)

if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" (
  set "PATH=%JAVA_HOME%\bin;%PATH%"
  exit /b 0
)

REM Fallback: usar where java
for /f "usebackq delims=" %%j in (`where java 2^>nul`) do (
  set "JAVA_EXE_PATH=%%j"
  goto :_from_where
)

:_from_where
if defined JAVA_EXE_PATH (
  for %%d in ("%JAVA_EXE_PATH%") do set "JAVA_HOME=%%~dpd.."
)

if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" (
  set "PATH=%JAVA_HOME%\bin;%PATH%"
  exit /b 0
)
exit /b 1

:persist_java_home
REM Persiste JAVA_HOME y agrega JAVA_HOME\bin al PATH (Machine)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$jh=$env:JAVA_HOME; if(-not $jh){ exit 1 };" ^
  "[Environment]::SetEnvironmentVariable('JAVA_HOME',$jh,'Machine');" ^
  "$p=[Environment]::GetEnvironmentVariable('Path','Machine');" ^
  "$jb=Join-Path $jh 'bin';" ^
  "if($p -and ($p -notmatch [regex]::Escape($jb))){ [Environment]::SetEnvironmentVariable('Path', ($p + ';' + $jb), 'Machine') }" >nul 2>&1
exit /b 0

:asegurar_java21
call :get_java_major JAVA_MAJOR
if not defined JAVA_MAJOR set "JAVA_MAJOR=0"

if %JAVA_MAJOR% GEQ 21 (
  echo [OK] Java %JAVA_MAJOR% detectado.
  echo.
  exit /b 0
)

if "%JAVA_MAJOR%"=="0" (
  echo [INFO] Java no detectado. Se instalara Java 21 (Eclipse Temurin).
) else (
  echo [INFO] Java %JAVA_MAJOR% detectado, pero se requiere 21+. Se instalara Java 21.
)
echo.

set "JDK_MSI=%PREREQ_DIR%\temurin-jdk21.msi"
call :download "https://api.adoptium.net/v3/installer/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk" "%JDK_MSI%"
if %errorlevel% neq 0 (
  echo [ERROR] No se pudo descargar el instalador de Java 21.
  exit /b 1
)

echo [INFO] Instalando Java 21 (puede tardar)...
msiexec /i "%JDK_MSI%" /qn /norestart
set "JDK_RC=%errorlevel%"
if not "%JDK_RC%"=="0" if not "%JDK_RC%"=="3010" (
  echo [ERROR] Instalacion de Java devolvio codigo: %JDK_RC%
  exit /b 1
)

call :detect_java_home
if %errorlevel% neq 0 (
  echo [ERROR] Java instalado pero no pude detectar JAVA_HOME automaticamente.
  exit /b 1
)

call :persist_java_home

echo [OK] Java configurado para esta sesion:
echo      JAVA_HOME=%JAVA_HOME%
echo.
java -version
echo.
exit /b 0


