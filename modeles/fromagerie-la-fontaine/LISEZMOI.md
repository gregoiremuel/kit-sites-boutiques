# Site et page de modification

Un moteur unique pour les sites des commerces de quartier. Le dossier livré est celui de la **Fromagerie La Fontaine** ; il sert de modèle pour toutes les autres boutiques : seul le fichier `contenu-initial.json` change.

- Le site public est une seule page : accueil, la boutique, la liste (fromages, pains, vins, services…), les offres (plateaux, gâteaux, réparations…), la demande en ligne, la presse et la note Google, les questions, les horaires et l'accès.
- **La page de modification** est une page privée du site (`/admin`), en français, protégée par un mot de passe. La boutique y modifie horaires, message d'annonce, produits et prix, offres, photos, textes, questions, presse, coordonnées ; elle **affiche ou masque chaque partie** avec un interrupteur ; elle y reçoit les demandes des clients.
- **Chaque boutique a son style**, choisi dans `contenu.theme`. Le **gabarit** (`theme.gabarit`, facultatif) change la structure de la page : `standard` (par défaut : accueil photo, partagé ou sobre ; titres ; angles ; offres sur photo ou fond clair), `atelier` (artisan : index numéroté et tiroirs), `depannage` (« Dépannage ou devis » et téléphone en tête, tuiles), `carte` (restaurant : en-tête centré, carte à deux colonnes, réservation), `marche` (fleurs et produits frais : mosaïque en arche, saisons en cartes). Les gabarits autres que `standard` ignorent `accueil`, `titres`, `angles` et `offres_fond`. Sept jeux de polices (`classique`, `atelier`, `net`, `etabli`, `chantier`, `table`, `serre`), couleurs tirées de la devanture, ordre des parties. Toutes les variantes sont testées ; deux boutiques voisines ne se ressemblent pas.
- Hébergement Cloudflare, offre gratuite.

## Une nouvelle boutique, de A à Z

1. **Le contenu** : remplis le prompt `prompts/1-site-et-espace-boutique.md` (fiche Google, tes notes, tes photos) et donne-le à Claude ou à GLM. Tes notes : de préférence avec `prompts/3-modele-de-notes.md` (faits sûrs, entendu sans vérifier, inspirations, photos, presse), collées dans le prompt ou jointes en fichier (.md, .txt, .pdf, .docx) ; la fiche Google peut aussi être jointe en PDF ou en captures. Il rend une fiche de faits, une liste « à valider » et un bloc `contenu.json`. Enregistre ce bloc dans un fichier `contenu.json`.
   Si le commerçant aime un site : colle `prompts/2-module-site-de-reference.md` au-dessus du prompt, avec les captures.
2. **Le projet** : dans Claude Code, ouvert dans ce dossier :
   > Lance `npm install`, puis `npm run nouvelle-boutique -- ../contenu.json`. S'il y a des lignes « ERREUR », montre-les-moi telles quelles. Sinon, va dans le nouveau dossier créé à côté, lance `npm install`, `npm run apercu` et `npm test`, et donne-moi le fichier demonstration.html.

   S'il y a des erreurs, recolle-les dans la conversation avec l'IA (« corrige uniquement ces points et renvoie le contenu.json complet »), puis recommence.
3. **La démonstration** : `demonstration.html`, à ouvrir sur ton téléphone (voir plus bas).
4. **Après la signature** : mise en ligne (plus bas).

Le modèle n'est jamais modifié par une nouvelle boutique : `nouvelle-boutique` crée un dossier frère avec le même moteur, le nouveau contenu et un `wrangler.jsonc` neuf (nom du site, stockage à créer, MAQUETTE à « oui »).

## Les commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm run verifier` | Contrôle le contenu : forme exacte, couleurs lisibles, style de mise en page, horaires, liens, mots « site IA », numéros de téléphone, rendu réel du site. Affiche la ligne « Style » de la boutique (à coller dans tes notes pour la boutique suivante, pour qu'elle ne lui ressemble pas) et la liste des faits à faire valider. |
| `npm run apercu` | Fabrique le fichier de démonstration `demonstration.html`, `apercu-site.html` (le site seul) et `demo-en-ligne/` (la démo à déposer sur Cloudflare Pages pour avoir un lien). Refuse si le contenu a une erreur. |
| `npm test` | Lance le vrai serveur sur l'ordinateur, sans rien mettre en ligne, et le teste : site, connexion, enregistrement, interrupteurs, photo, demande d'un client, statuts, retour en arrière, déconnexion, limites. Tout doit être « ok ». `npm test -- autre.json` teste un autre contenu. |
| `npm run nouvelle-boutique -- contenu.json [nom-du-site]` | Crée le projet d'une nouvelle boutique (voir plus haut). |
| `npm run mot-de-passe` | Crée le mot de passe de la page de modification et son empreinte. |
| `npm run deploy` | Vérifie le contenu puis met en ligne. |

## Le fichier de démonstration (pour le rendez-vous)

