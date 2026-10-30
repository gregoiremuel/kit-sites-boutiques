// Chasse aux défauts d'affichage sur un site lancé en local (page par page, 1440, 768 et 390 px) :
//   - éléments qui se chevauchent sans lien de parenté (une étiquette sur un titre, un bouton sur un texte)
//   - texte coupé, éléments hors de l'écran, débordement horizontal de la page
//   - frères d'une rangée dont les hauts ne sont pas alignés (cartes décalées, téléphones à des hauteurs différentes)
//   - images cassées
// Usage : node outils/controle-visuel.mjs http://127.0.0.1:8788 [/,/offres,/contact]   (par défaut : les pages du plan du site)
// Demande Playwright (déjà là dans l'espace de Claude ; sinon « npm i -D playwright »). Complète `npm run accessibilite` et `inspect.mjs` de Taste.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
for (const m of ['playwright', process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright', '/opt/node-tools/node_modules/playwright']) { try { ({ chromium } = require(m)); break; } catch (e) { /* suivant */ } }
if (!chromium) { console.error('Playwright introuvable : « npm i -D playwright » puis « npx playwright install chromium ».'); process.exit(1); }
const base = (process.argv[2] || 'http://127.0.0.1:8788').replace(/\/$/, '');
let pages = process.argv[3] ? process.argv[3].split(',') : null;
const b = await chromium.launch({ args: process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : [] });
if (!pages) { const p = await b.newPage(); const r = await p.goto(base + '/sitemap.xml').catch(() => null); const t = r ? await r.text() : ''; pages = [...t.matchAll(/<loc>[^<]*?(\/[^<]*)<\/loc>/g)].map((m) => m[1]).filter((x) => !x.includes('?')); if (!pages.length) pages = ['/']; await p.close(); }
let total = 0;
for (const w of [1440, 768, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  for (const chemin of pages) {
    await p.goto(base + chemin, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: '*{animation:none!important;transition:none!important}.rev{transform:none!important}' });
    await p.waitForTimeout(200);
    const r = await p.evaluate(() => {
      const out = [];
      const vis = (e) => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return c.display !== 'none' && c.visibility !== 'hidden' && r.width > 1 && r.height > 1 && !e.closest('[hidden],.volet,details:not([open]) > :not(summary)'); };
      const desc = (e) => e.tagName.toLowerCase() + (e.className && e.className.baseVal === undefined ? '.' + String(e.className).trim().split(/\s+/).slice(0, 2).join('.') : '') + ':' + (e.textContent || e.alt || '').trim().slice(0, 24).replace(/\s+/g, ' ');
      const cand = [...document.querySelectorAll('a,button,img,h1,h2,h3,p,li,.etiq,.illus,.btn,label,input,select,textarea,small,b,time')].filter(vis).filter((e) => !(e.tagName === 'LI' && e.querySelector('a,p,h3,img')) && !(e.tagName === 'A' && e.querySelector('img,h3,p,.etiq')) && !(e.tagName === 'P' && e.querySelector('a,b,small')));
      for (let i = 0; i < cand.length; i++) for (let j = i + 1; j < cand.length; j++) {
        const a = cand[i], c = cand[j]; if (a.contains(c) || c.contains(a)) continue;
        if (a.tagName === 'IMG' && c.tagName === 'IMG') continue;
        if (getComputedStyle(a).position === 'fixed' || getComputedStyle(c).position === 'fixed') continue;
        const x = a.getBoundingClientRect(), y = c.getBoundingClientRect();
        const ix = Math.min(x.right, y.right) - Math.max(x.left, y.left), iy = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
        if (ix > 3 && iy > 3 && ix * iy > 40) out.push('CHEVAUCHE ' + desc(a) + ' × ' + desc(c) + ' (' + Math.round(ix) + 'x' + Math.round(iy) + ')');
      }
      for (const e of document.querySelectorAll('h1,h2,h3,p,li,a,button,span,b,summary')) {
        if (!vis(e) || e.classList.contains('skip')) continue; const c = getComputedStyle(e); if (c.display === 'inline') continue;
        if (e.scrollWidth > e.clientWidth + 2 && c.overflowX !== 'visible' && (e.textContent || '').trim()) out.push('COUPE-X ' + desc(e));
        const r = e.getBoundingClientRect(); if (r.right > innerWidth + 1 || r.left < -1) out.push('HORS-ECRAN ' + desc(e) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
      }
      for (const c of document.querySelectorAll('ul,ol,div,nav,section')) {
        if (c.closest('header,.volet,footer') || c.children.length < 2 || c.children.length > 8) continue;
        const cs = getComputedStyle(c); if (!(cs.display === 'grid' || cs.display === 'flex') || cs.flexDirection === 'column') continue;
        const kids = [...c.children].filter(vis); if (kids.length < 2) continue;
        if (kids.some((k) => /^(DT|DD)$/.test(k.tagName)) || c.tagName === 'DL' || c.closest('dl')) continue;
        const rows = {}; kids.forEach((k) => { const r = k.getBoundingClientRect(); (rows[Math.round(r.top / 40)] = rows[Math.round(r.top / 40)] || []).push([r.top, r.bottom]); });
        for (const g of Object.values(rows)) { if (g.length < 2) continue; const tops = g.map((x) => Math.round(x[0])), bots = g.map((x) => Math.round(x[1])); if (Math.max(...tops) - Math.min(...tops) > 2 && Math.max(...bots) - Math.min(...bots) > 2) out.push('RANGEE-DECALEE ' + desc(c) + ' hauts=' + tops.join(',')); }
      }
      for (const im of document.images) if (vis(im) && im.complete && im.naturalWidth === 0) out.push('IMAGE-CASSEE ' + (im.getAttribute('src') || '').slice(-40));
      if (document.documentElement.scrollWidth > innerWidth + 1) out.push('DEBORD-PAGE ' + (document.documentElement.scrollWidth - innerWidth) + ' px');
      return [...new Set(out)];
    });
    if (r.length) { total += r.length; console.log(`[${w}] ${chemin}\n   ` + r.slice(0, 14).join('\n   ')); }
  }
  await p.close();
}
await b.close();
console.log(total ? `\n${total} point(s) à regarder (un chevauchement voulu, comme un texte posé sur une photo, est normal).` : '\nAucun défaut d’affichage détecté.');
process.exit(0);
