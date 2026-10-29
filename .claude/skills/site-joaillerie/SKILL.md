---
name: site-joaillerie
description: Use when creating the jewelry website of Grégoire Muel (Atelier Muel) or any new shop site from the kit: choices, tools, pitfalls and checks learned on the agency site (28-29 October 2026).
---
## Départ
Lire `METHODE.md` (parties 2, 3 et 4, version 15). Nouveau site = nouveau contenu dans le modèle **catalogue** (`modeles/maison-tcheskiss`), jamais un nouveau moteur. Identité propre : couleur, polices, mise en page et formes différentes de tous les sites déjà faits (registre des styles, `METHODE.md` partie 3) ; si deux captures côte à côte se confondent, on recommence.

## À décider avec Greg avant de coder (ne rien inventer)
Nom commercial et nom de domaine (`ateliermuel.fr`, marque INPI classe 14 : 190 €) ; activité ajoutée à la même EI ou société ; compte bancaire dédié dès le début ; BIC (vente de biens), TVA, chambre de métiers ; métaux précieux : douane, poinçon de maître ; rétractation en vente à distance (14 jours) et conditions de retour ; livraison et assurance ; garantie. Tout cela est « à vérifier » tant que Greg ne l'a pas confirmé. Ne pas citer son employeur ni la Maison Tcheskiss.

## Contenu et images
Photos réelles des pièces (réduites, sans GPS) ; aucune photo de banque d'images présentée comme une pièce ; démonstrations étiquetées ; prix en « à valider ». Pas de faux avis, pas de faux chiffre.

## Outils
`npm run verifier`, `npm test`, `npm run accessibilite`, `npm run apercu`, `npm run rendu <adresse>` (agence), `npm run dimensions`, détection Impeccable (`DO_NOT_TRACK=1 npx impeccable detect <adresse>`, jamais `install`). Skills locaux : `no-ai-slop` (Unslop UI), `web-design-guidelines` (Vercel), `revue-site-pro`. Écartés : Design Stack (lourd, doublon avec Playwright et axe-core).

## Méthode de test
Serveur jetable avec mot de passe connu ; quatre sous-agents Haiku en parallèle (visiteur, admin, démonstrations, commandes) ; ne croire que ce qui est constaté ; essai à 412 px ; titres mobiles : 28 px (accueil), 26 (pages), 20 (rubriques), 17 (sous-titres).

## Pièges
`pkill -f "[w]rangler"` ; Chromium en root : `--no-sandbox` ; KV garde son contenu : saisir dans `/admin` ; clé facultative : `FACULTATIVES`, pas `FORME` ; refaire les démonstrations avec `npm run demos` ; `git checkout -B` après un commit : `git reflog`.

## Fin
Branche de travail, demande de fusion, fusion dans `main` ; `MAQUETTE` reste « oui » tant que TVA, nom commercial, domaine et mentions ne sont pas décidés. Réponse en trois parties : Réponse claire, Niveau de confiance, Réserves clés.
