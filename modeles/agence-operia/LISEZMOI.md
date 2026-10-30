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

## Sauvegarde et visites (moteur du 28/10/2026)

- **Sauvegarde nocturne** : chaque nuit, le serveur garde une copie du contenu pendant 7 nuits (cron du Worker). Une copie externe (R2) est possible en ajoutant la ligne commentée de `wrangler.jsonc`. Restauration et détails : `METHODE.md` du kit, partie 2.4 bis.
- **Visites** : une fois le site ouvert (`MAQUETTE` à « non »), le serveur compte les pages vues par jour, sans cookie ni adresse IP ; panneau « Visites du site » de l'espace de modification. La page de confidentialité le dit.
- **Pages par métier et comparaison** : deux blocs facultatifs du contenu, absents d'ici (voir `METHODE.md`, partie 2.4 bis).

## Vidéo de fond (accueil)

Dans l'espace de modification, rubrique « Accueil » : « Vidéo de fond », puis la case « Vidéo en fond (sinon la photo) ». Case décochée, le site garde la photo, comme avant ; la vidéo reste enregistrée pour plus tard. La photo sert aussi d'image d'attente pendant le chargement, et un petit bouton pause s'affiche en bas à droite (obligatoire pour l'accessibilité). Les visiteurs qui ont demandé moins d'animations voient la vidéo à l'arrêt.

Une bonne vidéo de fond :
- **MP4**, 10 à 20 secondes, **sans son** (elle est toujours muette), **à l'horizontale** ;
- un mouvement lent et régulier (atelier, gestes, matière, lieu), sans texte incrusté, qui boucle bien ;
- **20 Mo au plus** (8 Mo dans la démonstration). Sur Android, la caméra enregistre déjà en MP4 : coupez la vidéo à 15 secondes dans la galerie, en 1080p ou 720p ;
- **iPhone** : la caméra enregistre en .mov, que tous les navigateurs ne lisent pas. Envoyez la vidéo à Grégoire (ou à Claude) : elle sera convertie en MP4 léger, ou utilisez une application de conversion.
- On peut aussi coller un lien https vers un fichier .mp4 déjà en ligne.

## Mettre en ligne depuis un téléphone (GitHub + Cloudflare)

Le dépôt GitHub privé `site-operia` contient tout. Cloudflare peut le mettre en ligne lui-même, sans ordinateur :

1. Sur https://dash.cloudflare.com (compte gratuit) : « Workers & Pages », « Create application », « Import a repository », « Get started ».
2. Connecter GitHub et autoriser Cloudflare sur le dépôt `site-operia`, puis le choisir.
3. Nom du projet : **site-operia** (exactement, sinon la mise en ligne échoue). Laisser les commandes proposées, puis « Save and Deploy ». Le stockage du contenu se crée tout seul.
4. Dans le projet : « Settings », « Variables and Secrets », ajouter deux **Secrets** : `ADMIN_HASH` et `SESSION_SECRET` (valeurs données par Grégoire ou par `npm run mot-de-passe`). Relancer un déploiement.
5. L'adresse est `site-operia.<ton-compte>.workers.dev`, l'espace de modification à la même adresse suivie de `/admin`. Chaque modification poussée sur GitHub se remet en ligne toute seule.

Le site reste en mode proposition (MAQUETTE à « oui ») : bandeau, non indexé par Google, formulaire de contact en démonstration.

## Mettre en ligne (avec Claude Code)

Compte gratuit sur https://dash.cloudflare.com, puis dans Claude Code, ouvert dans ce dossier :

> Installe les dépendances (`npm install`). Lance `npm test` : tout doit être « ok ». Connecte-moi à Cloudflare (`npx wrangler login`). Le stockage KV « CONTENU » se crée tout seul au premier déploiement. Lance `npm run mot-de-passe`, puis enregistre ADMIN_HASH et SESSION_SECRET avec `npx wrangler secret put`. Déploie avec `npm run deploy`. Donne-moi l'adresse du site et le mot de passe. Laisse MAQUETTE à « oui ».

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

## Ajouts du moteur (octobre 2026)

- **Page Engagements** (`/engagements`) : clé facultative `engagements`, une liste de blocs `{ titre, texte, points }` (hébergement, données, sauvegardes, délais…). Sans bloc, ni page ni lien de menu. Modifiable dans la rubrique « Engagements » de la page de modification.
- **Actualités** (`/actualites`, `/actualites/<id>`, 29/10/2026) : clé facultative `actualites`, liste de `{ id, titre, date (AAAA-MM-JJ), texte, photos, realisation, visible }`. La plus récente d'abord ; les 3 dernières sur l'accueil (`accueil.actualites: false` pour les cacher) ; lien « Actualités » dans le menu dès qu'une actualité est en ligne ; chaque page a ses données « BlogPosting » pour Google et entre dans le plan du site. Rubrique « Actualités » dans la page de modification (date du jour par défaut, réalisation liée au choix). Présentation en **liste éditoriale** (date, titre et extrait, petite vignette si photo) : les lignes restent alignées avec ou sans photo. Pour Google : données « BlogPosting » et fil d'Ariane, partage de type « article », date dans le plan du site (`lastmod`), liens dans les deux sens entre une réalisation et ses actualités (« Actualités de ce projet »).
- **IndexNow** (29/10/2026) : à chaque enregistrement qui ajoute ou change une actualité ou une réalisation, le serveur prévient Bing et les moteurs IndexNow (dont la recherche de ChatGPT, qui s'appuie sur Bing). Conditions : `MAQUETTE` à « non », `reglages.url` en https, Secret `INDEXNOW_KEY` (`openssl rand -hex 16`, puis `npx wrangler secret put INDEXNOW_KEY`) ; le fichier de clé est servi à `/<clé>.txt`. Google ne l'utilise pas : pour lui, le plan du site daté.
- **Référencement web** (29/10/2026) : plan du site avec la date réelle de modification de chaque page (clé KV `lastmod`), IndexNow pour toutes les pages modifiées, flux RSS `/actualites.xml` (annoncé dans l'en-tête), données `WebSite` et logo sur l'accueil, fil d'Ariane sur les réalisations et les pages métier, titre sans le nom du site s'il dépasse 60 signes, cache d'une heure des fichiers `/assets/`. Variable facultative `CREDIT_SITE` (« texte|https://… ») : lien « Site réalisé par » en pied de page, à faire accepter par le client dans le devis. `node outils/referencement.mjs <contenu.json>` contrôle désormais le fichier donné.
- **Conformité et titres Google** (30/10/2026) : pages « Mentions légales » (avec téléphone de l'hébergeur, champ `mentions.hebergeur_telephone`) et « Confidentialité » (responsable, cookies, base légale, durée, destinataires, transferts, droits, CNIL) complétées ; lien « Cookies » dans le pied de page ; mention d'information sous le formulaire ; aucune case de consentement ; clé facultative `seo` (`{ "/adresse": { "titre", "description" } }`, lue même si la mémoire a déjà un contenu) ; `npm run verifier` liste e-mail, téléphone de l'hébergeur et longueurs. Méthode : `METHODE.md` du kit, partie 2.12 ; prompt : `prompts/4-conformite-web.md`.
- **Profils reliés et zone** (29/10/2026) : `agence.profils` (une adresse par ligne : fiche Google, Pages Jaunes, Houzz, Facebook…) s'ajoute aux liens LinkedIn et Instagram dans les données de l'entreprise (`sameAs`) ; `agence.zone` écrite « Nantes, Vertou et Rezé » devient une liste de villes (`areaServed`). Champ « Autres profils en ligne » dans « Coordonnées, logo et mentions ».
- **Redirections 301** (29/10/2026) : liste `redirections` (`{ de: '/ancienne-adresse/', vers: '/nouvelle' }`, ou `https://…`), contrôlée par le vérificateur (une redirection ne peut pas masquer une page). Les adresses WordPress (`/feed/`, `/category/…`, `/tag/…`, `/author/…`, `/page/N`) et le « / » final sont redirigés d'office. À remplir avant toute refonte d'un site existant (`METHODE.md`, 2.11).
- **Publier une actualité en une minute** (29/10/2026) : encadré en tête de la page de modification (photos, titre, texte, « Publier maintenant ») ; il rappelle depuis combien de jours rien n'a été publié. Rappel par e-mail au client : flux n8n 5.
- **Lien court `/avis`** : redirige vers le formulaire d'avis Google rempli dans `agence.lien_avis` (page de modification, « Coordonnées, logo et mentions »). À mettre en QR code sur factures, cartes et vitrine. Sans lien : page introuvable.
- **Étiquette sur une vignette** : `realisations[].etiquette` (ex. « Démonstration »). L'accueil montre 6, 4 ou 3 réalisations selon leur nombre.
- **Cartes** : le nom de la réalisation est au-dessus de l'image.
- **Accessibilité** : `npm run accessibilite` (axe-core, WCAG 2.2 AA, bureau, mobile, « moins d'animations », parcours au clavier ; demande Playwright). Anneau de focus à deux tons, bandeaux de version et d'annonce repérés comme zones de la page.
