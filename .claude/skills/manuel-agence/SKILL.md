---
name: manuel-agence
description: Produit ou met à jour le manuel HTML de l'agence (organigramme, agents, modèles, coût en jetons, outils, accès) à partir de mesures réelles prises sur le serveur. À utiliser dès qu'on demande un tableau de bord, un manuel, une page d'explication du système, ou après tout changement d'architecture. Contient son propre journal d'amélioration à lire avant de commencer.
---

# Manuel de l'agence

## Quand l'utiliser

- Quelqu'un demande une page qui explique le système, un tableau de bord, un manuel.
- Un service, un agent, un plugin ou un modèle a changé : le manuel est périmé.
- Une leçon du journal (`~/cerveau/400-LECONS/`) contredit ce que dit le manuel.

**Ne pas l'utiliser** pour un site client : ce manuel décrit l'agence elle-même.

## Avant toute chose

**Lis `journal.md`, à côté de ce fichier.** Il contient ce que les versions
précédentes ont raté. C'est ce qui rend cette compétence meilleure à chaque
usage plutôt que constante.

## Procédure

### 1. Mesurer — jamais réciter

Aucun chiffre ne s'écrit sans avoir été relevé dans la même session :

```bash
claude plugin list                       # plugins et leur état réel
claude plugin details <nom> | head -3    # ligne "Always-on:" = jetons par session
free -m                                  # mémoire libre
docker stats --no-stream                 # mémoire par service
docker exec atelier env | grep -cE 'TELEGRAM|GEMINI'   # doit rendre 0
curl -s https://api.github.com/repos/<owner>/<nom> | grep stargazers_count
```

Un chiffre qu'on ne peut pas mesurer s'écrit **« pas encore mesuré »**. Jamais
une valeur plausible.

### 2. Structurer en chapitres numérotés

La numérotation encode une progression réelle (comprendre → maîtriser →
utiliser), pas une décoration. Chaque chapitre s'ouvre par un encart
**« En bref »** de trois lignes maximum, avant tout détail.

### 3. Écrire pour quelqu'un qui ne connaît rien

- Aucun terme technique sans définition à sa première apparition.
- Un glossaire complet en fin de document.
- Jamais « il suffit de » ni « simplement » : si c'était simple, on ne
  l'expliquerait pas.
- Le détail va dans des dépliants, pour que la page reste lisible d'un trait.

### 4. Faire signifier la couleur

Deux couleurs sémantiques, jamais décoratives : une pour « gratuit », une pour
« consomme le quota ». Le lecteur doit pouvoir lire la page en diagonale et
comprendre où part l'argent.

### 5. Vérifier au navigateur réel

```bash
docker cp page.html atelier:/tmp/page.html
docker exec atelier npx --yes playwright@latest screenshot \
  --viewport-size=390,844 --full-page file:///tmp/page.html /tmp/tel.png
```

Regarder la capture téléphone **et** la capture PC. Une page qui déborde
horizontalement sur téléphone est une page ratée.

## Pièges

1. **Un chiffre animé depuis zéro est un chiffre faux.** Le vrai nombre est
   dans le HTML dès le chargement ; l'animation n'accompagne que sa largeur.
   Une capture prise trop tôt doit montrer la bonne valeur.
2. **Jamais un mot de passe, une clé ou un jeton dans la page** — seulement
   l'emplacement du fichier qui les contient. La page doit rester partageable.
3. **Les étoiles GitHub mesurent la popularité, pas la qualité.** Les citer
   sans les vérifier par l'API est une faute déjà commise.
4. **Toute couleur se définit dans `:root` nu** avant d'être redéfinie sous
   `@media (prefers-color-scheme: dark)` et `:root[data-theme="dark"]`. Une
   couleur définie uniquement sous media ne s'applique jamais en mode système.
5. **Échapper `<` et `>` dans les blocs de code** (`&lt;` / `&gt;`), sinon le
   navigateur les lit comme des balises et le contenu disparaît.
6. **Distinguer ce qui marche de ce qui est prévu.** Un manuel qui présente un
   projet comme un fait est pire qu'aucun manuel. Prévoir un chapitre final
   « ce qui n'est pas encore vrai ».

## Vérification

Avant de rendre la main, cocher :

- [ ] Chaque chiffre a été mesuré dans cette session.
- [ ] Chaque chapitre commence par « En bref ».
- [ ] Chaque terme technique est défini à sa première apparition et au glossaire.
- [ ] Aucun secret dans la page (`grep -iE "password|token|api.?key"`).
- [ ] Capture téléphone ET PC regardées, aucun débordement horizontal.
- [ ] Mode clair et mode sombre tous deux définis en variables.
- [ ] Un chapitre sépare honnêtement le fait du projet.
- [ ] `journal.md` mis à jour si quelque chose a raté (voir ci-dessous).

## Comment cette compétence s'améliore

À la fin de chaque usage, si quelque chose a raté — un chiffre faux, un
débordement, une explication incomprise, une remarque de la personne —
**ajouter une entrée dans `journal.md`** au format :

```markdown
## AAAA-MM-JJ — titre en une phrase
**Ce qui a raté :** …
**Pourquoi :** …
**Règle ajoutée :** …
```

Quand une même entrée revient **trois fois**, la promouvoir en règle
permanente dans la section « Pièges » ci-dessus, et le signaler à la personne
avant de l'activer — jamais en silence.

Voir aussi `~/cerveau/300-RESSOURCES/apprentissage-continu.md`.
