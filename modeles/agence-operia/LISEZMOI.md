# Opéria : site et espace de modification

Un site indépendant, hébergé gratuitement chez Cloudflare, avec son espace de modification.

- **Le site** : accueil (grande photo, présentation et chiffres, trois métiers, réalisations à la une, méthode, références), Expertises (space planning, maîtrise d'œuvre, contractant général, méthode, corps d'état), Réalisations (filtres par secteur, une page par projet avec sa fiche et ses photos), L'agence (présentation, engagements, équipe, références), Contact (formulaire de demande de projet, coordonnées, itinéraire), mentions légales, confidentialité.
- **Le formulaire de contact** envoie la demande dans l'espace de modification (et par e-mail avec Web3Forms). Chaque demande a un statut : Nouvelle, Rappelé, Devis envoyé, Signée, Classée.
- **L'espace de modification** (`/admin`, avec mot de passe) : réalisations (photos, textes, fiche, à la une, masquée), secteurs, accueil, chiffres, métiers, méthode, corps d'état, présentation, engagements, équipe, références (nom ou logo), demandes reçues, coordonnées, logo, mentions. Un aperçu montre la bonne page en direct avant d'enregistrer.
- **Design** : bleu marine et or du logo, titres en Playfair Display, texte en Manrope.

## La démonstration

`demonstration.html` (fabriqué par `npm run apercu`) : un seul fichier, sur ordinateur ou Android, ou dans l'app Claude. Il s'ouvre sur le site, puis « Essayer l'espace de modification » (n'importe quel mot de passe). Sur iPhone, il faut un lien : `demo-en-ligne/` à déposer sur Cloudflare Pages, seulement avec l'accord d'Opéria.

## Ce qui est provisoire

- **Les photos** sont des photos d'essai libres (Unsplash). Sur les réalisations, chacune porte la mention « Photo d'illustration » : on ne les fait pas passer pour leurs chantiers. À remplacer par leurs photos depuis l'espace de modification (la mention disparaît d'elle-même).
- **Le logo** vient du fichier fourni (fond rendu transparent) : `public/assets/operia-*.png`. Une version vectorielle (SVG ou PDF) serait plus nette.
- **L'équipe** s'affiche avec des initiales en attendant les portraits.
- **Les références** s'affichent en noms (24 repris de leur site) en attendant les logos, à faire valider par Opéria.
- **Les textes** reprennent uniquement les faits de leur site actuel (réalisations, méthode, garanties, équipe), réécrits. Une surface ou un lieu douteux est indiqué dans la liste « à valider » donnée à Greg.
- `npm run verifier` liste tout ce qui reste à faire.

## Vidéo de fond (accueil)

Dans l'espace de modification, rubrique « Accueil » : « Vidéo de fond », puis la case « Vidéo en fond (sinon la photo) ». Case décochée, le site garde la photo, comme avant ; la vidéo reste enregistrée pour plus tard. La photo sert aussi d'image d'attente pendant le chargement, et un petit bouton pause s'affiche en bas à droite (obligatoire pour l'accessibilité). Les visiteurs qui ont demandé moins d'animations voient la vidéo à l'arrêt.

Une bonne vidéo de fond :
- **MP4**, 10 à 20 secondes, **sans son** (elle est toujours muette), **à l'horizontale** ;
- un mouvement lent et régulier (atelier, gestes, matière, lieu), sans texte incrusté, qui boucle bien ;
- **20 Mo au plus** (8 Mo dans la démonstration). Sur Android, la caméra enregistre déjà en MP4 : coupez la vidéo à 15 secondes dans la galerie, en 1080p ou 720p ;
- **iPhone** : la caméra enregistre en .mov, que tous les navigateurs ne lisent pas. Envoyez la vidéo à Grégoire (ou à Claude) : elle sera convertie en MP4 léger, ou utilisez une application de conversion.
- On peut aussi coller un lien https vers un fichier .mp4 déjà en ligne.

## Mettre en ligne (avec Claude Code)

Compte gratuit sur https://dash.cloudflare.com, puis dans Claude Code, ouvert dans ce dossier :

> Installe les dépendances (`npm install`). Lance `npm test` : tout doit être « ok ». Connecte-moi à Cloudflare (`npx wrangler login`). Crée le stockage KV « CONTENU » (`npx wrangler kv namespace create CONTENU`) et mets son id dans `wrangler.jsonc`. Lance `npm run mot-de-passe`, puis enregistre ADMIN_HASH et SESSION_SECRET avec `npx wrangler secret put`. Déploie avec `npm run deploy`. Donne-moi l'adresse du site et le mot de passe. Laisse MAQUETTE à « oui ».

Le site est alors en ligne en mode proposition (bandeau, non indexé par Google, demandes en démonstration), sur une adresse `site-operia.toncompte.workers.dev`, et l'espace de modification à la même adresse suivie de `/admin`.

## Avant la vraie ouverture

1. **Photos** des chantiers, portraits, logos des références, dans l'espace de modification. Mettre à jour le crédit des photos.
2. **Mentions légales** : RCS, directeur de la publication (et médiateur s'ils travaillent pour des particuliers).
3. **Demandes par e-mail** : clé gratuite sur https://web3forms.com avec l'e-mail d'Opéria, à coller dans « Demandes de contact », « Réglages du formulaire ». Faire une demande d'essai.
4. **Nom de domaine** : agence-operia.fr est à eux. Le faire pointer vers Cloudflare (« Ajouter un site »), puis dans Claude Code :
   > Dans `wrangler.jsonc`, passe MAQUETTE à « non », ajoute la route `{ "pattern": "agence-operia.fr", "custom_domain": true }`, puis redéploie.
   Prévoir les redirections des anciennes adresses importantes (réalisations) pour ne pas perdre le référencement.
5. **Google** : le plan du site (`/sitemap.xml`) se crée tout seul ; l'ajouter dans Google Search Console.

## Les commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm run verifier` | Contrôle le contenu (forme, couleurs lisibles, photos, textes, rendu de chaque page) et liste ce qui reste à faire. |
| `npm test` | Lance le vrai serveur sur l'ordinateur et le teste de bout en bout (47 vérifications). |
| `npm run apercu` | Fabrique `demonstration.html` et `demo-en-ligne/`. |
| `npm run mot-de-passe` | Crée le mot de passe de l'espace de modification et son empreinte. |
| `npm run deploy` | Vérifie le contenu puis met en ligne. |

## Entretien

- **Changer le mot de passe** : `npm run mot-de-passe`, puis `npx wrangler secret put ADMIN_HASH`.
- **Sauvegarde du contenu** : `npx wrangler kv key get contenu --binding CONTENU --remote > sauvegarde.json`.
- **Sécurité** : 8 mauvais mots de passe bloquent la connexion 15 minutes ; 6 demandes au plus par appareil et par 10 minutes ; les demandes sont conservées 180 jours.

## Fichiers

| Fichier | Rôle |
|---|---|
| `contenu-initial.json` | Le contenu de départ |
| `src/worker.js` | Le serveur : pages, connexion, enregistrement, photos, demandes |
| `public/assets/rendu.js` | Fabrique toutes les pages à partir du contenu |
| `public/assets/site.css`, `site.js` | Design et fonctionnement du site |
| `public/assets/polices.js`, `public/fonts/` | Playfair Display et Manrope, licence libre |
| `public/admin/`, `public/assets/admin.*` | L'espace de modification |
| `public/assets/operia-*.png` | Logo : nom, nom en blanc, monogramme, logo complet |
| `outils/` | Vérificateur, tests, démonstration, mot de passe |
