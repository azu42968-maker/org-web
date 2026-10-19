#!/usr/bin/env bash
# Sube a GitHub los dos proyectos y pasa los ejecutables compilados a la web:
#   1. azu-mod-maker  (AzuModification + workflow de GitHub Actions)  -> push
#   2. GitHub Actions compila Lin/Win/Mac -> se bajan a org-web/files/mods/
#   3. org-web        (la pagina de Acid)                              -> push
#
# Uso:  ./subir_a_github.sh            -> todo (con menu para los ejecutables)
#       ./subir_a_github.sh org-web    -> solo org-web
#       ./subir_a_github.sh azu-mod    -> solo azu-mod-maker (basta parte del nombre)
#       ./subir_a_github.sh --exe      -> solo bajar ejecutables a files/mods y subir org-web

export PATH="$HOME/.local/bin:/home/linuxbrew/.linuxbrew/bin:$PATH"

GH_USER="azu42968-maker"
ORG_DIR="$HOME/azu42968-maker/org-web"
MOD_DIR="$HOME/azu42968-maker/azu-mod-maker"
MODS_DEST="$ORG_DIR/files/mods"            # donde apuntan los botones del index.html
MOD_SLUG="$GH_USER/azu-mod-maker"
LIMITE_MB=95                               # GitHub rechaza archivos de mas de 100 MB

# nombre|carpeta|url   (azu-mod-maker primero: sus ejecutables alimentan a org-web)
REPOS=(
  "azu-mod-maker|$MOD_DIR|https://github.com/$GH_USER/azu-mod-maker.git"
  "org-web|$ORG_DIR|https://github.com/$GH_USER/org-web.git"
)

salir() { read -rp "Pulsa Enter para salir..." _; exit "${1:-0}"; }

echo "========================================"
echo "  Subir proyectos a GitHub"
echo "========================================"
echo

# --- Git instalado? ---
if ! command -v git >/dev/null 2>&1; then
  echo "[ERROR] Git no esta instalado."
  echo "En Bazzite/Fedora Atomic: usa 'brew install git' o corre este script dentro de distrobox."
  salir 1
fi

# --- Nombre y correo de Git, solo si faltan ---
if [ -z "$(git config --global user.name)" ]; then
  read -rp "Tu nombre para los commits: " GIT_NAME
  git config --global user.name "$GIT_NAME"
fi
if [ -z "$(git config --global user.email)" ]; then
  read -rp "Tu correo de GitHub: " GIT_MAIL
  git config --global user.email "$GIT_MAIL"
fi

# --- Login a GitHub (abre Firefox) ---
abrir_navegador() {
  if command -v firefox >/dev/null 2>&1; then
    export GH_BROWSER="firefox"
  elif command -v flatpak >/dev/null 2>&1 && flatpak info org.mozilla.firefox >/dev/null 2>&1; then
    export GH_BROWSER="flatpak run org.mozilla.firefox"
  fi
}

