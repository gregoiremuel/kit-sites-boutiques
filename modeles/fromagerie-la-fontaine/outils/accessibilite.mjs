// Audit d'accessibilité du site (WCAG 2.2 niveau AA) : axe-core lancé par Playwright sur le site et les mentions légales,
// en bureau, en mobile et avec « moins d'animations », puis un parcours au clavier (anneau de focus visible sur chaque élément).
// Aucun serveur Cloudflare nécessaire : un petit serveur local rend les pages depuis le contenu.
// Usage : npm run accessibilite [fichier de contenu]     (demande Playwright : « npx playwright install chromium »)
// Les photos écrites « /photos/nom » sont lues dans photos/nom.jpg à côté du fichier de contenu (comme pour npm run apercu).
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { rendreSite, rendreMentions } from '../public/assets/rendu.js';

const racine = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
let chromium, axeSource;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright introuvable : « npm i -D playwright » puis « npx playwright install chromium ».'); process.exit(1); }
try { axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'); } catch (e) { console.error('axe-core introuvable : « npm install » dans ce dossier.'); process.exit(1); }

const fichier = resolve(process.argv[2] || join(racine, 'contenu-initial.json'));
const C = JSON.parse(readFileSync(fichier, 'utf8'));
const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const serveur = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const m = /^\/photos\/([a-z0-9-]+)$/.exec(p);
  const f = m ? ['jpg', 'png', 'webp'].map((e) => join(dirname(fichier), 'photos', m[1] + '.' + e)).find(existsSync) : join(racine, 'public', p);
  if (f && /^\/(assets|fonts|photos)\//.test(p) && existsSync(f) && statSync(f).isFile()) { res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f)); return; }
  const html = p === '/mentions-legales' ? rendreMentions(C, {}) : rendreSite(C, { maquette: true, lienAdmin: '/admin/' });
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html);
});
await new Promise((ok) => serveur.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${serveur.address().port}`;

const MODES = [['bureau', { viewport: { width: 1280, height: 900 } }], ['mobile', { viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true }], ['moins d’animations', { viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' }]];
const navigateur = await chromium.launch();
let problemes = 0;
for (const route of ['/', '/mentions-legales']) {
  for (const [mode, opts] of MODES) {
    const ctx = await navigateur.newContext(opts);
    const page = await ctx.newPage();
    await page.goto(base + route); await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelectorAll('.rev').forEach((e) => e.classList.add('vu')));
    await page.waitForTimeout(1600);
    await page.addScriptTag({ content: axeSource });
    const v = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } })).violations
      .map((x) => `${x.id} (${x.impact}) ×${x.nodes.length} : ${x.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' ; ')}`));
    const sortDuCadre = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    const cachees = mode === 'moins d’animations' ? await page.evaluate(() => [...document.querySelectorAll('.rev')].filter((e) => getComputedStyle(e).opacity < 0.99).length) : 0;
    const liste = [...v, ...(sortDuCadre ? ['défilement horizontal : la page déborde de l’écran'] : []), ...(cachees ? [`${cachees} élément(s) encore cachés alors que le visiteur demande moins d’animations`] : [])];
    problemes += liste.length;
    console.log(`${liste.length ? 'À CORRIGER' : 'ok        '} ${route} · ${mode}${liste.length ? '\n    ' + liste.join('\n    ') : ''}`);
    if (mode === 'bureau' && route === '/') {
      const sans = [];
      for (let i = 0; i < 90; i++) {
        await page.keyboard.press('Tab');
        const r = await page.evaluate(() => {
          const e = document.activeElement; if (!e || e === document.body || e.getBoundingClientRect().width === 0 || e.type === 'date') return null;
          const c = getComputedStyle(e); return { ok: (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 2) || c.boxShadow !== 'none', nom: (e.tagName + ' ' + (e.textContent || e.name || '').trim().slice(0, 30)) };
        });
        if (r && !r.ok) sans.push(r.nom);
      }
      problemes += sans.length;
      console.log(`${sans.length ? 'À CORRIGER' : 'ok        '} ${route} · clavier${sans.length ? ' : pas d’anneau de focus sur ' + [...new Set(sans)].join(', ') : ''}`);
    }
    await ctx.close();
  }
}
await navigateur.close(); serveur.close();
console.log(problemes ? `\n${problemes} point(s) à corriger.` : '\nAucun problème trouvé. (Un audit automatique ne remplace pas un essai au lecteur d’écran.)');
process.exit(problemes ? 1 : 0);
