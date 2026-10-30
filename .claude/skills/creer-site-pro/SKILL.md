---
name: creer-site-pro
description: Use when creating, redesigning or polishing any shop or agency site from the kit (new client, new demo, Opéria, Atelier Muel): the order of work, which design skills to run when, the visual checks, and the rules that win when two skills disagree. Start here before touching a site's look.
---
# Créer un site « de studio » avec le kit

Greg veut des sites qui ne ressemblent ni aux autres sites du kit ni à une page « faite par une IA ». Ce skill dit **dans quel ordre** travailler et **quel skill lancer à quel moment**. Le détail est dans `METHODE.md` (2.12 conformité, 2.13 direction artistique, 3 règles d'or, 4 pièges). Réponse finale à Greg : Réponse claire ; Niveau de confiance (0.0 à 1.0, avec la raison) ; Réserves clés. Français, tutoiement.

## 0. Avant tout
1. Lire `CLAUDE.md` du dépôt du site, `LISEZMOI.md`, `DESIGN.md` et `PRODUCT.md` s'ils existent (sinon les écrire : `impeccable` s'en sert).
2. **Ne jamais réécrire un moteur.** Un site = un contenu dans un des trois modèles (`modeles/`). Un look qui manque s'ajoute au moteur (gabarit), jamais à la main dans un contenu.
3. Règles de Greg qui gagnent sur tout skill : rien d'inventé, pas de faux client ni de photo de banque présentée comme un travail réel, titres plafonnés (accueil 56 px, pages 48 px, rubriques 36 px ; 30 et 24 px sur téléphone), texte jamais sous 14 px, un site = une identité (relire le registre des styles, `METHODE.md` partie 3).

## 1. Direction (Taste, `design-taste-frontend`)
`node <skill>/scripts/draw.mjs --sector <secteur> --brief "<une ligne>" --options 3`, choisir celle qui porte l'idée **de ce client** (son nom, sa rue, sa contrainte), pas la plus familière. Marque déjà fixée : `--keep palette,type`. Écrire l'idée en une phrase : « sur ce site, [chose du client] devient [dispositif] ». Comparer avec le registre des styles : deux captures côte à côte ne doivent pas se confondre.

## 2. Construire (moteur du kit + `frontend-ui-engineering`)
HTML sémantique, un `h1` par page, labels sur chaque champ, `alt` utile ou vide, focus visible, clavier, `prefers-reduced-motion`. Chapitres de couleur plutôt que filets ; tuiles plates ; icônes Lucide ; images avec `width` et `height` (`npm run dimensions`). Photos libres : tester `images.unsplash.com` (autres hôtes souvent bloqués : le dire à Greg, ne pas contourner).

## 3. Raffiner
- `impeccable` : `critique`, `typeset`, `layout`, `polish` (le lanceur télécharge son binaire au premier usage ; `DO_NOT_TRACK=1 IMPECCABLE_NO_TELEMETRY=1`, détection seule : `impeccable detect <adresse>` avec `IMPECCABLE_BROWSER=outils/chrome-root.sh`).
- `emil-design-eng`, `animate`, `apple-design` : appui à 97 %, survol seulement avec `@media (hover:hover)`, courbes `cubic-bezier(.23,1,.32,1)`, durées d'interface sous 300 ms, mouvements en `transform` et `opacity`, jamais de retard d'apparition qui reste sur le survol, tout coupé avec « moins d'animations ». `review-animations` en fin de travail.
- `break-ui` : `node outils/pire-cas.mjs <dossier du site>` puis `node outils/controle-visuel.mjs http://127.0.0.1:8801` (textes démesurés, mots sans espace).

## 4. Contrôler (toujours, dans cet ordre)
`npm run verifier` · `npm test` · `npm run referencement` · `npm run accessibilite` · `npm run rendu <adresse>` (site de Greg) · `node outils/controle-visuel.mjs <adresse>` (chevauchements, rangées décalées, texte coupé, débordement) · `node <taste>/scripts/inspect.mjs <adresse> --out …` avec `CHROME_PATH=outils/chrome-root.sh` (chaque FAIL : corriger ou défendre par écrit) · `node outils/captures.mjs <adresse> 1440 sortie/page` puis **regarder chaque capture**, bureau et mobile.

## 5. Pièges
- Chromium en root : `outils/chrome-root.sh` (`--no-sandbox`). Ne jamais lancer `pkill -f "...wrangler..."` : le motif se retrouve dans la ligne de commande de l'outil et tue la session ; arrêter un serveur par son PID (`ss -ltnp`).
- Le contenu enregistré dans la mémoire du site (KV) l'emporte sur `contenu-initial.json` : prévenir Greg qu'un changement de contenu demande un passage par `/admin` (les clés lues « avec le code », comme `seo` ou `redirections`, s'appliquent toujours).
- Les captures des démonstrations (`npm run vignettes`) s'arrêtent sur un bloc entier (jamais au milieu d'un titre) ; refaire `npm run dimensions` après toute photo.
- Toute amélioration du moteur : reporter dans `modeles/agence-operia` **et** `site-operia`, relancer `verifier` et `test` dans chacun.
