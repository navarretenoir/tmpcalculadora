#!/usr/bin/env bash
# Copia la interfaz compartida (../app) a Recursos/web para macOS/iOS. Desarrollada por Javiera Navarrete.
set -euo pipefail
A=$(cd "$(dirname "$0")" && pwd); W="$A/Recursos/web"
rm -rf "$W"; mkdir -p "$W"; cp -r "$A/../app/." "$W/"; rm -f "$W"/*.bak*
sed -i.bak '/Content-Security-Policy/d' "$W/index.html" && rm -f "$W/index.html.bak"   # desde un archivo local la CSP del navegador no aplica
echo "✔ Recursos/web listo"
