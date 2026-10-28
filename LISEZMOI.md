# Kit sites boutiques

Tout ce qu'il faut pour refaire un site de commerce, de maison ou d'agence sans repartir de zéro : la méthode, les prompts, les pitchs et les trois moteurs déjà testés. Il marche avec Claude, Claude Code, GLM, ou une autre personne.

## Ce qu'il y a dedans

| Fichier ou dossier | À quoi il sert |
|---|---|
| `METHODE.md` | **La méthode complète** : étapes de la prospection à la facture, fabrication, règles d'or, pièges déjà rencontrés et leur parade, listes de contrôle, commandes, prix. |
| `prompts/1-site-et-espace-boutique.md` | Le prompt principal : fiche Google + tes notes → le contenu d'une boutique (Claude ou GLM). |
| `prompts/2-module-site-de-reference.md` | À coller au-dessus du prompt 1 quand le commerçant aime un site. |
| `prompts/3-modele-de-notes.md` | Le modèle de tes notes de boutique, en cinq parties. |
| `outils/fabrique-maquette.mjs` | La fabrique de maquettes en 1 heure : fiche Google collée → prompt → contrôle croisé → démonstration (`METHODE.md`, 2.2 bis). Les dossiers `maquettes/` restent sur l'ordinateur. |
| `prospection-pitchs.md` | Pitchs en boutique, au téléphone, par e-mail (trois messages), SMS, Instagram, réponses aux objections. |
| `modeles/fromagerie-la-fontaine/` | Le moteur **vitrine** (site d'une page + page de modification), avec son guide `LISEZMOI.md`. |
| `modeles/agence-operia/` | Le moteur **agence** (expertises, réalisations avec galerie, équipe, références, demande de projet) + page de modification, avec son guide. |
| `modeles/maison-tcheskiss/` | Le moteur **catalogue** (collections, pièces, panier qui envoie une demande de commande) + espace maison, avec son guide. |
| `skill/SKILL.md` | Le skill Claude « sites-boutiques » (le résumé de la méthode pour Claude). |
| `CLAUDE.md` | Lu automatiquement par Claude Code quand il ouvre ce dossier. |

## L'utiliser

- **Avec Claude (l'app)** : joins `kit-sites-boutiques.zip` et dis : « Suis la méthode du kit pour [boutique]. Voici la fiche Google, mes notes et mes photos. » Avec le skill « sites-boutiques » enregistré, Claude sait déjà comment faire et te demande le kit s'il ne l'a pas.
- **Avec Claude Code** (sur ton ordinateur) : ouvre le dossier du kit, puis : « Lis METHODE.md et fais la maquette de [boutique] avec ces éléments. » `CLAUDE.md` est lu tout seul.
- **Avec GLM** (chat.z.ai) : copie `prompts/1-site-et-espace-boutique.md`, puis ta fiche, tes notes et tes photos. Garde le bloc `contenu.json` qu'il rend, et passe-le à Claude Code pour fabriquer et tester le site (partie 2.3 de `METHODE.md`).
- **Avec une autre personne** : donne-lui le kit. Avant, retire `modeles/maison-tcheskiss/contenu-initial.json` et `modeles/maison-tcheskiss/public/assets/photos/` (le contenu et les photos de la Maison ne sont pas à partager sans l'accord d'Anthony), et relis `prospection-pitchs.md` (ton nom, ta rue).

## Où le garder

- **Le zip**, dans ton Drive ou iCloud : simple, et tu peux le joindre à n'importe quelle conversation.
- **Mieux : un dépôt GitHub privé** `kit-sites-boutiques`. Claude peut alors l'ouvrir lui-même dans une nouvelle conversation, sans que tu joignes de fichier, et chaque modification garde un historique.

## Le mettre à jour

Quand on apprend quelque chose de nouveau (un bug, un piège, une meilleure tournure de pitch) : on l'ajoute dans `METHODE.md`, on change la version en haut, puis on refait le zip ou on pousse sur le dépôt. Si la façon de travailler change, on met aussi à jour le skill.
