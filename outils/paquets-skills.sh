#!/usr/bin/env bash
# Fabrique un zip par skill de .claude/skills/ dans paquets-skills/ (à importer dans claude.ai : Réglages, Fonctionnalités, Skills, « Importer »).
# Usage : bash outils/paquets-skills.sh   (depuis le dossier du kit)
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf paquets-skills && mkdir -p paquets-skills
for d in .claude/skills/*/; do
  n=$(basename "$d")
  [ -f "$d/SKILL.md" ] || continue
  (cd .claude/skills && zip -qr "../../paquets-skills/$n.zip" "$n" -x '*/node_modules/*' '*/.DS_Store')
done
(cd paquets-skills && zip -q tous-les-skills.zip ./*.zip)
ls -1 paquets-skills | wc -l | xargs -I{} echo "{} fichiers dans paquets-skills/ (un zip par skill + tous-les-skills.zip)"
