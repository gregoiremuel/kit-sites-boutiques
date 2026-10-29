# Prompt à coller dans la session Claude Code qui tourne sur le VPS

> Tu es sur mon VPS Hostinger (srv1953111). Je suis sur téléphone : fais les commandes toi-même, sans commande interactive (pas de `adduser` sans `--disabled-password --gecos ""`, pas de `nano`, pas de mot de passe à taper). Ne me demande jamais de coller un mot de passe ou une clé dans la conversation.
>
> **Étape 0, état des lieux, sans rien changer** : système (`lsb_release -a`), Docker (`docker ps`, `docker compose ls`), n8n présent ou non (conteneur, version, adresse, HTTPS), espace disque, utilisateur courant et droits `sudo`, Node.js et `claude --version`, pays du centre de données si visible. Fais-moi un résumé de 10 lignes et attends mon « ok ».
>
> **Ensuite**, suis `automatisation/README.md` du dépôt `gregoiremuel/kit-sites-boutiques`, branche `ccr-04ab3608-pccm5z` (le cloner dans `/home/maquettes/kit-sites-boutiques` ; si le dépôt est privé, crée une clé de déploiement en lecture seule et donne-moi seulement la clé **publique** à ajouter sur GitHub, Settings, Deploy keys) :
> 1. utilisateur `maquettes` sans mot de passe, dossiers `/opt/greg/partage/demandes`, droits ;
> 2. `npm install` dans `modeles/fromagerie-la-fontaine` ;
> 3. scripts `lancer-maquette.sh` et `ssh-filtre.sh` dans `/opt/greg`, `config.env` (droits 600) avec un `N8N_SECRET` tiré au hasard (`openssl rand -hex 24`) et `ANTHROPIC_API_KEY=A_REMPLIR` ;
> 4. clé SSH de n8n limitée à `ssh-filtre.sh` (la clé privée reste sur le serveur dans un fichier en 600, tu me dis où ; je la collerai dans n8n moi-même) ;
> 5. **avant de toucher à n8n ou à Docker**, montre-moi le changement prévu (volume `/partage`, `extra_hosts`, variable d'accès aux fichiers) et attends mon « ok » ;
> 6. si n8n n'est pas installé : propose l'installation (Docker Compose, HTTPS avec l'adresse du serveur), attends mon « ok » ;
> 7. essai à blanc de `lancer-maquette.sh` avec une demande imaginaire (sans clé API, il doit échouer proprement et écrire `statut: echec`) ;
> 8. à la fin : retire `sudo` à l'utilisateur de travail si je te l'ai demandé, et écris dans `/opt/greg/ETAT.md` ce qui est fait et ce qu'il me reste (clé API, SMTP, Telegram, import des flux).
>
> Règles : rien de public, aucun port nouveau ouvert sans mon accord, aucun secret affiché en entier dans la conversation (les 4 premiers caractères suffisent pour vérifier). Réponds en français, tutoiement, court.
