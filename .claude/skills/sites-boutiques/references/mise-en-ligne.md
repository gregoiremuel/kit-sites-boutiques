# Mise en ligne

- **Depuis GitHub** : le projet Cloudflare (Workers & Pages, « Import a repository ») redéploie à chaque fusion dans `main`. Fusionner seulement quand Greg le demande ; dire ensuite « fusionné », et « en ligne » seulement si on l'a constaté (l'espace cloud de Claude ne joint ni Cloudflare ni le site en ligne).
- **Depuis l'ordinateur de Greg** : `npm install`, `npm test`, `npx wrangler login`, `npx wrangler kv namespace create CONTENU` (id dans `wrangler.jsonc`), `npm run mot-de-passe`, Secrets `ADMIN_HASH` et `SESSION_SECRET`, `npm run deploy`.
- **Mémoire du site (KV)** : une fois le site enregistré depuis `/admin`, son contenu l'emporte sur `contenu-initial.json`. Un texte changé dans le fichier n'apparaît qu'après un passage par `/admin` ; le code (style, boutons, menus) et les clés lues avec le code (`seo`, `redirections`) s'appliquent tout de suite.
- **`MAQUETTE` à « oui »** tant que rien n'est signé ou décidé (bandeau, `noindex`, formulaire en démonstration). Ouverture : domaine actif, mentions relues, puis `MAQUETTE` à « non », Search Console (propriété « Domaine »), Bing, Secrets n8n et `INDEXNOW_KEY` si utilisés.
- **Démonstration à montrer** : `npm run apercu` fabrique `demonstration.html` et `demo-en-ligne/` (un iPhone n'ouvre pas un fichier HTML : il faut un lien, seulement pour une boutique fictive ou signée).
- **Fusion** : demande de fusion de la branche de travail vers `main` dans chaque dépôt touché (site, kit), corps en français avec contenu et contrôles, puis fusion « merge ».
