// Fabrique de maquettes en 1 heure : de la fiche Google copiée à la démonstration à montrer sur téléphone.
// Aucune dépendance. Les dossiers de travail (maquettes/) contiennent des données de commerçants : ils ne sont jamais envoyés sur GitHub.
//
//   node outils/fabrique-maquette.mjs preparer <fiche.txt> [notes.md] [nom-du-site]
//       Crée maquettes/<nom>/ avec : fiche.txt, notes.md, faits.json (ce que la fiche dit, lu par le script) et prompt.md
//       (le prompt 1 du kit suivi de la fiche et des notes). À coller dans Claude ou GLM ; enregistrer sa réponse dans
//       maquettes/<nom>/contenu.json (la réponse entière peut être enregistrée : le bloc json est retrouvé tout seul).
//
//   node outils/fabrique-maquette.mjs construire maquettes/<nom> [--tester]
//       1. contrôle croisé : le contenu dit-il la même chose que la fiche (téléphone, adresse, horaires, note) ?
//       2. fabrique le site avec le moteur vitrine (nouvelle-boutique), le vérifie, produit demonstration.html
//       3. liste ce qu'il reste à valider avec le commerçant. --tester lance aussi « npm test » (1 à 2 minutes).
import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, symlinkSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const kit = fileURLToPath(new URL('..', import.meta.url));
const modele = join(kit, 'modeles', 'fromagerie-la-fontaine');
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const slug = (s) => String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const chiffres = (s) => String(s || '').replace(/\D/g, '');
const hhmm = (h, m) => String(h).padStart(2, '0') + ':' + m;

/* ---------- Lire ce que dit la fiche ---------- */
export function extraireFaits(texte) {
  const t = String(texte).replace(/[\u00a0\u202f\u2009]/g, ' ').replace(/\r/g, '');
  const lignes = t.split('\n').map((l) => l.trim()).filter(Boolean);
  const faits = { nom: lignes[0] || '', telephone: '', adresse: '', code_postal: '', note: '', nombre: '', site: '', lien_fiche: '', horaires: {} };
  const tel = t.match(/(?:\+33\s?|0033\s?|0)[1-9](?:[\s.-]?\d{2}){4}/);
  if (tel) faits.telephone = chiffres(tel[0]).replace(/^(?:33|0033)/, '0');
  const adr = lignes.find((l) => /\b\d{5}\b/.test(l) && !/^(tél|téléphone)/i.test(l) && l.length < 160);
  if (adr) { faits.adresse = adr.replace(/^adresse\s*:\s*/i, ''); faits.code_postal = (adr.match(/\b\d{5}\b/) || [''])[0]; }
  const avis = t.match(/(\d[,.]\d)\s*(?:\(|·|⋅|\s)\s*(\d[\d ]*)\s*(?:\)|avis)/i);
  if (avis) { faits.note = avis[1].replace('.', ','); faits.nombre = chiffres(avis[2]); }
  const site = t.match(/\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.(?:fr|com|net|org|eu|io)\b(?!\/maps)/i);
  if (site && !/google|goo\.gl|gstatic/i.test(site[0])) faits.site = site[0];
  const lien = t.match(/https:\/\/(?:maps\.app\.goo\.gl|maps\.google\.com|g\.page)\/\S+/i);
  if (lien) faits.lien_fiche = lien[0];
  for (const l of lignes) {
    const j = JOURS.find((x) => new RegExp('^' + x.slice(0, 3) + '[a-zé.]*\\b', 'i').test(l));
    if (!j) continue;
    const reste = l.replace(new RegExp('^' + j.slice(0, 3) + '[a-zé.]*\\s*[:,]?', 'i'), '');
    if (/ferm/i.test(reste) && !/\d/.test(reste)) { faits.horaires[j] = []; continue; }
    if (/24\s*h/i.test(reste)) { faits.horaires[j] = [['00:00', '23:59']]; continue; }
    const plages = [...reste.matchAll(/(\d{1,2})\s*[:h]\s*(\d{2})?\s*(?:[–—-]|à)\s*(\d{1,2})\s*[:h]\s*(\d{2})?/g)];
    if (plages.length) faits.horaires[j] = plages.map((p) => [hhmm(p[1], p[2] || '00'), p[3] === '24' ? '23:59' : hhmm(p[3], p[4] || '00')]);
  }
  return faits;
}

