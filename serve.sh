#!/usr/bin/env bash
# Sirve la web desde la carpeta donde está este script y la abre en el navegador.
# Uso: ./serve.sh [puerto]   (por defecto 8000)

cd "$(dirname "$(readlink -f "$0")")" || exit 1

PORT="${1:-8000}"
URL="http://localhost:$PORT"

# Si el puerto está ocupado, busca el siguiente libre
while ss -ltn 2>/dev/null | grep -q ":$PORT "; do
  PORT=$((PORT + 1))
  URL="http://localhost:$PORT"
done

(sleep 1 && xdg-open "$URL" >/dev/null 2>&1) &

echo "Sirviendo en $URL  (Ctrl+C para detener)"
exec python3 -m http.server "$PORT"
