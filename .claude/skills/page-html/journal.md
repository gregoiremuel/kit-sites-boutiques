# Journal d'amélioration — page-html

> À lire AVANT chaque usage. À compléter APRÈS, si quelque chose a raté.
> Trois occurrences d'une même entrée → la règle monte dans « Pièges déjà
> payés » du `SKILL.md`, après accord de la personne.

## 2026-09-08 — création, à partir du Manuel de l'Agence

**Origine :** cette compétence extrait la méthode utilisée pour produire le
manuel de l'agence, pour qu'elle serve à n'importe quelle page.

**Ce qui a bien marché et qu'il faut refaire :**

1. **Donner un sens aux couleurs.** Sur le manuel, vert = gratuit et ocre =
   consomme le quota. Le lecteur comprend en diagonale où part l'argent. Une
   couleur qui informe vaut mieux que trois qui décorent.

2. **Un résumé de trois lignes avant chaque chapitre.** Le lecteur pressé
   s'arrête là, le lecteur curieux continue. Les deux sont servis.

3. **Un serif pour le corps quand le texte est long.** Contraire à l'habitude
   des pages produites par IA, et nettement plus confortable sur un document
   qui se lit d'un trait.

4. **Un dernier chapitre qui sépare le fait du projet.** Une page qui présente
   un projet comme un fait accompli détruit la confiance dans tous les autres
   chiffres qu'elle donne.

**Ce qui reste à surveiller au prochain usage :**

- Sur un écran très large, la colonne de lecture laisse beaucoup de vide à
  droite. Acceptable pour un document, à revoir pour un tableau de bord où
  l'on veut voir plusieurs choses à la fois.
- La description en tête du `SKILL.md` pèse dans le coût permanent. La garder
  précise mais courte.

## 2026-09-14 — deux barres de graphique invisibles pendant toute l'écriture

**Ce qui a raté :** les cinq graphiques en barres de la refonte du manuel Koîos
n'affichaient aucun remplissage — seulement les pistes vides. Le défaut a
traversé l'écriture complète de la page et n'a été vu qu'à la troisième capture
navigateur, en mode sombre, où l'absence saute aux yeux.

**Pourquoi :** l'élément de remplissage était un `<b>`, donc `display: inline`
par défaut. `height` et `width` ne s'appliquent pas à un élément en ligne. Le
JavaScript posait bien `style.width` (21 barres sur 21, vérifié), le CSS était
juste, et rien n'échouait : la valeur était simplement ignorée par le moteur de
rendu. Aucune vérification structurelle ne pouvait l'attraper — seul un œil sur
une capture le pouvait.

**Règle ajoutée :** tout élément auquel on donne une hauteur, une largeur ou un
remplissage doit porter un `display` explicite (`block`, `flex`, `grid`) dans sa
règle CSS. Ne jamais compter sur le `display` par défaut d'une balise, et se
méfier en particulier de `<b>`, `<i>`, `<span>` et `<em>` utilisés comme
conteneurs graphiques.

**Second défaut, même session :** la barre haute (logo + deux boutons) débordait
de 20 px à 390 px de large, et la page entière rapportait 10 px de défilement
horizontal résiduel invisible à l'œil. Corrigé par un libellé de bouton
raccourci sous 600 px et `overflow-x: clip` sur `html` (`clip` et non `hidden` :
`hidden` casse `position: sticky` sur les ancêtres). **Règle ajoutée :** mesurer
`document.documentElement.scrollWidth` contre `clientWidth` à 320, 390, 768,
1280 et 1600 px — un débordement de quelques pixels ne se voit pas sur une
capture mais se sent au doigt sur téléphone.

**Ce qui a bien marché et qu'il faut refaire :** un marqueur de provenance
(mesuré / calculé / estimé / à venir) collé à chaque chiffre, plus un bouton qui
entoure tout ce qui n'est pas une mesure directe. Le lecteur voit d'un coup
d'œil où la page est solide et où elle extrapole — et l'auteur, en le posant,
est obligé de se demander pour chaque nombre d'où il sort.

## 2026-09-16 — le quatrième chiffre seul sur sa ligne, et une barre qui ment à 0