/* ---------- Contrôle croisé : le contenu dit-il la même chose que la fiche ? ---------- */
export function controler(C, faits) {
  const ecarts = [], infos = [];
  const B = C.boutique || {};
  if (faits.telephone && chiffres(B.telephone) !== faits.telephone) ecarts.push(`Téléphone : la fiche dit ${faits.telephone}, le contenu dit « ${B.telephone || ''} ».`);
  if (!faits.telephone) infos.push('Téléphone non trouvé dans la fiche : à demander.');
  if (faits.code_postal && !String(B.ville || '').includes(faits.code_postal)) ecarts.push(`Code postal : la fiche dit ${faits.code_postal}, le contenu dit « ${B.ville || ''} ».`);
  if (faits.adresse) {
    const rue = faits.adresse.split(/\b\d{5}\b/)[0].replace(/,\s*$/, '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    const mots = rue.split(/[^a-z0-9]+/).filter((m) => m.length > 2 || /^\d+$/.test(m));
    const adr = String(B.adresse || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    const absents = mots.filter((m) => !adr.includes(m));
    if (absents.length) ecarts.push(`Adresse : la fiche dit « ${faits.adresse} », le contenu dit « ${B.adresse || ''} » (manque : ${absents.join(', ')}).`);
  }
  const H = C.horaires || {};
  const jours = Object.keys(faits.horaires);
  if (!jours.length) infos.push('Aucun horaire lu dans la fiche (dépliez les horaires avant de copier).');
  for (const j of jours) {
    const a = JSON.stringify(faits.horaires[j]), b = JSON.stringify(H[j] || []);
    if (a !== b) ecarts.push(`Horaires du ${j} : la fiche dit ${a}, le contenu dit ${b}.`);
  }
  if (jours.length && jours.length < 7) infos.push(`Horaires lus pour ${jours.length} jour(s) sur 7 : vérifier les autres à la main.`);
  const A = C.avis || {};
  if (faits.note && A.note && A.note !== faits.note) ecarts.push(`Note : la fiche dit ${faits.note}, le contenu dit ${A.note}.`);
  if (faits.nombre && A.nombre && chiffres(A.nombre) !== faits.nombre) ecarts.push(`Nombre d’avis : la fiche dit ${faits.nombre}, le contenu dit ${A.nombre}.`);
  if (!faits.note && A.note) ecarts.push('Le contenu affiche une note Google que la fiche collée ne contient pas : à retirer ou à vérifier.');
  if (faits.site) infos.push(`La fiche indique un site (${faits.site}) : c’est donc une refonte, à dire au commerçant.`);
  return { ecarts, infos };
}

/* ---------- Le bloc json d'une réponse d'IA ---------- */
export function extraireJson(texte) {
  const t = String(texte);
  const blocs = [...t.matchAll(/```(?:json)?\s*\n([\s\S]*?)```/g)].map((m) => m[1]).filter((b) => b.trim().startsWith('{'));
  const candidats = blocs.length ? blocs : [t];
  const gros = candidats.sort((a, b) => b.length - a.length)[0];
  return JSON.parse(gros);
}

const lancer = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: 'utf8' });

function preparer(fiche, notes, nomForce) {
  if (!fiche || !existsSync(fiche)) { console.error('Usage : node outils/fabrique-maquette.mjs preparer <fiche.txt> [notes.md] [nom-du-site]'); process.exit(1); }
  const texteFiche = readFileSync(fiche, 'utf8');
  const faits = extraireFaits(texteFiche);
  const nom = nomForce || slug(faits.nom);
  if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(nom)) { console.error(`Nom de site « ${nom} » invalide : donnez-en un en troisième argument (minuscules, chiffres, tirets).`); process.exit(1); }
  const dossier = join(kit, 'maquettes', nom);
  mkdirSync(dossier, { recursive: true });
  const texteNotes = notes && existsSync(notes) ? readFileSync(notes, 'utf8') : '(aucune note)';
  writeFileSync(join(dossier, 'fiche.txt'), texteFiche);
  writeFileSync(join(dossier, 'notes.md'), texteNotes);
  writeFileSync(join(dossier, 'faits.json'), JSON.stringify(faits, null, 2) + '\n');
  const prompt = readFileSync(join(kit, 'prompts', '1-site-et-espace-boutique.md'), 'utf8');
  writeFileSync(join(dossier, 'prompt.md'), `${prompt}\n\n---\n\n# [FICHE]\n\n${texteFiche}\n\n# [NOTES]\n\n${texteNotes}\n\n# [PHOTOS]\n\naucune\n\n# [SOURCES]\n\naucune\n`);
  console.log(`\nDossier prêt : ${dossier}\n\nCe que la fiche dit (lu par le script) :`);
  console.log(`  nom        ${faits.nom}\n  téléphone  ${faits.telephone || '(non trouvé)'}\n  adresse    ${faits.adresse || '(non trouvée)'}\n  note       ${faits.note ? faits.note + ' (' + faits.nombre + ' avis)' : '(non trouvée)'}\n  horaires   ${Object.keys(faits.horaires).length} jour(s) lu(s)${faits.site ? '\n  site       ' + faits.site + ' (refonte)' : ''}`);
  console.log(`\nÉtapes suivantes :\n  1. Coller prompt.md dans Claude ou GLM (joindre les photos du commerçant si elles existent).\n  2. Enregistrer sa réponse dans ${join(dossier, 'contenu.json')} (la réponse entière suffit).\n  3. node outils/fabrique-maquette.mjs construire maquettes/${nom}\n`);
}

