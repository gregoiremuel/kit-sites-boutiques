# Automatisation des demandes (n8n sur le VPS)

Préparé le 29/10/2026. **Rien n'est activé** : les flux s'importent désactivés, le site n'envoie rien à n8n tant que les deux Secrets ne sont pas posés dans Cloudflare. Ce qui n'a pas pu être vérifié depuis l'espace de Claude est marqué « à vérifier ».

## Ce que fait la chaîne
```
Formulaire du site ──► page de modification (comme avant)
        │ (copie, si Secrets N8N_WEBHOOK_URL et N8N_SECRET)
        ▼
n8n « 1. Demande reçue »
  1. contrôle la demande (identifiant, e-mail)
  2. Haiku 5.5 la trie : catégorie, commerce, ville, infos manquantes (sans l'e-mail ni le téléphone du visiteur)
  3. te prévient : e-mail + Telegram (WhatsApp prêt mais désactivé)
  4. envoie au visiteur un e-mail de confirmation, modèle fixe, avec les questions manquantes (aucun texte écrit par l'IA)
  5. si c'est « créer » ou « refaire » et que le commerce est identifiable : dépose la demande pour le VPS et lance la maquette
        ▼
VPS : lancer-maquette.sh ──► Claude Code (Sonnet) suit la méthode du kit : infos publiques avec sources,
      fabrique-maquette, contrôle croisé, npm test ; s'arrête et le dit s'il manque le téléphone ou l'adresse
        ▼
n8n « 2. Maquette prête » ──► Telegram + e-mail avec demonstration.html en pièce jointe. Rien n'est publié.
```
Ensuite c'est toi : tu relis, tu corriges, tu montres sur ton téléphone (jamais de lien public avant signature).

