#!/usr/bin/env bash
# Sube a GitHub los proyectos y pasa los ejecutables compilados a la web:
#   1. azu-mod-maker  (AzuModification)   -> push
#   2. acidmodloader  (Acid Mod Loader)   -> push
#   3. GitHub Actions compila los ejecutables -> se bajan y se publican
#        - AzuModification: Win/Mac a org-web/files/mods/, Linux (grande) a un Release
#        - AcidModLoader:   Win/Linux/Mac (3 archivos separados) a un Release de acidmodloader
#   4. org-web        (la pagina de Acid) -> push
#
# Uso:  ./subir_a_github.sh                -> todo (con menu para los ejecutables)
#       ./subir_a_github.sh org-web        -> solo org-web
#       ./subir_a_github.sh azu-mod        -> solo azu-mod-maker (basta parte del nombre)
#       ./subir_a_github.sh acid           -> solo acidmodloader
#       ./subir_a_github.sh --exe          -> solo bajar/publicar ejecutables y subir org-web
#       ./subir_a_github.sh --exe acid     -> igual, pero solo los de acidmodloader

export PATH="$HOME/.local/bin:/home/linuxbrew/.linuxbrew/bin:$PATH"

GH_USER="azu42968-maker"
ORG_DIR="$HOME/azu42968-maker/org-web"
MOD_DIR="$HOME/azu42968-maker/azu-mod-maker"
ACID_DIR="$HOME/azu42968-maker/acidmodloader"   # <- cambia esta ruta si tu carpeta esta en otro lado
MODS_DEST="$ORG_DIR/files/mods"            # donde apuntan los botones del index.html
LIMITE_MB=95                               # GitHub rechaza archivos de mas de 100 MB en el repo
RELEASE_TAG="latest"                       # Release fijo donde van los archivos grandes

# nombre|carpeta|url   (las apps primero: sus ejecutables alimentan a org-web)
REPOS=(
  "azu-mod-maker|$MOD_DIR|https://github.com/$GH_USER/azu-mod-maker.git"
  "acidmodloader|$ACID_DIR|https://github.com/$GH_USER/acidmodloader.git"
  "org-web|$ORG_DIR|https://github.com/$GH_USER/org-web.git"
)

salir() { read -rp "Pulsa Enter para salir..." _; exit "${1:-0}"; }

# --- Argumentos ---
FILTRO=""
SOLO_EXE=0
for a in "$@"; do
  case "$a" in
    --exe|exe|ejecutables) SOLO_EXE=1 ;;
    *) FILTRO="$a" ;;
  esac
done
ELEGIDOS=()    # lo que eliges en el menu (vacio = se usa el filtro / todo)
quiere() {
  if [ "${#ELEGIDOS[@]}" -gt 0 ]; then
    local x; for x in "${ELEGIDOS[@]}"; do [ "$x" = "$1" ] && return 0; done; return 1
  fi
  [ -z "$FILTRO" ] || [[ "$1" == *"$FILTRO"* ]]
}
datos_repo() { local e; for e in "${REPOS[@]}"; do [[ "$e" == "$1|"* ]] && { echo "$e"; return; }; done; }
COPIADO_A_WEB=0
declare -A FALTAN   # archivos que el build necesita y no estan en GitHub, por repo

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

# --- Elegir que subir (si no pasaste filtro ni --exe) ---
if [ -z "$FILTRO" ] && [ "$SOLO_EXE" -eq 0 ]; then
  echo
  echo "Que quieres subir?"
  echo "  [1] azu-mod-maker   (AzuModification + su ejecutable)"
  echo "  [2] acidmodloader   (AcidModLoader + su ejecutable)"
  echo "  [3] org-web         (la pagina)"
  echo
  read -rp "Numeros separados por espacio, p. ej. 1 3  (Enter = todo): " SEL_IN
  for t in $SEL_IN; do
    case "$t" in
      1) ELEGIDOS+=("azu-mod-maker") ;;
      2) ELEGIDOS+=("acidmodloader") ;;
      3) ELEGIDOS+=("org-web") ;;
    esac
  done
  if [ "${#ELEGIDOS[@]}" -eq 0 ]; then
    ELEGIDOS=("azu-mod-maker" "acidmodloader" "org-web")
  fi
  echo "Elegido: ${ELEGIDOS[*]}"
