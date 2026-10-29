# Visibilité Google : la chaîne mensuelle (palier 0, puis palier 1)

Base : `docs/PLAN-REFERENCEMENT-IA.md` du dépôt `site-atelier-muel` (29 octobre 2026). Offre : **39 € par mois, sans engagement de durée** (proposition à valider). **Rien ici ne publie quoi que ce soit** : chaque texte passe par le client.

## Décisions retenues (partie 6 du plan)
| # | Question | Décision par défaut | Statut |
|---|---|---|---|
| 1 | Prix | 39 € par mois, sans engagement. 49 € à reconsidérer après les trois pilotes (repère CCI des Landes : 50 € HT, source tierce) | À confirmer par Greg |
| 2 | Palier 0 ou script | Palier 0 pour les clients 1 à 4 ; le script du palier 1 est écrit et testé sur une fiche imaginaire, à brancher à partir du 5e client | Décidé (demande du 29/10) |
| 3 | Canal de validation | Un seul canal par client (SMS ou e-mail, celui qu'il utilise déjà), écrit dans le devis. Délai : 3 jours ouvrés. **Silence = aucun texte nouveau publié** ; seules les mises à jour d'horaires et de fermetures que le client a lui-même écrites sont faites | À confirmer |
| 4 | Accès à la fiche | Greg ajouté comme **gestionnaire** depuis le compte du client, qui reste propriétaire. Jamais son mot de passe. Les étapes exactes se vérifient dans l'aide de Google le jour du premier client | À confirmer |
| 5 | Premier pilote | Non choisi | **Bloquant pour un vrai client** |
| 6 | Chatbot | Pas dans l'offre ; sur devis, à la demande, avec confidentialité et annexe 3 mises à jour avant activation | Décidé par défaut |

## Avant le premier vrai client : un point bloquant
Coller dans Claude les avis d'un client, ou les envoyer à l'API, **transmet des données personnelles à Anthropic**. Avant le premier client :
1. Ajouter Anthropic à l'**annexe 3** du contrat de sous-traitance (`docs/modeles/05-contrat-sous-traitance-rgpd.md` du dépôt du site) avec le pays et les garanties, **après vérification** des conditions d'Anthropic pour l'offre utilisée (ne pas supposer que les données ne servent pas à l'entraînement : lire les conditions de l'offre choisie) ;
2. Le dire dans la page de confidentialité du client si le texte des avis est envoyé ;
3. N'envoyer que le prénom et le texte de l'avis (jamais le nom de famille, jamais un contact).
Sans cela, travaille uniquement sur des fiches imaginaires.

## Palier 0 : à la main (clients 1 à 4), environ 1 heure par client et par mois
| Jour du mois | Étape | Temps | Fichier |
|---|---|---|---|
| Vers le 25 | Message de collecte au client (faits du mois, fermetures, photos, changements) | 5 min | `prompts/3-point-mensuel.md`, message 1 |
| Dès réception | Compléter la fiche du client (copie de `fiche-exemple.json`, dans `suivi-google/<client>/`) : faits du mois, avis sans réponse, chiffres du mois relevés dans la fiche Google | 15 min | `fiche-exemple.json` |
| Même jour | Ouvrir Claude ou Haiku, coller `0-regles.md` puis `1-posts.md` (fiche collée à la place de `{{FICHE}}`) ; idem `2-reponses-avis.md` | 10 min | `prompts/` |
| Même jour | Contrôler : `node outils/visibilite-google.mjs controler brouillons.md fiche.json`, puis relire chaque texte | 10 min | |
| Vers le 28 | Envoyer les brouillons au client pour « OK » | 5 min | message 2 |
| Après « OK » | Publier à la main dans la fiche (posts, réponses aux avis), mettre à jour horaires, fermetures, photos | 10 min | |
| Vers le 3 | Remplir le rapport, l'envoyer | 10 min | `modele-rapport.md`, message 3 |
Le temps réel est à mesurer sur les trois pilotes (le plan donne 1 heure, estimation) : note-le dans le rapport interne.

**Règles d'arrêt** : le client ne répond pas → un rappel, puis uniquement les mises à jour factuelles déjà données. Un avis de 3 étoiles ou moins → relu avec le client, par téléphone si possible. Un fait manque → on ne l'invente pas, on le demande.

## Palier 1 : le script (à partir du 5e client), environ 30 à 45 minutes par client
```
node outils/visibilite-google.mjs preparer suivi-google/<client>/fiche.json
node outils/visibilite-google.mjs rediger  suivi-google/<client>/fiche.json    # nécessite ANTHROPIC_API_KEY
node outils/visibilite-google.mjs controler suivi-google/<client>/reponse-claude.md suivi-google/<client>/fiche.json   # palier 0 : la réponse de Claude collée dans un fichier
node --test outils/visibilite-google.test.mjs                                   # essais sur fiche imaginaire, sans réseau
```
- `preparer` (sans réseau) : `rapport.html` (le modèle de rapport rempli), `prompt-posts.md` et `prompt-avis.md` (les fichiers `prompts/0-regles.md` + `1-posts.md` ou `2-reponses-avis.md`, fiche déjà collée : prêts à coller dans Claude), `a-valider.md`.
- La fiche du client : copie de `visibilite-google/fiche-exemple.json` dans `suivi-google/<client>/fiche.json`. La clé : `export ANTHROPIC_API_KEY=…` dans le terminal, avant `rediger` (jamais dans un fichier du dépôt).
- `rediger` : en plus, écrit `brouillons-posts.md`, `brouillons-avis.md` et `controle.md` (le contrôle y est déjà fait) ; il demande à Haiku 5.5 (`claude-haiku-5-5`, modifiable par `--modele`) les brouillons de posts et de réponses, puis `controle.md`. Un texte qui ne cite pas ses « Faits utilisés », qui contient un prix ou un chiffre absent de la fiche, une promesse, un mot de la liste « site IA », un cadeau ou un remboursement, est signalé.
- La clé reste dans la variable `ANTHROPIC_API_KEY` (jamais dans un fichier). `suivi-google/` est ignoré par git : les fiches de clients ne partent jamais sur GitHub.
- **Le rapport ne contient aucun chiffre écrit par l'IA** : seulement ceux de la fiche. L'IA n'écrit ni commentaire ni interprétation du rapport.
- Limites : le script n'a été essayé que sur une fiche imaginaire et un faux serveur ; l'appel réel à l'API n'a pas été testé. Le contrôle repère des signaux, il ne remplace pas la relecture.

## Fichiers
`prompts/0-regles.md`, `1-posts.md`, `2-reponses-avis.md`, `3-point-mensuel.md` · `modele-rapport.md` · `fiche-exemple.json` (imaginaire) · `../outils/visibilite-google.mjs` et `.test.mjs`.
