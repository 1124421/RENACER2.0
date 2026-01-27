@echo off
REM Este wrapper queda por compatibilidad.
REM El script de raiz ya maneja sincronizacion segura + arranque.

set "TOOLS_DIR=%~dp0"
for %%I in ("%TOOLS_DIR%..") do set "ROOT=%%~fI"

call "%ROOT%\INICIAR_SERVIDOR.bat"


