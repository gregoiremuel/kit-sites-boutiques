// Visibilité Google, palier 1 : de la fiche du client aux brouillons du mois et au rapport d'une page.
// Aucune dépendance. Les dossiers de travail (suivi-google/) contiennent des données de clients : jamais envoyés sur GitHub.
//
//   node outils/visibilite-google.mjs preparer <fiche.json> [--mois AAAA-MM] [--sortie dossier]
//       Sans réseau. Écrit : rapport.html (une page), prompt-posts.md et prompt-avis.md (prêts à coller dans Claude,
//       c'est le palier 0 outillé) et a-valider.md. Le rapport ne contient que les chiffres de la fiche : l'IA n'écrit aucun chiffre.
//
//   node outils/visibilite-google.mjs rediger <fiche.json> [--mois AAAA-MM] [--sortie dossier] [--modele claude-haiku-4-5]
//       Comme « preparer », puis demande les brouillons à l'API d'Anthropic (clé dans la variable ANTHROPIC_API_KEY,
//       jamais dans un fichier du dépôt) et écrit brouillons-posts.md, brouillons-avis.md et controle.md.
//       À ne lancer sur un vrai client qu'après mise à jour de l'annexe 3 du contrat de sous-traitance (Anthropic).
//
//   node outils/visibilite-google.mjs controler <brouillons.md> <fiche.json>
//       Contrôle un texte écrit à la main ou dans Claude (palier 0) : promesses, chiffres absents de la fiche, mots interdits.
//
// Rien n'est publié : tout est à valider par le client. L'API de la fiche Google n'est pas utilisée (palier 2).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const kit = fileURLToPath(new URL('..', import.meta.url));
const dossierModeles = join(kit, 'visibilite-google', 'prompts');
const MODELE_PAR_DEFAUT = 'claude-haiku-4-5';
const URL_API = 'https://api.anthropic.com/v1/messages';
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const INDICATEURS = [
  ['appels', 'Appels depuis la fiche', 'Fiche Google'],
  ['itineraires', 'Demandes d’itinéraire', 'Fiche Google'],
  ['clics_site', 'Clics vers le site depuis la fiche', 'Fiche Google'],
  ['impressions_fiche', 'Affichages de la fiche (recherche et Maps)', 'Fiche Google'],
  ['visites_site', 'Pages vues du site', 'Page de modification du site (sans cookie)']
];

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const norm = (s) => String(s).replace(/[’‘]/g, "'").replace(/[   ]/g, ' ');
const estMois = (m) => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(m));

export function nomDuMois(m) { const [a, n] = m.split('-'); return MOIS[Number(n) - 1] + ' ' + a; }
export function moisPrecedent(m) { const [a, n] = m.split('-').map(Number); return n === 1 ? `${a - 1}-12` : `${a}-${String(n - 1).padStart(2, '0')}`; }
export function moisSuivant(m) { const [a, n] = m.split('-').map(Number); return n === 12 ? `${a + 1}-01` : `${a}-${String(n + 1).padStart(2, '0')}`; }

/* ---------- Lire et vérifier la fiche ---------- */
export function verifierFiche(f, mois) {
  const erreurs = [];
  const c = f && f.client;
  if (!c || !c.nom) erreurs.push('client.nom manque');
  if (!c || !c.telephone) erreurs.push('client.telephone manque (les réponses aux avis négatifs renvoient vers le téléphone)');
  if (!estMois(mois)) erreurs.push(`mois invalide : « ${mois} » (attendu AAAA-MM)`);
  if (!Array.isArray(f.faits_du_mois) || !f.faits_du_mois.length) erreurs.push('faits_du_mois est vide : sans fait donné par le commerçant, aucun post n’est écrit');
  if (f.avis && !Array.isArray(f.avis)) erreurs.push('avis doit être une liste');
  for (const a of f.avis || []) {
    if (!a.id || !a.texte || typeof a.note !== 'number') erreurs.push(`avis incomplet (id, note, texte requis) : ${JSON.stringify(a).slice(0, 60)}`);
  }
  if (f._note && /^FICHE IMAGINAIRE/.test(f._note)) return { erreurs, imaginaire: true };
  return { erreurs, imaginaire: false };
}

export function lireFiche(chemin) {
  try { return JSON.parse(readFileSync(chemin, 'utf8')); }
  catch (e) { throw new Error(`Fiche illisible (${chemin}) : ${e.message}`); }
}

