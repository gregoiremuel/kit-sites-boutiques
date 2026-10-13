---
name: sites-boutiques
description: Méthode de Greg pour les sites de commerces (moteur + espace boutique) : maquette, contenu GLM, tests, démo, mise en ligne, prospection. À suivre dès qu'on crée ou modifie un site de boutique.
---

# Sites boutiques : la méthode de Greg

Greg (Grégoire Muel, joaillier à Paris 16e) crée des sites pour les commerces de son quartier, pour des entreprises (Opéria, maître d'œuvre à Vertou) et le site de la Maison Tcheskiss (joaillerie de son employeur). Chaque site est livré avec un **espace boutique** : une page privée où le commerçant modifie tout et reçoit les demandes de ses clients. Tout est déjà construit et testé : **on ne refait jamais le moteur, on remplit un contenu.**

## 1. Trouver le kit avant toute chose

Le kit `kit-sites-boutiques` contient la méthode complète (`METHODE.md`), les prompts, les pitchs et les trois moteurs. Dans l'ordre :
1. Un fichier `kit-sites-boutiques.zip` joint à la conversation : le décompresser dans le dossier de travail.
2. Sinon, le dépôt GitHub privé `gregoiremuel/kit-sites-boutiques` s'il existe : l'ajouter à la session et le cloner.
3. Sinon, demander à Greg de joindre le zip (une phrase), et en attendant, n'avancer que sur ce qui ne demande pas le moteur (notes, liste « à valider », pitch).

Lire `METHODE.md` en entier avant de commencer. Ce skill en est le résumé ; en cas d'écart, `METHODE.md` gagne.

## 2. Choisir le moteur

- **Vitrine** (`modeles/fromagerie-la-fontaine`) : commerce de quartier, une page (horaires, produits, offres, demande en ligne, presse, accès). Contenu fait par le prompt `prompts/1-site-et-espace-boutique.md` (Claude ou GLM), puis `npm run nouvelle-boutique -- ../contenu.json`.
- **Agence** (`modeles/agence-operia`) : entreprise de services ou du bâtiment, haut de gamme, plusieurs pages (expertises, méthode, réalisations avec page et galerie, filtres par secteur, équipe, engagements, références, formulaire de demande de projet avec statuts). Copier le dossier et réécrire `contenu-initial.json` ; les photos d'essai des réalisations portent d'office « Photo d'illustration ».
- **Catalogue** (`modeles/maison-tcheskiss`) : maison qui vend des pièces (collections, catalogue filtré, page par pièce, panier qui envoie une **demande de commande**, sans paiement en ligne). Copier le dossier et réécrire `contenu-initial.json` en gardant exactement la même forme.

## 3. Le déroulé d'une maquette

1. Rassembler : fiche Google (texte copié ou captures), notes de Greg (modèle `prompts/3-modele-de-notes.md`), photos du commerçant, presse.
2. Contenu : fiche de faits, liste « à valider » (questions pour le commerçant), puis `contenu.json`. Si le commerçant aime un site : `prompts/2-module-site-de-reference.md` (on ne reprend que couleurs, polices, variantes et ton).
3. Construire dans le dossier de la boutique : `npm install`, `npm run verifier` (aucune erreur), `npm test` (tout « ok »), `npm run apercu`.
4. Vérifier en vrai : ouvrir la démo dans un navigateur sans cadre et dans un cadre « allow-scripts » (comme l'aperçu de l'app Claude), à 390 px et 1280 px : navigation, panier ou demande, connexion à l'espace boutique (n'importe quel mot de passe), changer un prix, enregistrer, revoir le site. Aucune erreur JavaScript, aucun débordement horizontal.
5. Livrer avec SendUserFile : `demonstration.html` (à afficher) et le zip du projet (sans `node_modules`, `.wrangler`, `.dev.vars`, `demonstration.html`, `demo-en-ligne/`).

## 3 bis. Vidéo de fond (les trois moteurs)

Champ « Vidéo de fond » (MP4 ou WebM, 20 Mo au plus, ou lien https .mp4) et case « Vidéo en fond (sinon la photo) » dans l'accueil de l'espace de modification. La photo reste l'image d'attente, bouton pause intégré. Une vidéo d'iPhone (.mov) se convertit avec ffmpeg (commande dans `METHODE.md`, partie 2.7). Sans vidéo du client, un lent mouvement sur une de ses photos (ffmpeg zoompan) fait une bonne démonstration.

## 4. Règles d'or

