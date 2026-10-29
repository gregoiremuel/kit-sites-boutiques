# Consignes pour la session Claude Code du VPS : terminer l'installation (29/10/2026)

Tu es sur le VPS Hostinger de Greg (srv1953111, Paris). Greg est sur téléphone : fais les commandes toi-même, jamais de commande interactive, jamais de mot de passe ni de clé dans la conversation (les 4 premiers caractères suffisent pour vérifier). Réponds en français, tutoiement, court. **Avant chaque changement de Docker, de Caddy ou du pare-feu, montre le plan et attends le « ok » de Greg.**

## 0. Remettre le kit à jour
- Dans `/home/maquettes/kit-sites-boutiques` : la branche de travail est fusionnée. Passe sur `main` et fais `git pull` (en tant qu'utilisateur `maquettes`).
- Recopie dans `/opt/greg/` les versions du dépôt de `automatisation/vps/lancer-maquette.sh` et `ssh-filtre.sh` (droits 700, propriétaire `maquettes`) ; garde `config.env`, en y ajoutant les variables nouvelles de `config.env.exemple` s'il en manque (`CLAUDE_BIN`).
- Supprime `/opt/greg/correctif-lancer-maquette.diff` s'il existe encore.
- Relance l'essai à blanc de `lancer-maquette.sh` par le chemin SSH de n8n : il doit finir sur `statut: echec` propre (pas de clé API encore).

## 1. Adresse de n8n
- **N'utilise jamais `gemmalis.com`** : ce domaine sert un autre projet (lithos). Ne touche ni à son bloc Caddy ni à lithos.
- Utilise l'adresse Hostinger du serveur (`hostname -f`, vérifiée avec `dig +short`). Si elle ne pointe pas vers l'IP du serveur, arrête-toi et dis-le : on attendra le domaine `gregoiremuel.fr` (`n8n.gregoiremuel.fr`).
- Mets cette adresse partout : docker-compose de n8n (`N8N_HOST`, `N8N_WEBHOOK_URL` : `WEBHOOK_URL` est déprécié depuis n8n 2.45), bloc Caddy, `N8N_RAPPEL_URL` de `/opt/greg/config.env`.

## 2. n8n (si ce n'est pas déjà fait)
- `/opt/n8n/docker-compose.yml` comme proposé plus tôt : image n8n épinglée, réseau Docker de Caddy, **aucun port publié**, `GENERIC_TIMEZONE` et `TZ` = `Europe/Paris`, clé de chiffrement dans un fichier 600, historique des exécutions effacé à 180 jours, volume `/opt/greg/partage:/partage`, `N8N_RESTRICT_FILE_ACCESS_TO=/partage`, `extra_hosts: host.docker.internal:host-gateway`.
- Caddy : sauvegarde du Caddyfile, bloc pour l'adresse de n8n avec **le même mot de passe Caddy que lithos** devant l'interface, **sauf** `/webhook/*` et `/webhook-test/*` ; `caddy validate`, puis rechargement sans couper lithos.
- Démarre n8n, puis préviens Greg **tout de suite** pour qu'il crée son compte propriétaire dans les minutes qui suivent (le premier visiteur peut sinon le créer).

## 3. Les trois flux et leurs identifiants (sans l'interface)
- Importe, **désactivés**, `automatisation/n8n/1-demande-recue.json`, `2-maquette-prete.json`, `3-rappels-visibilite.json` avec la ligne de commande de n8n dans le conteneur (`n8n import:workflow --input=…`, à vérifier selon la version).
- Crée par la ligne de commande (`n8n import:credentials`) les deux identifiants « Header Auth » : « Secret du site (X-Webhook-Secret) » avec une valeur tirée au hasard (`openssl rand -hex 24`), et « Secret du VPS (X-Webhook-Secret) » avec la valeur de `N8N_SECRET` de `config.env`. Range la valeur du secret du site dans `/opt/greg/secret-site.txt` (600) : Greg la collera dans Cloudflare.
- Crée « SSH utilisateur maquettes » (hôte `host.docker.internal`, utilisateur `maquettes`, clé privée de `/opt/greg/cles/n8n-maquettes`).
- Ne crée pas « Clé Anthropic », « SMTP » ni « Bot Telegram » : il faut les valeurs de Greg. Laisse-les absents et liste-les dans `ETAT.md`.
- Si la ligne de commande refuse un format, dis-le et laisse cette partie à l'interface : ne bricole pas la base de données de n8n.

## 4. Claude Code pour les maquettes
- Vérifie que l'utilisateur `maquettes` lance `"$CLAUDE_BIN" --version`.
- Les consignes et les skills du projet (`CLAUDE.md` et `.claude/skills/` du kit) sont lus automatiquement quand Claude tourne dans le dossier du kit : vérifie qu'ils sont présents après le `git pull`. N'installe aucun autre skill ou plugin.
- `npm install` dans `modeles/fromagerie-la-fontaine` s'il a changé.

## 5. Petites automatisations du serveur (crontab de `maquettes` ou de root, à montrer avant)
- Chaque nuit : `git pull --ff-only` du kit (utilisateur `maquettes`).
- Chaque nuit : sauvegarde du volume de n8n et de `/opt/n8n` dans `/opt/greg/sauvegardes/` (archive datée, 7 gardées), sans y mettre de secret en clair hors des fichiers 600 déjà existants.
- Nettoyage : les dossiers de `/opt/greg/partage/` et de `maquettes/` du kit de plus de 180 jours sont effacés (données de prospects).
- Proposer (sans l'appliquer sans « ok ») les mises à jour de sécurité automatiques d'Ubuntu (`unattended-upgrades`).

## 6. Fin
- Retire à l'utilisateur de travail les droits dont il n'a plus besoin, **sans toucher à `orreg`** (compte de Greg).
- Écris `/opt/greg/ETAT.md` : ce qui est fait, ce qui reste à Greg, dans l'ordre :
  1. créer son compte n8n (si pas fait) ;
  2. clé API Anthropic avec plafond de dépense, à mettre dans `config.env` (la session peut ouvrir le fichier, Greg colle la clé dans le terminal) et dans l'identifiant « Clé Anthropic » de n8n ;
  3. e-mail pro et SMTP ;
  4. bot Telegram (@BotFather) et son identifiant de conversation ;
  5. remplacer `contact@gregoiremuel.fr` et `REMPLACER_…` dans les nœuds ;
  6. activer les flux ;
  7. dans Cloudflare, Secrets du site `N8N_WEBHOOK_URL` (`https://<adresse-n8n>/webhook/demande-site`) et `N8N_SECRET` (valeur de `/opt/greg/secret-site.txt`) ;
  8. essai avec la commande `curl` de `automatisation/README.md`.
- Résume `ETAT.md` à Greg en 10 lignes.