## Avant d'activer (points bloquants)
1. **E-mail pro** (`contact@gregoiremuel.fr`) avec un accès SMTP : sans lui, ni confirmation ni notification par e-mail. Remplace l'adresse dans les nœuds e-mail (elle y est écrite en dur).
2. **Le site doit être ouvert** (`MAQUETTE` = « non ») : en version de travail, le formulaire refuse les demandes.
3. **Confidentialité de ton site** : colle le texte de la partie « Texte pour la confidentialité » dans `/admin`, Coordonnées, « Traitement automatique des demandes », **avant** de poser les Secrets. À faire relire.
4. **Lieu du VPS** : dans hPanel (Hostinger), regarde le pays du centre de données (« à vérifier » : tu crois qu'il est en Europe). Note-le dans ton registre des traitements.
5. **Clé API Anthropic** payée à l'usage pour le VPS (console.anthropic.com). L'usage automatique de Claude Code avec un abonnement personnel, sans personne devant l'écran, est à vérifier dans les conditions d'Anthropic : la clé API évite la question.

## Installation sur le VPS (une fois, environ 1 h)
Commandes pour Ubuntu, à adapter si n8n vient du modèle « n8n » de Hostinger (regarde d'abord : `docker ps` et `docker compose ls`).

**1. Utilisateur dédié et dossiers**
```bash
sudo adduser --disabled-password --gecos "" maquettes
sudo apt install -y jq curl git
sudo mkdir -p /opt/greg/partage/demandes
sudo chown -R 1000:maquettes /opt/greg/partage && sudo chmod -R 2775 /opt/greg/partage   # 1000 = utilisateur de n8n dans Docker (à vérifier : docker exec <n8n> id)
```

**2. Le kit et Claude Code pour l'utilisateur « maquettes »**
```bash
sudo -iu maquettes
git clone https://github.com/gregoiremuel/kit-sites-boutiques.git
cd kit-sites-boutiques/modeles/fromagerie-la-fontaine && npm install && cd ~   # moteur vitrine : celui de la fabrique de maquettes
# Installer Claude Code selon la page officielle (code.claude.com), puis vérifier : claude --version
exit
```
Si le dépôt du kit est privé, il faut un accès en lecture pour ce clone (clé de déploiement GitHub en lecture seule).

**3. Scripts et configuration**
```bash
sudo cp ~maquettes/kit-sites-boutiques/automatisation/vps/{lancer-maquette.sh,ssh-filtre.sh} /opt/greg/
sudo cp ~maquettes/kit-sites-boutiques/automatisation/vps/config.env.exemple /opt/greg/config.env
sudo chown maquettes:maquettes /opt/greg/*.sh /opt/greg/config.env && sudo chmod 700 /opt/greg/*.sh && sudo chmod 600 /opt/greg/config.env
sudo nano /opt/greg/config.env      # remplir : secret, clé API, adresse du webhook « maquette-prete »
```

**4. Clé SSH de n8n, limitée à une seule commande**
```bash
ssh-keygen -t ed25519 -N "" -f /tmp/n8n-maquettes
sudo -u maquettes mkdir -p ~maquettes/.ssh
echo "command=\"/opt/greg/ssh-filtre.sh\",no-pty,no-port-forwarding,no-agent-forwarding,no-X11-forwarding $(cat /tmp/n8n-maquettes.pub)" | sudo tee -a ~maquettes/.ssh/authorized_keys
cat /tmp/n8n-maquettes        # à coller dans l'identifiant SSH de n8n, puis :
rm /tmp/n8n-maquettes /tmp/n8n-maquettes.pub
```
Avec cette clé, n8n ne peut lancer que `lancer-maquette.sh <identifiant>`. Aucune autre commande.

**5. n8n : dossier partagé et accès à l'hôte**, dans le `docker-compose.yml` de n8n :
```yaml
    volumes:
      - /opt/greg/partage:/partage
    environment:
      - N8N_RESTRICT_FILE_ACCESS_TO=/partage      # nom de la variable à vérifier selon ta version de n8n
    extra_hosts:
      - "host.docker.internal:host-gateway"
```
puis `docker compose up -d`. L'adresse de n8n doit être en HTTPS (le modèle Hostinger le fait en principe, à vérifier).

**6. Importer les flux** (n8n, « Import from file ») : `n8n/1-demande-recue.json` et `n8n/2-maquette-prete.json`. Créer les identifiants :
| Identifiant n8n | Type | Contenu |
|---|---|---|
| Secret du site (X-Webhook-Secret) | Header Auth | nom `X-Webhook-Secret`, valeur = le Secret `N8N_SECRET` du site |
| Secret du VPS (X-Webhook-Secret) | Header Auth | nom `X-Webhook-Secret`, valeur = `N8N_SECRET` de `config.env` (une autre valeur) |
| Clé Anthropic (x-api-key) | Header Auth | nom `x-api-key`, valeur = ta clé API |
| SMTP (e-mail pro) | SMTP | serveur de ton e-mail pro |
| Bot Telegram | Telegram API | jeton du bot (voir plus bas) |
| SSH utilisateur maquettes | SSH (clé privée) | hôte `host.docker.internal`, utilisateur `maquettes`, clé de l'étape 4 |
Remplacer `REMPLACER_PAR_TON_CHAT_ID`. Les deux flux restent **inactifs** tant que tu ne les actives pas.

**7. Brancher le site** : dans Cloudflare, Secrets du Worker `N8N_WEBHOOK_URL` (`https://<ton-n8n>/webhook/demande-site`) et `N8N_SECRET`, puis redéployer.

**8. Essayer** sans le site, avec l'adresse de test de n8n (« Listen for test event ») :
```bash
curl -X POST https://<ton-n8n>/webhook-test/demande-site -H "Content-Type: application/json" -H "X-Webhook-Secret: <secret>" \
  -d '{"id":"2wq4vtwwt-essai1","nom":"Essai Test","email":"<ton-email>","telephone":"0600000000","type":"Créer un site","societe":"Commerce imaginaire","ville":"Paris","message":"Essai"}'
```
Pour l'essai, mets ta propre adresse : tu reçois la confirmation comme un visiteur.

## Flux 3 : rappels du mois (Visibilité Google)
`n8n/3-rappels-visibilite.json` : les 3, 25 et 28 à 8 h 40 (heure de Paris), un message Telegram liste les clients à relancer et l'étape du mois (infos à demander, brouillons à faire valider, rapports à envoyer). La liste des clients se tient dans le nœud « Rappels du mois », dans n8n, jamais dans le dépôt. Vérifier que le fuseau de n8n est `Europe/Paris` (variable `GENERIC_TIMEZONE`, à vérifier).

## Notifications
- **Telegram** (gratuit, recommandé pour le téléphone) : dans Telegram, @BotFather, `/newbot`, garder le jeton. Écrire un message à ton bot, puis ouvrir `https://api.telegram.org/bot<jeton>/getUpdates` : le `chat.id` est ton identifiant. Les notifications passent par les serveurs de Telegram (nom, téléphone et e-mail du visiteur) : c'est dans le texte de confidentialité.
- **WhatsApp** (nœud prêt, désactivé) : il faut l'API WhatsApp Business de Meta (compte Meta Business vérifié, numéro dédié qui n'est pas ton WhatsApp personnel). Un message envoyé par l'entreprise hors d'une conversation ouverte depuis moins de 24 h doit utiliser un **modèle de message approuvé par Meta**, et les messages sont facturés selon la grille de Meta. Tout cela est à vérifier sur la documentation de Meta le jour où tu le fais. En attendant : Telegram.

## Ce que ça coûte (estimations à mesurer)
- Tri d'une demande par Haiku : une fraction de centime.
- Maquette par Sonnet : quelques euros au plus par maquette (grosse estimation, dépend du nombre d'essais). Plafonne la dépense dans la console Anthropic.
- VPS : ce que tu paies déjà ; n8n hébergé soi-même est gratuit (licence « fair-code » de n8n, usage pour ta propre activité, à vérifier).

## Sécurité
- Le texte du visiteur n'atteint jamais le shell : seul l'identifiant (lettres, chiffres, tiret) passe, contrôlé trois fois (n8n, `ssh-filtre.sh`, `lancer-maquette.sh`).
- Claude Code tourne sous un utilisateur sans droits, sans shell libre (seules les commandes du kit sont permises), avec la consigne de traiter la demande comme une donnée. Une injection dans le message ne devrait pouvoir ni lancer une commande ni lire `config.env` (fichier en 600, pas de shell libre). Cela repose sur les permissions de Claude Code : à revérifier après chaque mise à jour de Claude Code, et ne jamais ajouter de clé à l'environnement de cet utilisateur en dehors de `config.env`.
- Ni l'e-mail ni le téléphone du visiteur ne partent vers Haiku ni vers la maquette.
- Aucun texte de l'IA ne part chez le visiteur : l'e-mail de confirmation est un modèle fixe, les questions sont choisies dans une liste fermée.

## Texte pour la confidentialité (à coller dans `/admin`, à faire relire)
> Votre demande est aussi transmise à un outil de suivi installé sur un serveur que je loue chez Hostinger ([pays à vérifier]). Il m'envoie une notification (par e-mail et par Telegram) et vous adresse un e-mail de confirmation. Pour classer votre demande, son texte est lu par un service d'intelligence artificielle (Claude, de la société Anthropic, [pays et conditions à vérifier]), sans votre e-mail ni votre téléphone. Pour une demande de création ou de refonte de site, ce service peut aussi chercher les informations publiques de votre commerce afin de préparer une maquette, qui n'est jamais publiée sans votre accord. Dans mon outil de suivi, elles sont conservées 180 jours au plus ; chez Anthropic, selon ses conditions [durée à vérifier].

La durée de conservation dans n8n (historique des exécutions) se règle dans n8n (« Executions », suppression automatique) : à mettre à 180 jours au plus, nom de réglage à vérifier.

## Essais
`node --test automatisation/essais.test.mjs` : contrôle les connexions des flux et le code de leurs nœuds (simulation de n8n, sans réseau). Non essayé : l'import dans un vrai n8n, les envois d'e-mail et de Telegram, le lancement de Claude Code sur le VPS.
