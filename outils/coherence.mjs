// Cohérence des coordonnées (nom, téléphone, adresse) entre la fiche Google copiée et les pages où le commerce apparaît :
// son site, ses réseaux, un annuaire. Une différence de numéro ou d'adresse affaiblit la fiche (METHODE.md, partie 3).
// Aucune dépendance.
//
//   node outils/coherence.mjs <fiche.txt> <page.html | https://adresse> [autre page …]
//
// Les adresses https:// sont lues en ligne (pages publiques seulement) ; les fichiers sont lus tels quels (demonstration.html, page enregistrée).
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extraireFaits } from './fabrique-maquette.mjs';

const sansAccents = (s) => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const texteDe = (html) => String(html).replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/[  ]/g, ' ').replace(/\s+/g, ' ');

export function comparer(faits, html) {
  const t = texteDe(html), chiffres = t.replace(/\D/g, ''), bas = sansAccents(t);
  const liensTel = [...String(html).matchAll(/href="tel:([^"]+)"/g)].map((m) => m[1].replace(/\D/g, '').replace(/^33/, '0'));
  const res = [];
  if (faits.telephone) {
    const vu = chiffres.includes(faits.telephone) || chiffres.includes('33' + faits.telephone.slice(1)) || liensTel.includes(faits.telephone);
    const autres = [...new Set((t.match(/(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}/g) || []).map((x) => x.replace(/\D/g, '').replace(/^33/, '0')))].filter((x) => x !== faits.telephone);
    res.push({ point: 'Téléphone', ok: vu, detail: vu ? faits.telephone : `${faits.telephone} absent${autres.length ? ` ; numéro(s) trouvé(s) : ${autres.join(', ')}` : ''}` });
    if (vu && autres.length) res.push({ point: 'Autre numéro', ok: false, detail: `la page affiche aussi ${autres.join(', ')} : est-ce voulu ?` });
  }
  if (faits.code_postal) res.push({ point: 'Code postal', ok: t.includes(faits.code_postal), detail: faits.code_postal });
  if (faits.adresse) {
    const rue = sansAccents(faits.adresse.split(/\b\d{5}\b/)[0]).split(/[^a-z0-9]+/).filter((m) => m.length > 2 || /^\d+$/.test(m));
    const absents = rue.filter((m) => !bas.includes(m));
    res.push({ point: 'Adresse', ok: !absents.length, detail: absents.length ? `mots absents : ${absents.join(', ')}` : faits.adresse });
  }
  if (faits.nom) {
    const mots = sansAccents(faits.nom).split(/[^a-z0-9]+/).filter((m) => m.length > 2);
    const absents = mots.filter((m) => !bas.includes(m));
    res.push({ point: 'Nom', ok: absents.length <= Math.floor(mots.length / 3), detail: absents.length ? `mots absents : ${absents.join(', ')}` : faits.nom });
  }
  return res;
}

async function lire(source) {
  if (/^https?:\/\//.test(source)) {
    const r = await fetch(source, { headers: { 'User-Agent': 'Mozilla/5.0 (verification de coherence)' }, signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(`${source} répond ${r.status}`);
    return r.text();
  }
  if (!existsSync(source)) throw new Error(`fichier introuvable : ${source}`);
  return readFileSync(source, 'utf8');
}

async function principal() {
  const [fiche, ...sources] = process.argv.slice(2);
  if (!fiche || !sources.length) { console.log('Usage : node outils/coherence.mjs <fiche.txt> <page.html | https://…> [autres]'); process.exit(1); }
  const faits = extraireFaits(readFileSync(fiche, 'utf8'));
  console.log(`Fiche : ${faits.nom} · ${faits.telephone || 'pas de téléphone'} · ${faits.adresse || 'pas d’adresse'}\n`);
  let ecarts = 0;
  for (const s of sources) {
    try {
      const r = comparer(faits, await lire(s));
      console.log(s);
      for (const x of r) { if (!x.ok) ecarts++; console.log(`  ${x.ok ? 'ok    ' : 'ÉCART '} ${x.point.padEnd(14)} ${x.detail}`); }
    } catch (e) { ecarts++; console.log(`${s}\n  ÉCART  illisible : ${e.message}`); }
  }
  console.log(ecarts ? `\n${ecarts} écart(s) : mêmes nom, adresse et téléphone partout, ou expliquer la différence.` : '\nCoordonnées cohérentes.');
  process.exit(ecarts ? 1 : 0);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