**Ce qui a raté :** deux défauts vus sur la capture PC du manuel Lithos.
1. Les quatre chiffres clés en tête étaient posés en
`grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr))`. Dans une colonne de
lecture de 66ch, `auto-fit` calcule trois colonnes : le quatrième chiffre — le
plus important, celui qui manque — se retrouvait seul à côté d'une case vide.
2. Dans l'entonnoir, la dernière barre annonçait « 0 » et dessinait quand même
un trait de 0,6 %. Les deux barres précédentes (1,2 % et 3 %) étaient, elles,
invisibles alors qu'elles valaient 4 et 10.

**Pourquoi :** `auto-fit` optimise le remplissage de la LIGNE, pas la lecture —
il ne sait pas qu'une grille de 4 doit rester une grille de 4. Et sur une
échelle linéaire honnête, une petite valeur tombe sous le pixel : on avait
compensé en trichant sur la largeur du zéro plutôt qu'en donnant un minimum aux
valeurs non nulles.

**Règle ajoutée :** pour un nombre d'éléments CONNU et petit (3, 4, 6), écrire
le nombre de colonnes en dur avec un point de rupture, jamais `auto-fit` — il
laisse régulièrement un orphelin. Et dans un graphique en barres : toute valeur
non nulle reçoit un `min-width` de quelques pixels, toute valeur nulle dessine
exactement rien. Une barre doit atteindre la valeur qu'elle annonce, dans les
deux sens.

## 2026-09-19 — un bloc de thème sombre corrompu, et un test de débordement qui ne testait rien

**Ce qui a raté, deux fois dans la même page :**

1. Le bloc `@media (prefers-color-scheme: dark)` est sorti de l'écriture avec des
valeurs de couleur invalides (`--padpa:#e5a濃;`) et dupliqué deux fois de suite.
Le CSS invalide est ignoré silencieusement par le navigateur : la page s'affichait
sans erreur, avec une variable qui gardait sa valeur claire en mode sombre.
**Pourquoi :** écrire le bloc sombre « au fil de la plume » au milieu d'un long
fichier, sans le relire isolément. **Règle ajoutée :** écrire les deux blocs
sombres (`@media` et `[data-theme="dark"]`) en UN seul geste, à la suite, avec la
liste complète des variables recopiée depuis `:root` — puis les relire seuls.
Un `grep` des valeurs hexadécimales invalides coûte une seconde et attrape tout :
`re.findall(r'--[a-z-]+:\s*([^;]+);')` filtré sur `#[0-9a-fA-F]{3,8}`.

2. Le contrôle de débordement horizontal rapportait `scrollWidth=1280` aux cinq
largeurs, y compris 320 px — donc « aucun débordement » partout. **Pourquoi :**
`browser.newPage({viewportSize:…})` n'est pas la bonne clé (c'est `viewport`), et
Playwright ouvrait chaque page à la taille par défaut. Le test ne pouvait PAS
constater ce qu'il cherchait. C'est exactement le piège n°4 du SKILL, rencontré
sur le contrôle lui-même. **Règle ajoutée :** faire varier la taille avec
`page.setViewportSize()` sur une page déjà ouverte, et VALIDER LE TEST en
vérifiant que `clientWidth` renvoie bien la largeur demandée avant de lire son
verdict. Un contrôle qui renvoie la même valeur à 320 et à 1600 px est cassé,
pas rassurant.

**Ce qui a bien marché et qu'il faut refaire :** prendre la palette dans le
vocabulaire réel du sujet plutôt que dans une charte — ici les pierres du corpus
lui-même : bleu de Ceylan pour ce qui est corrigé, grenat pour ce qui était faux,
padparadscha pour une référence extérieure, lavande de spinelle pour ce qui
attend une décision. Le lecteur lit la page en diagonale et voit tout de suite où
elle est solide et où elle attend quelque chose de lui. Et reprendre comme
marqueurs de provenance le vocabulaire que le PROJET s'est déjà donné (ici les
marqueurs de preuve du §2 de sa constitution) plutôt que d'en inventer un.
