---
name: cao-bijouterie-blender
description: >
  CAO de précision sous Blender headless : bâtir une géométrie par script, la
  contrôler par la mesure, en sortir un STL étanche, un plan technique coté et
  des rendus packshot. Née d'un chantier de joaillerie — monture, serti, griffes,
  chatons, pavé, panier. À utiliser dès qu'on parle de bague, bijou, monture,
  serti, joaillerie, modèle imprimable ou plan coté, et plus largement pour toute
  géométrie construite par code dont les cotes sont un contrat.
---

# CAO de précision sous Blender

## Avant tout : vérifier l'outillage

Cette compétence suppose un binaire Blender 4.2+ et un Python avec numpy, plus
PIL côté système pour composer les planches. Le vérifier en une commande AVANT
de promettre quoi que ce soit :

```bash
command -v blender && blender --version | head -1
python3 -c "import numpy, PIL; print('numpy', numpy.__version__, 'PIL ok')"
```

Si Blender manque, le dire tout de suite et proposer l'une des deux voies
honnêtes : l'installer (tarball officiel, ~700 Mo décompressés, aucune
dépendance système), ou préparer les scripts ici et les faire exécuter là où
Blender existe. Ce qu'il ne faut pas faire, c'est improviser un substitut : une
géométrie de précision produite sans le moteur qui la mesure n'est pas une CAO,
c'est un dessin.

## Le contrat

Une pièce de CAO n'est pas une image : elle sera fabriquée. Une cote fausse de
0,3 mm ne se voit pas à l'écran et ruine un serti. Tout ce qui suit découle de
là.

**Un chiffre n'existe que s'il a été mesuré sur le maillage final.** Pas estimé
depuis les paramètres d'entrée, pas lu sur un aperçu, pas recopié du cahier des
charges. Le plan technique et le rapport ne contiennent aucune valeur saisie à
la main : ils lisent un `mesures.json` produit par un script qui interroge la
géométrie livrée. C'est ce qui permet de dire « Ø 14,800 mm » et de le penser.

## La chaîne

Six scripts, dans cet ordre. Chacun repart du fichier du précédent : on peut
reprendre à n'importe quelle étape sans tout refaire.

| Étape | Rôle | Durée typique |
|---|---|---|
| `build.py CLE [A\|B\|C\|D]` | construit la géométrie, un composant par fonction | 5 min |
| `checks.py CLE --thick` | mesure les invariants, rend un verdict chiffré | 2 min |
| `export.py CLE` | STL + GLB + `mesures.json` | 1 min |
| `plan_views.py CLE` | vues orthographiques au trait et coupes | 1 min |
| `plan_pdf.py CLE` | compose la planche et le PDF | 5 s |
| `render.py CLE VUE RES ECH` | un packshot | 30 à 90 min sur 2 cœurs CPU |

Le découpage en étapes A / B / C / D du constructeur est ce qui rend le travail
tenable : A = la structure porteuse, B = la tête, C = les ornements, D = la
fusion et les pièces rapportées. On rend un aperçu à 512 px après chaque lettre
et on compare aux références visuelles. Un défaut vu à l'étape B coûte deux
minutes ; le même défaut découvert après la fusion en coûte trente.

## Construire

**Un composant = une fonction = un objet nommé.** Ne jamais fusionner en cours
de route. Tant que les pièces sont séparées, un contrôle peut dire *quel* objet
viole une contrainte ; après la fusion il ne peut plus dire que « le métal ».
Prévoir un interrupteur (`NOJOIN=1`) qui saute la fusion : c'est l'outil de
débogage le plus utile de toute la chaîne.

La géométrie se fabrique par **balayage d'un profil le long d'une courbe**, pas
par assemblage de primitives. `scripts/geo.py` fournit tout le nécessaire :
polygones à congés exacts, repères à rotation minimale le long d'une polyligne
3D, tubes à rayon variable, nappes paramétriques épaissies. Un profil de jonc,
une section de branche, un pétale creusé, une griffe effilée sont tous le même
geste avec des entrées différentes.

### La fusion, et ce qu'elle emporte

Le remesh voxel est ce qui transforme un empilement de pièces en objet coulé :
il reconstruit une surface unique et pose un congé organique à chaque jonction.
`blender_util.fondre()` enchaîne joindre → remesh → lissage → décimation.

Deux conséquences à tenir en tête dès la conception :

- **Il soude tout ce qui se touche.** Les pièces qui doivent rester lisibles
  séparément — griffes, grains, billes — sont ajoutées APRÈS la fusion du corps.
  Sinon un grain de 0,35 mm posé sur un rail de 0,25 mm devient une bosse molle.
