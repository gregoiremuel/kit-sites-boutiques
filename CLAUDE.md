# Kit sites boutiques : instructions pour Claude

Avant toute tâche dans ce dossier, lis `METHODE.md` en entier. C'est la méthode de Greg pour créer, montrer, mettre en ligne et entretenir les sites de commerces avec leur espace boutique.

- **On ne réécrit jamais un moteur.** Un nouveau site = un nouveau contenu dans un des trois modèles de `modeles/` (vitrine : `fromagerie-la-fontaine` ; catalogue avec panier : `maison-tcheskiss` ; agence de services ou du bâtiment : `agence-operia`). On ne touche au code d'un moteur que pour corriger ou améliorer le moteur lui-même, puis on relance `npm run verifier` et `npm test` dans ce modèle.
- **Règles d'or** (détail dans `METHODE.md`, partie 3) : ne rien inventer (l'inconnu va dans « à valider ») ; jamais de photos Google ou Wix ; jamais de photo de banque d'images présentée comme un produit du commerce ; photos du commerçant réduites et sans données GPS ; rien en ligne au nom d'un commerce qui n'a pas signé ; textes légaux = brouillons à faire relire ; aucun mot « site IA ».
- **Avant de livrer** : `npm run verifier` sans erreur, `npm test` tout « ok », `npm run apercu`, démo essayée (site, panier ou demande, espace boutique, enregistrement).
- **Pièges connus** : `METHODE.md`, partie 4. Ajoute-y toute nouvelle leçon et change la version en haut du fichier.
- **Avec Greg** : français, tutoiement, direct, textes prêts à coller. Réponse finale en trois parties : Réponse claire ; Niveau de confiance (0.0 à 1.0, avec la raison) ; Réserves clés.
