# Contrôles, tests et report dans le kit

## Contrôles automatiques (dans cet ordre)
1. `npm run verifier` (aucune erreur), `npm test` (tout « ok » ; site de Greg 132, moteur agence 116, vitrine 63 au 30/10/2026), `npm run referencement`, `npm run look-ia`.
2. Serveur local : `npx wrangler dev --port 8801 --ip 127.0.0.1` (en arrière-plan), puis `NODE_PATH=$(npm root -g) npm run rendu -- http://127.0.0.1:8801` et `node <kit>/outils/controle-visuel.mjs http://127.0.0.1:8801`.
3. `npm run accessibilite` (axe, WCAG 2.2 AA, bureau, mobile, moins d'animations, clavier ; environ 2 min 30, lancer en arrière-plan).
4. Taste : `CHROME_PATH=outils/chrome-root.sh node .claude/skills/design-taste-frontend/scripts/inspect.mjs <adresse> --out <dossier>` : chaque FAIL corrigé ou défendu par écrit.
5. Impeccable en détection seule (voir `creation-design.md`) ; les « contenus cachés » des `<details>` fermés sont normaux.

## Regarder (aucun contrôle ne le remplace)
`node outils/captures.mjs <adresse> 1440 <sortie>/page` et à 390 px ; regarder **chaque** capture : accueil, offres, réalisations, à propos, contact, démonstrations (haut de page sur téléphone pour comparer les menus). Pour économiser : planches de captures réduites assemblées avec Pillow, puis zoom sur un détail douteux (`element.screenshot`).

## Tests de bout en bout (sous-agents économiques)
Serveur jetable avec mot de passe connu ; quatre sous-agents Haiku en parallèle, scripts dans le dossier de travail (jamais dans le dépôt), rapport de 35 lignes au plus, « ne dis que ce que tu as constaté » :
1. visiteur et formulaire (bureau, mobile, 404, clavier, choix de formule par `?offre=`) ;
2. `/admin` : connexion, chaque rubrique, modification, mot de passe, photo ;
3. démonstrations et leur page de modification (rien ne part au serveur) ;
4. commandes npm, contenu volontairement cassé, `LISEZMOI.md`.

## Report dans le kit
Toute évolution de `public/assets/{rendu.js,site.js,site.css,admin.*}` ou `outils/verifier.mjs` du site de Greg se reporte dans `modeles/agence-operia` du kit : `git diff HEAD -- <fichiers> > moteur.patch`, puis `patch -p1 --dry-run` et `patch -p1` dans le modèle, puis `npm run verifier` et `npm test` du modèle. Dans `site-operia` : seulement avec l'accord de Greg (c'est le site d'un client).
Démonstrations : le moteur vitrine du kit fabrique `public/demos/` du site (`npm run demos`, kit attendu dans `../kit-sites-boutiques`), puis `npm run mobiles`, `npm run vignettes`, `npm run dimensions`.