instalar_gh() {
  echo "Descargando GitHub CLI (gh) a ~/.local/bin ..."
  mkdir -p "$HOME/.local/bin"
  local url tmp ver
  ver=$(curl -fsSIL -o /dev/null -w '%{url_effective}' https://github.com/cli/cli/releases/latest | sed 's#.*/tag/v##')
  [ -z "$ver" ] && { echo "[ERROR] No pude obtener la version de gh."; return 1; }
  url="https://github.com/cli/cli/releases/download/v${ver}/gh_${ver}_linux_amd64.tar.gz"
  tmp=$(mktemp -d)
  curl -fsSL "$url" -o "$tmp/gh.tar.gz" || return 1
  tar xzf "$tmp/gh.tar.gz" -C "$tmp" || return 1
  cp "$tmp"/gh_*/bin/gh "$HOME/.local/bin/gh" && chmod +x "$HOME/.local/bin/gh"
  rm -rf "$tmp"
  command -v gh >/dev/null 2>&1
}

asegurar_login() {
  if ! command -v gh >/dev/null 2>&1; then
    if command -v brew >/dev/null 2>&1; then
      brew install gh || instalar_gh || return 1
    else
      instalar_gh || return 1
    fi
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo
    echo "Hay que iniciar sesion en GitHub. Se abrira Firefox:"
    echo "copia el codigo que aparece aqui, pegalo en la pagina y autoriza."
    abrir_navegador
    gh auth login --hostname github.com --git-protocol https --web --scopes "repo,read:org,gist,workflow" || return 1
  fi
  # Para subir .github/workflows hace falta el permiso "workflow"
  if ! gh auth status 2>&1 | grep -q "workflow"; then
    echo
    echo "Falta el permiso 'workflow' (necesario para subir GitHub Actions). Se abrira Firefox otra vez..."
    abrir_navegador
    gh auth refresh --hostname github.com --scopes workflow || return 1
  fi
  gh auth setup-git >/dev/null 2>&1
  return 0
}

# --- Pedir login una sola vez para los dos repos ---
asegurar_login

# --- Mensaje de commit (uno solo para todos) ---
echo
read -rp "Mensaje del commit, Enter para usar fecha y hora: " MSG
[ -z "$MSG" ] && MSG="Actualizacion $(date '+%d/%m/%Y %H:%M:%S')"

hacer_push() {
  PUSH_OUT=$(LC_ALL=C.UTF-8 git push -u origin main 2>&1)
  local rc=$?
  echo "$PUSH_OUT"
  return $rc
}

# Anade al .gitignore las lineas que falten
asegurar_ignore() {
  touch .gitignore
  local l
  for l in "$@"; do
    grep -qxF -- "$l" .gitignore || echo "$l" >> .gitignore
  done
}

# Sube UN repo. Devuelve 0 si todo bien, 1 si fallo o cancelaste.
subir_repo() {
  local nombre="$1" dir="$2" url="$3"

  echo
  echo "========================================"
  echo "  $nombre"
  echo "  Carpeta: $dir"
  echo "========================================"

  cd "$dir" 2>/dev/null || { echo "[ERROR] No existe la carpeta $dir"; return 1; }

  # Inicializar la primera vez
  if [ ! -d .git ]; then
    echo "Primera vez: inicializando repositorio..."
    git init -b main >/dev/null 2>&1 || { git init >/dev/null; git symbolic-ref HEAD refs/heads/main; }
  fi
  # Asegurar que la rama se llama main
  if [ "$(git symbolic-ref --short HEAD 2>/dev/null)" != "main" ]; then
    git branch -M main 2>/dev/null || git symbolic-ref HEAD refs/heads/main
  fi

  # Remoto
  if git remote get-url origin >/dev/null 2>&1; then
    git remote set-url origin "$url"
  else
    git remote add origin "$url"
  fi

  # .gitignore
  if [ ! -f .gitignore ]; then
    printf '%s\n' '.DS_Store' 'Thumbs.db' '*.swp' '*~' '.directory' > .gitignore
  fi
  if [ "$nombre" = "azu-mod-maker" ]; then
    # Los ejecutables y temporales de PyInstaller no se suben al repo
    asegurar_ignore 'Ejecutables/' 'build/' 'dist/' 'release/' '__pycache__/' '*.pyc'

    # GitHub solo lee workflows desde .github/workflows/: si build.yml esta suelto
    # en la raiz del proyecto, lo muevo al sitio correcto.
    if [ -f build.yml ]; then
      mkdir -p .github/workflows
      mv -f build.yml .github/workflows/build.yml
      echo "build.yml movido a .github/workflows/"
    fi
    if [ ! -f .github/workflows/build.yml ]; then
      echo "[!] Falta .github/workflows/build.yml: sin el no hay build de ejecutables."
    fi
  fi

  # Commit
  git add -A
  echo
  echo "Resumen de lo que se va a subir:"
  git diff --cached --shortstat
  if ! git diff --cached --quiet; then
    git commit -q -m "$MSG" && echo "Commit hecho: $MSG"
  else
    echo "No hay cambios nuevos que commitear."
  fi

  # Push
  echo
  echo "Subiendo $nombre..."
  hacer_push && { echo "[OK] $nombre subido."; return 0; }

  # Fallo de autenticacion: reloguear y reintentar una vez
  if echo "$PUSH_OUT" | grep -qiE "Authentication failed|Invalid username or token|could not read Username"; then
    echo
    echo "[!] Falta iniciar sesion en GitHub."
    gh auth logout --hostname github.com >/dev/null 2>&1
    asegurar_login || return 1
    hacer_push && { echo "[OK] $nombre subido."; return 0; }
  fi

  # Falta el permiso workflow
  if echo "$PUSH_OUT" | grep -qi "workflow"; then
    echo
    echo "[!] GitHub pide el permiso 'workflow'. Lo pido y reintento..."
    abrir_navegador
    gh auth refresh --hostname github.com --scopes workflow || return 1
    gh auth setup-git >/dev/null 2>&1
    hacer_push && { echo "[OK] $nombre subido."; return 0; }
  fi

  # Remoto con commits que no tenemos
  echo
  echo "[!] GitHub rechazo el push de $nombre: el repo remoto tiene commits que no tienes aqui."
  echo
  echo "  [1] Unir y quedarme con MIS archivos   (seguro, no se pierde historial)"
  echo "  [2] Reemplazar el remoto con lo mio    (borra el historial viejo de main)"
  echo "  [N] Saltar este repo"
  echo
  local OPT
  read -rp "Elige 1, 2 o N: " OPT
  case "${OPT,,}" in
    1)
      git fetch origin || return 1
      git merge -s ours origin/main --allow-unrelated-histories \
        -m "Unir historial remoto (se conservan los archivos locales)" || return 1
      git push -u origin main || return 1
      echo "[OK] $nombre subido."
      return 0
      ;;
    2)
      git fetch origin || return 1
      git push -u origin main --force-with-lease || return 1
      echo "[OK] $nombre subido."
      return 0
      ;;
    *)
      echo "Saltado. No se subio nada de $nombre."
      return 1
      ;;
  esac
}

