# Méthode « sites boutiques »

Version 1, 13 octobre 2026. Grégoire Muel.

Toute la méthode pour créer, montrer, vendre, mettre en ligne et entretenir les sites des commerces : les étapes, les règles, les pièges déjà rencontrés et leur parade, les listes de contrôle. Elle sert à Greg, à Claude (Claude Code ou l'app), à GLM et à toute personne à qui on confie le travail.

---

## 0. En une minute

- **L'offre** : un site rapide, à leur nom, avec un **espace boutique**, une page privée où le commerçant change lui-même ses horaires, prix, photos et textes, affiche ou masque chaque partie, et reçoit les demandes de ses clients. Maquette gratuite en 48 h, puis 590 € photos comprises et 29 € par mois (hébergement et mises à jour). Ces prix sont des recommandations de départ, pas des tarifs du marché.
- **Deux moteurs, déjà testés**, dans `modeles/` :
  - **Vitrine** (`modeles/fromagerie-la-fontaine`) : une page pour un commerce de quartier (accueil, la boutique, produits, offres, demande en ligne, presse et note Google, questions, horaires, accès). Des variantes combinables (accueil sur grande photo, partagé ou sobre ; titres ; angles ; offres ; ordre des parties) et trois jeux de polices, pour que deux boutiques voisines ne se ressemblent pas.
  - **Catalogue** (`modeles/maison-tcheskiss`) : un site de plusieurs pages pour une maison qui vend des pièces (accueil, collections, catalogue avec filtres, une page par pièce, panier, pages d'information, mentions légales). Le panier envoie une **demande de commande**, sans paiement en ligne : la maison rappelle, encaisse et expédie. Stripe pourra s'ajouter plus tard.
- **L'IA n'écrit jamais de code** pour un nouveau site. Elle remplit un seul fichier de contenu (`contenu.json`) à partir d'un squelette fixe. Le moteur, l'espace boutique et le serveur restent les mêmes partout.
- **Hébergement** : Cloudflare Workers, offre gratuite (le site, l'espace boutique et le stockage). Seul le nom de domaine se paie, au nom du client.

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
10. **Mettre en ligne** (partie 2.6), donner le mot de passe de l'espace boutique, prise en main de 15 minutes, lien du site ajouté sur la fiche Google.
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

### 2.3 Construire et tester : Claude Code (ou Claude avec ce kit)
Dans le dossier `modeles/fromagerie-la-fontaine` :
> Lance `npm install`, puis `npm run nouvelle-boutique -- ../contenu.json`. S'il y a des lignes « ERREUR », montre-les-moi telles quelles. Sinon, va dans le nouveau dossier créé à côté, lance `npm install`, `npm run apercu` et `npm test`, et donne-moi le fichier demonstration.html.

- S'il y a des erreurs : les recoller à l'IA (« corrige uniquement ces points et renvoie le contenu.json complet »), puis recommencer.
- Le modèle n'est jamais modifié : `nouvelle-boutique` crée un dossier à côté, avec le même moteur et le nouveau contenu.

### 2.4 Le moteur catalogue (boutique qui vend des pièces)
Il n'a pas encore de prompt pour GLM : le contenu se prépare avec Claude.
> Pars de `modeles/maison-tcheskiss`. Copie-le dans un nouveau dossier au nom de la boutique, puis réécris `contenu-initial.json` pour [boutique] avec mes notes et mes photos jointes, en gardant exactement la même forme. Mets mes photos dans `public/assets/photos/` (1200 px de large au plus, sans données GPS). Lance `npm run verifier`, `npm test` et `npm run apercu`, puis donne-moi la démonstration.

Ce qui se règle dans ce contenu : nom, logo (SVG ou PNG transparent), couleurs du thème (fond, encre, gris, trait), collections avec leur couleur, types de pièces, pièces (photos, photo portée, prix ou « prix sur demande », tailles, gravure, vendue, masquée, exemple), pages (atelier, la maison, entretien, guide des tailles, commande et livraison, conditions de vente), réglages des demandes, mentions légales.

### 2.5 La démonstration
- `npm run apercu` fabrique `demonstration.html` : **un seul fichier**, sans serveur, qui s'ouvre sur le site puis « Essayer l'espace boutique » (n'importe quel mot de passe). On y modifie tout et le site de la démo change. Rien n'est publié.
- **Ordinateur et Android** : le fichier s'ouvre directement (Chrome). **Un iPhone n'ouvre pas un fichier HTML** : il faut un lien. `npm run apercu` prépare aussi `demo-en-ligne/` : le zipper et le déposer sur Cloudflare Pages (« Workers & Pages », « Create application », « Pages », « Drag and drop your files », faisable depuis l'iPhone). Ce lien est public pour qui l'a : uniquement pour une boutique fictive ou un client qui a signé.
- Dans la démo, chaque testeur garde ses changements dans son navigateur (une vingtaine de photos ajoutées au plus) ; une demande envoyée depuis le site n'arrive pas dans l'espace boutique (deux exemples tout faits). Pour tester à plusieurs avec une vraie sauvegarde : le vrai site en ligne en mode proposition.

### 2.6 Mettre en ligne : Claude Code, sur l'ordinateur de Greg
Compte gratuit sur https://dash.cloudflare.com, puis dans le dossier de la boutique :
> Installe les dépendances (`npm install`). Lance `npm test` : tout doit être « ok ». Connecte-moi à Cloudflare (`npx wrangler login`). Crée le stockage KV « CONTENU » (`npx wrangler kv namespace create CONTENU`) et mets son id dans `wrangler.jsonc`. Lance `npm run mot-de-passe`, puis enregistre ADMIN_HASH et SESSION_SECRET avec `npx wrangler secret put`. Déploie avec `npm run deploy`. Donne-moi l'adresse du site et le mot de passe. Laisse MAQUETTE à « oui ».

- Avec MAQUETTE à « oui » : bandeau « proposition », non indexé par Google, demandes en démonstration. Bon pour faire tester à plusieurs.
- Après signature, nom de domaine acheté et ajouté dans Cloudflare :
> Dans `wrangler.jsonc`, passe MAQUETTE à « non », ajoute la route `{ "pattern": "nomdedomaine.fr", "custom_domain": true }`, puis redéploie.
- Les demandes par e-mail : clé gratuite sur https://web3forms.com (avec l'e-mail du commerçant), à coller dans l'espace boutique. Sans clé, les demandes arrivent quand même dans l'espace boutique.
- L'espace de travail cloud de Claude ne peut pas joindre Cloudflare : la mise en ligne se fait depuis l'ordinateur de Greg.

---

## 3. Règles d'or

### Toujours
- **Ne rien inventer** : aucun prix, horaire, avis, citation, date, label, producteur, service, chiffre ou anecdote absent des éléments fournis. Ce qu'on ne sait pas reste vide et va dans la liste « à valider ». Deux sources se contredisent : la fiche Google gagne, la contradiction va dans « à valider ».
- **Marquer ce qui est provisoire** : photos d'essai (créditées), pièces d'exemple (marquées « exemple à remplacer »), textes légaux (brouillons).
- **Photos du commerçant** : réduites (1200 px de large au plus, JPEG qualité ~78) et **réenregistrées sans métadonnées** : les photos de téléphone contiennent la position GPS.
- **Domaine au nom du client.** Prix toujours recalculés par le serveur (jamais celui envoyé par le navigateur).
- **Respecter un refus** de prospection et ne plus recontacter. Par e-mail, la prospection entre professionnels est permise si le message concerne leur activité et propose de ne plus être contacté.
- **Vérifier avant de livrer** : `npm run verifier` sans erreur, `npm test` tout « ok », démo ouverte et essayée sur téléphone.

### Jamais
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
| Le fichier HTML ne s'ouvre pas sur iPhone | iOS n'ouvre pas les fichiers HTML locaux dans un navigateur | Un lien : `demo-en-ligne/` sur Cloudflare Pages (ou Tiiny Host : en gratuit, 7 jours et 3 Mo selon un comparatif de 2026) |
| Sur ordinateur, une photo verticale rend un bloc deux fois trop haut | L'image impose sa hauteur | Hauteur plafonnée (`max-height: min(85vh, 760px)`) |
| Le titre de l'accueil passe sur le sujet de la photo | La photo est centrée, le titre est en bas à gauche | Recadrer la photo pour mettre le sujet dans le tiers haut |
| Photos de téléphone avec position GPS | Métadonnées EXIF | Réenregistrer avec sharp (sans `withMetadata`) |
| Photos Unsplash absentes sur les captures faites par Claude | L'espace cloud de Claude bloque Unsplash | Photos de remplacement pour les captures ; le vrai site les charge |
| La démo casse après réunion des scripts | Deux noms identiques au premier niveau dans deux fichiers | Noms distincts ; `apercu` refuse en nommant le doublon |
| Le vérificateur cachait des erreurs | Il s'arrêtait trop tôt | Il ne s'arrête que si la forme est cassée ; sinon il liste tout |
| Captures « page entière » avec des images blanches | Chromium ne peint pas les images décodées en asynchrone hors écran | Capturer en faisant défiler l'écran |
| Mise en ligne impossible depuis l'espace cloud de Claude | Cloudflare n'est pas joignable de là | Mise en ligne depuis l'ordinateur, avec Claude Code |
| GLM rend un JSON avec une clé en trop ou un guillemet | Écart au squelette | Recoller les lignes « ERREUR » : « corrige uniquement ces points » |

---

## 5. Listes de contrôle

### Avant de montrer une maquette
- [ ] `npm run verifier` : aucune erreur ; la liste « à valider » est prête pour le rendez-vous.
- [ ] `npm test` : tout « ok ».
- [ ] Démo ouverte sur téléphone : accueil, appel, itinéraire, une demande d'essai, l'espace boutique (changer un prix, enregistrer, revoir le site).
- [ ] Bandeau « Proposition », rien en ligne au nom du commerce.
- [ ] Photos d'essai créditées ; aucune photo Google ; aucun bijou ou produit d'une banque d'images présenté comme le sien.

### Avant la mise en ligne (après signature)
- [ ] Vraies photos, vrais prix, textes validés ; pièces ou produits d'exemple supprimés ; crédit des photos d'essai vidé.
- [ ] Logo définitif (SVG ou PNG transparent), coordonnées, réseaux.
- [ ] Mentions légales complètes (raison sociale, forme et capital, SIRET, adresse, directeur de la publication, médiateur si vente aux particuliers).
- [ ] CGV relues (idéalement par un juriste).
- [ ] Clé Web3Forms et demande d'essai reçue par e-mail.
- [ ] Nom de domaine au nom du client, MAQUETTE à « non », route ajoutée, redéployé.
- [ ] Testé sur téléphone en vrai : appel, itinéraire, espace boutique, interrupteurs, demande.
- [ ] Site ajouté sur la fiche Google ; Google Search Console (le plan du site `/sitemap.xml` se crée tout seul).

### Prise en main avec le commerçant (15 minutes, sur son téléphone)
Se connecter, changer un horaire, mettre un message d'annonce, ajouter un produit avec photo, masquer puis réafficher une partie, regarder les demandes. Ajouter l'espace boutique à l'écran d'accueil (« Ajouter à l'écran d'accueil »).

### Entretien
- Sauvegarde du contenu : `npx wrangler kv key get contenu --binding CONTENU --remote > sauvegarde.json`.
- Changer le mot de passe : `npm run mot-de-passe`, puis `npx wrangler secret put ADMIN_HASH`.
- Sécurité intégrée : 8 mauvais mots de passe bloquent 15 minutes ; demandes limitées par appareil ; demandes gardées 180 jours.
- Ce que couvrent les 29 € par mois : à définir avec le client (proposition : hébergement suivi, sauvegarde, petites modifications que le client ne fait pas lui-même).

---

## 6. Les commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm install` | Installe les outils (une fois par dossier). |
| `npm run verifier` | Contrôle le contenu : forme exacte, couleurs lisibles, photos, horaires, liens, mots « site IA », numéros, rendu réel de chaque page. Affiche la ligne « Style » et ce qui reste à faire avant l'ouverture. |
| `npm test` | Lance le vrai serveur sur l'ordinateur et le teste de bout en bout (pages, images, connexion, enregistrement, photo, demande d'un client, statuts, retour en arrière, sécurité). |
| `npm run apercu` | Fabrique `demonstration.html` et `demo-en-ligne/`. |
| `npm run nouvelle-boutique -- contenu.json [nom]` | (Vitrine) Crée le dossier d'une nouvelle boutique à côté du modèle. |
| `npm run mot-de-passe` | Crée le mot de passe de l'espace boutique et son empreinte. |
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