/* ---------- Le texte de la fiche donné à l'IA (sans nom de famille, sans chiffres de résultats) ---------- */
export function fichePourIA(f, mois) {
  const c = f.client || {};
  const l = [];
  l.push(`Commerce : ${c.nom}`, `Métier : ${c.metier || '(non précisé)'}`, `Quartier : ${c.quartier || '(non précisé)'}`, `Adresse : ${c.adresse || '(non précisée)'}`, `Téléphone : ${c.telephone}`);
  l.push(`Ton à employer : ${c.ton || 'simple et chaleureux'}`);
  l.push(`Horaires : ${f.horaires || '(non précisés)'}`);
  l.push('Fermetures : ' + ((f.fermetures || []).map((x) => `du ${x.du} au ${x.au} (${x.raison})`).join(' ; ') || 'aucune'));
  l.push('Spécialités : ' + ((f.specialites || []).join(', ') || '(non précisées)'));
  l.push('Faits du mois donnés par le commerçant :');
  (f.faits_du_mois || []).forEach((x, i) => l.push(`  ${i + 1}. ${x}`));
  l.push(`Mois à rédiger : ${nomDuMois(mois)}`);
  return l.join('\n');
}

export function avisSansReponse(f) { return (f.avis || []).filter((a) => !a.reponse_publiee); }

export function avisPourIA(f) {
  return avisSansReponse(f).map((a) => `- Identifiant ${a.id} · ${a.note} étoile(s) · prénom ${a.prenom || '(non donné)'} · « ${String(a.texte).replace(/\s+/g, ' ')} »`).join('\n') || '(aucun avis sans réponse)';
}

function remplir(modele, valeurs) { return modele.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in valeurs ? valeurs[k] : `{{${k}}}`)); }
const lireModele = (nom) => readFileSync(join(dossierModeles, nom), 'utf8');

export function construirePrompts(f, moisRapport) {
  const moisPosts = moisSuivant(moisRapport);
  const v = { FICHE: fichePourIA(f, moisPosts), AVIS: avisPourIA(f), MOIS_POSTS: nomDuMois(moisPosts), NOMBRE_POSTS: String(Math.min(2, (f.faits_du_mois || []).length) || 1) };
  return {
    regles: lireModele('0-regles.md'),
    posts: remplir(lireModele('1-posts.md'), v),
    avis: remplir(lireModele('2-reponses-avis.md'), v)
  };
}

/* ---------- Le rapport d'une page : uniquement les chiffres de la fiche ---------- */
export function lignesChiffres(f, mois) {
  const ce = (f.chiffres || {})[mois] || {};
  const avant = (f.chiffres || {})[moisPrecedent(mois)] || {};
  const nombre = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
  return INDICATEURS.map(([cle, nom, source]) => {
    const a = nombre(avant[cle]), b = nombre(ce[cle]);
    const ecart = a !== null && b !== null ? b - a : null;
    return { cle, nom, source, avant: a, ce: b, ecart };
  });
}
const fmt = (n) => (n === null ? 'non disponible' : n.toLocaleString('fr-FR'));
const fmtEcart = (n) => (n === null ? '' : n === 0 ? 'stable' : (n > 0 ? '+' : '−') + Math.abs(n).toLocaleString('fr-FR'));

