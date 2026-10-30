// Serveur « pire cas » (skill break-ui) : le contenu du site avec des textes démesurés et des mots sans espace, pour voir ce qui casse.
// Usage : node outils/pire-cas.mjs <dossier d'un site du moteur agence> [port]   puis   node outils/controle-visuel.mjs http://127.0.0.1:8801
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const racine = resolve(process.argv[2] || '.') + '/', port = +(process.argv[3] || 8801);
const { rendrePage } = await import(pathToFileURL(join(racine, 'public/assets/rendu.js')).href);
const C = JSON.parse(readFileSync(join(racine, 'contenu-initial.json'), 'utf8'));
const long = 'Établissement Dupont-Lefèvre-Montmorency et fils, spécialistes de la rénovation de menuiseries anciennes en bois massif ';
const mot = 'Anticonstitutionnellementdeuxfoisplusgrandqueprévu';
const GARDER = /^(libelles|id|photo|photo_.*|logo|lien|url|demo|theme|reglages|gabarit|etiquette|secteur|realisation|date|actif|visible|recommande|liste|cle.*|email|telephone|code_postal|redirections|seo)$/;
const gonfler = (o, d = 0) => (typeof o === 'string' ? (/^(\/|https?:|#|tel:)/.test(o) || o.length < 3 ? o : (d % 2 ? long + o : o + ' ' + mot))
  : Array.isArray(o) ? o.map((x) => gonfler(x, d + 1))
    : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, GARDER.test(k) ? v : gonfler(v, d + 1)])) : o);
const P = gonfler(C); P.theme = C.theme; P.reglages = C.reglages; P.libelles = C.libelles; if (P.contact) P.contact.cle_web3forms = '';
const types = { '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
createServer((q, s) => {
  const u = new URL(q.url, 'http://x'), f = join(racine, 'public', decodeURIComponent(u.pathname));
  if (u.pathname !== '/' && existsSync(f) && statSync(f).isFile()) { s.writeHead(200, { 'Content-Type': types[extname(f)] || 'application/octet-stream' }); return s.end(readFileSync(f)); }
  const r = rendrePage(P, u.pathname + u.search, { maquette: false }); s.writeHead(r.statut, { 'Content-Type': 'text/html; charset=utf-8' }); s.end(r.html);
}).listen(port, '127.0.0.1', () => console.log(`Pire cas sur http://127.0.0.1:${port} (Ctrl-C pour arrêter)`));
