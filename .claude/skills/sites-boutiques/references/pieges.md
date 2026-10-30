# Pièges connus et leur parade (liste complète : `METHODE.md`, partie 4)

## Espace cloud de Claude
- Cloudflare, le site en ligne et le VPS sont injoignables : on pousse et on fusionne, Cloudflare déploie depuis `main`.
- Photos libres : tester d'abord `images.unsplash.com` et `images.pexels.com` ; bloqués : le dire à Greg, sans contourner.
- Chromium en root : `outils/chrome-root.sh` (`--no-sandbox`) ; Playwright global : `NODE_PATH=$(npm root -g)`.
- Arrêter un serveur par son PID (`ss -ltnp`), **jamais** `pkill -f "...wrangler..."` (tue la session).
- Une commande de plus de 2 min (accessibilité) : la lancer en arrière-plan et attendre sa fin avant de conclure.

## Moteurs
- La mémoire du site (KV) l'emporte sur `contenu-initial.json` (voir `mise-en-ligne.md`).
- Clé facultative nouvelle : la déclarer dans `FACULTATIVES` du vérificateur, pas dans `FORME`.
- Spécificité CSS : une règle générique avec plusieurs `:not()` passe devant une règle de contexte (fond sombre) ; ajouter les mêmes `:not()` au contexte.
- `currentColor` dans un `::before` vaut la couleur du pseudo-élément, pas celle du bouton : passer les couleurs par des variables (`--cc`, `--cb`).
- Bouton en pleine largeur sur téléphone avec une case collée : `justify-content:flex-start`, sinon la case se décolle du bord.
- Panneau photo qui déborde (`margin` négatif) : ne pas lui imposer `width:100%` sur téléphone, sinon il se décale d'un côté.
- Cartes en rangée avec des titres de longueurs différentes : texte `flex:1` pour aligner les images.
- Images : `width`/`height` partout, `npm run dimensions` après chaque photo ; captures des démos (`npm run vignettes`) coupées sur un bloc entier.
- Démos : clé de mémoire propre à chaque site et version ; bouton « Remettre à zéro » ; un iPhone n'ouvre pas un fichier HTML.
- Aperçu de l'app Claude : pas de `<form>` envoyé, boutons `type=button`.
- Chromium des tests ne lit pas le H.264 : tester la vidéo en WebM.
- Captures « page entière » parfois blanches : faire défiler, ou capturer par tranches (`outils/captures.mjs`).

## Git
- Branche déjà fusionnée : `git checkout -B <branche> origin/main` (même nom), jamais de commits empilés sur l'historique fusionné.
- `git checkout -B` après un commit non poussé : le retrouver avec `git reflog`.

## Modèles Claude
- Jamais de nom de modèle deviné : vérifier avec le skill `claude-api` avant d'écrire un appel. Le code du kit (n8n, Visibilité Google) appelle `claude-haiku-4-5`, testé ; ne le changer qu'après vérification.