function construire(dossier, tester) {
  if (!dossier || !existsSync(join(dossier, 'contenu.json'))) { console.error('Usage : node outils/fabrique-maquette.mjs construire maquettes/<nom> [--tester]  (contenu.json attendu dans le dossier)'); process.exit(1); }
  dossier = resolve(dossier);
  const nom = basename(dossier);
  let C;
  try { C = extraireJson(readFileSync(join(dossier, 'contenu.json'), 'utf8')); } catch (e) { console.error(`contenu.json ne contient pas de JSON lisible : ${e.message}`); process.exit(1); }
  writeFileSync(join(dossier, 'contenu.json'), JSON.stringify(C, null, 2) + '\n');
  const faitsFichier = join(dossier, 'faits.json');
  if (existsSync(faitsFichier)) {
    const { ecarts, infos } = controler(C, JSON.parse(readFileSync(faitsFichier, 'utf8')));
    infos.forEach((m) => console.log('  INFO     ' + m));
    ecarts.forEach((m) => console.log('  ÉCART    ' + m));
    if (ecarts.length) { console.error(`\n${ecarts.length} écart(s) entre la fiche et le contenu. Corrigez le contenu (ou renvoyez ces lignes à l’IA : « corrige uniquement ces points ») puis relancez. Rien n’a été fabriqué.\n`); process.exit(1); }
    console.log('  ok       Le contenu dit la même chose que la fiche (téléphone, adresse, horaires, note).');
  }
  const site = join(dossier, 'site');
  if (existsSync(site)) { console.error(`${site} existe déjà : supprimez-le pour refaire la maquette.`); process.exit(1); }
  const r1 = lancer('node', [join(modele, 'outils', 'nouvelle-boutique.mjs'), join(dossier, 'contenu.json'), nom], modele);
  process.stdout.write(r1.stdout || ''); process.stderr.write(r1.stderr || '');
  if (r1.status !== 0) { console.error('\nLe vérificateur du moteur refuse le contenu : renvoyez les lignes « ERREUR » à l’IA (« corrige uniquement ces points »).\n'); process.exit(1); }
  renameSync(join(kit, 'modeles', nom), site);
  symlinkSync(join(modele, 'node_modules'), join(site, 'node_modules'), 'dir');
  const r2 = lancer('npm', ['run', 'apercu'], site);
  process.stdout.write(r2.stdout || ''); process.stderr.write(r2.stderr || '');
  if (r2.status !== 0) { console.error('La démonstration n’a pas pu être fabriquée.'); process.exit(1); }
  cpSync(join(site, 'demonstration.html'), join(dossier, 'demonstration.html'));
  if (tester) {
    const r3 = lancer('npm', ['test'], site);
    const fin = (r3.stdout || '').trim().split('\n').slice(-2).join('\n');
    console.log(r3.status === 0 ? '  ok       npm test : ' + fin.split('\n').pop() : '  ÉCHEC    npm test :\n' + fin);
  }
  console.log(`\nMaquette prête.\n  Démonstration : ${join(dossier, 'demonstration.html')}\n  Site complet  : ${site}\n\nÀ faire avant de la montrer :\n  - relire la liste « à valider » rendue par l’IA et la poser au commerçant ;\n  - ouvrir demonstration.html sur un téléphone (un iPhone n’ouvre pas un fichier : demo-en-ligne/, METHODE.md 2.5) ;\n  - ne publier aucun lien au nom du commerce tant qu’il n’a pas signé.\n`);
}

const [, , commande, a, b, c] = process.argv;
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (commande === 'preparer') preparer(a && resolve(a), b && !b.startsWith('--') && existsSync(b) ? resolve(b) : '', b && !existsSync(b) ? b : c);
  else if (commande === 'construire') construire(a, process.argv.includes('--tester'));
  else { console.error('Commandes : preparer <fiche.txt> [notes.md] [nom] | construire <dossier> [--tester]. Voir METHODE.md, partie 2.2 bis.'); process.exit(1); }
}
