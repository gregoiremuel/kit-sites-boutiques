# Journal de la compétence

Incidents réels et datés. À compléter à chaque chantier : c'est la mémoire de la
compétence, et ce qui l'empêche de redevenir une théorie.

---

## 28–29/09/2026 — Chantier d'origine : bague lotus P1 / P2 / P3

Reconstruire tout le métal de trois bagues autour de pierres fournies, aux cotes
d'un fichier de specs, puis plans techniques et rendus. Blender 4.2.3 LTS
headless, VPS 2 cœurs sans GPU. Résultat : P1 et P2 à 10 invariants sur 10, P3 à
8 sur 10 pour cause d'incohérence dans le pack fourni.

**Ce qui a coûté du temps, dans l'ordre :**

1. **Le corps de la bague a disparu** entre la décimation et la sauvegarde.
   Aucun message d'erreur, fichier de taille plausible. Cause : ratio de
   décimation calculé sur le nombre de faces au lieu du nombre de triangles.
   Repéré au deuxième essai grâce au journal des boîtes englobantes, ajouté
   après coup — devenu depuis une règle de la compétence.

2. **Corrective Smooth ne faisait rien.** Soupçonné dès l'écriture, confirmé par
   la mesure : 0,0000 mm de déplacement. Le script bascule maintenant tout seul.

3. **Trois coques au lieu d'une.** Les specs ne disaient nulle part comment les
   branches rejoignaient la galerie, ni ce qui portait le panier central. Le
   contrôle qui affiche le centre de chaque coque isolée a désigné les deux
   liaisons manquantes en une lecture.

4. **Une bille de griffe détachée de sa tige.** L'ajustement automatique avait
   aminci les deux, et le recouvrement avait disparu. Corrigé en faisant monter
   la tige jusqu'au centre de la bille : le contact devient indépendant du
   facteur d'amincissement.

5. **Le contrôle de recouvrement recalait à 0,26 mm** alors que l'ajustement
   visait 0,23. Deux causes cumulées : l'échantillonnage ne voyait que les
   stations du tube, et la marge ne couvrait pas le déplacement du remesh.
   Densification + cible abaissée à 0,205 : passé à 0,245.

6. **Le solveur booléen FAST** a vidé une coupe du plan technique de tout le
   corps de la bague. EXACT partout depuis.

7. **Le fond gris du studio** est apparu dans une vue latérale : le cyclo ne
   tournait pas avec la caméra. Deux vues à refaire, une heure de calcul perdue.

8. **Les vues `profil` et `face` étaient inversées** par rapport au plan
   technique et à l'usage joaillier. Repéré en regardant l'image, pas le code.
   Leçon : nommer les vues d'après ce qu'elles montrent, pas d'après l'azimut.

9. **Quinze heures de rendu non anticipées.** Une vue mesurée à 36 minutes, puis
   une macro à 86. Vingt et une vues au total. Le chiffrage aurait dû précéder
   le lancement. Le lanceur saute maintenant les images déjà présentes, ce qui
   a rendu deux interruptions indolores.

**Le conflit d'invariants.** L'encombrement de tête imposé valait exactement la
distance entre les pointes des deux pierres opposées : aucun métal ne pouvait
dépasser, alors que le recouvrement de griffe demandé exigeait une bille
débordante. Tranché en tenant l'encombrement (invariant contractuel) et en
réduisant la bille de Ø0,55 à Ø0,45 (paramètre), écrit dans le rapport. Les deux
invariants passent.

**L'incohérence d'entrée.** Sur P3, les marquises du fichier 3D étaient 0,21 mm
plus grandes que celles du fichier de cotes. Les pierres seules dépassaient la
cote d'encombrement annoncée. Livré en échec avec la démonstration que le métal
n'ajoutait 0,00 mm — plutôt que de redimensionner les pierres pour afficher
10/10. Le client peut corriger sa source.

**Trouvés en testant la compétence elle-même (29/09/2026)** — deux défauts que
le chantier n'avait pas révélés, parce que le script d'origine posait les
réglages ailleurs : `vue_au_trait()` rendait une image blanche quand aucun
`pass_index` n'était posé, et `ajuster()` rendait silencieusement son plancher
quand aucun facteur ne tenait la contrainte. Les deux sont corrigés dans les
outils. Leçon générale : extraire du code en compétence le fait tourner hors de
son contexte d'origine, et c'est là que les dépendances implicites se voient.

**La livraison a coûté autant de découvertes que la CAO (29/09/2026).** Quatre
choses qu'aucune étape technique n'avait révélées :

- Les `.glb` exportés depuis le modèle de travail n'avaient que des matériaux
  *nommés*, sans réglage : les bagues se seraient affichées en gris uniforme
  chez le client. Un export de présentation avec de vraies matières PBR est une
  étape à part entière, pas un détail d'export.
- Android n'ouvre aucun `.glb` nativement. La seule voie sans installation est
  une page HTML autonome embarquant `model-viewer` et les modèles en base64.
  Deux défauts y sont passés — `[hidden]` sans `!important` laisse les modèles
  s'empiler, et une distance de caméra en dur place l'observateur dans l'objet.
  Trouvés en ouvrant la page dans un vrai Chrome, pas en la relisant.
- Les canaux plafonnent : 30 Mo par envoi, 50 Mo pour un bot Telegram, alors
  que le dossier faisait 121 Mo. Découpé par usage plutôt qu'en tranches.
- Un dossier synchronisé (Syncthing) passe là où aucune messagerie ne passe, et
  n'expose rien publiquement.

**Chiffres utiles à garder comme ordre de grandeur** (objet de 20 mm, 2 cœurs) :
remesh voxel 0,03 mm ≈ 20 s et 1,8 M faces ; construction complète ≈ 5 min ;
contrôles avec épaisseur ≈ 2 min ; plan complet ≈ 1 min ; rendu 2048 px /
512 échantillons : 30 min en vue normale, 90 min en macro à faible profondeur
de champ.
