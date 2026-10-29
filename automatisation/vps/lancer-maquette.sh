#!/usr/bin/env bash
# Lance une maquette automatique pour une demande reçue. Appelé par n8n (nœud SSH) avec un seul argument : l'identifiant
# de la demande. Rend la main tout de suite ; prévient n8n à la fin (webhook « maquette-prete »).
# À installer dans /opt/greg/ et à lancer avec l'utilisateur dédié « maquettes » (jamais root). Voir automatisation/README.md.
set -euo pipefail

ID="${1:-}"
# L'identifiant vient du site (chiffres, lettres, tiret) : tout autre caractère est refusé, rien du visiteur n'atteint le shell.
[[ "$ID" =~ ^[a-z0-9]{6,16}-[a-z0-9]{4,8}$ ]] || { echo "identifiant refusé"; exit 2; }

set -a; source /opt/greg/config.env; set +a   # KIT, PARTAGE, N8N_RAPPEL_URL, N8N_SECRET, ANTHROPIC_API_KEY (exportée pour Claude Code), MODELE ; droits 600
DEMANDE="$PARTAGE/demandes/$ID.json"
[[ -f "$DEMANDE" ]] || { echo "demande introuvable"; exit 3; }
TRAVAIL="$KIT/maquettes/$ID"
[[ -e "$TRAVAIL" ]] && { echo "déjà lancée"; exit 0; }
mkdir -p "$TRAVAIL" "$PARTAGE/$ID"
cp "$DEMANDE" "$TRAVAIL/demande.json"

(
  cd "$KIT"
  git pull --ff-only --quiet || true
  PROMPT="$(sed "s/{{ID}}/$ID/g" "$KIT/automatisation/vps/prompt-maquette.md")"
  # Outils permis : lecture, écriture, recherche web, et seulement les commandes du kit. Pas de shell libre.
  timeout 45m claude -p "$PROMPT" \
    --model "${MODELE:-sonnet}" \
    --permission-mode acceptEdits \
    --allowedTools "Read" "Write" "Edit" "Glob" "Grep" "WebSearch" "WebFetch" \
      "Bash(node outils/fabrique-maquette.mjs:*)" "Bash(npm install:*)" "Bash(npm test:*)" "Bash(npm run verifier:*)" "Bash(npm run apercu:*)" \
    --max-turns 80 > "$TRAVAIL/journal.txt" 2>&1 || echo "fin anormale ($?)" >> "$TRAVAIL/journal.txt"

  STATUT="$(head -1 "$TRAVAIL/RAPPORT.md" 2>/dev/null | sed -n 's/^statut: *//p')"
  STATUT="${STATUT:-echec}"
  for f in RAPPORT.md INFOS-MANQUANTES.md demonstration.html; do [[ -f "$TRAVAIL/$f" ]] && cp "$TRAVAIL/$f" "$PARTAGE/$ID/"; done
  RESUME="$(sed -n '2,12p' "$TRAVAIL/RAPPORT.md" 2>/dev/null | head -c 1500)"
  jq -n --arg id "$ID" --arg statut "$STATUT" --arg resume "$RESUME" '{id:$id, statut:$statut, resume:$resume}' \
    | curl -sS --max-time 20 -X POST -H "Content-Type: application/json" -H "X-Webhook-Secret: $N8N_SECRET" --data @- "$N8N_RAPPEL_URL" >/dev/null || true
) </dev/null >/dev/null 2>&1 &

echo "lancée $ID"