`demonstration.html`, un seul fichier à ouvrir sur ton téléphone :
- il s'ouvre sur **le site**, tel qu'il sera en ligne, avec le bandeau « proposition » ; une demande d'essai montre l'écran final sans rien envoyer ;
- le bouton **« Essayer la page de modification »** ouvre la page de modification en démonstration : n'importe quel mot de passe, les essais restent sur le téléphone, l'aperçu montre le site changer en direct. Après « Enregistrer », le site de la démonstration montre la nouvelle version (« Voir le site », ou « Revoir le site » sur l'écran de connexion).

Ouvre-le avec internet si le contenu utilise des photos en ligne. `apercu-site.html` est le site seul, si tu en as besoin (par exemple pour faire des captures).

**Sur iPhone, un fichier HTML ne s'ouvre pas** (ni Safari ni Chrome) : il faut un lien. `npm run apercu` prépare aussi le dossier `demo-en-ligne/` : zippe-le et dépose-le sur https://dash.cloudflare.com, « Workers & Pages », « Create application », « Pages », « Drag and drop your files » (gratuit, faisable depuis un iPhone). Le lien `nom-du-projet.pages.dev` marche partout ; « Create a new deployment » pour le mettre à jour. Ce lien est public pour qui l'a : jamais au nom d'un commerce qui n'a pas signé (utilise une boutique fictive pour ta démo de prospection). Sur ordinateur et Android, le fichier s'ouvre directement.

## Vidéo de fond (accueil)

Dans la page de modification, rubrique « Photos et textes », groupe « Accueil » : « Vidéo de fond », puis la case « Vidéo en fond (sinon la photo) ». Case décochée, le site garde la photo, comme avant ; la vidéo reste enregistrée pour plus tard. La photo sert aussi d'image d'attente pendant le chargement, et un petit bouton pause s'affiche en bas à droite (obligatoire pour l'accessibilité). Les visiteurs qui ont demandé moins d'animations voient la vidéo à l'arrêt.

Une bonne vidéo de fond :
- **MP4**, 10 à 20 secondes, **sans son** (elle est toujours muette), **à l'horizontale** ;
- un mouvement lent et régulier (atelier, gestes, matière, lieu), sans texte incrusté, qui boucle bien ;
- **20 Mo au plus** (8 Mo dans la démonstration). Sur Android, la caméra enregistre déjà en MP4 : coupez la vidéo à 15 secondes dans la galerie, en 1080p ou 720p ;
- **iPhone** : la caméra enregistre en .mov, que tous les navigateurs ne lisent pas. Envoyez la vidéo à Grégoire (ou à Claude) : elle sera convertie en MP4 léger, ou utilisez une application de conversion.
- On peut aussi coller un lien https vers un fichier .mp4 déjà en ligne.

## Mettre en ligne (avec Claude Code)

Il faut un compte gratuit sur https://dash.cloudflare.com. Ensuite, dans Claude Code ouvert dans le dossier de la boutique :

> Installe les dépendances (`npm install`). Lance `npm test` : tout doit être « ok ». Connecte-moi à Cloudflare (`npx wrangler login`). Crée la mémoire du site (KV « CONTENU ») (`npx wrangler kv namespace create CONTENU`) et mets son id dans `wrangler.jsonc`. Lance `npm run mot-de-passe`, puis enregistre ADMIN_HASH et SESSION_SECRET avec `npx wrangler secret put`. Déploie avec `npm run deploy`. Donne-moi l'adresse du site et le mot de passe. Laisse MAQUETTE à « oui ».

Le site est alors en ligne sur une adresse du type `nom-du-site.toncompte.workers.dev`, encore en mode proposition (bandeau, non indexé par Google, demandes en démonstration). La page de modification est à la même adresse, suivie de `/admin`.

## Après la signature

