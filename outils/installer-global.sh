#!/usr/bin/env bash
# Installe pour TOUTES les sessions Claude Code de cet ordinateur : les skills du kit dans ~/.claude/skills
# et la consigne de démarrage dans ~/.claude/CLAUDE.md (sans doublon si relancé).
# Usage : bash outils/installer-global.sh   (depuis le dossier du kit)
set -euo pipefail
cd "$(dirname "$0")/.."
DEST="${HOME}/.claude"
mkdir -p "$DEST/skills"
for d in .claude/skills/*/; do rm -rf "$DEST/skills/$(basename "$d")"; cp -r "$d" "$DEST/skills/"; done
MARQUE="<!-- sites-boutiques : démarrage automatique -->"
if ! grep -qF "$MARQUE" "$DEST/CLAUDE.md" 2>/dev/null; then
cat >> "$DEST/CLAUDE.md" <<'BLOC'

<!-- sites-boutiques : démarrage automatique -->
## Sites de Greg (Grégoire Muel)
Pour tout site, texte, style, contrôle ou mise en ligne : suivre le skill `sites-boutiques` (kit `gregoiremuel/kit-sites-boutiques`, à ajouter à la session s'il manque), utiliser les skills de design qu'il indique (Taste, Impeccable, Frontend UI Engineering, Apple, Emil, performance, sécurité) et les outils de contrôle du dépôt, regarder les captures avant de dire que c'est bon, dire à Greg sur quel modèle passer avant un gros chantier. Français, tutoiement. Réponse finale en trois parties : Réponse claire ; Niveau de confiance (0.0 à 1.0, avec la raison) ; Réserves clés.
BLOC
fi
echo "Skills installés dans $DEST/skills ($(ls "$DEST/skills" | wc -l)) ; consigne dans $DEST/CLAUDE.md"
