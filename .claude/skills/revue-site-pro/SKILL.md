---
name: revue-site-pro
description: Use when reviewing, testing or changing the look, content or behaviour of the Grégoire Muel site (site-atelier-muel): taste, human proof, sizes, end-to-end tests with cheap subagents, and the kit port.
---
## Règles
Lis `docs/REGLES-DESIGN.md` (goût, preuve humaine, tailles : texte 14 px minimum, corps 16 px, titre d'accueil 56 px, titres de pages 48 px, rubriques 32 px ; aucun faux client, avis ou chiffre ; démonstrations étiquetées ; icônes Lucide ; pas de surtitre, pas de fondu au défilement).

## Contrôles automatiques (dans cet ordre)
1. `npm run verifier`, `npm test` (≈ 10 s), `npm run referencement`, `npm run look-ia`, `npm run accessibilite` (≈ 2 min 30).
2. Serveur local : copier `outils/tester.mjs` (wrangler dev, KV local `--persist-to`, `--var ADMIN_HASH`, `--var SESSION_SECRET`, `--var MAQUETTE:non`) ; puis `NODE_PATH=$(npm root -g) node outils/rendu.mjs http://127.0.0.1:PORT`.
3. Impeccable (détection seule, jamais `install`) : `DO_NOT_TRACK=1 IMPECCABLE_NO_TELEMETRY=1 IMPECCABLE_BROWSER=<script qui lance chromium --no-sandbox> npx impeccable detect http://127.0.0.1:PORT/` (Chromium de `/opt/pw-browsers/`). Sur la page des offres, les « contenu caché » viennent des détails repliés (`<details>` fermés dans les tuiles).
4. CLS : Playwright + PerformanceObserver `layout-shift` ; images avec `width`/`height` (`npm run dimensions` après ajout de photo) ; polices préchargées.

## Tests de bout en bout avec modèles économiques
Lancer le serveur avec un mot de passe connu, puis 4 sous-agents Haiku en parallèle, scripts dans le dossier de travail (jamais dans le dépôt), rapport de 35 lignes max, bugs puis améliorations, « ne dis que ce que tu as constaté » : (1) visiteur et formulaire de contact, bureau et mobile, 404, clavier ; (2) espace /admin : connexion, chaque rubrique, modification, mot de passe, photo ; (3) quatre démonstrations et leur page de modification (rien ne doit partir au serveur) ; (4) commandes npm, contenu volontairement cassé, LISEZMOI. Les envois de test arrivent dans les demandes du serveur local : normal. Le sous-agent d'admin change le mot de passe de test : prévoir de ne pas le réutiliser.

## Report et mise en ligne
Toute évolution de `site.css`, `site.js`, `rendu.js`, `admin.*` se copie dans `kit-sites-boutiques/modeles/agence-operia/public/assets/` (`npm test` du kit : 116 ok au 30/10/2026 ; puis `site-operia`, 117 ok). Branche de travail `ccr-04ab3608-pccm5z`, demande de fusion vers `main` des deux dépôts ; `MAQUETTE` reste « oui » tant que TVA, nom commercial, domaine et mentions ne sont pas décidés.

## Contrôles ajoutés le 30/10/2026
`node outils/controle-visuel.mjs <adresse>` (kit : chevauchements, rangées décalées, texte coupé, débordement) et `node outils/pire-cas.mjs <dossier>` (textes démesurés) ; `inspect.mjs` de Taste avec `CHROME_PATH=outils/chrome-root.sh`. Skill chapeau : `creer-site-pro`.

## Jugement à l'œil
Preuve humaine (portrait, vrais pilotes, accord écrit) et goût (un seul bleu, pas de motif répété, pas de duo de boutons de même poids) : captures bureau et mobile.
