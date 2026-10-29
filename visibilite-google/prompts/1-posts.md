# Posts du mois pour la fiche Google

Tu as reçu les règles de rédaction. Voici la fiche du commerce (données du client, fournies par lui) :

{{FICHE}}

Écris **{{NOMBRE_POSTS}} post(s) Google** pour le mois de **{{MOIS_POSTS}}**.

Contraintes :
- 300 caractères au moins, 900 au plus (la limite de Google est de 1 500, à vérifier ; on reste loin).
- Un seul sujet par post, tiré d'un fait de `faits_du_mois` (numérotés dans la fiche). Si `faits_du_mois` est vide, écris « Manque : aucun fait du mois, demander au commerçant » et rien d'autre.
- Si une fermeture de `fermetures` tombe dans le mois, un post peut l'annoncer, avec les dates exactes de la fiche.
- Après le texte, trois lignes dans cet ordre : `Faits utilisés : 1, 3` (les numéros des faits utilisés), `Bouton : Appeler` ou `Bouton : Aucun`, puis `Manque : …` seulement s'il manque une information.

Format :

### POST 1
(texte du post)
Faits utilisés : …
Bouton : …
Manque : … (seulement s'il manque une information)