# Descomprime un zip (unzip o, si no hay, python3)
descomprimir() {
  if command -v unzip >/dev/null 2>&1; then
    unzip -oq "$1" -d "$2"
  else
    python3 -c "import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])" "$1" "$2"
  fi
}

# Baja los ejecutables de GitHub Actions y los deja en org-web/files/mods
bajar_ejecutables() {
  echo
  echo "========================================"
  echo "  Ejecutables -> $MODS_DEST"
  echo "========================================"

  [ -d "$ORG_DIR" ] || { echo "[ERROR] No existe $ORG_DIR"; return 1; }

  local def=2
  [ "$AZU_OK" -eq 1 ] && def=1
  echo
  echo "  [1] Compilar de nuevo en GitHub y bajar   (tarda unos 10-15 min)"
  echo "  [2] Bajar el ultimo build exitoso         (rapido)"
  echo "  [N] Saltar"
  echo
  local OPT run_id before i
  read -rp "Elige 1, 2 o N (Enter = $def): " OPT
  [ -z "$OPT" ] && OPT=$def

  case "${OPT,,}" in
    1)
      before=$(gh run list -R "$MOD_SLUG" -w build.yml -L 1 --json databaseId -q '.[0].databaseId' 2>/dev/null)
      echo "Lanzando el build en GitHub Actions..."
      gh workflow run build.yml -R "$MOD_SLUG" --ref main || { echo "[ERROR] No pude lanzar el workflow (esta build.yml subido?)."; return 1; }
      run_id=""
      for i in $(seq 1 30); do
        sleep 3
        run_id=$(gh run list -R "$MOD_SLUG" -w build.yml -L 1 --json databaseId -q '.[0].databaseId' 2>/dev/null)
        [ -n "$run_id" ] && [ "$run_id" != "$before" ] && break
        run_id=""
      done
      [ -z "$run_id" ] && { echo "[ERROR] No aparecio el build en GitHub."; return 1; }
      echo "Build #$run_id en marcha. Esperando a que termine (Ctrl+C para cortar)..."
      gh run watch "$run_id" -R "$MOD_SLUG" --exit-status >/dev/null 2>&1 \
        && echo "[OK] Build terminado." \
        || echo "[!] Algun job fallo; intento bajar lo que haya."
      ;;
    2)
      run_id=$(gh run list -R "$MOD_SLUG" -w build.yml -s success -L 1 --json databaseId -q '.[0].databaseId' 2>/dev/null)
      [ -z "$run_id" ] && { echo "[ERROR] No hay ningun build exitoso. Usa la opcion 1."; return 1; }
      echo "Usando el build #$run_id"
      ;;
    *)
      echo "Saltado."
      return 1
      ;;
  esac

  local tmp
  tmp=$(mktemp -d)
  echo "Descargando ejecutables..."
  gh run download "$run_id" -R "$MOD_SLUG" -n AzuModification-Todos -D "$tmp" \
    || { echo "[ERROR] No se pudo bajar el artifact AzuModification-Todos."; rm -rf "$tmp"; return 1; }

  local z
  z=$(find "$tmp" -maxdepth 2 -name '*.zip' | head -n 1)
  [ -z "$z" ] && { echo "[ERROR] El artifact no trae ningun zip."; rm -rf "$tmp"; return 1; }
  mkdir -p "$tmp/out"
  descomprimir "$z" "$tmp/out" || { echo "[ERROR] No pude descomprimir $z"; rm -rf "$tmp"; return 1; }

  mkdir -p "$MODS_DEST"
  local f ruta mb copiados=0 omitidos=0
  for f in AzuModificationLin AzuModificationWin.exe AzuModificationMac.zip; do
    ruta=$(find "$tmp/out" -name "$f" -type f | head -n 1)
    if [ -z "$ruta" ]; then
      echo "  [falta]   $f (ese build no lo genero)"
      continue
    fi
    mb=$(( $(stat -c%s "$ruta") / 1024 / 1024 ))
    if [ "$mb" -ge "$LIMITE_MB" ]; then
      echo "  [OMITIDO] $f pesa ${mb} MB: GitHub no deja subir archivos de mas de 100 MB."
      omitidos=$((omitidos+1))
      continue
    fi
    cp -f "$ruta" "$MODS_DEST/$f" && echo "  [OK]      $f (${mb} MB)" && copiados=$((copiados+1))
  done

  # Nombres viejos que ya no usa el index.html
  rm -f "$MODS_DEST/AzuModification.exe" "$MODS_DEST/AzuModification-linux-x64"

  rm -rf "$tmp"
  if [ "$omitidos" -gt 0 ]; then
    echo
    echo "[!] $omitidos archivo(s) pasan el limite. Opcion: subirlos a un GitHub Release"
    echo "    del repo azu-mod-maker y poner ese enlace en el index.html."
  fi
  [ "$copiados" -gt 0 ]
}

