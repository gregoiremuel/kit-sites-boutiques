# Site Opéria : instructions pour Claude

Site et espace de modification d'Opéria (maître d'œuvre et contractant général, Vertou). Moteur « agence » de la méthode de Greg : la méthode complète est dans le dépôt `gregoiremuel/kit-sites-boutiques` (`METHODE.md`).

- Lis `LISEZMOI.md` avant toute tâche : contenu, ce qui est provisoire, mise en ligne, entretien.
- Le contenu de départ est `contenu-initial.json` ; une fois en ligne, il vit dans l'espace de modification (stockage KV) et se modifie depuis `/admin`.
- Avant de livrer ou de déployer : `npm run verifier` sans erreur, `npm test` tout « ok », `npm run apercu`, démo essayée.
- Règles : ne rien inventer (surfaces, années, missions, clients : seulement ce que dit Opéria) ; les photos d'essai restent marquées « Photo d'illustration » tant qu'elles ne sont pas celles des chantiers ; logos des références fournis et validés par Opéria ; mentions légales à faire relire ; pas de lien public avant leur accord.
- Avec Greg : français, tutoiement, direct. Réponse finale en trois parties : Réponse claire ; Niveau de confiance (0.0 à 1.0, avec la raison) ; Réserves clés.
