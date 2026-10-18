@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo ========================================
echo   Descargar web desde GitHub
echo ========================================
echo.

REM --- Instalar Git si falta (winget viene en Windows 10/11) ---
where git >nul 2>&1
if not errorlevel 1 goto git_ok
if exist "%ProgramFiles%\Git\cmd\git.exe" set "PATH=%PATH%;%ProgramFiles%\Git\cmd"
where git >nul 2>&1
if not errorlevel 1 goto git_ok
echo Git no esta instalado. Instalando con winget...
winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
if exist "%ProgramFiles%\Git\cmd\git.exe" set "PATH=%PATH%;%ProgramFiles%\Git\cmd"
where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] No se pudo instalar Git. Descargalo en https://git-scm.com/download/win
    echo Despues cierra esta ventana y vuelve a ejecutar el script.
    pause
    exit /b 1
)
:git_ok

REM --- Si ya hay un repo en esta carpeta, solo actualizar ---
if exist ".git" (
    echo Actualizando...
    git pull origin main
    goto fin
)

REM --- Primera vez: pedir URL y clonar en esta carpeta ---
set /p REPO_URL=Pega la URL del repo, por ejemplo https://github.com/usuario/mi-web.git : 
if "!REPO_URL!"=="" (
    echo [ERROR] No escribiste ninguna URL.
    pause
    exit /b 1
)
git init
git branch -M main
git remote add origin "!REPO_URL!"
git pull origin main
if errorlevel 1 (
    echo [ERROR] No se pudo descargar. Revisa la URL o tu login de GitHub.
    pause
    exit /b 1
)

:fin
echo.
echo Listo, web descargada en %cd%
pause
