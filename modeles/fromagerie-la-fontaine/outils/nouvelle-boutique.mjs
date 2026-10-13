// Crée le projet d'une nouvelle boutique à partir de ce modèle, en ne changeant que le contenu.
// Usage : node outils/nouvelle-boutique.mjs <contenu.json> [nom-du-site]
//   contenu.json  : le fichier rendu par le prompt (vérifié avant tout)
//   nom-du-site   : minuscules, chiffres et tirets (par défaut : tiré du nom de la boutique)
// Résultat : un dossier frère ../<nom-du-site>/ avec le même moteur, le nouveau contenu, et un wrangler.jsonc neuf.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifier } from './verifier.mjs';

const modele = fileURLToPath(new URL('..', import.meta.url));
const source = process.argv[2];
if (!source) { console.error('Usage : npm run nouvelle-boutique -- <contenu.json> [nom-du-site]'); process.exit(1); }
let C;
try { C = JSON.parse(readFileSync(resolve(source), 'utf8')); } catch (e) { console.error(`${source} n’est pas un JSON valide : ${e.message}`); process.exit(1); }

const { erreurs, alertes, style } = verifier(C);
if (erreurs.length) {
  console.error(`\nLe contenu a ${erreurs.length} erreur(s), rien n’a été créé :`);
  erreurs.forEach((m) => console.error('  ERREUR   ' + m));
  console.error('\nCorrigez le fichier (ou renvoyez ces lignes à l’IA qui l’a écrit), puis relancez.\n');
  process.exit(1);
}
const slug = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const nom = process.argv[3] || slug(C.boutique.nom);
if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(nom)) { console.error(`Nom de site « ${nom} » invalide : minuscules, chiffres et tirets, 3 à 40 caractères.`); process.exit(1); }
const dest = resolve(modele, '..', nom);
if (existsSync(dest)) { console.error(`Le dossier ${dest} existe déjà : choisissez un autre nom ou supprimez-le.`); process.exit(1); }

mkdirSync(dest);
for (const f of ['src', 'public', 'outils', 'prompts', 'package.json', 'package-lock.json', 'LISEZMOI.md', '.gitignore']) {
  if (existsSync(join(modele, f))) cpSync(join(modele, f), join(dest, f), { recursive: true });
}
writeFileSync(join(dest, 'contenu-initial.json'), JSON.stringify(C, null, 2) + '\n');
const pkg = JSON.parse(readFileSync(join(modele, 'package.json'), 'utf8'));
pkg.name = nom; pkg.version = '1.0.0'; pkg.description = `Site et espace boutique : ${C.boutique.nom} (Cloudflare Workers)`;
writeFileSync(join(dest, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
writeFileSync(join(dest, 'wrangler.jsonc'), `{
  // Site de ${C.boutique.nom.replace(/[\r\n]/g, ' ')} : Cloudflare Worker + stockage KV.
  "name": "${nom}",
  "main": "src/worker.js",
  "compatibility_date": "2026-09-01",
  "assets": { "directory": "./public", "binding": "ASSETS" },
  // Remplacer l'id par celui donné par : npx wrangler kv namespace create CONTENU
  "kv_namespaces": [{ "binding": "CONTENU", "id": "A_REMPLACER" }],
  // "oui" tant que la boutique n'a pas validé : bandeau de proposition, demandes en démonstration.
  "vars": { "MAQUETTE": "oui" }
  // Après l'achat du domaine (zone ajoutée sur Cloudflare) :
  // "routes": [{ "pattern": "nomdedomaine.fr", "custom_domain": true }]
}
`);
console.log(`\nProjet créé : ${dest}`);
console.log(`\nStyle : ${style}\n(à coller dans tes notes pour la prochaine boutique du quartier, pour qu'elle ne lui ressemble pas)`);
if (alertes.length) { console.log(`\n${alertes.length} alerte(s) à regarder :`); alertes.forEach((m) => console.log('  ALERTE   ' + m)); }
console.log(`\nEnsuite, dans ce dossier :\n  npm install\n  npm run apercu      (le fichier demonstration.html)\n  npm test            (le vrai serveur, testé sur cet ordinateur)\n`);
