---
name: sites-boutiques
description: Méthode de Greg pour les sites de commerces (moteur + page de modification) : maquette, contenu GLM, tests, démo, mise en ligne, prospection. À suivre dès qu'on crée ou modifie un site de boutique.
---

# Sites boutiques : la méthode de Greg

Greg (Grégoire Muel, joaillier à Paris 16e) crée des sites pour les commerces de son quartier, pour des entreprises (Opéria, maître d'œuvre à Vertou) et le site de la Maison Tcheskiss (joaillerie de son employeur). Chaque site est livré avec une **page de modification** : une page privée où le commerçant modifie tout et reçoit les demandes de ses clients. Tout est déjà construit et testé : **on ne refait jamais le moteur, on remplit un contenu.**

## 1. Trouver le kit avant toute chose

Le kit `kit-sites-boutiques` contient la méthode complète (`METHODE.md`), les prompts, les pitchs et les trois moteurs. Dans l'ordre :
1. Un fichier `kit-sites-boutiques.zip` joint à la conversation : le décompresser dans le dossier de travail.
2. Sinon, le dépôt GitHub privé `gregoiremuel/kit-sites-boutiques` s'il existe : l'ajouter à la session et le cloner.
3. Sinon, demander à Greg de joindre le zip (une phrase), et en attendant, n'avancer que sur ce qui ne demande pas le moteur (notes, liste « à valider », pitch).

Lire `METHODE.md` en entier avant de commencer. Ce skill en est le résumé ; en cas d'écart, `METHODE.md` gagne.

## 2. Choisir le moteur

- **Vitrine** (`modeles/fromagerie-la-fontaine`) : commerce de quartier, une page (horaires, produits, offres, demande en ligne, presse, accès). Contenu fait par le prompt `prompts/1-site-et-espace-boutique.md` (Claude ou GLM), puis `npm run nouvelle-boutique -- ../contenu.json`.
- **Agence** (`modeles/agence-operia`) : entreprise de services ou du bâtiment, ou activité de création (deux gabarits : `theme.gabarit` « classique » ou « studio » ; bloc facultatif `abonnements`), plusieurs pages (expertises, méthode, réalisations avec page et galerie, filtres par secteur, actualités datées que le client publie lui-même, équipe, engagements, références, formulaire de demande de projet avec statuts). Copier le dossier et réécrire `contenu-initial.json` ; les photos d'essai des réalisations portent d'office « Photo d'illustration ».
- **Catalogue** (`modeles/maison-tcheskiss`) : maison qui vend des pièces (champs de bijouterie : métal, pierres, tailles, gravure ; ne pas le proposer tel quel hors joaillerie) (collections, catalogue filtré, page par pièce, panier qui envoie une **demande de commande**, sans paiement en ligne). Copier le dossier et réécrire `contenu-initial.json` en gardant exactement la même forme.

## 3. Le déroulé d'une maquette

1. Rassembler : fiche Google (texte copié ou captures), notes de Greg (modèle `prompts/3-modele-de-notes.md`), photos du commerçant, presse.
2. Contenu : fiche de faits, liste « à valider » (questions pour le commerçant), puis `contenu.json`. Si le commerçant aime un site : `prompts/2-module-site-de-reference.md` (on ne reprend que couleurs, polices, variantes et ton).
3. Construire dans le dossier de la boutique : `npm install`, `npm run verifier` (aucune erreur), `npm test` (tout « ok »), `npm run apercu`.
4. Vérifier en vrai : ouvrir la démo dans un navigateur sans cadre et dans un cadre « allow-scripts » (comme l'aperçu de l'app Claude), à 390 px et 1280 px : navigation, panier ou demande, connexion à la page de modification (n'importe quel mot de passe), changer un prix, enregistrer, revoir le site. Aucune erreur JavaScript, aucun débordement horizontal.
5. Livrer avec SendUserFile : `demonstration.html` (à afficher) et le zip du projet (sans `node_modules`, `.wrangler`, `.dev.vars`, `demonstration.html`, `demo-en-ligne/`).

## 3 bis. Vidéo de fond (les trois moteurs)

Champ « Vidéo de fond » (MP4 ou WebM, 20 Mo au plus, ou lien https .mp4) et case « Vidéo en fond (sinon la photo) » dans l'accueil de la page de modification. La photo reste l'image d'attente, bouton pause intégré. Une vidéo d'iPhone (.mov) se convertit avec ffmpeg (commande dans `METHODE.md`, partie 2.7). Sans vidéo du client, un lent mouvement sur une de ses photos (ffmpeg zoompan) fait une bonne démonstration.

## 4. Règles d'or

- **N'invente rien** : prix, horaires, avis, dates, labels, services. L'inconnu reste vide et va dans « à valider ». Fiche Google et notes se contredisent : la fiche gagne, la contradiction va dans « à valider ».
- **Photos** : jamais celles de Google ou de Wix. Photos d'essai libres (Unsplash) créditées, jamais présentées comme un produit ou une pièce du commerce (des pierres, matières ou paysages pour patienter). Les photos du commerçant : réduites à 1200 px de large au plus, JPEG ~78, **sans métadonnées** (la position GPS), sujet recadré pour ne pas passer sous le titre.
- **Avis** : la note en chiffres et un lien vers la fiche, jamais le texte des avis.
- **Rien en ligne au nom d'un commerce qui n'a pas signé.** Pas d'artifact ni de lien public avec le vrai nom et la vraie marque : les fichiers s'envoient avec SendUserFile.
- **Textes légaux** (CGV, mentions, confidentialité) : des bases, marquées à faire relire. Greg n'est pas juriste, Claude non plus.
- **Mots « site IA » interdits** (le vérificateur les refuse) : Bienvenue, Découvrez, N'hésitez pas, au cœur de, véritable, incontournable, passion, savoir-faire unique, sublimer, écrin, expérience, univers, authentique, de qualité, d'exception, excellence, intemporel, En savoir plus… Ni violet, ni crème et terracotta, ni dégradés.
- **Pas de Wix ni de constructeur** quand Greg veut un vrai site indépendant.

- **Un site, une identité** : chaque site a sa couleur, ses polices, sa mise en page et ses formes, différentes de tous les sites déjà faits (registre des styles dans `METHODE.md`, partie 3), et une interface cohérente avec le métier (bouche : empattements chaleureux ; artisan : empattements carrés, teintes de matière, angles droits ; service moderne : famille nette ; bâtiment haut de gamme : sombre et sobre ; création : grotesque, papier clair). Test : deux captures côte à côte réduites ; si elles se confondent, on recommence. Un look qui manque au moteur s'ajoute au moteur.
- **Prix** : toujours des propositions que Greg valide ; repères du marché dans `METHODE.md`, partie 9, à rechercher de nouveau avant de les citer.

## 5. Pièges connus (et la parade, déjà dans les moteurs)

- Aperçu de l'app Claude : formulaires et mémoire du navigateur bloqués. Boutons « type=button » avec un clic, mémoire de secours, jamais de `<form>` envoyé.
- Démos ouvertes depuis l'ordinateur : elles partagent la même mémoire du navigateur. Chaque démo range ses essais sous une clé propre au site et à sa version, avec un bouton « Remettre la démonstration à zéro » ; ne jamais revenir à une clé commune.
- Démo : la mémoire du navigateur fait ~5 Mo. Les images déjà dans le fichier ne doivent pas y être recopiées ; si elle est pleine, le dire au lieu de « Enregistré ».
- **iPhone : un fichier HTML ne s'ouvre pas.** Il faut un lien : `demo-en-ligne/` (fabriqué par `npm run apercu`) à déposer sur Cloudflare Pages, uniquement pour une boutique fictive ou signée.
- Photo verticale : hauteur plafonnée sur ordinateur (`max-height`) pour les bandes photo et texte.
- Réunion des scripts pour la démo : deux noms identiques au premier niveau la cassent (`apercu` le signale).
- Dans l'espace cloud de Claude : Cloudflare est bloqué (mise en ligne depuis l'ordinateur de Greg avec Claude Code, texte prêt dans le `LISEZMOI.md` du projet). Pour les photos, **tester d'abord `images.unsplash.com` et `images.pexels.com`** ; s'ils sont bloqués, s'arrêter et le dire à Greg, sans contourner (`METHODE.md`, 2.8 bis). Avant de livrer : `npm run accessibilite` et l'avis de cinq sous-agents Haiku (`METHODE.md`, 2.8 ter et quater).
- Captures « page entière » : images blanches possibles. Capturer en faisant défiler l'écran ; pour une démo dans son cadre, capturer la fenêtre et faire défiler le cadre.
- Texte du bandeau d'une démo remplacé par expression régulière : s'arrêter au prochain `<`, sinon la balise fermante disparaît et toute la page se décale.
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

## 8. Leçons du 28 et 29 octobre 2026 (à relire avant de toucher au style)

- **Contrôles** : `npm run verifier`, `npm test`, `npm run accessibilite` (2 min 30), et dans le dépôt de l'agence `npm run rendu <adresse>` (texte jamais sous 14 px, titres plafonnés, rien de caché au chargement, liens alignés, `alt`). Le détecteur Impeccable se lance en détection seule : `DO_NOT_TRACK=1 npx impeccable detect <adresse>`, jamais `install`.
- **Style** : un seul bleu, fond papier froid (pas de crème), texte presque noir, pas de motif répété, pas d'ombre dure, pas de surtitre, icônes Lucide (ISC), pas de fondu au défilement. Taille mobile : titre d'accueil 28 px, titres de pages 26, rubriques 20, sous-titres 17. Toujours vérifier à 412 px.
- **Preuve** : jamais de faux client, d'avis ou de chiffre ; démonstrations étiquetées ; photos d'illustration créditées. Le frein à la vente est la preuve, pas le prix.
- **Tests de bout en bout** : quatre sous-agents Haiku (visiteur, admin, démonstrations, commandes) sur un serveur jetable avec mot de passe connu ; rapport de 35 lignes ; ne croire que ce qui est constaté.
- **Pièges** : voir `METHODE.md`, partie 4 (version 15) : titres trop gros, rangées désalignées, `pkill`, Chromium en root, KV qui garde son contenu, clé facultative du vérificateur, démonstrations à refaire, `git checkout -B` après un commit.
- **Actualités (moteur agence, 29/10)** : rubrique `/actualites` que le client remplit depuis sa page de modification (titre, date, photos, texte, réalisation liée). Conseil à donner : une toutes les une à deux semaines, 300 à 800 signes, lieu et métier écrits, ses propres photos. Le même fait du mois sert au post Google et à l'actualité (`METHODE.md`, 2.11). Jamais d'actualité inventée ni de texte bourré de mots-clés.
- **Programme de visibilité (29/10)** : moteur agence = plan du site daté, IndexNow (Secret `INDEXNOW_KEY`), lien court `/avis` (`agence.lien_avis`) ; n8n = flux 4, veille du lundi sur Telegram. Le reste est humain et pèse le plus : fiche Google, avis, annuaires cohérents (Foursquare pour ChatGPT). Détail : `METHODE.md`, 2.11. Ne jamais promettre une place dans Google.
- **Référencement web (29/10)** : lastmod réel par page, IndexNow, RSS, WebSite et fil d'Ariane, lien `CREDIT_SITE` (accord écrit du client) ; puis Search Console et Bing (import), contenu utile et liens entrants honnêtes. `METHODE.md`, 2.11.
- **Refonte et référencement (table de conférence du 29/10, cas Opéria)** : la fréquence de publication n'est pas un critère de Google ; ce qui marche, c'est des pages utiles (une par service, une par chantier) et des liens. Avant toute refonte : relever les anciennes adresses, remplir `redirections` (301), reprendre les anciennes pages de valeur, exporter la Search Console. Viser les requêtes des vrais clients (pros : « aménagement de bureaux Nantes »). Lien « Site réalisé par » toujours en nofollow. `METHODE.md`, 2.11.
- **Noms de modèles Claude** : jamais de nom deviné (`claude-haiku-5-5` n'existe pas) ; Haiku actuel : `claude-haiku-4-5`. Vérifier dans la documentation avant d'écrire un appel.
- **Joaillerie (Atelier Muel)** : même méthode, modèle catalogue (`maison-tcheskiss`) avec un contenu, une couleur, des polices et une mise en page propres ; photos réelles des pièces ; mentions sur les métaux précieux, poinçons, garantie et rétractation à faire confirmer ; compte bancaire dédié dès le début ; ne pas citer l'employeur.
