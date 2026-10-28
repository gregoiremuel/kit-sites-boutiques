// Fabrique les fichiers à ouvrir sur un téléphone, sans serveur :
//   demonstration.html  LE fichier du rendez-vous : le site d'abord, puis « Essayer l'espace boutique »
//                       (démonstration : n'importe quel mot de passe, les essais restent sur le téléphone)
//   apercu-site.html    le site seul (bandeau de proposition, demandes en démonstration), si besoin
// Usage : node outils/apercu.mjs [fichier de contenu]   (par défaut : contenu-initial.json)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { rendreSite } from '../public/assets/rendu.js';
import { POLICES } from '../public/assets/polices.js';
import { verifier } from './verifier.mjs';

const ici = (f) => new URL('../' + f, import.meta.url);
const lire = (f) => readFileSync(ici(f), 'utf8');
const fichierContenu = resolve(process.argv[2] || new URL('../contenu-initial.json', import.meta.url).pathname);
const C = JSON.parse(readFileSync(fichierContenu, 'utf8'));
const { erreurs } = verifier(C);
if (erreurs.length) { console.error(`Le contenu a ${erreurs.length} erreur(s) : lancez « npm run verifier » pour les voir. Aucun fichier fabriqué.`); process.exit(1); }
/* Photos du contenu écrites « /photos/nom » : si un fichier photos/nom.jpg (ou .jpeg, .png, .webp) existe à côté du fichier de contenu,
   il est intégré à la démonstration (elle s'ouvre alors sans internet, photos comprises). */
const TYPES_PHOTO = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const integrerPhotos = (o) => {
  if (Array.isArray(o)) return o.map(integrerPhotos);
  if (o && typeof o === 'object') { for (const k of Object.keys(o)) o[k] = integrerPhotos(o[k]); return o; }
  const m = typeof o === 'string' && /^\/photos\/([a-z0-9-]+)$/.exec(o);
  if (!m) return o;
  for (const [ext, type] of Object.entries(TYPES_PHOTO)) {
    const f = join(dirname(fichierContenu), 'photos', m[1] + '.' + ext);
    if (existsSync(f)) return `data:${type};base64,` + readFileSync(f).toString('base64');
  }
  return o;
};
integrerPhotos(C);
const css = lire('public/assets/site.css');
const js = lire('public/assets/site.js');
const jeu = POLICES[(C.theme || {}).polices] || POLICES.classique;
const polices = {};
jeu.fichiers.forEach(([, , f]) => { polices[f] = 'data:font/woff2;base64,' + readFileSync(ici('public/fonts/' + f)).toString('base64'); });

writeFileSync('apercu-site.html', rendreSite(C, { maquette: true, urlPolice: (f) => polices[f], css, js, lienMentions: '#', apiCommande: '' }));

const surScript = (t) => t.replace(/<\/script/gi, '<\\/script');
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const sansExport = (t) => t.replace(/^import .*;\s*$/gm, '').replace(/^export (const|function|async function)/gm, '$1');
const sources = [lire('public/assets/polices.js'), lire('public/assets/rendu.js'), lire('public/assets/admin.js')].map(sansExport);
/* Les trois fichiers sont réunis en un seul script : deux noms identiques au premier niveau le casseraient */
const vus = new Map();
sources.forEach((src, i) => { for (const m of src.matchAll(/^(?:const|let|var|function|async function|class) ([A-Za-z_$][\w$]*)/gm)) { if (vus.has(m[1])) { console.error(`Nom « ${m[1]} » déclaré deux fois (fichiers ${vus.get(m[1])} et ${i}) : renommez-en un.`); process.exit(1); } vus.set(m[1], i); } });
const modules = sources.join('\n');
const page = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="${(C.theme || {}).couleur || '#46667f'}">
<title>${C.boutique.nom} : démonstration</title>
<style>
${lire('public/assets/admin.css')}
</style>
</head>
<body>
<div id="app"></div>
<script>window.ESPACE_DEMO = { siteDabord: true, contenu: ${json(C)}, polices: ${json(polices)}, css: ${json(css)}, js: ${json(js)} };</script>
<script type="module">
${surScript(modules)}
</script>
</body>
</html>
`;
writeFileSync('demonstration.html', page);
/* La même démonstration, prête à déposer sur Cloudflare Pages (un iPhone n'ouvre pas un fichier HTML : il lui faut un lien) */
mkdirSync('demo-en-ligne', { recursive: true });
writeFileSync('demo-en-ligne/index.html', page);
writeFileSync('demo-en-ligne/_headers', '/*\n  X-Robots-Tag: noindex, nofollow\n  Referrer-Policy: no-referrer\n');
console.log('demonstration.html, apercu-site.html et demo-en-ligne/ prêts (' + C.boutique.nom + ')');
