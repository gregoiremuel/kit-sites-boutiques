#!/bin/sh
# Lance Chromium avec --no-sandbox (obligatoire quand on est « root », comme dans l'espace cloud de Claude).
# Usage : CHROME_PATH=$PWD/chrome-root.sh node .../inspect.mjs http://127.0.0.1:8788/   (Taste)
#         IMPECCABLE_BROWSER=$PWD/chrome-root.sh impeccable detect http://127.0.0.1:8788/
for c in "$CHROMIUM_BIN" /opt/pw-browsers/chromium-*/chrome-linux64/chrome /usr/bin/chromium /usr/bin/chromium-browser /usr/bin/google-chrome; do
  [ -n "$c" ] && [ -x "$c" ] && exec "$c" --no-sandbox --disable-gpu "$@"
done
echo "Chromium introuvable : définir CHROMIUM_BIN." >&2; exit 1