- **Il déplace la surface d'environ un demi-voxel.** Toute contrainte calée pile
  sur sa limite avant la fusion la dépasse après. Viser 10 à 15 % en dessous.

Choisir le voxel d'après le plus petit détail à garder : il faut 8 à 10 voxels
dans l'épaisseur du fil le plus fin. Pour des fils de 0,25 mm, 0,03 mm convient
(≈ 20 s et 1,8 M faces pour un objet de 20 mm sur 2 cœurs).

### Garantir une contrainte par booléen plutôt que par vigilance

Quand une règle doit valoir partout — « aucune matière dans ce volume » — la
tenir composant par composant est fragile : il suffit d'en oublier un. La
rendre vraie par construction est robuste : on fabrique l'union des volumes
interdits et on la soustrait du corps entier, une fois, après la fusion.

En joaillerie c'est la découpe des couronnes : un prisme au-dessus du rondiste
de chaque pierre, soustrait du métal. Plus aucun composant ne peut entrer dans
une pierre par-dessus, quel que soit ce qu'on ajoute ensuite.

## Contrôler

Écrire les invariants AVANT de modéliser, et les écrire comme des mesures avec
une cible et une tolérance. `scripts/controles.py` fournit les mesures
génériques. Pour une monture, les six qui comptent :

1. **Les pierres sont intactes** — position et orientation à ±5 µm. On les
   importe, on ne les touche jamais.
2. **Le passage du doigt** — diamètre minimum ET circularité par tranche
   angulaire. Un diamètre minimum seul ne dit pas si le canon est ovalisé.
3. **L'encombrement**, griffes comprises.
4. **L'épaisseur de matière** — par lancer de rayons, en lisant les centiles
   (p1, p5) et non le minimum, qui est presque toujours un artefact de maillage.
5. **Aucune matière dans une pierre au-dessus du rondiste**, sauf les bouts de
   griffes sous un recouvrement donné. Mesurer ce recouvrement
   PERPENDICULAIREMENT au contour : sur une pointe de marquise, la mesure axiale
   et la mesure perpendiculaire diffèrent d'un facteur deux.
6. **Étanchéité** — zéro arête non-manifold ET une seule coque. Vérifier les
   deux : un modèle peut être manifold et livré en trois morceaux.

Le compte des coques n'a aucun sens avant la fusion. Des objets qui
s'interpénètrent restent des coques distinctes tant que le remesh ne les a pas
réunies.

**Contrôler le fichier livré, pas la scène.** Réimporter le STL, souder à 1 µm,
recompter. Un export peut casser ce qui était sain en mémoire.

## Le tour de main : le paramètre piloté par le contrôle

C'est l'idée la plus rentable de la méthode, et elle se transpose partout.

Au lieu de choisir un rayon de griffe et d'espérer qu'il passe le contrôle, on
cherche par dichotomie **le plus grand rayon qui le passe**, en appelant la
fonction de mesure elle-même comme critère. `ajustement.ajuster()` fait ça en
huit itérations.

Résultat sur le chantier : 136 griffes et grains, dont 44 amincis
automatiquement, facteur minimum 0,38. Aucun réglage à la main, et la
géométrie s'adapte d'elle-même quand on change de design — c'est ce qui a
permis de traiter P1 et P3 sans retoucher une ligne.

Piège à connaître : **échantillonner une pièce seulement à ses stations rate la
surface entre elles.** Sur une griffe dont l'axe s'incline, le point qui viole
la contrainte est systématiquement entre deux stations. Densifier avant de
mesurer (`echantillonner_tube(..., densite=6)`) — sans ça l'ajustement valide
une pièce fausse, et le contrôle final la recale 40 minutes plus tard.

## Quand deux invariants s'opposent

Ça arrive, et c'est un vrai résultat, pas un échec. Sur ce chantier :
l'encombrement de tête imposé valait exactement la distance entre les pointes
des deux pierres opposées — aucun métal ne pouvait dépasser — alors que le
recouvrement de griffe demandé exigeait une bille qui débordait.

La conduite à tenir :

