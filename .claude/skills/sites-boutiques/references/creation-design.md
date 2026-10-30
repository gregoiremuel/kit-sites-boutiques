# Création et direction artistique

Skills installés dans `.claude/skills/` du kit (licences conservées) ; ils se chargent tout seuls dans une session ouverte sur le kit. Chemins ci-dessous relatifs au kit.

## Quel skill, à quel moment
| Étape | Skill | Usage |
|---|---|---|
| Direction | `design-taste-frontend` (Taste) | `node .claude/skills/design-taste-frontend/scripts/draw.mjs --sector <secteur> --brief "<une ligne>" --options 3` ; marque déjà fixée : `--keep palette,type`. Choisir l'option qui porte l'idée **du client** (« sur ce site, [chose du client] devient [dispositif] »). |
| Construire | `frontend-ui-engineering` | HTML sémantique, un `h1`, labels, `alt` utile ou vide, focus visible, clavier, `prefers-reduced-motion`, images avec `width`/`height` (`npm run dimensions`). |
| Raffiner | `impeccable` | `critique`, `typeset`, `layout`, `polish` ; détection seule : `DO_NOT_TRACK=1 IMPECCABLE_NO_TELEMETRY=1 IMPECCABLE_BROWSER=outils/chrome-root.sh npx impeccable detect <adresse>` (jamais `install`). Sans réseau : lire `PRODUCT.md` et `DESIGN.md` à la main. |
| Gestes | `emil-design-eng`, `animate`, `apple-design` | appui à 97 %, survol seulement sous `@media (hover:hover)`, `cubic-bezier(.23,1,.32,1)`, moins de 300 ms, `transform`/`opacity` seulement, contenu visible dès le chargement, tout coupé avec « moins d'animations ». Fin : `review-animations`. |
| Pire cas | `break-ui` | `node outils/pire-cas.mjs <dossier du site>` puis `node outils/controle-visuel.mjs <adresse>`. |
| Performance, sécurité | `performance-optimization`, `security-and-hardening` (Addy Osmani) | Core Web Vitals (CLS, LCP), page de modification, formulaires, en-têtes. |
| Officiel Anthropic | `frontend-design` (plugin `claude-plugins-official`) | typographie et parti pris assumés, contre le design générique ; à installer : `/plugin install frontend-design@claude-plugins-official`. |
| Navigateur | MCP Chrome DevTools (`npx chrome-devtools-mcp@latest`) | voir, mesurer et tracer la page dans un vrai navigateur ; utile surtout aux modèles sans Playwright sous la main. |
| Compte claude.ai | `no-ai-slop`, `web-design-guidelines` | listes de « tells » IA et règles d'interface de Vercel : relecture finale. |

Autres skills d'Emil présents : `animation-performance`, `animation-vocabulary`, `improve-animations`, `find-animation-opportunities`, `remove-animations`, `prototype`. Écartés : skills Swift, Expo, mobile natif ; Design Stack (doublon de Playwright et axe-core).

## Ce qui marche (site de Greg, version 3 du 30/10/2026)
- **Premier écran** : promesse en une phrase, un bouton principal, le **portrait rond** de la personne (56 px) avec son téléphone, puis **quatre atouts** juste dessous (« titre court | une phrase » dans `accueil.reperes`). Le client voit ce qui change pour lui avant les offres.
- **Boutons** : un principal plein (filet de 3 px qui monte en fond au survol, flèche qui avance), un secondaire en texte souligné (pas un deuxième rectangle), « Choisir » avec une case « + ». Jamais deux boutons de même poids côte à côte.
- **Offres** : chaque offre et chaque abonnement ont un bouton « Choisir » qui ouvre `/contact?offre=<id>` (case cochée ; plusieurs formules possibles, écrites en tête du message).
- **Réalisations** : secteur, nom et métier **au-dessus** de l'image ; images alignées par le bas.
- **Portraits** : ronds et petits (56 à 88 px), jamais une grande photo de la personne.
- **Démonstrations** : un menu différent par gabarit ; la planche des téléphones de l'accueil est centrée et sans étiquette posée dessus (le crédit va dans les mentions).

## Vidéo de fond (trois moteurs)
Champ « Vidéo de fond » (MP4 ou WebM, 20 Mo au plus, ou lien https .mp4) ; la photo reste l'image d'attente, bouton pause intégré. Une vidéo d'iPhone (.mov) se convertit avec ffmpeg (`METHODE.md` 2.7) ; sans vidéo du client, un lent mouvement sur une de ses photos (ffmpeg zoompan).

## Textes
- Simples, concis, précis, au bénéfice du client : « Pour qu'un client vous trouve, voie vos horaires et vous appelle en un geste. »
- Une information à un seul endroit : la méthode sur la page des offres, la présentation sur « À propos », les engagements sur leur page ; ailleurs, un lien.
- Un seul appel par page, au texte propre à la page ; « 48 h » ou un prix ne se répètent pas dans trois blocs voisins.
- Mots interdits (le vérificateur les refuse) : Bienvenue, Découvrez, N'hésitez pas, au cœur de, véritable, incontournable, passion, savoir-faire unique, sublimer, écrin, expérience, univers, authentique, de qualité, d'exception, excellence, intemporel, En savoir plus.
- Une page trop courte pour Google (`npm run referencement` : « peu de texte ») se complète avec des **faits vrais** demandés au client, jamais avec du remplissage.

## Style déjà pris (registre complet : `METHODE.md`, partie 3)
Site de Greg : gabarit `edition` (papier froid, marine `#22364f`, Besley et Schibsted Grotesk, angles droits, chapitres de couleur). Opéria : `classique` v2. Démonstrations : `atelier`, `marche`, `depannage`, `carte`. Un nouveau site prend un autre jeu ; un look qui manque s'ajoute au moteur (gabarit), jamais à la main dans un contenu.
