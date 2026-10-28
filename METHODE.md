# Méthode « sites boutiques »

Version 13, 28 octobre 2026. Grégoire Muel.

Toute la méthode pour créer, montrer, vendre, mettre en ligne et entretenir les sites des commerces : les étapes, les règles, les pièges déjà rencontrés et leur parade, les listes de contrôle. Elle sert à Greg, à Claude (Claude Code ou l'app), à GLM et à toute personne à qui on confie le travail.

---

## 0. En une minute

- **L'offre** : un site rapide, à leur nom, avec une **page de modification**, une page privée où le commerçant change lui-même ses horaires, prix, photos et textes, affiche ou masque chaque partie, et reçoit les demandes de ses clients. Maquette gratuite en 48 h, puis le site à partir de 590 € **une fois** (photos comprises), **sans abonnement obligatoire** ; en option, un abonnement mensuel (Sérénité 19 €, Croissance 49 €) et, **sans site**, la **Visibilité Google** (39 €, fiche Google tenue chaque mois, avec un mini-diagnostic gratuit pour commencer). L'argument de vente : « je m'en occupe pour vous » (la page de modification reste là pour ceux qui préfèrent faire eux-mêmes). Ces prix sont des propositions de départ ; repères du marché en partie 9.
- **Trois moteurs, déjà testés**, dans `modeles/` :
  - **Vitrine** (`modeles/fromagerie-la-fontaine`) : une page pour un commerce de quartier, un artisan ou un restaurant (accueil, la boutique, produits ou carte, offres, demande en ligne, presse et note Google, questions, horaires, accès). Cinq **gabarits** (`theme.gabarit`) qui changent la structure de la page, pas seulement les couleurs : `standard` (accueil sur grande photo, partagé ou sobre ; titres ; angles ; offres), `atelier` (artisan : index numéroté, tiroirs), `depannage` (urgence : appel et « Dépannage ou devis » en tête, tuiles), `carte` (restaurant : carte à deux colonnes, réservation), `marche` (fleurs, produits frais : mosaïque, saisons en cartes). Sept jeux de polices, pour que deux boutiques voisines ne se ressemblent pas.
  - **Agence** (`modeles/agence-operia`) : un site de plusieurs pages, haut de gamme, pour une entreprise de services ou du bâtiment (expertises, méthode, réalisations avec une page et une galerie par projet, filtres par secteur, équipe, engagements, références, formulaire de demande de projet avec statuts : Nouvelle, Rappelé, Devis envoyé, Signée, Classée).
  - **Catalogue** (`modeles/maison-tcheskiss`) : un site de plusieurs pages pour une maison qui vend des pièces (accueil, collections, catalogue avec filtres, une page par pièce, panier, pages d'information, mentions légales). Le panier envoie une **demande de commande**, sans paiement en ligne : la maison rappelle, encaisse et expédie. Stripe pourra s'ajouter plus tard.
- **L'IA n'écrit jamais de code** pour un nouveau site. Elle remplit un seul fichier de contenu (`contenu.json`) à partir d'un squelette fixe. Le moteur, la page de modification et le serveur restent les mêmes partout.
- **Hébergement** : Cloudflare Workers, offre gratuite (le site, la page de modification et la mémoire du site). Seul le nom de domaine se paie, au nom du client.

---

## 1. Les étapes, de la prospection à la facture

Ton premier site peut être signé en deux semaines si tu visites 5 commerces la première semaine.

1. **Statut** : ajouter l'activité « création de sites internet » à la micro-entreprise (procedures.inpi.fr).
2. **Démo de prospection** : une boutique **fictive** faite avec le moteur vitrine. Jamais la maquette d'un commerce qui n'a pas signé.
3. **Choisir** 5 commerces sans site ou avec un site faible (bonne note, au moins 40 avis : clientèle active). Vérifier sur place qu'ils n'ont toujours pas de site.
4. **Visiter** entre 18h15 et 19h ou le samedi, avec le pitch adapté (`prospection/pitchs.md`). Noter : prénom du gérant, horaires, prix, ce qu'il veut mettre en avant, couleur de la devanture.
5. **Maquette gratuite en 48 h** (partie 2). Marquée « Proposition », jamais publiée en ligne à son nom.
6. **La montrer** sur ton téléphone (ou deux captures par e-mail). S'il accepte : devis signé (prix, délai, 2 séries de corrections incluses) et acompte de 30 %.
7. **Récupérer le contenu** : logo, prix, horaires, textes validés, SIRET pour les mentions légales. Shooting photo de 30 minutes.
8. **Nom de domaine** au nom du client, qui en reste propriétaire. DNS confiés à Cloudflare (gratuit). Garder les accès techniques pour la maintenance.
9. **Construire la version finale** avec les infos validées, puis la vérifier sur téléphone (liste « Avant la mise en ligne », partie 5).
10. **Mettre en ligne** (partie 2.6), donner le mot de passe de la page de modification, prise en main de 15 minutes, lien du site ajouté sur la fiche Google.
11. **Facturer le solde**. En micro-entreprise sans TVA : mention « TVA non applicable, art. 293 B du CGI ». Lancer l'abonnement mensuel. Déclarer le chiffre d'affaires à l'URSSAF.
12. **Demander** un avis Google et une recommandation à deux commerçants voisins.

---

## 2. Fabriquer un site

### 2.1 Rassembler
- **La fiche Google** : sur ordinateur, sélectionner tout le panneau (nom, note, adresse, horaires dépliés, téléphone, « À propos ») et le copier. Sur téléphone, 2 ou 3 captures, horaires dépliés : Claude et GLM lisent les images.
- **Les notes** : avec `prompts/3-modele-de-notes.md`, en cinq parties : 1. Faits sûrs ; 2. Entendu, pas vérifié ; 3. Inspirations ; 4. Photos ; 5. Presse et liens. Un fichier .md, .txt, .pdf ou .docx joint marche aussi.
- **Les photos du commerçant** si tu en as. Jamais celles de Google ou de Wix : elles appartiennent à leurs auteurs.
- **La ligne « Style : … »** des boutiques voisines déjà faites (le vérificateur l'affiche) : l'IA en choisira un autre.

### 2.2 Le contenu (moteur vitrine) : Claude ou GLM
1. Coller `prompts/1-site-et-espace-boutique.md`, puis la fiche, les notes et les photos (ou les joindre).
2. Si le commerçant aime un site : coller `prompts/2-module-site-de-reference.md` **au-dessus** du prompt, avec 2 à 6 captures de ce site.
3. L'IA rend une fiche de faits, une liste « à valider » (questions pour le commerçant) et un bloc `contenu.json`. Enregistrer ce bloc dans un fichier `contenu.json`.

### 2.2 bis La fabrique de maquettes en 1 heure (prospection)
Pour une maquette à montrer le jour même, à partir de la fiche Google collée. Un script sans dépendance enchaîne les étapes ; seul le contenu passe par une IA.
1. **Copier la fiche** (nom, adresse, téléphone, horaires **dépliés**, note) dans un fichier `fiche.txt`. Facultatif : `notes.md` (modèle `prompts/3-modele-de-notes.md`).
2. `node outils/fabrique-maquette.mjs preparer fiche.txt notes.md` : crée `maquettes/<nom>/` avec `prompt.md` (le prompt 1 suivi de la fiche et des notes) et `faits.json` (ce que le script lit lui-même dans la fiche : téléphone, adresse, horaires, note). Le dossier `maquettes/` n'est jamais envoyé sur GitHub : il contient des données de commerçants.
3. **Coller `prompt.md`** dans Claude ou GLM et enregistrer sa réponse entière dans `maquettes/<nom>/contenu.json` (le bloc json est retrouvé tout seul).
4. `node outils/fabrique-maquette.mjs construire maquettes/<nom>` (ajouter `--tester` pour lancer aussi `npm test`) : **contrôle croisé** (le contenu dit-il la même chose que la fiche : téléphone, code postal, adresse, horaires jour par jour, note ?) ; en cas d'« ÉCART », rien n'est fabriqué : renvoyer les lignes à l'IA (« corrige uniquement ces points »). Sinon : fabrication avec le moteur vitrine (`nouvelle-boutique`, qui vérifie le contenu), puis `demonstration.html` dans le dossier.
5. **Montrer** sur téléphone (partie 2.5), poser la liste « à valider » au commerçant. Aucun lien public au nom du commerce.
Le contrôle croisé attrape les dérives de l'IA sur les faits sûrs (il est testé avec un faux téléphone, de faux horaires et une fausse note). Il ne remplace pas la relecture des textes. Durée visée : 15 minutes de préparation, 10 minutes pour l'IA, 15 minutes de relecture. Pour un moteur agence (entreprise de services), la fabrique ne s'applique pas : le contenu se prépare avec Claude (partie 2.4 bis).

### 2.3 Construire et tester : Claude Code (ou Claude avec ce kit)
Dans le dossier `modeles/fromagerie-la-fontaine` :
> Lance `npm install`, puis `npm run nouvelle-boutique -- ../contenu.json`. S'il y a des lignes « ERREUR », montre-les-moi telles quelles. Sinon, va dans le nouveau dossier créé à côté, lance `npm install`, `npm run apercu` et `npm test`, et donne-moi le fichier demonstration.html.

- S'il y a des erreurs : les recoller à l'IA (« corrige uniquement ces points et renvoie le contenu.json complet »), puis recommencer.
- Le modèle n'est jamais modifié : `nouvelle-boutique` crée un dossier à côté, avec le même moteur et le nouveau contenu.

### 2.4 Le moteur catalogue (boutique qui vend des pièces)
Il n'a pas encore de prompt pour GLM : le contenu se prépare avec Claude.
> Pars de `modeles/maison-tcheskiss`. Copie-le dans un nouveau dossier au nom de la boutique, puis réécris `contenu-initial.json` pour [boutique] avec mes notes et mes photos jointes, en gardant exactement la même forme. Mets mes photos dans `public/assets/photos/` (1200 px de large au plus, sans données GPS). Lance `npm run verifier`, `npm test` et `npm run apercu`, puis donne-moi la démonstration.

Ce qui se règle dans ce contenu : nom, logo (SVG ou PNG transparent), couleurs du thème (fond, encre, gris, trait), collections avec leur couleur, types de pièces, pièces (photos, photo portée, prix ou « prix sur demande », tailles, gravure, vendue, masquée, exemple), pages (atelier, la maison, entretien, guide des tailles, commande et livraison, conditions de vente), réglages des demandes, mentions légales.

### 2.4 bis Le moteur agence (entreprise de services, bâtiment, cabinet)
Comme le catalogue : le contenu se prépare avec Claude, à partir du site actuel du client (refonte : ses propres faits et textes, réécrits) ou de tes notes.
> Pars de `modeles/agence-operia`. Copie-le dans un nouveau dossier au nom du client, puis réécris `contenu-initial.json` pour [client] avec ces éléments, en gardant exactement la même forme. Mets le logo (fond transparent) dans `public/assets/`. Lance `npm run verifier`, `npm test` et `npm run apercu`, puis donne-moi la démonstration.

Les photos d'essai des réalisations portent automatiquement la mention « Photo d'illustration » : on ne fait jamais passer une photo de banque d'images pour un chantier du client.

Le moteur agence sert à toute entreprise de services, pas seulement au bâtiment (exemple : le site de Grégoire Muel, sites internet, dépôt `site-atelier-muel`). Les cartes de réalisation montrent le **nom au-dessus de l'image**. Champs facultatifs, absents d'Opéria :
- `libelles` : les mots du menu, des titres de rubrique, de la fiche d'une réalisation et du formulaire (liste et valeurs par défaut dans `LIBELLES`, `rendu.js`). Un champ du formulaire au libellé vide disparaît. Le panneau « Titres et libellés » ne s'affiche dans la page de modification que si le contenu a des `libelles`.
- `metiers[].prix` : « À partir de… » sous chaque offre.
- `realisations[].lien` et `lien_texte` : bouton vers le site en ligne ou une démonstration. Avec `accueil.essai_titre` et `essai_texte`, l'accueil affiche un bloc « À essayer » qui liste ces liens.
- `abonnements` : bloc « Abonnement facultatif » de la page des offres (`titre`, `intro`, `note`, `formules[]` avec `nom`, `prix`, `periode`, `description`, `points`, `recommande`). Panneau « Abonnement mensuel » dans la page de modification, seulement si le bloc existe.
- `theme.gabarit` : `classique` (par défaut : bandes foncées, photo plein cadre, Playfair + Manrope), `studio` (papier clair, accueil en deux colonnes, Bricolage Grotesque + DM Sans, pastilles, bandes arrondies) ou `edition` (voir plus bas). Voir la règle « Un site, une identité » (partie 3).
- **Gabarit `edition`** (28/10/2026, fait pour le site de Grégoire Muel après trois avis extérieurs) : une page tenue comme un document imprimé. Papier blanc `#f6f6f2`, encre `#101216`, **un seul bleu** (`marine`, le bleu de travail `#1f48b8`) réservé aux liens, aux prix et à un aplat de fin de page ; `or` n'y sert qu'au bandeau « proposition ». Titres en **Besley** (égyptienne chaleureuse), texte en **Schibsted Grotesk**, angles droits, filets fins, aucun dégradé, aucune pastille, aucune capitale espacée, aucune ombre. Composants propres : accueil sans collage (le tarif en trois lignes à droite du titre, ou une photo si `accueil.photo` est rempli), offres en liste (accueil) et **en volets** (page des offres, `<details>` ouverts par `#identifiant`), tarifs composés en colonnes, tableau de comparaison, bande des quatre sites avec légendes, **feuille de diagnostic** (`pages_metier[].exemple`), FAQ à filets, typographie française (espaces insécables avant `: ; ! ?`, entre un nombre et `€`).
  Champs facultatifs apportés avec lui : `accueil.cartes` (false : pas de vignettes de réalisations sur l'accueil), `realisations[].apercu` (capture verticale de la bande « À essayer », fabriquée par `npm run vignettes`), `accueil.reperes` et `metiers[].prix` au format `montant | précision` (composés sur deux lignes), `pages_metier[].sur` (petit titre de la page) et `pages_metier[].exemple` (feuille d'exemple : `titre`, `commerce`, `date`, `lignes[{point, etat: ok|afaire|manque, note}]`, `actions`, `legende` ; le vérificateur exige de dire que le commerce est imaginaire).
- `mentions.tva` : ligne TVA des mentions légales (« TVA non applicable, article 293 B du CGI » pour une micro-entreprise en franchise).
- `realisations[].etiquette` : étiquette sur la vignette et sur la fiche (« Démonstration » pour un site imaginaire ; vide pour un vrai client). L'accueil montre 6 réalisations (une grande et cinq), 4 (deux par deux) ou 3.
- `comparaison` : tableau honnête « constructeur en ligne (Wix) ou moi » sur la page des offres (`sur`, `titre`, `intro`, `colonnes` : deux noms, `lignes[]` : `critere`, `a`, `b`, `note`). Les tarifs du constructeur y sont datés et à relire avant l'ouverture (le vérificateur le rappelle). Panneau « Comparaison » dans la page de modification.
- `pages_metier` : une page par métier à l'adresse `/id` (`id`, `nom`, `titre`, `description`, `accroche`, `texte`, `prix`, `points`, `demo`, `demo_texte`, `bouton`, `photo`, `questions[]` : `q`, `r`, `liste`, `visible`). Chaque page a sa démonstration, ses questions (données structurées « FAQPage » pour Google) et son prix de départ ; liens dans le pied de page et sur la page des offres (sauf `liste: false`). Le vérificateur refuse une adresse déjà prise (`ADRESSES_RESERVEES` dans `rendu.js`). Seules les questions se modifient avec Claude : le reste a son panneau « Pages par métier ».
- `metiers[].lien` : adresse d'une page du site vers laquelle renvoie la carte de l'offre (ex. `/visibilite-google`). `mentions.nom_commercial` : ligne « Nom commercial » des mentions légales (le vérificateur rappelle de la comparer au registre).
- **Mesure d'audience sans cookie** (automatique, quand `MAQUETTE` vaut « non ») : le serveur compte les pages vues par jour dans **un seul enregistrement** (total, pages, provenance : moteur de recherche, autre site, adresse tapée, navigation interne), sans cookie, sans adresse IP, sans identifiant ; robots, aperçus et pages introuvables ne comptent pas ; arrêt à 800 vues par jour (la mémoire gratuite accepte 1 000 écritures par jour). Chiffres : panneau « Visites du site » ou `GET /api/audience?jours=30` (connecté). Ce sont des ordres de grandeur (deux visites simultanées peuvent n'en compter qu'une). À dire dans la confidentialité (c'est fait).
- **Sauvegarde nocturne** (cron du Worker, `triggers.crons` de `wrangler.jsonc`) : chaque nuit, copie du contenu (`sauvegarde:AAAA-MM-JJ`, 7 nuits gardées) dans la mémoire du site. Si un stockage R2 `SAUVEGARDE` est relié (lignes en commentaire de `wrangler.jsonc`), le contenu y est aussi copié (30 jours) avec les photos et vidéos, une fois chacune (30 fichiers par nuit au plus). État de la dernière nuit dans « Visites du site ». Restaurer : `npx wrangler kv key get sauvegarde:2026-11-02 --binding CONTENU --remote > c.json`, relire, puis `npx wrangler kv key put contenu --path c.json --binding CONTENU --remote`. Une copie dans la même mémoire protège d'une erreur de modification, pas de la perte de la mémoire : la copie R2 est faite pour ça (R2 demande une carte bancaire sur le compte Cloudflare, même pour l'offre gratuite : à vérifier).
- `engagements` : liste de blocs `{ titre, texte, points }` qui forme la page `/engagements` (hébergement, données personnelles, sauvegardes, délai de réponse, arrêt de l'abonnement, accès aux données). La page et son lien de menu n'existent que s'il y a au moins un bloc ; textes dans `libelles` (`nav_engagements`, `page_eng_titre`…). Ce sont des engagements que le professionnel doit pouvoir tenir : les faire valider, et relire par un juriste.

Des démonstrations à essayer vivent dans `public/demos/` : contenus imaginaires dans `exemples/`, fabriqués avec le moteur vitrine, **un gabarit différent par métier** (atelier d'ébéniste avec devis, fleuriste avec commande à retirer, plombier avec téléphone cliquable et « Dépannage ou devis » en haut, restaurant avec carte, réservation et horaires). Chacune porte le bandeau « Démonstration : … imaginaire » (`reglages.bandeau`), des photos libres étiquetées « Photo d'illustration » (`reglages.illustration`) et créditées dans `credits_photos`, et aucun prix de carte ou de tarif qui n'ait été validé. Dans le site de l'agence, leurs vignettes sont de vraies captures d'écran, sans cadre de téléphone ni d'ordinateur, avec l'étiquette « Démonstration ».

### 2.5 La démonstration
- `npm run apercu` fabrique `demonstration.html` : **un seul fichier**, sans serveur, qui s'ouvre sur le site puis « Essayer la page de modification » (n'importe quel mot de passe). On y modifie tout et le site de la démo change. Rien n'est publié.
- **Ordinateur et Android** : le fichier s'ouvre directement (Chrome). **Un iPhone n'ouvre pas un fichier HTML** : il faut un lien. `npm run apercu` prépare aussi `demo-en-ligne/` : le zipper et le déposer sur Cloudflare Pages (« Workers & Pages », « Create application », « Pages », « Drag and drop your files », faisable depuis l'iPhone). Ce lien est public pour qui l'a : uniquement pour une boutique fictive ou un client qui a signé.
- Dans la démo, chaque testeur garde ses changements dans son navigateur (une vingtaine de photos ajoutées au plus) ; une demande envoyée depuis le site n'arrive pas dans la page de modification (deux exemples tout faits). Pour tester à plusieurs avec une vraie sauvegarde : le vrai site en ligne en mode proposition.

### 2.6 Mettre en ligne : Claude Code, sur l'ordinateur de Greg
Compte gratuit sur https://dash.cloudflare.com, puis dans le dossier de la boutique :
> Installe les dépendances (`npm install`). Lance `npm test` : tout doit être « ok ». Connecte-moi à Cloudflare (`npx wrangler login`). Crée la mémoire du site (KV « CONTENU ») (`npx wrangler kv namespace create CONTENU`) et mets son id dans `wrangler.jsonc`. Lance `npm run mot-de-passe`, puis enregistre ADMIN_HASH et SESSION_SECRET avec `npx wrangler secret put`. Déploie avec `npm run deploy`. Donne-moi l'adresse du site et le mot de passe. Laisse MAQUETTE à « oui ».

- Avec MAQUETTE à « oui » : bandeau « proposition », non indexé par Google, demandes en démonstration. Bon pour faire tester à plusieurs.
- Après signature, nom de domaine acheté et ajouté dans Cloudflare :
> Dans `wrangler.jsonc`, passe MAQUETTE à « non », ajoute la route `{ "pattern": "nomdedomaine.fr", "custom_domain": true }`, puis redéploie.
- Les demandes par e-mail : clé gratuite sur https://web3forms.com (avec l'e-mail du commerçant), à coller dans la page de modification. Sans clé, les demandes arrivent quand même dans la page de modification.
- L'espace de travail cloud de Claude ne peut pas joindre Cloudflare : la mise en ligne se fait depuis l'ordinateur de Greg.

---

### 2.7 Vidéo de fond sur l'accueil (les trois moteurs)
Dans la page de modification : « Vidéo de fond » (fichier MP4 ou WebM de 20 Mo au plus, ou lien https .mp4) et la case « Vidéo en fond (sinon la photo) ». La photo reste l'image d'attente ; bouton pause intégré ; vidéo à l'arrêt pour les visiteurs qui demandent moins d'animations. Le serveur sert les vidéos par morceaux (indispensable pour Safari). Une vidéo d'iPhone (.mov) se convertit avant : `ffmpeg -i entree.mov -t 15 -vf "scale=-2:1080" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart sortie.mp4`. Sans vidéo du client, un lent mouvement sur une de ses photos fait illusion (exemple : `modeles/maison-tcheskiss/public/assets/videos/`).

### 2.8 Mise en ligne depuis GitHub, sans ordinateur (moteur agence)
Cloudflare « Import a repository » sur le dépôt privé du client (nom du projet = `name` de `wrangler.jsonc`), la mémoire du site (KV) se crée toute seule (binding sans id). Puis deux **Secrets** (pas « Variable ») : `ADMIN_HASH` et `SESSION_SECRET`, donnés par `npm run mot-de-passe`. Jamais d'identifiant écrit dans le dépôt. Chaque envoi sur GitHub remet le site en ligne.

### 2.8 bis Photos libres : choisir, vérifier, réduire
1. **Tester d'abord l'accès** : `images.unsplash.com` et `images.pexels.com` (une vraie photo, pas la page d'accueil). Les pages de recherche (`unsplash.com`, `pexels.com`) sont, elles, bloquées par une protection anti-robot. Si un hôte d'images est bloqué, **s'arrêter et le dire à Greg, sans contourner** (pas de proxy, pas de miroir).
2. Les identifiants de photos se trouvent par la recherche web ou WebFetch sur les pages Unsplash (la page d'une photo donne `images.unsplash.com/photo-…`, le photographe et la licence). Écarter les photos « Unsplash+ » (payantes).
3. **Regarder chaque photo téléchargée** avant de la garder (un résultat de recherche peut montrer autre chose que sa description : un salon de narguilé pour un « restaurant », par exemple) et noter photographe et identifiant dans un fichier de sources.
4. Réduire à 1200 px de large, JPEG qualité 78, sans métadonnées (`convert … -strip -resize '1200x>' -quality 78`), vérifier l'absence de GPS. Étiqueter « Photo d'illustration », créditer dans `credits_photos`, ne jamais présenter la photo comme celle d'un vrai client.

### 2.8 ter Audit d'accessibilité (avant de montrer un site)
`npm run accessibilite` (axe-core par Playwright, WCAG 2.2 AA) : chaque page en bureau (1280 px), en mobile (390 px) et avec « moins d'animations », puis un parcours au clavier qui vérifie qu'un anneau de focus épais s'affiche sur chaque élément. Corriger tout ce qui est signalé (contrastes, focus, zones sans repère de page, défilement horizontal, éléments restés cachés quand le visiteur demande moins d'animations). Un audit automatique ne remplace pas un essai au lecteur d'écran et au clavier sur téléphone.

### 2.8 quater Avis de cinq testeurs (sous-agents Haiku, très économes)
Avant de livrer une refonte ou un nouveau style : cinq sous-agents Haiku, **chacun avec un profil différent** (par exemple une fleuriste de 62 ans peu à l'aise avec le web, un plombier pressé, une gérante de restaurant, un artisan d'art exigeant, un dirigeant de PME méfiant). Chacun reçoit quelques captures réduites (page d'accueil, une démonstration de son métier, la page qui le concerne) et une seule question : *qu'est-ce qui me ferait aimer ce site et acheter, qu'est-ce qui me freine ?* Réponse limitée à 120 mots, au même format (J'aime / Ça me freine / Il me faudrait / note sur 10). On fait la synthèse : un point cité par plusieurs profils se corrige ; un point qui ne dépend pas de nous (vrais clients à montrer, prix à valider) va dans « à valider ». Ce sont des avis simulés : ils orientent, ils ne remplacent pas un vrai client.

### 2.9 Typographie et mouvement (niveau « pro »)
Titres de page autour de 56 px au plus sur ordinateur, titres de section 36 à 40 px, texte 16 à 17 px, petites lignes de rubrique à 13 px. Mouvements : apparitions douces au défilement (0,9 s, décalées de 70 ms), chiffres qui montent, en-tête qui s'affine au défilement, soulignés qui se dessinent au survol. Jamais dans l'aperçu de la page de modification, jamais pour les visiteurs qui demandent moins d'animations, et rien ne reste caché si le script ne tourne pas.

Doser selon le site : le moteur « agence » a le jeu complet. Le catalogue (joaillerie) et la vitrine (commerce de quartier) n'en gardent que l'essentiel, pour ne pas paraître chargés : texte de l'accueil qui arrive, apparitions plus courtes (16 px, 1 s, trois décalages au plus), ombre légère sous l'en-tête au défilement (catalogue), menu du téléphone en fondu. Pas de chiffres animés, pas de zoom sur les photos, pas d'en-tête qui change de taille (sur un en-tête collant, le contenu sauterait). Titres : accueil autour de 52 à 58 px sur ordinateur, sections 32 à 34 px, texte 16 à 17 px ; titres de la vitrine en graisse 500 plutôt que 600. Le même interrupteur partout : option `calme` dans l'aperçu de la page de modification (classe `calme` sur body), et rien pour les visiteurs qui demandent moins d'animations.

### 2.10 Stockage en juridiction UE (à tester sur le compte Cloudflare de Greg)
Le Wrangler installé (4.149) accepte `npx wrangler kv namespace create <nom> --jurisdiction=eu` (aide de la commande, vérifiée le 28/10/2026). Le journal de Cloudflare du 02/10/2026 annonce la disponibilité générale ; les pages de référence de Cloudflare disent encore « bêta privée » : **les deux sources se contredisent, et je n'ai pas pu lire les pages depuis l'espace cloud de Claude** (voir partie 4). Ce que cela garantit : le **stockage** durable reste dans l'UE ; les Workers tournent partout et un cache peut exister hors UE. Le choix se fait à la création et ne se change pas.
Test à faire (5 minutes) : `npx wrangler kv namespace create TEST-UE --jurisdiction=eu`. Résultat attendu : un identifiant. Si une erreur parle de bêta, d'accès ou d'offre, noter le message ici et rester sur le stockage par défaut. Si ça marche : créer le vrai stockage avec `--jurisdiction=eu`, mettre son `id` dans `wrangler.jsonc` à la place du stockage créé tout seul (une copie de l'ancien contenu se fait avec `kv key get` puis `kv key put`), supprimer le stockage d'essai, et seulement alors écrire « données stockées dans l'Union européenne » dans les engagements et la confidentialité. **Résultat du test : pas encore fait.**

## 3. Règles d'or

### Toujours
- **Ne rien inventer** : aucun prix, horaire, avis, citation, date, label, producteur, service, chiffre ou anecdote absent des éléments fournis. Ce qu'on ne sait pas reste vide et va dans la liste « à valider ». Deux sources se contredisent : la fiche Google gagne, la contradiction va dans « à valider ».
- **Marquer ce qui est provisoire** : photos d'essai (créditées), pièces d'exemple (marquées « exemple à remplacer »), textes légaux (brouillons).
- **Photos du commerçant** : réduites (1200 px de large au plus, JPEG qualité ~78) et **réenregistrées sans métadonnées** : les photos de téléphone contiennent la position GPS.
- **Domaine au nom du client.** Prix toujours recalculés par le serveur (jamais celui envoyé par le navigateur).
- **Respecter un refus** de prospection et ne plus recontacter. Par e-mail, la prospection entre professionnels est permise si le message concerne leur activité et propose de ne plus être contacté.
- **Vérifier avant de livrer** : `npm run verifier` sans erreur, `npm test` tout « ok », démo ouverte et essayée sur téléphone.

- **Un site, une identité** : deux sites montrés ou livrés ne se ressemblent pas. Couleur, polices, mise en page (accueil, ordre des parties), formes (angles, boutons) et ton changent d'un site à l'autre. Test : deux captures côte à côte, réduites ; si l'on hésite sur laquelle est laquelle, on recommence. Avant de créer, relire le registre ci-dessous et la ligne « Style » du vérificateur, puis choisir un autre jeu.
- **L'interface suit le métier** : le style traduit ce que fait l'entreprise et à qui elle parle. Commerce de bouche : empattements chaleureux, couleur de la devanture. Artisan : empattements carrés, teintes de matière (bois, cuir), angles droits. Commerce de service moderne : une seule famille nette. Bâtiment, haut de gamme : sombre, didone, sobre. Création, conseil, numérique : grotesque, papier clair, une couleur vive. Un style choisi parce qu'il est déjà fait ne passe pas.
- **Registre des styles** (à compléter à chaque site) : Fromagerie La Fontaine = vitrine standard, bleu ardoise, Vollkorn, angles doux, accueil photo · Maison Tcheskiss = catalogue, noir et blanc cassé, Bodoni + Hanken · Opéria = agence classique, marine #262a59 et jaune #f8c151, Playfair + Manrope · Grégoire Muel = agence édition, encre #101216 et bleu de travail #1f48b8 sur papier #f6f6f2, Besley + Schibsted Grotesk, angles droits, filets, volets, bande d'encre pour les offres (l'ancien look « studio », vermillon #ff5a36 et Bricolage + DM Sans, reste disponible au moteur mais n'est plus utilisé par aucun site) · démo Atelier du Merrain = vitrine gabarit atelier, brun noyer #6b4a2e sur gris pierre, Zilla Slab + Work Sans, angles droits, index numéroté · démo Le Pétale Sauvage = vitrine gabarit marche, vert #2f5d50, Fraunces + Nunito Sans, mosaïque en arche, saisons en cartes · démo Plomberie Delorme = vitrine gabarit depannage, vert d'eau profond #0b6b7a et jaune #ffcf33, Barlow Condensed + Barlow, appel et devis en tête · démo La Cuillère Haute = vitrine gabarit carte, bordeaux #7a1f2b, Young Serif + Figtree, en-tête centré et carte à deux colonnes. Un nouveau look qui manque au moteur (troisième gabarit agence, par exemple) s'ajoute au moteur, jamais par un contenu bricolé.

### Jamais
- **Jamais de jargon technique dans les textes que lit le client** : les mots « espace de modification », « espace boutique », « stockage » et « KV » se disent « page de modification » et « mémoire du site ».
- **Jamais de lien public au nom d'un commerce qui n'a pas signé** : montrer les fichiers sur le téléphone, ou deux captures par e-mail.
- **Jamais les photos ou le texte des avis Google** : la note s'affiche en chiffres, avec un lien vers la fiche.
- **Jamais une photo de banque d'images présentée comme une pièce ou un produit du commerce** (ex. un bijou d'Unsplash sur la fiche d'une bague de la maison). Pour patienter : des photos d'ambiance (pierres, matières, paysages), créditées.
- **Jamais Wix, Squarespace ou un constructeur** quand le client veut un vrai site indépendant : le moteur fait mieux, gratuit, et le client garde tout.
- **Jamais le logo, les textes, les photos ou le code d'un site de référence** (sauf refonte du propre site du commerçant).
- **Jamais de mots qui font « site IA »** : Bienvenue, Découvrez, N'hésitez pas, au cœur de, véritable, incontournable, passion, savoir-faire unique, sublimer, écrin, expérience, univers, authentique, de qualité, un large choix, En savoir plus, niché, havre, pépite, voyage gustatif, savoureux mélange, d'exception, excellence, intemporel. Ni violet, ni « fond crème et terracotta », ni dégradés, ni capitales espacées. Le vérificateur les refuse.
- **Jamais de conseil juridique présenté comme sûr** : CGV, mentions légales et confidentialité sont des bases à faire relire. Le médiateur de la consommation est obligatoire pour vendre à des particuliers. Les rétractations ne s'appliquent pas aux pièces personnalisées (article L221-28 du Code de la consommation).

---

## 4. Pièges déjà rencontrés, et la parade

| Ce qu'on voit | Pourquoi | La parade (déjà dans les moteurs) |
|---|---|---|
| Dans l'app Claude, un bouton ou la connexion de la démo ne fait rien | L'aperçu de l'app bloque les formulaires et la mémoire du navigateur | Boutons « type=button » avec un clic, mémoire de secours ; aucun `<form>` envoyé |
| Une démo garde 2 ou 3 photos puis « oublie » après rechargement, tout en disant « Enregistré » | La mémoire du navigateur est limitée à ~5 Mo et les photos de base y étaient recopiées | Les photos déjà dans le fichier ne sont plus recopiées ; message clair si la mémoire est pleine, ou bloquée (aperçu de l'app Claude : rien n'est gardé après fermeture) |
| Une démonstration « fait IA » malgré des photos réelles | Mise en page de gabarit : photos en arche, rond et carré, collages décalés, pastilles, tuiles lettrées, cadres inclinés ; un client juge un site à sa ressemblance avec ceux qu'il connaît (photo pleine largeur, titre lisible, un appel clair) | Les gabarits atelier, dépannage et marché ont une grande photo en tête (atelier : photo pleine largeur sous un dégradé ; dépannage : photo qui touche le bord droit ; marché : bandeau photo) et des angles presque droits ; jamais de collage ni de forme décorative |
| Une règle de gabarit ne s'applique pas (position, marge) | Une règle plus précise plus haut (`.g-atelier figure{position:relative}`) l'emporte sur `.a-hero-fig` même écrite plus bas | Préfixer par le gabarit (`.g-atelier .a-hero-fig`) ; vérifier le style calculé dans le navigateur, pas seulement la capture |
| Une vignette coupe un titre en deux | Capture à hauteur fixe | `outils/vignettes.mjs` coupe à la fin du dernier bloc entier visible et complète avec la couleur de fond de la page |
| Une démo affiche le contenu ou les photos d'une autre démo | Tous les fichiers ouverts depuis l'ordinateur partagent la même mémoire du navigateur, et effacer les données de navigation ne la vide pas toujours | Chaque démo range ses essais sous une clé propre au site et à sa version ; bouton « Remettre la démonstration à zéro » sur l'écran de connexion de la démo |
| Une vidéo MP4 ne se lit pas dans les tests automatiques | Le Chromium de test n'a pas le décodeur H.264 (Chrome, Safari, Brave l'ont) | Tester la lecture avec un fichier WebM ; le site masque le bouton pause si la vidéo ne se lit pas et garde la photo |
| Le fichier HTML ne s'ouvre pas sur iPhone | iOS n'ouvre pas les fichiers HTML locaux dans un navigateur | Un lien : `demo-en-ligne/` sur Cloudflare Pages (ou Tiiny Host : en gratuit, 7 jours et 3 Mo selon un comparatif de 2026) |
| Sur ordinateur, une photo verticale rend un bloc deux fois trop haut | L'image impose sa hauteur | Hauteur plafonnée (`max-height: min(85vh, 760px)`) |
| Le titre de l'accueil passe sur le sujet de la photo | La photo est centrée, le titre est en bas à gauche | Recadrer la photo pour mettre le sujet dans le tiers haut |
| Photos de téléphone avec position GPS | Métadonnées EXIF | Réenregistrer avec sharp (sans `withMetadata`) |
| Photos Unsplash absentes sur les captures faites par Claude, ou téléchargement impossible | Selon la session, l'espace cloud de Claude bloque `images.unsplash.com` ou `images.pexels.com` (les pages de recherche, elles, sont bloquées par une protection anti-robot) | **Tester les deux hôtes d'images avant tout** (partie 2.8 bis). S'ils répondent : choisir par recherche web, télécharger, regarder, réduire. S'ils sont bloqués : s'arrêter et le dire à Greg, sans contourner |
| La démo casse après réunion des scripts | Deux noms identiques au premier niveau dans deux fichiers | Noms distincts ; `apercu` refuse en nommant le doublon |
| Le vérificateur cachait des erreurs | Il s'arrêtait trop tôt | Il ne s'arrête que si la forme est cassée ; sinon il liste tout |
| Captures « page entière » avec des images blanches | Chromium ne peint pas les images décodées en asynchrone hors écran | Capturer en faisant défiler l'écran |
| Mise en ligne impossible depuis l'espace cloud de Claude | Cloudflare n'est pas joignable de là | Mise en ligne depuis l'ordinateur, avec Claude Code |
| Le site du client ne se télécharge pas depuis l'espace cloud de Claude (photos, logo) | Seuls les registres de paquets et GitHub sont joignables | Greg joint le logo et les photos ; WebFetch lit les textes ; Unsplash : WebFetch d'une page de recherche donne les adresses des photos |
| Logo reçu en JPEG sur fond blanc | Pas de fichier vectoriel | Détourage automatique (sharp) en PNG transparent + version blanche pour les fonds foncés ; demander un SVG pour la version finale |
| Grille « à la une » avec une case vide | Nombre de projets qui ne remplit pas la grille | Le moteur agence prend 6 projets (un grand et cinq) ou 3 |
| Dans la démo ou l'aperçu, un clic sur le menu (#produits, #horaires…) n'affiche pas la rubrique, le cadre recharge toute la démo | La page est affichée dans un cadre « srcdoc » : le navigateur comprend « #produits » comme une adresse de la page de démo | Les trois moteurs font défiler eux-mêmes jusqu'à la rubrique quand la page est dans un aperçu (`location.protocol === 'about:'`). Tester chaque lien du menu dans la démo, sur téléphone et ordinateur |
| Lien vers `/demos/x.html` : redirection 307 | Cloudflare sert les fichiers .html sans l'extension | Écrire `/demos/x` |
| Dans l'aperçu, un lien vers une démonstration affiche « Page introuvable » | L'aperçu transforme tout lien commençant par « / » en page du site | Les liens de réalisation portent `data-ouvrir` et s'ouvrent dans un nouvel onglet (marche en ligne ; pas dans le fichier de démonstration seul) |
| Une démo fabriquée à partir du moteur a le texte centré et le contenu décalé | Un remplacement de texte (bandeau « Site d'exemple ») a avalé la balise fermante `</div>` : le bandeau englobe toute la page | Remplacer seulement jusqu'au prochain `<` (`[^<]*`), jamais jusqu'à une apostrophe ou un guillemet ; recompter les balises ou regarder la capture |
| Capture « page entière » d'une démo : bloc étroit et texte centré | La démo affiche le site dans un cadre ; la page entière est faussée par le cadre | Capturer la fenêtre, et faire défiler le cadre (`frame.evaluate(scrollTo)`) |
| Le moteur catalogue ne convient pas à une boutique de fleurs ou de meubles | Ses champs sont ceux d'un bijou : métal, pierres, poids, tailles, gravure, page entretien | Ne pas le proposer tel quel hors joaillerie ; pour un autre commerce, le moteur vitrine (commande ou devis), ou adapter d'abord le moteur catalogue. Pas de démo catalogue non bijoutière : la démo viendra du site de la joaillerie de Greg |
| Deux sites du même moteur se ressemblent (même structure, mêmes polices, couleurs voisines) | Le contenu change mais pas le gabarit | Règle « Un site, une identité » (partie 3) : choisir un autre gabarit, jeu de polices et palette ; `theme.gabarit` pour le moteur agence ; ligne « Style » du vérificateur pour le moteur vitrine |
| Une démonstration qui ressemble à un « site IA » : même structure, mêmes cartes, pas de photo | Un seul gabarit pour plusieurs métiers, et des photos absentes | Un gabarit par métier (`theme.gabarit`), de vraies photos libres étiquetées « Photo d'illustration », avis des cinq testeurs (partie 2.8 quater) avant de livrer |
| Les cinq testeurs trouvent que le bandeau « Version de travail non publiée » fait brouillon | C'est le bandeau de la maquette, laissé à `MAQUETTE = oui` | Normal tant que le site n'est pas ouvert ; pour une démonstration, `reglages.bandeau` écrit « Démonstration : … imaginaire » |
| axe-core signale des contrastes insuffisants qui disparaissent avec « moins d'animations » | La mesure se fait pendant une apparition en fondu | Forcer l'état final (classe `vu`) et attendre la fin des transitions avant de mesurer (`npm run accessibilite` le fait) |
| Anneau de focus invisible | Un trait de la couleur d'accent sur fond clair (2,8 : 1) ou de la couleur du thème sur fond sombre | Anneau foncé avec liseré blanc sur fond clair, blanc sur fond sombre ou sur photo, foncé sur une boîte claire posée dans une partie sombre |
| Après le premier enregistrement depuis la page de modification, les formules d'abonnement et les libellés ont disparu | Le serveur ne recopiait que ses clés connues et jetait les clés facultatives (`abonnements`, `libelles`) ; un test écrit pour l'occasion a échoué avant la correction | `OBJETS_FACULTATIFS` et `LISTES_FACULTATIVES` dans `src/worker.js` : une clé facultative absente de l'envoi est gardée telle quelle. **Toute nouvelle clé du contenu s'ajoute à ces listes**, avec un test « conservée après enregistrement » |
| Un test réussissait grâce au bug (libellé « Surface » au lieu de « Type de site ») | Le contenu enregistré avait perdu ses libellés, le test attendait la valeur par défaut | Le test lit le libellé du contenu (`libellesDemande`) ; un test qui dépend d'un défaut doit le dire |
| Un lien « données stockées dans l'UE » promis alors que le stockage ne l'est pas | La commande `--jurisdiction=eu` existe mais la disponibilité sur l'offre gratuite n'est pas confirmée | Partie 2.10 : tester d'abord, écrire ensuite |
| Un site d'agence « fait par une IA » : même gabarit que tous, étiquettes en capitales espacées avec pastille, cartes arrondies identiques, boutons en pastille, orange vif, collage de quatre captures, coches partout | Un avis extérieur (directeur artistique, détecteur de look IA, commerçant) l'a relevé ; ces signes étaient dans le gabarit « studio » lui-même et dans notre propre liste « site IA » (capitales espacées) | Gabarit `edition` ; règle : un seul bleu, angles droits, filets plutôt que cartes, pas de pastille, pas d'icône de coche, pas d'ombre, pas plus de trois fonds de couleur par page ; faire juger les captures par trois regards (partie 2.8 quater) avant de livrer |
| Sur téléphone, le titre passe sous l'image de l'accueil, ou une page déborde de quelques pixels | Une grille CSS place les éléments dans l'ordre du code, et un texte « sans retour à la ligne » (flèche d'un lien) dépasse sa colonne | `order` explicite sur téléphone ; `white-space:normal` dans les colonnes étroites ; contrôle `debord.mjs` (éléments dont le bord droit dépasse la fenêtre) à 320, 360, 390, 430 et 768 px |
| L'anneau de focus du clavier est invisible sur l'accueil d'un gabarit à fond clair | La règle générale met un contour blanc sur tout ce qui est dans `.hero` (prévu pour une photo sombre) | Contour foncé dans l'accueil clair des gabarits `studio` et `edition` |
| GLM rend un JSON avec une clé en trop ou un guillemet | Écart au squelette | Recoller les lignes « ERREUR » : « corrige uniquement ces points » |

---

## 5. Listes de contrôle

### Avant de montrer une maquette
- [ ] `npm run verifier` : aucune erreur ; la liste « à valider » est prête pour le rendez-vous.
- [ ] `npm test` : tout « ok ».
- [ ] `npm run accessibilite` : aucun point (partie 2.8 ter).
- [ ] Avis des cinq testeurs faits et synthétisés (partie 2.8 quater).
- [ ] Démo ouverte sur téléphone : accueil, appel, itinéraire, une demande d'essai, la page de modification (changer un prix, enregistrer, revoir le site).
- [ ] Bandeau « Proposition », rien en ligne au nom du commerce.
- [ ] Photos d'essai créditées ; aucune photo Google ; aucun bijou ou produit d'une banque d'images présenté comme le sien.

### Avant la mise en ligne (après signature)
- [ ] Vraies photos, vrais prix, textes validés ; pièces ou produits d'exemple supprimés ; crédit des photos d'essai vidé.
- [ ] Logo définitif (SVG ou PNG transparent), coordonnées, réseaux.
- [ ] Mentions légales complètes (raison sociale, forme et capital, SIRET, adresse, directeur de la publication, médiateur si vente aux particuliers).
- [ ] CGV relues (idéalement par un juriste).
- [ ] Clé Web3Forms et demande d'essai reçue par e-mail.
- [ ] Nom de domaine au nom du client, MAQUETTE à « non », route ajoutée, redéployé.
- [ ] Testé sur téléphone en vrai : appel, itinéraire, page de modification, interrupteurs, demande.
- [ ] Site ajouté sur la fiche Google ; Google Search Console (le plan du site `/sitemap.xml` se crée tout seul).

### Prise en main avec le commerçant (15 minutes, sur son téléphone)
Se connecter, changer un horaire, mettre un message d'annonce, ajouter un produit avec photo, masquer puis réafficher une partie, regarder les demandes. Ajouter la page de modification à l'écran d'accueil (« Ajouter à l'écran d'accueil »).

### Entretien
- Sauvegarde du contenu : une copie est faite chaque nuit (partie 2.4 bis) ; copie à la main : `npx wrangler kv key get contenu --binding CONTENU --remote > sauvegarde.json`. Vérifier une fois par mois, dans le panneau « Visites du site », que la dernière copie date de la nuit passée.
- Changer le mot de passe : `npm run mot-de-passe`, puis `npx wrangler secret put ADMIN_HASH`.
- Sécurité intégrée : 8 mauvais mots de passe bloquent 15 minutes ; demandes limitées par appareil ; demandes gardées 180 jours.
- Abonnement facultatif : ce que couvrent les formules (Sérénité, Croissance), à écrire noir sur blanc dans le devis ; proposition : hébergement et domaine, sauvegardes, petites modifications que le client ne fait pas lui-même.

---

## 6. Les commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm install` | Installe les outils (une fois par dossier). |
| `npm run verifier` | Contrôle le contenu : forme exacte, couleurs lisibles, photos, horaires, liens, mots « site IA », numéros, rendu réel de chaque page. Affiche la ligne « Style » et ce qui reste à faire avant l'ouverture. |
| `npm test` | Lance le vrai serveur sur l'ordinateur et le teste de bout en bout (pages, images, connexion, enregistrement, photo, demande d'un client, statuts, retour en arrière, sécurité). |
| `npm run apercu` | Fabrique `demonstration.html` et `demo-en-ligne/`. |
| `npm run nouvelle-boutique -- contenu.json [nom]` | (Vitrine) Crée le dossier d'une nouvelle boutique à côté du modèle. |
| `npm run accessibilite` | Audit axe-core (WCAG 2.2 AA) en bureau, mobile et « moins d'animations », et parcours au clavier. Demande Playwright. |
| `npm run mot-de-passe` | Crée le mot de passe de la page de modification et son empreinte. |
| `node outils/fabrique-maquette.mjs preparer …` / `construire …` | (Racine du kit) Fabrique de maquettes en 1 heure : partie 2.2 bis. |
| `npm run deploy` | Vérifie le contenu puis met en ligne. |
| `npm run dev` | Le site sur l'ordinateur, pour essayer en vrai (adresse locale). |

---

## 7. Travailler avec les IA

- **GLM** (chat.z.ai) : très bien pour le contenu du moteur vitrine (prompt 1, puis 2 au besoin). Il ne fabrique pas le site : son `contenu.json` passe ensuite dans Claude Code.
- **Claude, dans l'app** : joindre `kit-sites-boutiques.zip` (ou le dépôt GitHub du kit) et dire « Suis la méthode du kit pour [boutique] ». Avec le skill « sites-boutiques » installé, il la suit tout seul.
- **Claude Code**, sur l'ordinateur : ouvrir le dossier du kit ; `CLAUDE.md` est lu automatiquement.
- **Économiser** : les petites tâches (reformuler, trier, relire) vont aux modèles les moins chers ; GLM pour les contenus ; Claude pour fabriquer, tester et corriger.
- **Quelqu'un d'autre** : lui donner le kit sans les dossiers de clients (voir `LISEZMOI.md`).

---

## 8. Faire vivre ce kit

- Une nouvelle leçon (un bug, un piège, une meilleure tournure) : l'ajouter à la partie 4 ou 3, changer la version en haut, refaire le zip (ou pousser sur le dépôt).
- Un moteur corrigé : corriger d'abord le modèle (`modeles/…`), relancer `npm run verifier` et `npm test`, puis reporter dans les boutiques déjà en ligne (même correction, redéploiement).
- Les prompts se mettent à jour dans `prompts/`. Le prompt 1 est lié au squelette du moteur vitrine : si la forme du contenu change, il change aussi.

---

## 9. Prix : repères du marché (octobre 2026)

À relire et à rechercher de nouveau avant de changer les prix : ces chiffres bougent et viennent en partie de sites qui vendent eux-mêmes des sites.
- **Création d'un site d'artisan ou de commerce, en France** : freelance débutant 800 à 2 500 €, freelance expérimenté 2 500 à 5 000 €, agence 3 000 à 15 000 € (Seedweb, repris par SK Web). Offres d'entrée de concurrents : un site « essentiel » dès 690 € puis 22 € par mois (SK Web) ; Wix : 16,80 à 30 € par mois, sans création.
- **Maintenance** : basique 200 à 800 € par an (soit 17 à 67 € par mois), complète 800 à 2 500 € par an ; contrats professionnels d'entrée 50 à 120 € par mois (Kolonell, qui les vend). Domaine .fr : 8 à 15 € par an.
- **Boutique en ligne** : aucun tarif fiable trouvé en ligne en octobre 2026 ; les fourchettes habituelles (1 500 à 4 000 € pour un petit catalogue) sont une estimation, à vérifier.
- **Constructeur en ligne (relevé du 28/10/2026, sources tierces, le site officiel de Wix n'étant pas joignable depuis l'espace cloud de Claude)** : forfait Light 16,80 € par mois et Essentiel 30 € par mois, TTC, en abonnement annuel (La Fabrique du Net, grille 2026). Sur 3 ans : environ 605 € (Light) à 1 080 € (Essentiel), à comparer aux 590 € une fois du site vitrine de Greg plus environ 30 € de domaine. À relire sur wix.com avant toute affirmation publique ; l'écart ne compte ni le temps du client ni celui de Greg.
- **Gestion d'une fiche Google** : CCI des Landes 50 € HT par mois (150 € HT en premium), agences de 150 à 800 € par mois pour du référencement local d'artisan (sources dans `docs/PLAN-ENTREPRISE.md` du site de Greg). La Visibilité Google à 39 € par mois se place sous l'offre de la CCI.
- **Offre actuelle de Greg (28/10/2026)** : site vitrine 590 € une fois (sous la fourchette des débutants : bon pour les premiers clients, à relever ensuite), boutique dès 1 290 €, entreprise dès 1 900 € ; abonnement facultatif Sérénité 19 € (30 minutes de modifications), Croissance 49 € (1 heure de modifications, chiffres des visites, conseils trimestriels : alléger à une heure et sortir la fiche Google rend l'heure rentable : environ 36 € net pour une heure, environ 29 € net de l'heure avec un quart d'heure de suivi, contre 18 € auparavant) et Visibilité Google 39 € (environ une heure par mois : environ 29 € net de l'heure), tous sans engagement de durée. Tout cela reste à valider par Greg et à confirmer par de vrais clients.
