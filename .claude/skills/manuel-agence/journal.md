# Journal d'amélioration — manuel-agence

> À lire AVANT chaque usage de la compétence. À compléter APRÈS, si quelque
> chose a raté. Trois occurrences d'une même entrée → la règle monte dans la
> section « Pièges » du `SKILL.md`, après accord de la personne.

## 2026-09-08 — première version

**Ce qui a raté :** rien encore — cette entrée existe pour poser le format.

**Ce qui a été appris en construisant la première version :**

1. Une vérification écrite trop vite peut accuser à tort. Le premier contrôle
   des liens du coffre signalait 16 liens cassés : c'était le vérificateur qui
   lisait mal la syntaxe `[[fiche\|titre]]`, valide dans un tableau Obsidian.
   **Règle : quand un contrôle échoue en masse, soupçonner le contrôle avant
   de soupçonner le contenu.**

2. Un test mal construit donne une réponse fausse avec assurance. Le premier
   essai de chargement d'ECC concluait « plugin non chargé » — les outils
   avaient été restreints à `Read,Glob`, donc les agents du plugin ne
   pouvaient de toute façon pas apparaître. **Règle : avant de conclure à une
   absence, vérifier que le test pouvait constater une présence.**

3. Le coût réel d'un outil n'est jamais celui annoncé. Mesurer d'abord.

## 2026-09-08 — le manuel décrivait une architecture qui n'existait pas

**Ce qui a raté :** le manuel annonçait deux robots Telegram. Il y en avait trois,
et le plus utilisé (1 128 messages en cinq jours) n'était mentionné nulle part —
ni dans la page, ni dans `agence/ETAT.md`. La page était juste sur tous ses
chiffres mesurables et fausse sur sa carte du système.

**Pourquoi :** la procédure fait mesurer les *quantités* (mémoire, jetons, tests,
étoiles) mais ne fait jamais vérifier l'*inventaire* : quels processus tournent
vraiment, sous quel utilisateur, hors Docker compris. `docker ps` ne montre pas
un service systemd d'un autre utilisateur.

**Règle ajoutée :** avant d'écrire l'architecture, lister les processus réels de
la machine, pas seulement les conteneurs — `ps aux`, `systemctl --user` pour
chaque utilisateur du système, et les connexions sortantes établies. Un service
absent de `docker ps` n'est pas un service absent.

## 2026-09-08 — deux pièges d'outillage, sans conséquence sur la page

**Ce qui a raté :** (1) `docker cp tests conteneur:/app/tests` crée
`/app/tests/tests` quand la cible existe déjà — les tests ont semblé disparaître.
(2) Un contrôle des ancres du sommaire a signalé deux liens cassés : c'était le
contrôle qui ne reconnaissait pas `class="chap large"`. Encore la règle n°1 de ce
journal, appliquée une deuxième fois.

**Règle ajoutée :** copier fichier par fichier vers un conteneur, jamais un
dossier vers un chemin existant. Et pour un schéma ASCII dans `<pre>`, viser
moins de 45 caractères par ligne : à 78, le bloc déborde de 638 px dans une
boîte de 316 px sur téléphone — il défile, mais il se lit mal.

## 2026-09-09 — recalculer un graphe de coffre à la main, et un chiffre à deux sens

**Ce qui a raté :** un premier essai de mise en page par attraction/répulsion
(pur Python, sans bibliothèque) a placé plusieurs fiches exactement au même
point dans un coin de la boîte — répulsion trop faible face à la gravité,
positions de départ trop regroupées. Invisible dans le JSON, visible seulement
en ouvrant la page.

**Pourquoi :** une disposition calculée doit être vérifiée comme un rendu, pas
comme des nombres. Mesurer la distance minimale entre tous les couples de
points (un script de quelques lignes) l'a révélé immédiatement ; l'œil sur une
capture l'aurait révélé aussi, mais plus tard.

**Règle ajoutée :** après tout calcul de disposition (graphe, carte, nuage de
points), vérifier la distance minimale entre points avant de considérer le
JSON bon — pas seulement "ça a tourné sans erreur".

**Second piège, sans dégât grâce à une relecture attentive :** le manuel
distinguait déjà « fiches reliées dans le graphe » (les nœuds, hors
`CLAUDE.md`) de « fiches au total » (nœuds + `CLAUDE.md`), mais ne le disait
qu'à demi — l'encart « en bref » citait le premier chiffre, la légende du
graphe citait un chiffre proche sans préciser lequel des deux. Une consigne
qui demandait « 46 fiches » (le total) a donc dû être conciliée avec la
vraie mesure du réseau (45 nœuds). **Règle ajoutée :** quand un coffre a une
fiche de règles qui n'est pas un nœud (ici `CLAUDE.md`), toujours écrire les
deux chiffres dans le même passage (« 46 fiches, dont 45 reliées par N
liens ») plutôt qu'un seul nombre ambigu.

## 2026-09-14 — le manuel décrivait un service actif qui ne l'était pas

**Ce qui a raté :** le manuel annonçait « n8n : 2 workflows actifs ». Le second,
le rapport hebdomadaire du lundi, est bien importé et a produit un vrai rapport
le 12/09 — mais il est **désactivé**. Aucun rapport n'arriverait lundi, et rien
dans le manuel ni dans `ETAT.md` ne le disait. La page était juste sur le
contenu du flux et fausse sur son état.

**Pourquoi :** la procédure faisait vérifier l'*existence* des automatisations
(le flux est-il importé ? l'API répond-elle ?) mais jamais leur *état
d'activation*. `n8n list:workflow` liste les deux sans distinguer ; il faut
`--active=true` puis `--active=false` pour voir la différence. Même famille que
l'entrée du 08/09 sur les trois robots : on mesure des quantités, on oublie de
vérifier ce qui tourne réellement.

**Règle ajoutée :** pour tout composant qui peut être installé sans être actif
(flux n8n, unité systemd, tâche cron, plugin, moteur du registre), relever
l'état d'activation séparément de l'existence, et l'écrire dans la page.
Commandes : `n8n list:workflow --active=true|false`, `systemctl is-enabled`,
`crontab -l`, `claude plugin list`, le champ `pause` du registre des moteurs.

**Deuxième leçon, sur un chiffre qu'on ne peut plus mesurer :** le coût
permanent en jetons (40 637 pour ECC, 1 804 pour le plugin agence) venait de la
ligne « Always-on » de `claude plugin details`. La version 2.1.269 du CLI ne
l'affiche plus : elle donne l'inventaire des composants, pas leur poids. Le
chiffre n'est donc plus re-vérifiable, et le plugin `agence` porte dans sa
propre description une valeur différente (~1 496). **Règle ajoutée :** quand un
chiffre déjà publié cesse d'être re-mesurable, ne pas le supprimer et ne pas le
rafraîchir en silence — le conserver avec la date de sa dernière mesure et
écrire pourquoi il ne peut plus l'être. Un écart non tranché s'écrit ; il ne se
choisit pas au hasard.

**Ce qui a bien marché :** ouvrir la base de l'atelier en lecture seule
(`sqlite3.connect('file:…?mode=ro', uri=True)`) et interroger `GET /metriques`
plutôt que recalculer les taux dans la page. Les agrégats viennent alors du
système lui-même, avec leurs bases d'échantillon (« 0 % sur base 4 ») — ce qui
force à écrire la fragilité en même temps que le chiffre.