1. Le dire, chiffres à l'appui, plutôt que de choisir en silence.
2. Distinguer ce qui est **invariant** (l'encombrement, une cote contractuelle)
   de ce qui est **paramètre** (un diamètre de bille, une section de fil). Un
   paramètre se change, un invariant se tient.
3. Tenir l'invariant le plus dur, ajuster le paramètre, et écrire l'écart dans
   le rapport avec la valeur mesurée.

Une bille passée de Ø0,55 à Ø0,45, écrite noir sur blanc, est un choix
d'ingénierie. La même bille laissée à Ø0,55 avec un encombrement dépassé de
0,7 mm est un défaut qui se découvre à la fonte.

## Quand les données d'entrée se contredisent

Sur un des trois designs, le fichier 3D des pierres et le fichier de cotes ne
disaient pas la même chose : 0,21 mm d'écart sur les pierres allongées. À elles
seules, sans un gramme de métal, les pierres dépassaient la cote annoncée.

**Ne pas redimensionner en douce pour faire passer le contrôle.** Mesurer
l'écart, isoler ce qui vient de l'entrée de ce qui vient de la conception — ici
en affichant l'encombrement des pierres seules à côté du total, montrant que le
métal ajoutait 0,00 mm — et livrer le contrôle en échec avec son explication.
Un rapport qui dit 8/10 et pourquoi vaut infiniment mieux qu'un 10/10 obtenu en
déformant l'entrée. C'est aussi ce qui permet au client de corriger sa source.

## Le plan technique

Vues orthographiques au trait obtenues par détection d'arêtes sur les passes Z
et Normale (`scripts/trait.py`), pas par Freestyle : plus rapide, et les seuils
se règlent sans relancer Blender.

Le détecteur cumule le **laplacien de la profondeur** (qui repère les plis et
les marches) et la **discontinuité des normales**. Utiliser le simple gradient
de profondeur noircit toutes les faces vues de biais — c'est l'erreur qui
transforme un plan en tache d'encre.

Les coupes se font par soustraction d'un demi-espace, et la surface tranchée se
reconnaît à sa profondeur, exactement égale à celle du plan de coupe : c'est ce
qui permet de la hachurer proprement.

La planche se compose avec PIL, sans dépendance lourde : un tableau de fractions
de largeur pour les colonnes, des lignes de cote avec flèches, un cartouche. PIL
écrit aussi le PDF, y compris avec des formats de page mélangés (A3 paysage pour
les planches, A4 pour le reste) — il suffit de composer chaque page à la bonne
taille en pixels et de passer `resolution=150`.

## Les rendus

`scripts/studio.py` monte un studio complet en un appel. Trois choses font la
différence entre une image de CAO et une photo de bijou :

- **Les deux cartons noirs**, invisibles à la caméra mais présents dans les
  reflets. Sans eux, un environnement uniformément clair se reflète partout et
  les diamants virent au gris laiteux. C'est le geste du photographe packshot.
- **Le cyclo sans raccord**, sol + congé + mur en une seule nappe, **tourné avec
  l'azimut de la vue**. Sinon le gris du monde apparaît dans le cadre dès qu'on
  tourne autour de l'objet.
- **La dispersion des pierres transparentes** : le feu du diamant (0,044). Si
  l'entrée native n'existe pas dans la version de Cycles, additionner trois
  verres teintés R/G/B aux IOR décalés donne le même arc-en-ciel.

**Prévoir le temps avant de lancer.** Sur 2 cœurs CPU sans GPU, une vue 2048 px
à 512 échantillons prend 30 à 90 minutes ; une vue macro à faible profondeur de
champ est la plus chère. Mesurer une vue, extrapoler, et annoncer l'échéance
AVANT de lancer 21 rendus. Écrire le lanceur pour qu'il **saute les images déjà
présentes** : la série devient reprenable, et une interruption ne coûte rien.

## Livrer

Dans `sortie/CLE/` : `CLE_metal.stl`, `CLE_complet.glb`,
`CLE_plan_technique.pdf`, `rapport.md`, les rendus.

Le `rapport.md` porte le tableau des invariants avec valeur mesurée et verdict,
les cotes face aux specs avec l'écart, le journal de construction, les
itérations visuelles et **les choix assumés avec leur raison**. C'est cette
dernière section qui fait la différence entre un livrable et un fichier.

Quand un chantier s'étale sur plusieurs sessions, écrire un `REPRENDRE.md` à la
racine : état exact, commande unique de reprise, rôle de chaque script, pièges
déjà payés. Et un fichier de synthèse autonome (HTML avec images incluses, ou
PDF) que le client peut ouvrir sans rien installer.

### Les formats, et qui peut vraiment les ouvrir

Un livrable que le client ne peut pas ouvrir n'est pas livré. La matrice réelle,
vérifiée :

| Format | Sert à | Ouvre sans rien installer |
|---|---|---|
| `.stl` | fabriquer | Windows (Visionneuse 3D), tout slicer, toute CAO |
| `.glb` | modèle + pierres, référence | Windows, navigateurs ; **pas Android nativement** |
| `.usdz` | montrer sur iPhone/iPad, avec AR | iOS seulement, d'un simple toucher |
| HTML autonome | montrer partout | **tout appareil avec un navigateur** |

Android est le trou : aucun lecteur `.glb` natif. La réponse qui marche partout
est une page HTML qui embarque la bibliothèque `model-viewer` ET les modèles en
base64 — `scripts/visionneuse.py` la fabrique. Elle pèse quelques mégaoctets,
fonctionne hors ligne, et ne demande aucune application. C'est souvent le seul
fichier que le client ouvrira vraiment.

Deux pièges vérifiés dessus : `model-viewer` impose son propre `display`, donc
`[hidden]` ne le cache pas sans `!important` et les modèles s'empilent ; et une
distance de caméra en dur place l'observateur à l'intérieur de l'objet — laisser
`camera-orbit="… auto"` et laisser la bibliothèque cadrer.

### Découper une livraison qui ne passe pas

Les canaux plafonnent : 30 Mo par fichier ici, 50 Mo pour un bot Telegram. Un
dossier de CAO complet en fait facilement dix fois plus.

Découper **par usage, jamais en tranches arbitraires** : une archive
« essentiel » qui suffit à voir, lire et imprimer, puis une archive par pièce
pour la pleine qualité et la fabrication, puis les rendus, puis les sources.
Chacune se suffit, chacune emporte une copie du `LISEZ-MOI`. Un fichier
`.zip.002` ne veut rien dire dans deux ans ; `bague-P2-pleine-qualite.zip`, si.

Pour un envoi unique sans limite de taille, un dossier synchronisé (Syncthing ou
équivalent) passe là où aucun canal de messagerie ne passe.

## Aller plus loin

- `references/pieges.md` — les pièges Blender vérifiés en vrai, avec leur
  symptôme. À lire avant la première fusion : chacun a coûté une heure.
- `references/geometrie.md` — recettes de formes de bijouterie (jonc confort,
  serti grain, chaton, panier, griffe en serre) et le raisonnement derrière.
- `journal.md` — les incidents datés de ce chantier. À compléter au fil des
  suivants : c'est la mémoire de la compétence.

## La boîte à outils

| Script | Ce qu'il donne |
|---|---|
| `scripts/geo.py` | congés 2D exacts, repères à rotation minimale, balayages, tubes, nappes épaissies, décalage de contour — numpy pur, testable hors Blender |
| `scripts/blender_util.py` | création d'objets, fusion « pièce coulée », décimation en triangles, lissage vérifié, booléens, comptage de coques, import glTF |
| `scripts/controles.py` | épaisseur par lancer de rayons, volume et masse, pénétration dans un volume interdit, diamètre et circularité d'un alésage |
| `scripts/ajustement.py` | le paramètre piloté par le contrôle, échantillonnage densifié, plongée locale sous un obstacle, arasage d'enveloppe |
| `scripts/studio.py` | studio packshot complet, matières métal et gemmes avec dispersion |
| `scripts/trait.py` | vues orthographiques au trait, coupes hachurées, conversion mm → pixels pour les cotes |

`geo.py` ne dépend que de numpy : le tester en dehors de Blender fait gagner des
cycles entiers de mise au point.

## Porter cette compétence ailleurs

Le dossier est autonome : rien ne dépend de Claude Code. Les scripts ne
demandent que Blender 4.2+ (pour `blender_util`, `studio`, `trait`), numpy et
PIL (côté système). `geo.py`, `controles.py` et `ajustement.py` tournent en
Python nu.

- **Koîos** — déposer le dossier dans `plugins/agence/skills/` de l'atelier et
  reconstruire l'image. Le `name` du frontmatter correspond déjà au nom du
  dossier, et le `journal.md` suit la convention maison.
- **Autre assistant (GLM ou autre)** — donner `SKILL.md` comme instruction
  système ou comme document de référence, et copier `scripts/` à côté du projet.
  Les commentaires des scripts portent le raisonnement, pas seulement l'usage :
  ils restent lisibles sans le SKILL.md.

Un point à vérifier avant de s'appuyer sur les valeurs chiffrées : elles
viennent de Blender 4.2.3 LTS. `blender_util.lisser()` mesure de lui-même si
Corrective Smooth agit, mais la présence de l'entrée « Dispersion » sur le
Glass BSDF et le comportement du Decimate méritent un contrôle rapide sur une
version différente. Le principe reste : **mesurer plutôt que supposer**.
