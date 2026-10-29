# Mise en route Google, à chaque livraison de site (environ 1 h 15)

À faire une fois, le jour où le site d'un client passe en ligne. C'est ce qui donne au site toutes ses chances d'être trouvé : sans ces étapes, Google peut mettre longtemps à le connaître. Prix : **à fixer par Greg** (compris dans le prix du site, ce qui renforce « je m'en occupe », ou en option) ; rien n'est promis sur la position dans Google.

**Principe** : tous les comptes sont **au nom du client** (domaine, Search Console, fiche Google) ; Greg y est ajouté comme utilisateur ou gestionnaire. Jamais le mot de passe du client. Les noms de boutons de Google changent : vérifier à l'écran.

## 1. Avant l'ouverture (dans le dépôt du site)
- [ ] `reglages.url` = l'adresse définitive (`https://…`) : dans la page de modification du site (Réglages) ou dans `contenu-initial.json` avant la première mise en ligne ; `MAQUETTE` = « non » dans `wrangler.jsonc`.
- [ ] `npm run verifier`, `npm test`, `npm run referencement` : 0 erreur (ce dernier existe dans les trois moteurs depuis le 29/10/2026).
- [ ] Une seule adresse ouverte aux moteurs : l'adresse provisoire `….workers.dev` fermée (réglage du Worker sur Cloudflare).
- [ ] `/robots.txt` et `/sitemap.xml` ouverts dans le navigateur ; `rel="canonical"` présent dans le code de l'accueil.

## 2. Search Console (20 min)
- [ ] search.google.com/search-console, propriété **Domaine**, avec le compte Google du client (ou le client t'ajoute ensuite comme utilisateur).
- [ ] Validation par un enregistrement DNS ajouté dans Cloudflare.
- [ ] Envoi du plan du site : `https://<domaine>/sitemap.xml`.
- [ ] « Inspection de l'URL » de l'accueil, puis « Demander l'indexation ».
- [ ] Test des résultats enrichis (search.google.com/test/rich-results) sur l'accueil : les données structurées sont lues.

## 3. Fiche d'établissement Google (30 min)
- [ ] Le client crée ou récupère sa fiche (business.google.com) et **t'ajoute comme gestionnaire**.
- [ ] Catégorie principale la plus précise, catégories secondaires utiles ; zone de service pour un artisan qui se déplace.
- [ ] Nom réel (sans mots-clés ajoutés : c'est contraire aux règles de Google), téléphone, horaires, **jours fériés et congés**.
- [ ] Lien vers le site ; description courte (ce qu'il fait, pour qui, où) ; 5 photos du client (réduites, sans GPS).
- [ ] Premier post (validé par le client). Lien pour demander un avis, donné au client (jamais d'avis contre un avantage).

## 4. Mêmes coordonnées partout (20 min)
- [ ] Bing Webmaster Tools (import depuis Search Console) et Bing Places ; Apple Business Connect ; Pages Jaunes (fiche gratuite, ne pas payer d'option sans raison) ; réseaux du client.
- [ ] Contrôle automatique : `node outils/coherence.mjs fiche.txt https://<site> https://<page-réseau>`. `fiche.txt` = le texte de la fiche Google copié tel quel (comme pour la fabrique de maquettes, `METHODE.md` 2.2 bis). Nom, téléphone, adresse identiques ; un autre numéro est signalé.

## 5. Être compris par les assistants IA (rien en plus à vendre)
Les assistants ne publient pas leurs critères (à vérifier au fil du temps) ; ce qui les aide le plus probablement : faits clairs sur le site (horaires, zone, services, prix si le client les donne), questions fréquentes, données structurées, coordonnées cohérentes, avis récents avec réponses. Pas de texte écrit pour les robots.

## 6. Pages par service ou par quartier : oui, mais utiles
Une page par **vrai** service (« débouchage », « chauffe-eau ») ou par zone **réellement** servie, chacune avec un texte propre, des questions réelles et une preuve (photo, chantier, avis). Des pages presque identiques où seul le nom de la ville change sont des « pages satellites », que les règles anti-spam de Google visent (règles de Google, à relire) : jamais.

## 7. Le jour même et dans 3 mois
- [ ] Diagnostic de la fiche **avant** (`node outils/diagnostic-fiche.mjs`) gardé dans le dossier du client ; refait à 3 mois pour mesurer ce qui a changé (ou non).
- [ ] À 3 mois, avec l'accord écrit du client : étude de cas (avant, après, délai, phrase du client) pour ton site.
- [ ] Proposer **Visibilité Google** (39 € par mois, proposition) pour la suite : `visibilite-google/README.md`.

## Ce qu'on ne dit jamais au client
« Premier sur Google », « garanti », un nombre d'appels. On dit : « je fais ce travail, je vous le montre chaque mois ».