- **N'invente rien** : prix, horaires, avis, dates, labels, services. L'inconnu reste vide et va dans « à valider ». Fiche Google et notes se contredisent : la fiche gagne, la contradiction va dans « à valider ».
- **Photos** : jamais celles de Google ou de Wix. Photos d'essai libres (Unsplash) créditées, jamais présentées comme un produit ou une pièce du commerce (des pierres, matières ou paysages pour patienter). Les photos du commerçant : réduites à 1200 px de large au plus, JPEG ~78, **sans métadonnées** (la position GPS), sujet recadré pour ne pas passer sous le titre.
- **Avis** : la note en chiffres et un lien vers la fiche, jamais le texte des avis.
- **Rien en ligne au nom d'un commerce qui n'a pas signé.** Pas d'artifact ni de lien public avec le vrai nom et la vraie marque : les fichiers s'envoient avec SendUserFile.
- **Textes légaux** (CGV, mentions, confidentialité) : des bases, marquées à faire relire. Greg n'est pas juriste, Claude non plus.
- **Mots « site IA » interdits** (le vérificateur les refuse) : Bienvenue, Découvrez, N'hésitez pas, au cœur de, véritable, incontournable, passion, savoir-faire unique, sublimer, écrin, expérience, univers, authentique, de qualité, d'exception, excellence, intemporel, En savoir plus… Ni violet, ni crème et terracotta, ni dégradés.
- **Pas de Wix ni de constructeur** quand Greg veut un vrai site indépendant.

## 5. Pièges connus (et la parade, déjà dans les moteurs)

- Aperçu de l'app Claude : formulaires et mémoire du navigateur bloqués. Boutons « type=button » avec un clic, mémoire de secours, jamais de `<form>` envoyé.
- Démos ouvertes depuis l'ordinateur : elles partagent la même mémoire du navigateur. Chaque démo range ses essais sous une clé propre au site et à sa version, avec un bouton « Remettre la démonstration à zéro » ; ne jamais revenir à une clé commune.
- Démo : la mémoire du navigateur fait ~5 Mo. Les images déjà dans le fichier ne doivent pas y être recopiées ; si elle est pleine, le dire au lieu de « Enregistré ».
- **iPhone : un fichier HTML ne s'ouvre pas.** Il faut un lien : `demo-en-ligne/` (fabriqué par `npm run apercu`) à déposer sur Cloudflare Pages, uniquement pour une boutique fictive ou signée.
- Photo verticale : hauteur plafonnée sur ordinateur (`max-height`) pour les bandes photo et texte.
- Réunion des scripts pour la démo : deux noms identiques au premier niveau la cassent (`apercu` le signale).
- Dans l'espace cloud de Claude : Unsplash et Cloudflare sont bloqués. Utiliser des photos de remplacement pour les captures, et faire la mise en ligne depuis l'ordinateur de Greg avec Claude Code (texte prêt dans le `LISEZMOI.md` du projet).
- Captures « page entière » : images blanches possibles. Capturer en faisant défiler l'écran.
- Le Chromium des tests ne lit pas le H.264 : tester la lecture vidéo avec un WebM.
- Site d'un client à refaire : l'espace cloud ne télécharge pas ses photos ni son logo ; WebFetch lit les textes, Greg joint le logo (détourage en PNG transparent avec sharp).

## 6. Mise en ligne (sur l'ordinateur de Greg, Claude Code)

Compte Cloudflare gratuit, puis : `npm install`, `npm test`, `npx wrangler login`, `npx wrangler kv namespace create CONTENU` (id dans `wrangler.jsonc`), `npm run mot-de-passe`, `npx wrangler secret put ADMIN_HASH` et `SESSION_SECRET`, `npm run deploy`. MAQUETTE à « oui » tant que ce n'est pas signé (bandeau, non indexé). Après signature : domaine au nom du client, MAQUETTE à « non », route `custom_domain`, redéploiement, clé Web3Forms, mentions légales, prise en main de 15 minutes.

## 7. Travailler avec Greg

- Français, tutoiement, direct. Il lit souvent sur téléphone : phrases courtes, textes prêts à coller.
- Réponse finale toujours en trois parties : **Réponse claire** ; **Niveau de confiance** (0.0 à 1.0, avec la raison) ; **Réserves clés**.
- Honnête plutôt que rassurant ; dire ce qui n'a pas pu être testé.
- Tâches simples et répétitives : les confier à un modèle moins cher quand c'est possible. GLM sert au contenu (prompt 1).
- Chaque nouvelle leçon (bug, piège, meilleure façon de faire) : l'ajouter à `METHODE.md` (partie 3 ou 4), changer la version, refaire le zip ou pousser sur le dépôt, et proposer de mettre ce skill à jour.