fi

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
  if [ "$nombre" = "azu-mod-maker" ] || [ "$nombre" = "acidmodloader" ]; then
    # Los ejecutables y temporales de PyInstaller no se suben al repo
    asegurar_ignore 'Ejecutables/' 'build/' 'dist/' 'release/' '__pycache__/' '*.pyc'
    if [ "$nombre" = "acidmodloader" ]; then
      # Entornos y descargas que genera build_exe.py (el JRE se baja solo en cada build)
      asegurar_ignore '.build-venv/' '.build-python312/' 'vendor/jre/' 'payload/*.zip'
      # Si ya se habian subido antes, dejar de seguirlos (los archivos locales no se borran)
      git rm -r -q --cached --ignore-unmatch .build-venv .build-python312 build dist __pycache__ vendor/jre >/dev/null 2>&1
    fi

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

  # Comprobar que el build tendra todo lo que necesita en GitHub
  local REQ=""
  case "$nombre" in
    acidmodloader) REQ="build_exe.py requirements.txt launcher.py build_payload.py payload/app_main.py payload/version.json vendor/ffdec_lib.jar" ;;
    azu-mod-maker) REQ="build_exe.py AppLauncher.py" ;;
  esac
  FALTAN[$nombre]=""
  local f ign
  for f in $REQ; do
    if ! git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
      if [ -e "$f" ]; then
        ign=$(git check-ignore -v "$f" 2>/dev/null)
        echo "  [!] $f existe aqui pero NO se esta subiendo${ign:+ (lo ignora: $ign)}"
      else
        echo "  [!] $f no existe en $dir"
      fi
      FALTAN[$nombre]+="$f "
    fi
  done
  [ -n "${FALTAN[$nombre]}" ] && echo "  [!] Sin esos archivos el build de $nombre va a fallar en GitHub."

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

# Sube un archivo grande a un Release fijo del repo (reemplaza el anterior)
subir_a_release() { # $1=slug  $2=ruta
  local slug="$1" ruta="$2"
  if ! gh release view "$RELEASE_TAG" -R "$slug" >/dev/null 2>&1; then
    gh release create "$RELEASE_TAG" -R "$slug" --target main \
      --title "Ejecutables" \
      --notes "Ejecutables, actualizados automaticamente por subir_a_github.sh" >/dev/null || return 1
  fi
  gh release upload "$RELEASE_TAG" "$ruta" -R "$slug" --clobber
}

# Descomprime un zip (unzip o, si no hay, python3)
descomprimir() {
  if command -v unzip >/dev/null 2>&1; then
    unzip -oq "$1" -d "$2"
  else
    python3 -c "import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])" "$1" "$2"
  fi
}

# id|repo|artifact|archivos|destino   (destino: auto = web si pesa poco, release = siempre al Release)
APPS=(
  "azu-mod-maker|$GH_USER/azu-mod-maker|AzuModification-Todos|AzuModificationLin AzuModificationWin.exe AzuModificationMac.zip|auto"
  "acidmodloader|$GH_USER/acidmodloader|AcidModLoader-Todos|AcidModLoaderWin.exe AcidModLoaderLin AcidModLoaderMac.zip|release"
)

declare -A RUN_ID PUSH_OK

# Lanza el workflow de una app y guarda el numero de run
lanzar_build() { # $1=id $2=slug
  local id="$1" slug="$2" before run_id="" i
  echo
  echo "[$id] Lanzando el build en GitHub Actions..."
  before=$(gh run list -R "$slug" -w build.yml -L 1 --json databaseId -q '.[0].databaseId' 2>/dev/null)
  gh workflow run build.yml -R "$slug" --ref main \
    || { echo "[ERROR] No pude lanzar el workflow de $id (esta .github/workflows/build.yml subido?)."; return 1; }
  for i in $(seq 1 30); do
    sleep 3
    run_id=$(gh run list -R "$slug" -w build.yml -L 1 --json databaseId -q '.[0].databaseId' 2>/dev/null)
    [ -n "$run_id" ] && [ "$run_id" != "$before" ] && break
    run_id=""
  done
  [ -z "$run_id" ] && { echo "[ERROR] No aparecio el build de $id en GitHub."; return 1; }
  RUN_ID[$id]="$run_id"
  echo "[$id] Build #$run_id en marcha."
}

# Baja los ejecutables de un run y los publica segun el destino
recoger_ejecutables() { # $1=id $2=slug $3=artifact $4=archivos $5=destino $6=run_id $7=esperar(1|0)
  local id="$1" slug="$2" artifact="$3" archivos="$4" destino="$5" run_id="$6" esperar="$7"

  echo
  echo "========================================"
  echo "  Ejecutables de $id"
  echo "========================================"

  if [ "$esperar" -eq 1 ]; then
    echo "Esperando a que termine el build #$run_id (Ctrl+C para cortar)..."
    gh run watch "$run_id" -R "$slug" --exit-status >/dev/null 2>&1 \
      && echo "[OK] Build terminado." \
      || {
        echo "[!] Algun job fallo. Ultimas lineas del error:"
        echo "----------------------------------------"
        gh run view "$run_id" -R "$slug" --log-failed 2>/dev/null | tail -n 40
        echo "----------------------------------------"
        echo "(Copia esto si necesitas ayuda. Intento bajar lo que haya.)"
      }
  else
    echo "Usando el build #$run_id"
  fi

  local tmp
  tmp=$(mktemp -d)
  echo "Descargando ejecutables..."
  gh run download "$run_id" -R "$slug" -n "$artifact" -D "$tmp" \
    || { echo "[ERROR] No se pudo bajar el artifact $artifact."; rm -rf "$tmp"; return 1; }

  # Si el artifact trae un zip con su propio nombre, se abre (asi llega el de azu-mod-maker)
  [ -f "$tmp/$artifact.zip" ] && descomprimir "$tmp/$artifact.zip" "$tmp/out"

  local f ruta mb ok=0
  for f in $archivos; do
    ruta=$(find "$tmp" -name "$f" -type f | head -n 1)
    if [ -z "$ruta" ]; then
      echo "  [falta]   $f (ese build no lo genero)"
      continue
    fi
    mb=$(( $(stat -c%s "$ruta") / 1024 / 1024 ))
    if [ "$destino" = "release" ] || [ "$mb" -ge "$LIMITE_MB" ]; then
      rm -f "$MODS_DEST/$f"      # que no quede una copia vieja/rota en la web
      if subir_a_release "$slug" "$ruta"; then
        echo "  [OK]      $f (${mb} MB) -> https://github.com/$slug/releases/download/$RELEASE_TAG/$f"
        ok=$((ok+1))
      else
        echo "  [ERROR]   No pude subir $f al Release."
      fi
    else
      mkdir -p "$MODS_DEST"
      cp -f "$ruta" "$MODS_DEST/$f" && echo "  [OK]      $f (${mb} MB) -> files/mods/" && ok=$((ok+1)) && COPIADO_A_WEB=1
    fi
  done

  # Nombres viejos de AzuModification que ya no usa el index.html
  [ "$id" = "azu-mod-maker" ] && rm -f "$MODS_DEST/AzuModification.exe" "$MODS_DEST/AzuModification-linux-x64"

  rm -rf "$tmp"
  [ "$ok" -gt 0 ]
}

