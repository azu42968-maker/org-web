@echo off
setlocal EnableDelayedExpansion

REM Trabaja siempre en la carpeta donde esta este .bat
cd /d "%~dp0"

echo ========================================
echo   Reconfigurar datos de GitHub
echo   Carpeta: %cd%
echo ========================================
echo.

REM --- Comprobar que Git esta instalado ---
where git >nul 2>&1
if not errorlevel 1 goto git_ok
if exist "%ProgramFiles%\Git\cmd\git.exe" set "PATH=%PATH%;%ProgramFiles%\Git\cmd"
where git >nul 2>&1
if not errorlevel 1 goto git_ok
echo [ERROR] Git no esta instalado o Windows no lo encuentra.
pause
exit /b 1
:git_ok

REM --- Leer los valores actuales ---
set "CUR_NAME="
for /f "delims=" %%A in ('git config --global user.name 2^>nul') do set "CUR_NAME=%%A"
set "CUR_MAIL="
for /f "delims=" %%A in ('git config --global user.email 2^>nul') do set "CUR_MAIL=%%A"
set "CUR_URL="
if exist ".git" for /f "delims=" %%A in ('git remote get-url origin 2^>nul') do set "CUR_URL=%%A"

echo Deja un campo vacio y pulsa Enter para mantener el valor actual.
echo.

REM --- Nombre ---
echo Nombre actual: !CUR_NAME!
set "NEW_NAME="
set /p NEW_NAME=Nuevo nombre: 
if not "!NEW_NAME!"=="" git config --global user.name "!NEW_NAME!"
echo.

REM --- Correo ---
echo Correo actual: !CUR_MAIL!
set "NEW_MAIL="
set /p NEW_MAIL=Nuevo correo: 
if not "!NEW_MAIL!"=="" git config --global user.email "!NEW_MAIL!"
echo.

REM --- URL del repo ---
if not exist ".git" (
    echo Inicializando repositorio en esta carpeta...
    git init
    git branch -M main
)
echo URL actual del repo: !CUR_URL!
set "NEW_URL="
set /p NEW_URL=Nueva URL del repo: 
if not "!NEW_URL!"=="" if defined CUR_URL git remote set-url origin "!NEW_URL!"
if not "!NEW_URL!"=="" if not defined CUR_URL git remote add origin "!NEW_URL!"
echo.

REM --- Mostrar como quedo todo ---
echo ========================================
echo   Datos guardados
echo ========================================
for /f "delims=" %%A in ('git config --global user.name 2^>nul') do echo Nombre: %%A
for /f "delims=" %%A in ('git config --global user.email 2^>nul') do echo Correo: %%A
git remote -v
echo.
echo Listo. Ahora ejecuta subir_a_github.bat para subir la web.
pause
