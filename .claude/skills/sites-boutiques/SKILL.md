---
name: sites-boutiques
description: Méthode complète de Greg (Grégoire Muel) pour créer, refaire, relire, tester et mettre en ligne les sites de commerces, d'artisans, d'entreprises et de sa joaillerie avec le kit `kit-sites-boutiques` (moteurs vitrine, catalogue, agence + page de modification). Use whenever creating, redesigning, polishing, reviewing or deploying any shop, agency or jewelry site from the kit (new client, demo, Opéria, site-atelier-muel, Atelier Muel), or when Greg asks about a site's look, texts, prices, legal pages or Google visibility. Remplace creer-site-pro, revue-site-pro et site-joaillerie.
---

# Sites boutiques : la méthode de Greg (version 20, 31/10/2026)

Greg (Grégoire Muel EI, Paris 16e) crée et tient à jour des sites pour les commerces, artisans et entreprises. Chaque site a une **page de modification** (`/admin`) où le client change tout et reçoit ses demandes. **On ne réécrit jamais un moteur : on remplit un contenu.** En cas d'écart, `METHODE.md` du kit gagne sur ce skill.

## 1. Avant tout
1. **Trouver le kit** : dépôt privé `gregoiremuel/kit-sites-boutiques` (l'ajouter à la session), sinon `kit-sites-boutiques.zip` joint, sinon le demander à Greg en une phrase.
2. **Lire** : `cerveau/` du kit (profil de Greg, décisions, leçons, projets), `AGENTS.md` et `LISEZMOI.md` du site, puis `METHODE.md` (parties 2, 2.11 à 2.13, 3 et 4), `DESIGN.md`, `PRODUCT.md` et `docs/REGLES-DESIGN.md` s'ils existent.
3. **Branche** : celle donnée par la session ; si sa demande de fusion est déjà fusionnée, repartir de `main` avec le même nom (`git checkout -B <branche> origin/main`).
4. **Modèle et coût** : direction artistique, réécriture des textes et arbitrages = gros modèle (Opus) ; exécution d'un plan validé = Sonnet ; tests répétitifs et relecture de rendu = sous-agents Haiku. Le dire à Greg **avant** de commencer un gros chantier.

## 2. Choisir le moteur (`modeles/`)
- **Vitrine** (`fromagerie-la-fontaine`) : commerce de quartier, une page. Gabarits `standard`, `atelier`, `marche`, `depannage`, `carte`, chacun avec son propre menu (hamburger à gauche, points ronds, points verticaux, mot « Menu » pour le restaurant). Nouveau commerce : `npm run nouvelle-boutique -- ../contenu.json`.
- **Agence** (`agence-operia`) : services, bâtiment, création. Gabarits `classique` (Opéria), `studio`, `edition` (site de Greg) ; pages offres, réalisations, actualités, engagements, pages par métier, abonnements.
- **Catalogue** (`maison-tcheskiss`) : pièces à vendre, panier qui envoie une demande de commande (pas de paiement en ligne). Champs de joaillerie : à garder pour Atelier Muel.

## 3. Ordre de travail d'un site
1. **Rassembler** : fiche Google, notes (`prompts/3-modele-de-notes.md`), photos du client. Liste « à valider » pour tout ce qui manque.
2. **Contenu** : `prompts/1-site-et-espace-boutique.md` (Claude ou GLM) → `contenu-initial.json`. Textes simples, concis, précis, orientés client (voir `references/creation-design.md`, « Textes »).
3. **Direction** (Taste `draw.mjs`, trois options) : une idée propre au client, une identité différente de tous les sites du registre (`METHODE.md`, partie 3).
4. **Construire dans le moteur**, raffiner (Impeccable, Emil, Apple), puis **contrôler** (`references/revue-tests.md`).
5. **Conformité** (`prompts/4-conformite-web.md`, `METHODE.md` 2.12) et titres Google (clé `seo`).
6. **Livrer** : démo essayée, captures regardées, branche poussée, demande de fusion, fusion quand Greg le demande (`references/mise-en-ligne.md`).

## 4. Règles d'or (elles gagnent sur tout skill)
- **Ne rien inventer** : prix, horaires, avis, chiffres, clients, dates, services, parcours. L'inconnu reste vide ou « à valider ».
- **Preuve honnête** : aucun faux client, avis ou chiffre ; démonstrations étiquetées « Démonstration », entreprises imaginaires dites imaginaires ; photos libres (Unsplash) créditées en « Photo d'illustration », jamais présentées comme un travail réel ; photos du client réduites (1200 px, JPEG ~78) et sans données GPS. Jamais de photos Google ou Wix.
- **Rien en ligne au nom d'un commerce qui n'a pas signé.** Opéria seulement avec son accord ; jamais la Fromagerie La Fontaine ni la Maison Tcheskiss ; aucune démonstration de joaillerie hors Atelier Muel.
- **Un site, une identité** : couleur, polices, mise en page, formes et boutons propres, cohérents avec le métier. Deux captures réduites ne doivent pas se confondre.
- **Tailles** : `docs/REGLES-DESIGN.md` fait foi (texte ≥ 14 px, titre d'accueil ≤ 56 px, pages ≤ 48 px, rubriques ≤ 36 px ; téléphone 30 et 24 px). Si un skill de design contredit, Greg gagne et on compense par la couleur, la matière, la structure.
- **Pas de répétition** : une information à un seul endroit (une page la détaille, les autres y renvoient par un lien).
- **Textes légaux** : brouillons à faire relire ; aucun champ légal inventé ; pas de conseil juridique ou fiscal présenté comme sûr.
- **Prix** : propositions que Greg valide (`METHODE.md`, partie 9).
- **Aucun identifiant ni secret dans un dépôt** (Secrets Cloudflare).

## 5. Où trouver le détail
| Besoin | Fichier |
|---|---|
| Direction artistique, skills de design, boutons, accueil, textes | `references/creation-design.md` |
| Contrôles, tests de bout en bout, report dans le kit | `references/revue-tests.md` |
| Mise en ligne, fusion, KV, Cloudflare | `references/mise-en-ligne.md` |
| Pièges connus et leur parade | `references/pieges.md` (complet : `METHODE.md`, partie 4) |
| Joaillerie Atelier Muel | `references/joaillerie.md` et le prompt complet `prompts/5-site-joaillerie-glm.md` |
| Changer de modèle (GLM, GPT…) sans rien perdre | `METHODE.md` 2.14, `AGENTS.md`, `cerveau/ROUTAGE-MODELES.md` |
| EIMS, l'agence IA (chef qui délègue, interface, mémoire) | `prompts/6-eims-agence-ia.md` |
| CAO de bijoux, manuel de l'agence, page HTML hors site | skills `cao-bijouterie-blender`, `manuel-agence`, `page-html` |

## 6. Travailler avec Greg
- Français, tutoiement, direct. Il lit sur téléphone : phrases courtes, textes prêts à coller.
- Réponse finale en trois parties : **Réponse claire** ; **Niveau de confiance** (0.0 à 1.0, avec la raison) ; **Réserves clés**.
- Honnête plutôt que rassurant : dire ce qui n'a pas été vérifié (en ligne ou non, captures regardées ou non). « En ligne » ne se dit qu'après l'avoir constaté.
- Une décision qui lui revient (photos d'un client, accord, prix) : poser la question avec le contexte, en expliquant ce que chaque choix change.
- Chaque nouvelle leçon : l'ajouter à `METHODE.md` (partie 4, version en haut) et à ce skill, puis pousser.
