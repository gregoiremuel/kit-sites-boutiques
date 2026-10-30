// Captures d'écran d'une page, par tranches de la hauteur de la fenêtre, pour les regarder une à une (bureau 1440 px ou téléphone 390 px).
// Usage : node outils/captures.mjs http://127.0.0.1:8788/expertises 1440 sortie/offres [6]   → sortie/offres-1.png, -2.png…
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const require = createRequire(import.meta.url);
let chromium;
for (const m of ['playwright', process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright', '/opt/node-tools/node_modules/playwright']) { try { ({ chromium } = require(m)); break; } catch (e) { /* suivant */ } }
if (!chromium) { console.error('Playwright introuvable.'); process.exit(1); }
const [url, largeur = '1440', prefixe = 'capture', max = '6'] = process.argv.slice(2);
if (!url) { console.error('Usage : node outils/captures.mjs <adresse> [largeur] [préfixe] [tranches]'); process.exit(1); }
mkdirSync(dirname(prefixe) || '.', { recursive: true });
const b = await chromium.launch({ args: process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : [] });
const mobile = +largeur < 600, vh = mobile ? 800 : 900;
const p = await b.newPage({ viewport: { width: +largeur, height: vh } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.addStyleTag({ content: '*{animation-duration:0s!important;transition-duration:0s!important}.rev{opacity:1!important;transform:none!important}' });
const H = await p.evaluate(() => document.documentElement.scrollHeight), n = Math.min(Math.ceil(H / vh), +max);
for (let i = 0; i < n; i++) { await p.evaluate((y) => scrollTo(0, y), i * vh); await p.waitForTimeout(250); await p.screenshot({ path: `${prefixe}-${i + 1}.png` }); }
console.log(`${url} : ${H} px de haut, ${n} tranche(s)`);
await b.close();
