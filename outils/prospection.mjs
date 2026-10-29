// Suivi de la prospection : un fichier CSV tenu à la main (une ligne par commerce), et chaque semaine les chiffres à tenir
// (script de visite, partie 5) et les relances du jour. Aucune dépendance, aucun réseau. Le vrai fichier reste sur l'ordinateur
// (prospection/*.csv est ignoré par git, sauf l'exemple imaginaire).
//
//   node outils/prospection.mjs prospection/prospects.csv [--jour AAAA-MM-JJ]
//
// Colonnes (séparateur « ; ») : date;commerce;metier;quartier;contact;statut;prochaine_date;prochaine_action;notes
// Statuts : visite, maquette, devis, signe, refus. Un refus n'est jamais relancé.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const STATUTS = ['visite', 'maquette', 'devis', 'signe', 'refus'];

export function lireCsv(texte) {
  const lignes = String(texte).replace(/\r/g, '').split('\n').filter((l) => l.trim());
  const champs = (l) => { const r = []; let c = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ';' && !q) { r.push(c); c = ''; } else c += ch; } r.push(c); return r.map((x) => x.trim()); };
  const tete = champs(lignes[0] || '');
  return lignes.slice(1).map((l, i) => { const v = champs(l); const o = Object.fromEntries(tete.map((k, j) => [k, v[j] || ''])); o.ligne = i + 2; return o; });
}

export function bilan(P, jour) {
  const erreurs = P.filter((p) => !STATUTS.includes(p.statut)).map((p) => `ligne ${p.ligne} : statut « ${p.statut} » inconnu (${STATUTS.join(', ')})`);
  const debut = new Date(jour); debut.setDate(debut.getDate() - 6);
  const semaine = P.filter((p) => p.date && new Date(p.date) >= debut && p.date <= jour);
  const compte = (liste, s) => liste.filter((p) => p.statut === s).length;
  const avance = (liste, rang) => liste.filter((p) => STATUTS.indexOf(p.statut) >= rang && p.statut !== 'refus').length;
  const relances = P.filter((p) => p.statut !== 'refus' && p.statut !== 'signe' && p.prochaine_date && p.prochaine_date <= jour).sort((a, b) => a.prochaine_date.localeCompare(b.prochaine_date));
  const sansSuite = P.filter((p) => !['refus', 'signe'].includes(p.statut) && !p.prochaine_date);
  return {
    erreurs, relances, sansSuite,
    semaine: { visites: semaine.length, maquettes: avance(semaine, 1), devis: avance(semaine, 2), signes: compte(semaine, 'signe'), refus: compte(semaine, 'refus') },
    total: { commerces: P.length, maquettes: avance(P, 1), devis: avance(P, 2), signes: compte(P, 'signe'), refus: compte(P, 'refus') }
  };
}

function principal() {
  const fichier = process.argv[2];
  if (!fichier) { console.log('Usage : node outils/prospection.mjs prospection/prospects.csv [--jour AAAA-MM-JJ]'); process.exit(1); }
  const i = process.argv.indexOf('--jour');
  const jour = i > 0 ? process.argv[i + 1] : new Date().toISOString().slice(0, 10);
  const b = bilan(lireCsv(readFileSync(fichier, 'utf8')), jour);
  if (b.erreurs.length) console.log('À corriger :\n- ' + b.erreurs.join('\n- ') + '\n');
  const s = b.semaine, t = b.total;
  console.log(`Semaine jusqu'au ${jour} : ${s.visites} visite(s) ; parmi elles, ${s.maquettes} ont vu une maquette, ${s.devis} ont reçu un devis, ${s.signes} ont signé, ${s.refus} ont refusé.`);
  console.log(`Depuis le début : ${t.commerces} commerces, ${t.maquettes} maquettes, ${t.devis} devis, ${t.signes} signés${t.commerces ? ` (${Math.round((100 * t.signes) / t.commerces)} % des visites)` : ''}, ${t.refus} refus.\n`);
  console.log(b.relances.length ? 'À faire aujourd’hui ou en retard :' : 'Aucune relance due.');
  for (const p of b.relances) console.log(`- ${p.prochaine_date} · ${p.commerce} (${p.contact || '?'}) : ${p.prochaine_action || 'action à préciser'}`);
  if (b.sansSuite.length) console.log(`\nSans prochaine action (à décider) : ${b.sansSuite.map((p) => p.commerce).join(', ')}`);
  console.log('\nRègle : une seule relance ; un refus se note et ne se relance jamais.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