1. **Photos** : dans la page de modification, « Photos et textes », remplace les photos d'illustration par les tiennes. Vide le crédit des photos.
2. **Nom de domaine** : achète-le au nom de la boutique (OVHcloud, une dizaine d'euros par an). Dans Cloudflare, « Ajouter un site » avec ce domaine (offre gratuite), puis remplace chez OVHcloud les serveurs DNS par les deux que Cloudflare indique.
3. Dans Claude Code :
   > Dans `wrangler.jsonc`, passe MAQUETTE à « non » et ajoute la route `{ "pattern": "nomdedomaine.fr", "custom_domain": true }`, puis redéploie.
4. **Demandes par e-mail** : sur https://web3forms.com, saisis l'e-mail de la boutique ; la clé arrive dans leur boîte. Colle-la dans la page de modification, rubrique des demandes, « Réglages du formulaire ». Fais une demande d'essai. Sans clé, les demandes arrivent quand même dans la page de modification.
5. **Mentions légales** : raison sociale, SIRET, directeur de la publication, dans « Coordonnées et mentions légales ».
6. **Prise en main** (15 minutes sur leur téléphone) : se connecter, changer un horaire, mettre un message, ajouter un produit avec photo, masquer puis réafficher une partie, regarder les demandes. Ajoute la page de modification à leur écran d'accueil (menu du navigateur, « Ajouter à l'écran d'accueil »).
7. La boutique ajoute l'adresse du site sur sa fiche Google.

## Ce que voit la boutique

- Un écran de connexion à son nom et à ses couleurs, un seul mot de passe. La session dure 30 jours.
- Des rubriques qui se déplient, avec les mots de son métier et un résumé sous chaque titre (« Aujourd'hui (mardi) : 9h–13h et 15h30–19h30 », « 9 fromages affichés », « Masqué sur le site », « 1 nouvelle demande »).
- Un interrupteur « Afficher cette partie sur le site » pour la présentation de la boutique, la liste, les offres (et le formulaire), la presse et les questions. Une partie masquée garde son contenu.
- Un aperçu du site qui change en direct avant d'enregistrer (à droite sur ordinateur, bouton « Aperçu » sur téléphone).
- « Enregistrer » : le site est à jour en moins d'une minute. « Revenir en arrière » rétablit la version enregistrée juste avant.
- Les photos du téléphone sont réduites automatiquement avant l'envoi.
- Les demandes reçues, le téléphone du client à toucher pour l'appeler, et un statut : Nouvelle, Confirmée, Terminée, Annulée. Elles sont effacées au bout de 180 jours.

Ce qui ne se change pas depuis la page de modification : les mots du métier, les couleurs, les polices et la mise en page. C'est voulu (le site reste beau et lisible quoi qu'il arrive) ; ces réglages se changent dans `contenu-initial.json`, puis `npm run verifier` et un nouveau déploiement.

## Entretien

- **Changer le mot de passe** : `npm run mot-de-passe`, puis `npx wrangler secret put ADMIN_HASH`.
- **Sauvegarde du contenu** : `npx wrangler kv key get contenu --binding CONTENU --remote > sauvegarde.json`.
- **Mettre à jour le moteur d'une boutique** : recopie `src/`, `public/` et `outils/` depuis le modèle, sans toucher à `contenu-initial.json` ni à `wrangler.jsonc`, lance `npm test`, puis `npm run deploy`. Le contenu enregistré par la boutique est gardé.
- **Sécurité** : 8 mauvais mots de passe d'affilée bloquent la connexion 15 minutes ; 6 demandes au plus par appareil et par 10 minutes ; le serveur refuse les demandes quand la partie est masquée ou le site en mode proposition.

## Coûts

Cloudflare gratuit : 100 000 visites par jour, 1 000 enregistrements par jour, 1 Go de stockage (largement assez pour une boutique). Web3Forms gratuit jusqu'à 250 e-mails par mois. Seul le nom de domaine se paie.

## Fichiers

| Fichier | Rôle |
|---|---|
| `contenu-initial.json` | **Le seul fichier propre à la boutique** : textes, listes, horaires, mots du métier (`metier`), couleurs et polices (`theme`), parties affichées (`sections`) |
| `src/worker.js` | Le serveur : site, connexion, enregistrement, photos, demandes |
| `public/assets/rendu.js` | Fabrique les pages du site à partir du contenu (le même pour toutes les boutiques) |
| `public/assets/polices.js`, `public/fonts/` | Les trois jeux de polices : classique, atelier, net |
| `public/assets/site.css`, `site.js` | Design et fonctionnement du site (statut ouvert ou fermé, menu, demande en ligne) |
| `public/admin/`, `public/assets/admin.*` | La page de modification |
| `outils/` | Vérificateur, tests, démonstration, nouvelle boutique, mot de passe |
| `prompts/` | Le prompt principal (contenu du site), le module « site de référence » et le modèle de notes, pour Claude ou GLM |


## Pour une démonstration ou un métier qui n'est pas une boutique

- `reglages.bandeau` : texte du bandeau du haut (ex. « Démonstration : restaurant imaginaire… ») à la place de « Proposition de site pour… ».
- `reglages.illustration` : `true` écrit « Photo d'illustration » sur chaque photo des gabarits ; à mettre à `false` dès que ce sont les vraies photos.
- `metier.demande` accepte en plus `qui` (« le restaurant », « l'atelier », « l'entreprise »), `etape_jour`, `jour_phrase` (« Table le »), `sujet` (« Réservation ») et `sans_prix` (texte sous un choix sans prix, vide pour ne rien afficher) : la réservation d'une table ou la demande de dépannage ne parlent pas de « retrait » ni de « commande ».
- Photos écrites `/photos/nom` dans le contenu : `npm run apercu` les intègre depuis `photos/nom.jpg` à côté du fichier de contenu, et la démonstration s'ouvre sans internet.
- `npm run accessibilite [contenu.json]` : audit axe-core (WCAG 2.2 AA) du site en bureau, mobile et « moins d'animations », avec parcours au clavier (demande Playwright).