RESUMEN=()
HAY_FALLOS=0
registrar() { # $1=0|1 (rc)  $2=texto
  if [ "$1" -eq 0 ]; then RESUMEN+=("  [OK]     $2"); else RESUMEN+=("  [FALLO]  $2"); HAY_FALLOS=1; fi
}

# 1) Push de las apps
if [ "$SOLO_EXE" -eq 0 ]; then
  for id in azu-mod-maker acidmodloader; do
    if quiere "$id"; then
      IFS='|' read -r n d u <<< "$(datos_repo "$id")"
      subir_repo "$n" "$d" "$u"; rc=$?
      [ "$rc" -eq 0 ] && PUSH_OK[$id]=1
      registrar "$rc" "$n"
    fi
  done
fi

# 2) Ejecutables de GitHub Actions
SEL=()
if [ "$SOLO_EXE" -eq 1 ] || [ -z "$FILTRO" ]; then
  for e in "${APPS[@]}"; do
    id="${e%%|*}"
    quiere "$id" && SEL+=("$e")
  done
fi

if [ "${#SEL[@]}" -gt 0 ]; then
  def=1
  for e in "${SEL[@]}"; do [ -z "${PUSH_OK[${e%%|*}]}" ] && def=2; done
  echo
  echo "========================================"
  echo "  Ejecutables: ${SEL[*]%%|*}"
  echo "========================================"
  echo
  echo "  [1] Compilar de nuevo en GitHub y bajar   (tarda unos 10-15 min)"
  echo "  [2] Bajar el ultimo build exitoso         (rapido)"
  echo "  [N] Saltar"
  echo
  read -rp "Elige 1, 2 o N (Enter = $def): " OPT
  [ -z "$OPT" ] && OPT=$def

  case "${OPT,,}" in
    1|2)
      # Fase A: lanzar todos los builds a la vez para no esperar uno tras otro
      if [ "$OPT" = "1" ]; then
        for e in "${SEL[@]}"; do
          IFS='|' read -r id slug artifact archivos destino <<< "$e"
          if [ -n "${FALTAN[$id]}" ]; then
            echo
            echo "[$id] No lanzo el build: faltan en GitHub -> ${FALTAN[$id]}"
            registrar 1 "Ejecutables de $id (faltan archivos: ${FALTAN[$id]})"
            continue
          fi
          lanzar_build "$id" "$slug" || registrar 1 "Ejecutables de $id (no se pudo lanzar)"
        done
      fi
      # Fase B: esperar, bajar y publicar
      for e in "${SEL[@]}"; do
        IFS='|' read -r id slug artifact archivos destino <<< "$e"
        if [ "$OPT" = "1" ]; then
          run_id="${RUN_ID[$id]}"; esperar=1
          [ -z "$run_id" ] && continue
        else
          run_id=$(gh run list -R "$slug" -w build.yml -s success -L 1 --json databaseId -q '.[0].databaseId' 2>/dev/null)
          esperar=0
          if [ -z "$run_id" ]; then
            echo "[ERROR] $id no tiene ningun build exitoso. Usa la opcion 1."
            registrar 1 "Ejecutables de $id"
            continue
          fi
        fi
        recoger_ejecutables "$id" "$slug" "$artifact" "$archivos" "$destino" "$run_id" "$esperar"
        registrar $? "Ejecutables de $id"
      done
      ;;
    *)
      echo "Ejecutables saltados."
      ;;
  esac
fi

# 3) org-web
if [ "$SOLO_EXE" -eq 1 ] || [ "$COPIADO_A_WEB" -eq 1 ] || quiere "org-web"; then
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