# --- Argumentos ---
FILTRO=""
SOLO_EXE=0
for a in "$@"; do
  case "$a" in
    --exe|exe|ejecutables) SOLO_EXE=1 ;;
    *) FILTRO="$a" ;;
  esac
done
quiere() { [ -z "$FILTRO" ] || [[ "$1" == *"$FILTRO"* ]]; }
datos_repo() { local e; for e in "${REPOS[@]}"; do [[ "$e" == "$1|"* ]] && { echo "$e"; return; }; done; }

RESUMEN=()
HAY_FALLOS=0
AZU_OK=0
registrar() { # $1=0|1 (rc)  $2=texto
  if [ "$1" -eq 0 ]; then RESUMEN+=("  [OK]     $2"); else RESUMEN+=("  [FALLO]  $2"); HAY_FALLOS=1; fi
}

# 1) azu-mod-maker
if [ "$SOLO_EXE" -eq 0 ] && quiere "azu-mod-maker"; then
  IFS='|' read -r n d u <<< "$(datos_repo azu-mod-maker)"
  subir_repo "$n" "$d" "$u"; rc=$?
  [ "$rc" -eq 0 ] && AZU_OK=1
  registrar "$rc" "$n"
fi

# 2) Ejecutables de GitHub Actions -> org-web/files/mods
if [ "$SOLO_EXE" -eq 1 ] || [ -z "$FILTRO" ]; then
  bajar_ejecutables; rc=$?
  registrar "$rc" "Ejecutables -> files/mods"
fi

# 3) org-web
if [ "$SOLO_EXE" -eq 1 ] || quiere "org-web"; then
  IFS='|' read -r n d u <<< "$(datos_repo org-web)"
  subir_repo "$n" "$d" "$u"; rc=$?
  registrar "$rc" "$n"
fi

echo
echo "========================================"
echo "  Resumen"
echo "========================================"
if [ "${#RESUMEN[@]}" -eq 0 ]; then
  echo "  Nada que hacer con '$FILTRO'."
  salir 1
fi
printf '%s\n' "${RESUMEN[@]}"
echo
if [ "$HAY_FALLOS" -eq 0 ]; then
  echo "Listo, todo subido correctamente."
  salir 0
else
  echo "Algo no se pudo completar. Revisa los mensajes de arriba."
  salir 1
fi