export function construireRapportHtml(f, mois) {
  const c = f.client || {};
  const ligne = lignesChiffres(f, mois);
  const avisMois = (f.avis || []).filter((a) => String(a.date || '').startsWith(mois));
  const repondus = avisMois.filter((a) => a.reponse_publiee).length;
  const liste = (t) => (t && t.length ? `<ul>${t.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p>Rien ce mois-ci.</p>');
  const presta = f.prestataire || { nom: 'Grégoire Muel', telephone: '07 80 00 81 37' };
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Visibilité Google, ${esc(nomDuMois(mois))}, ${esc(c.nom)}</title>
<style>
@page{size:A4;margin:16mm}
body{font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1d2328;background:#fff;max-width:760px;margin:0 auto;padding:24px 16px}
h1{font-size:26px;line-height:1.2;margin:0 0 4px}
h2{font-size:19px;margin:28px 0 8px;border-bottom:1px solid #c9d1d6;padding-bottom:4px}
p,li{font-size:16px}
.sous{color:#4a555d;margin:0 0 4px}
table{border-collapse:collapse;width:100%}
th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #dde3e7;vertical-align:top;font-size:15px}
th{font-size:14px;color:#4a555d;font-weight:600}
td.n{text-align:right;white-space:nowrap}
.src{font-size:14px;color:#4a555d}
.note{border-left:3px solid #1d4f7a;padding:4px 12px;margin:20px 0;background:#f2f5f7}
footer{margin-top:28px;font-size:14px;color:#4a555d}
</style></head><body>
<h1>${esc(c.nom)}</h1>
<p class="sous">Visibilité Google, rapport de ${esc(nomDuMois(mois))}</p>

<h2>Les chiffres du mois</h2>
<table>
<tr><th>Indicateur</th><th class="n">${esc(nomDuMois(moisPrecedent(mois)))}</th><th class="n">${esc(nomDuMois(mois))}</th><th class="n">Écart</th></tr>
${ligne.map((l) => `<tr><td>${esc(l.nom)}<br><span class="src">Source : ${esc(l.source)}</span></td><td class="n">${fmt(l.avant)}</td><td class="n">${fmt(l.ce)}</td><td class="n">${fmtEcart(l.ecart)}</td></tr>`).join('\n')}
</table>
<p class="src">« Non disponible » veut dire que le chiffre n’a pas pu être relevé, pas qu’il vaut zéro. Les écarts d’un mois à l’autre sont des constats, pas des promesses.</p>

<h2>Ce qui a été fait</h2>
${liste(f.travail_fait)}

<h2>Les avis</h2>
<p>${c.note_actuelle ? `Note actuelle : ${esc(c.note_actuelle)}${c.nombre_avis ? ` sur ${esc(c.nombre_avis)} avis` : ''}. ` : ''}${avisMois.length} nouvel${avisMois.length > 1 ? 's' : ''} avis ce mois-ci, ${repondus} avec une réponse publiée.</p>

<h2>Prévu le mois prochain</h2>
${liste(f.prevu_mois_suivant)}

<div class="note"><strong>À savoir.</strong> Je ne promets aucune place dans Google. Je promets un travail fait chaque mois, que je vous montre ici. Les appels et les demandes d’itinéraire sont les premiers chiffres à regarder ; je ne peux pas dire à l’avance dans quel délai ils évoluent. Rien n’est publié sans votre accord.</div>

<footer>${esc(presta.nom)} · ${esc(presta.telephone)}</footer>
</body></html>
`;
}

/* ---------- Contrôle des brouillons ---------- */
const MOTS_INTERDITS = ['bienvenue', 'découvrez', "n'hésitez pas", 'au cœur de', 'véritable', 'incontournable', 'passion', 'savoir-faire unique', 'sublimer', 'écrin', 'expérience', 'univers', 'authentique', 'de qualité', 'un large choix', 'niché', 'havre', 'pépite', "d'exception", 'excellence', 'intemporel', 'voyage gustatif', 'savoureux mélange'];
const PROMESSES = /\b(n°\s?1|numéro\s?1|meilleur(?:e|es|s)?|garanti(?:e|es|s)?|incontournable|leader|le seul|la seule|unique)\b/gi;
const SANTE = /\b(sans gluten|sans lactose|sans allerg|vegan|végétalien|bio|biologique|halal|casher|label|certifié|fait maison|artisanal(?:e|es|ale)?)\b/i;
const CADEAU = /\b(rembours|offert|gratuit|en échange|cadeau|remise|réduction|dédommag|geste commercial)/i;
const nombresDe = (t) => new Set((norm(t).match(/\d+(?:[.,]\d+)?/g) || []).map((x) => x.replace(',', '.')));

export function controlerTexte(texte, f, { type = 'post', note = null, faitsMax = null } = {}) {
  const t = norm(texte), bas = t.toLowerCase(), alertes = [];
  const fiche = norm(JSON.stringify(f));
  for (const m of MOTS_INTERDITS) if (bas.includes(m)) alertes.push(`mot ou formule à éviter : « ${m} »`);
  for (const p of new Set([...t.matchAll(PROMESSES)].map((m) => m[0].toLowerCase()))) alertes.push(`promesse ou superlatif : « ${p} »`);
  const s = t.match(SANTE); if (s) alertes.push(`mention à faire confirmer par écrit par le commerçant : « ${s[0]} »`);
  if (/[—–]/.test(t)) alertes.push('tiret long (— ou –) : à remplacer');
  if (/#\w/.test(t)) alertes.push('hashtag : à retirer');
  if ((t.match(/\p{Extended_Pictographic}/gu) || []).length > 2) alertes.push('plus de deux émojis');
  if (/[A-ZÉÈÀ]{6,}/.test(t.replace(/\b[A-Z]{2,5}\b/g, ''))) alertes.push('mot en majuscules');
  const prix = (x) => new Set([...norm(x).matchAll(/(\d+(?:[.,]\d+)?)\s?(?:€|euros?)/gi)].map((m) => m[1].replace(',', '.')));
  const prixConnus = prix(fiche);
  const prixInventes = [...prix(t)].filter((n) => !prixConnus.has(n));
  if (prixInventes.length) alertes.push(`prix absent(s) de la fiche : ${prixInventes.join(', ')} € (le commerçant doit le donner par écrit)`);
  const connus = nombresDe(fiche);
  const inconnus = [...nombresDe(t)].filter((n) => !connus.has(n));
  if (inconnus.length) alertes.push(`chiffre(s) absent(s) de la fiche : ${inconnus.join(', ')} (prix, horaire, date ou téléphone à vérifier)`);
  const mots = (bas.match(/[a-zàâçéèêëîïôûùüÿœ]{5,}/g) || []);
  const compte = {};
  for (const w of mots) compte[w] = (compte[w] || 0) + 1;
  const repetes = Object.entries(compte).filter(([w, n]) => n >= 4 && !['pour', 'cette', 'votre', 'notre', 'vous', 'nous'].includes(w)).map(([w, n]) => `${w} ×${n}`);
  if (repetes.length) alertes.push(`mot répété (effet « mots-clés ») : ${repetes.join(', ')}`);
  if (type === 'post') {
    if (t.length > 1500) alertes.push(`${t.length} caractères : au-dessus de la limite supposée de 1 500 (à vérifier)`);
    if (t.length < 200) alertes.push(`${t.length} caractères : très court`);
  } else {
    if (CADEAU.test(t)) alertes.push('geste commercial, remboursement ou cadeau évoqué : à retirer');
    if (/@|\bhttps?:\/\//i.test(t)) alertes.push('adresse e-mail ou lien dans une réponse publique');
    if (typeof note === 'number' && note <= 3) alertes.push('avis de 3 étoiles ou moins : à relire avec le commerçant avant publication');
    if (t.length > 800) alertes.push(`${t.length} caractères : réponse longue`);
  }
  if (faitsMax !== null) {
    const m = t.match(/faits? utilis[ée]s?\s*:\s*([^\n]+)/i);
    if (!m) alertes.push('ligne « Faits utilisés » absente : impossible de vérifier d’où vient le texte');
    else {
      const ids = (m[1].match(/\d+/g) || []).map(Number);
      if (!ids.length) alertes.push('« Faits utilisés » ne cite aucun numéro');
      if (ids.some((i) => i < 1 || i > faitsMax)) alertes.push(`« Faits utilisés » cite un numéro absent de la fiche (la fiche en a ${faitsMax})`);
    }
  }
  return alertes;
}

/* ---------- Lire la réponse de l'IA ---------- */
export function decouper(texte, motif) {
  const blocs = [], re = new RegExp(`^###\\s*${motif}\\s+(\\S+)[^\\n]*\\n`, 'gmi');
  const reperes = [...String(texte).matchAll(re)];
  reperes.forEach((m, i) => {
    const fin = i + 1 < reperes.length ? reperes[i + 1].index : texte.length;
    blocs.push({ id: m[1], texte: texte.slice(m.index + m[0].length, fin).trim() });
  });
  return blocs;
}

/* ---------- Appel de l'API (clé en variable d'environnement) ---------- */
export async function appelerIA({ systeme, utilisateur, modele = MODELE_PAR_DEFAUT, cle = process.env.ANTHROPIC_API_KEY, url = process.env.ANTHROPIC_API_URL || URL_API, maxJetons = 2000 }) {
  if (!cle) throw new Error('Variable ANTHROPIC_API_KEY absente. La clé ne se met jamais dans un fichier du dépôt.');
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': cle, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: modele, max_tokens: maxJetons, system: systeme, messages: [{ role: 'user', content: utilisateur }] }),
    signal: AbortSignal.timeout(90000)
  });
  if (!r.ok) throw new Error(`API : ${r.status} ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const t = (j.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  if (!t) throw new Error('API : réponse vide');
  return t;
}

/* ---------- Mise en forme des fichiers ---------- */
const ENTETE = (titre, mois) => `# ${titre} (${nomDuMois(mois)})\n\n> **BROUILLON, rien n'est publié.** À relire et à valider par le commerçant avant toute publication. Le contrôle automatique ne remplace pas la relecture.\n\n`;

export function formaterBrouillons(titre, blocs, mois, alertesParId) {
  if (!blocs.length) return ENTETE(titre, mois) + '_Aucun brouillon reçu._\n';
  return ENTETE(titre, mois) + blocs.map((b) => {
    const al = alertesParId[b.id] || [];
    return `## ${b.id}\n\n${b.texte}\n\n${al.length ? al.map((a) => `- ⚠ ${a}`).join('\n') : '- Contrôle automatique : rien à signaler'}\n`;
  }).join('\n');
}

export function controlerBlocs(blocs, f, type, faitsMax) {
  const par = {};
  const meta = /^(Faits utilisés|Bouton|Manque|Alerte)\s*:.*$/gim;
  for (const b of blocs) {
    const a = (f.avis || []).find((x) => x.id === b.id);
    par[b.id] = controlerTexte(b.texte.replace(meta, ''), f, { type, note: a ? a.note : null });
    if (type === 'post') par[b.id].push(...controlerTexte(b.texte, f, { type, faitsMax }).filter((x) => /Faits utilisés/.test(x)));
    if (type === 'avis' && !a) par[b.id].push('identifiant d’avis absent de la fiche');
    if (type === 'avis' && /^Alerte\s*:/im.test(b.texte)) par[b.id].push('l’IA demande une relecture attentive (ligne « Alerte »)');
  }
  return par;
}

export function ecrireSuivi({ f, mois, sortie }) {
  mkdirSync(sortie, { recursive: true });
  const p = construirePrompts(f, mois);
  writeFileSync(join(sortie, 'rapport.html'), construireRapportHtml(f, mois));
  writeFileSync(join(sortie, 'prompt-posts.md'), `${p.regles}\n\n---\n\n${p.posts}`);
  writeFileSync(join(sortie, 'prompt-avis.md'), `${p.regles}\n\n---\n\n${p.avis}`);
  const aValider = [
    `# À valider par le client, ${(f.client || {}).nom} (${nomDuMois(mois)})`, '',
    '- [ ] Posts : texte relu et « OK » reçu par écrit (canal du devis)',
    `- [ ] Réponses aux avis (${avisSansReponse(f).length} sans réponse) : relues, « OK » reçu`,
    '- [ ] Les avis de 3 étoiles ou moins : relus avec le commerçant, par téléphone si possible',
    '- [ ] Horaires, jours fériés et fermetures : conformes à ce que le client a écrit',
    '- [ ] Photos : envoyées par le client, sans données GPS',
    '- [ ] Rapport : chiffres recopiés de la fiche Google, relus avant envoi',
    '- [ ] Rien n’est publié sans « OK » ; sans réponse, seules les mises à jour factuelles déjà données sont faites', ''
  ].join('\n');
  writeFileSync(join(sortie, 'a-valider.md'), aValider);
  return p;
}

export async function rediger({ f, mois, sortie, modele, appel = appelerIA }) {
  const p = ecrireSuivi({ f, mois, sortie });
  const faitsMax = (f.faits_du_mois || []).length;
  const sorties = {};
  const ctrl = [];
  const moisPosts = moisSuivant(mois);
  const rep = await appel({ systeme: p.regles, utilisateur: p.posts, modele });
  const posts = decouper(rep, 'POST');
  const alP = controlerBlocs(posts, f, 'post', faitsMax);
  writeFileSync(join(sortie, 'brouillons-posts.md'), formaterBrouillons('Brouillons de posts', posts, moisPosts, alP));
  sorties.posts = posts.length;
  ctrl.push(`## Posts (${posts.length})`, ...posts.map((b) => `- ${b.id} : ${(alP[b.id] || []).length ? alP[b.id].join(' · ') : 'rien à signaler'}`));
  if (avisSansReponse(f).length) {
    const repA = await appel({ systeme: p.regles, utilisateur: p.avis, modele });
    const avis = decouper(repA, 'AVIS');
    const alA = controlerBlocs(avis, f, 'avis');
    writeFileSync(join(sortie, 'brouillons-avis.md'), formaterBrouillons('Brouillons de réponses aux avis', avis, mois, alA));
    sorties.avis = avis.length;
    const manquants = avisSansReponse(f).filter((a) => !avis.some((b) => b.id === a.id)).map((a) => a.id);
    ctrl.push(`## Réponses aux avis (${avis.length})`, ...avis.map((b) => `- ${b.id} : ${(alA[b.id] || []).length ? alA[b.id].join(' · ') : 'rien à signaler'}`));
    if (manquants.length) ctrl.push(`- Avis sans brouillon : ${manquants.join(', ')}`);
  }
  writeFileSync(join(sortie, 'controle.md'), `# Contrôle automatique (${nomDuMois(mois)})\n\nCe contrôle repère des signaux, il ne prouve rien : relis chaque texte.\n\n${ctrl.join('\n')}\n`);
  return sorties;
}

/* ---------- Ligne de commande ---------- */
function options(args) {
  const o = { _: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) { o[args[i].slice(2)] = args[i + 1]; i++; } else o._.push(args[i]);
  }
  return o;
}

async function principal() {
  const [commande, ...reste] = process.argv.slice(2);
  const o = options(reste);
  if (commande === 'controler') {
    const [fichierTexte, fichierFiche] = o._;
    if (!fichierTexte || !fichierFiche) throw new Error('Usage : controler <brouillons.md> <fiche.json>');
    const f = lireFiche(fichierFiche);
    const texte = readFileSync(fichierTexte, 'utf8');
    const posts = decouper(texte, 'POST'), avis = decouper(texte, 'AVIS');
    if (!posts.length && !avis.length) throw new Error('Aucun titre « ### POST n » ni « ### AVIS id » trouvé dans le texte.');
    const faitsMax = (f.faits_du_mois || []).length;
    const al = { ...controlerBlocs(posts, f, 'post', faitsMax), ...controlerBlocs(avis, f, 'avis') };
    let n = 0;
    for (const b of [...posts, ...avis]) { const a = al[b.id] || []; n += a.length; console.log(`${a.length ? '⚠' : 'ok'} ${b.id}${a.length ? ' : ' + a.join(' · ') : ''}`); }
    console.log(n ? `\n${n} signal(aux) à regarder.` : '\nRien à signaler (relis quand même chaque texte).');
    return;
  }
  if (commande !== 'preparer' && commande !== 'rediger') {
    console.log('Usage : preparer <fiche.json> [--mois AAAA-MM] [--sortie dossier]\n        rediger <fiche.json> [--mois AAAA-MM] [--sortie dossier] [--modele id]\n        controler <brouillons.md> <fiche.json>');
    process.exit(commande ? 1 : 0);
  }
  const fichier = o._[0];
  if (!fichier) throw new Error('Il manque la fiche (fichier .json).');
  const f = lireFiche(fichier);
  const mois = o.mois || Object.keys(f.chiffres || {}).sort().pop();
  const { erreurs, imaginaire } = verifierFiche(f, mois);
  if (erreurs.length) { console.error('Fiche à corriger :\n- ' + erreurs.join('\n- ')); if (commande === 'rediger' || erreurs.some((e) => /mois invalide|client\.nom/.test(e))) process.exit(1); }
  const sortie = resolve(o.sortie || join('suivi-google', slug((f.client || {}).nom || basename(fichier, '.json')), mois));
  if (commande === 'preparer') {
    ecrireSuivi({ f, mois, sortie });
    console.log(`Écrit dans ${sortie} : rapport.html, prompt-posts.md, prompt-avis.md, a-valider.md${imaginaire ? ' (fiche imaginaire)' : ''}`);
    return;
  }
  const r = await rediger({ f, mois, sortie, modele: o.modele || MODELE_PAR_DEFAUT });
  console.log(`Écrit dans ${sortie} : ${r.posts || 0} brouillon(s) de post, ${r.avis || 0} réponse(s) aux avis, controle.md. Rien n'est publié.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  principal().catch((e) => { console.error('Erreur : ' + e.message); process.exit(1); });
}
