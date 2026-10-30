# Cerveau : la mémoire de Greg, indépendante du modèle

Tout agent (Claude, GLM, GPT, Gemini, un modèle local) lit ces fichiers **au démarrage**, avant toute tâche. Ils remplacent la « mémoire » propre à chaque outil : si on change de modèle, rien n'est perdu.

| Fichier | Contenu | Qui le modifie |
|---|---|---|
| `PROFIL.md` | Qui est Greg, ses activités, sa façon de travailler, ce qu'il attend d'une réponse | l'agent propose, Greg valide |
| `ROUTAGE-MODELES.md` | Quel modèle pour quelle tâche, budgets, solutions de repli | Greg (l'agent propose) |
| `DECISIONS.md` | Décisions prises par Greg, datées (ne pas les rediscuter) | l'agent ajoute, jamais ne supprime |
| `LECONS.md` | Les erreurs à ne plus refaire, toutes activités confondues | l'agent ajoute |
| `PROJETS.md` | Les projets en cours, leur dépôt, leur état, la prochaine étape | l'agent tient à jour en fin de séance |

Règles : une information à un seul endroit (le détail d'un site reste dans son dépôt) ; jamais de secret ici ; dater chaque ajout (AAAA-MM-JJ) ; un fait non vérifié s'écrit « à vérifier ».

Sur le VPS, `~/cerveau/` (agence Koios, utilisateur `orreg`) suit une organisation numérotée (`300-RESSOURCES`, `400-LECONS`…). Les deux doivent finir par ne faire qu'un : voir `prompts/6-agence-koios.md`, étape 1.
