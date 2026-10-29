#!/usr/bin/env bash
# Commande imposée à la clé SSH de n8n (authorized_keys de l'utilisateur « maquettes ») : seule la maquette peut être lancée.
[[ "${SSH_ORIGINAL_COMMAND:-}" =~ ^/opt/greg/lancer-maquette\.sh\ ([a-z0-9]{6,16}-[a-z0-9]{4,8})$ ]] || { echo "commande refusée"; exit 1; }
exec /opt/greg/lancer-maquette.sh "${BASH_REMATCH[1]}"
