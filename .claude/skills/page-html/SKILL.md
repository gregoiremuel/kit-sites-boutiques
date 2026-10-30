---
name: page-html
description: Produire une page HTML autonome de qualité professionnelle — site vitrine, rapport, manuel, tableau de bord, page de vente. Impose un plan de design explicite avant d'écrire, des couleurs qui signifient, une typographie appariée, les modes clair et sombre, une lecture parfaite sur téléphone, et une vérification au vrai navigateur. À utiliser pour toute page destinée à être lue par quelqu'un d'autre.
---

# Faire une page HTML qui ne ressemble pas à de l'IA

## Quand l'utiliser

Toute page destinée à être lue par un être humain : site client, rapport,
manuel, tableau de bord, page de vente, présentation.

**Lire `journal.md` à côté de ce fichier avant de commencer.** Il contient ce
que les versions précédentes ont raté.

## Étape 1 — Le plan de design, AVANT la première ligne de code

Écrire ces quatre points noir sur blanc. Sans eux, la page sortira générique.

1. **Le sujet en une phrase** — de quoi ça parle, pour qui, et quel est le
   seul travail de cette page.
2. **La palette : 4 à 6 couleurs, en hexadécimal, nommées.** Chacune doit
   avoir un rôle. Les meilleures pages ont une ou deux couleurs qui
   *signifient* quelque chose (gratuit/payant, fait/à faire, sain/en panne)
   plutôt que de décorer.
3. **Deux polices au minimum**, prises sur Google Fonts : une de caractère
   pour les titres, une confortable pour le corps. Une troisième en chasse
   fixe si la page contient du code ou des chiffres alignés.
4. **La composition en une phrase** — une colonne de lecture ? un rail
   latéral ? une grille de cartes ?

**Puis relire ce plan et se demander : est-ce que je produirais le même plan
pour n'importe quel autre sujet ?** Si oui, il est générique — le refaire.

## Étape 2 — Puiser dans le monde du sujet

Une page distinctive emprunte au vocabulaire réel de son sujet : ses unités,
ses instruments, ses conventions de document, ses termes de métier. Une
boulangerie n'a pas la même matière visuelle qu'un cabinet d'avocats.

Écrire de vrais contenus. **Jamais de faux texte de remplissage.**

## Étape 3 — Ce qu'il faut fuir

Ces choix reviennent dans presque toute page produite par une IA. Les éviter
sauf demande explicite de la personne :

- le dégradé violet vers bleu ;
- le fond crème `#F4F1EA` avec serif et accent terracotta ;
- Inter et Space Grotesk comme choix « sûr » ;
- des emoji en marqueurs de section ;
- tout centré ;
- le même arrondi et la même ombre sur chaque bloc, ce qui écrase la
  hiérarchie ;
- une bannière d'accueil qui occupe tout l'écran et repousse le contenu
  hors de la première vue ;
- des marqueurs numérotés `01 / 02 / 03` quand le contenu n'est pas une
  vraie séquence.

## Étape 4 — Les règles techniques non négociables

### Les deux thèmes

Le lecteur a **trois** états, pas deux : clair choisi, sombre choisi, ou rien
choisi — et dans ce dernier cas seule la préférence du système tranche.

```css
:root { /* TOUTES les couleurs, en clair, définies ici */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* on redéfinit UNIQUEMENT les variables */ }
}
:root[data-theme="dark"] { /* les mêmes, pour que le bouton gagne */ }
```

Une couleur définie **uniquement** sous `@media` ne s'applique jamais en mode
système : c'est le bug classique de la page illisible. Et `body` doit poser un
fond explicite, sinon la page emprunte celui de son hôte.

### Le téléphone

Unités relatives, `flex`/`grid` avec `gap` plutôt que des marges empilées.
Tout contenu large — tableau, diagramme, bloc de code — dans son propre
conteneur en `overflow-x: auto`. **Le corps de la page ne défile jamais
latéralement.**

### La page au repos

Tout ce qui doit être lu est visible dès le chargement, sans défiler ni
cliquer. Un chiffre animé depuis zéro est un chiffre faux tant que
l'animation n'est pas finie : écrire la vraie valeur dans le HTML, et ne
laisser à l'animation que l'apparition.

Respecter `prefers-reduced-motion`.

### Les ressources extérieures

Seules les polices Google Fonts se chargent depuis l'extérieur. **Tout le
reste doit être dans le fichier** : CSS, JavaScript, images en `data:`.
Prévoir toujours une police de repli réelle dans la déclaration.

### Les caractères à échapper

`<` et `>` deviennent `&lt;` et `&gt;` dans tout bloc de code, sinon le
navigateur les lit comme des balises et le contenu disparaît.

## Étape 5 — Vérifier au vrai navigateur

Une seule fois, avant de rendre :

```bash
docker cp page.html atelier:/tmp/page.html
docker exec atelier npx --yes playwright@latest screenshot \
  --viewport-size=390,844 --full-page file:///tmp/page.html /tmp/tel.png
docker exec atelier npx --yes playwright@latest screenshot \
  --viewport-size=1280,1500 --full-page file:///tmp/page.html /tmp/pc.png
```

Regarder les deux captures. Chercher : texte qui se chevauche, colonne
coupée, débordement horizontal, contraste insuffisant.

Ne pas boucler : une écriture soignée puis un seul regard valent mieux que
dix allers-retours.

## Pièges déjà payés

1. Une couleur définie seulement sous `@media` → page illisible en mode
   système.
2. Un chiffre animé depuis zéro → capture et lecteur sans JavaScript voient
   un chiffre faux.
3. `<` non échappé dans un `<code>` → le contenu disparaît silencieusement.
4. Un test mal construit conclut à tort. Avant de conclure qu'une chose
   manque, vérifier que le test pouvait constater sa présence.
5. Un contrôle qui échoue en masse est plus souvent faux que le contenu qu'il
   contrôle.
6. Jamais de mot de passe, de clé ni de jeton dans une page — seulement
   l'emplacement du fichier qui les contient.

## Liste de vérification finale

- [ ] Le plan de design a été écrit avant le code, et n'est pas générique.
- [ ] Deux polices appariées, avec repli réel.
- [ ] Toutes les couleurs déclarées dans `:root` nu, les deux thèmes traités.
- [ ] `body` a un fond explicite.
- [ ] Capture téléphone et capture PC regardées.
- [ ] Aucun débordement horizontal.
- [ ] Contenu réel, aucun texte de remplissage.
- [ ] Chaque chiffre est vrai, ou marqué « pas encore mesuré ».
- [ ] Aucun secret dans la page.
- [ ] `journal.md` complété si quelque chose a raté.

## Comment cette compétence s'améliore

Après chaque usage, si quelque chose a raté — un défaut visible, une remarque
de la personne, une correction demandée — ajouter dans `journal.md` :

```markdown
## AAAA-MM-JJ — titre en une phrase
**Ce qui a raté :** …
**Pourquoi :** …
**Règle ajoutée :** …
```

Trois occurrences de la même entrée font monter la règle dans « Pièges déjà
payés », après accord explicite de la personne — jamais en silence.

Application spécialisée de cette compétence : `manuel-agence`.
Voir aussi `~/cerveau/300-RESSOURCES/apprentissage-continu.md`.
