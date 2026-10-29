// Mini-diagnostic gratuit de la fiche Google : de la fiche copiée à la page d'une feuille que tu laisses au commerçant.
// Aucune dépendance, aucun réseau. Les dossiers diagnostics/ contiennent des données de commerçants : jamais envoyés sur GitHub.
//
//   node outils/diagnostic-fiche.mjs preparer <fiche.txt> [nom]
//       Lit la fiche copiée (comme la fabrique de maquettes) et écrit diagnostics/<nom>/grille.json : les 12 points de la grille
//       (script de visite, partie 4). Ce que le script peut lire est prérempli ; le reste vaut « ? » et se remplit en regardant la fiche.
//
//   node outils/diagnostic-fiche.mjs fabriquer diagnostics/<nom>/grille.json [--brouillon]
//       Écrit diagnostic.html (une page A4, à imprimer ou à montrer sur téléphone). Refuse tant qu'il reste un « ? »,
//       sauf avec --brouillon (la page porte alors « brouillon »). Aucune note sur 100 : ce serait inventer un chiffre.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extraireFaits } from './fabrique-maquette.mjs';

const kit = fileURLToPath(new URL('..', import.meta.url));
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const ETATS = ['OK', 'À faire', 'Manque'];
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

/* Les 12 points, dans l'ordre de priorité des actions (ce qui fait perdre des clients d'abord). */
export const POINTS = [
  { id: 'horaires', nom: 'Horaires', regarde: 'Horaires normaux, jours fériés et congés à jour', action: 'Mettre à jour les horaires des jours fériés et des congés' },
  { id: 'telephone', nom: 'Téléphone', regarde: 'Le bon numéro, qui répond', action: 'Corriger le numéro de téléphone' },
  { id: 'avis', nom: 'Avis', regarde: 'Nombre, note, réponses du commerçant', action: 'Répondre aux avis sans réponse, en commençant par les plus récents' },
  { id: 'photos', nom: 'Photos', regarde: 'Logo, façade, intérieur, produits ou travaux ; récentes et nettes', action: 'Ajouter 5 photos récentes : façade, intérieur, produits ou travaux' },
  { id: 'categorie', nom: 'Catégorie', regarde: 'Catégorie principale juste, catégories secondaires utiles', action: 'Choisir la catégorie principale la plus précise et ajouter les catégories secondaires utiles' },
  { id: 'adresse', nom: 'Adresse et zone', regarde: 'Adresse exacte ; zone de service pour un artisan qui se déplace', action: 'Corriger l’adresse ou indiquer la zone d’intervention' },
  { id: 'site', nom: 'Site', regarde: 'Lien présent, pas cassé, lisible sur téléphone', action: 'Ajouter un lien vers un site lisible sur téléphone' },
  { id: 'description', nom: 'Description', regarde: 'Rédigée, claire, quartier et spécialités', action: 'Écrire une description courte : ce que vous faites, pour qui, dans quel quartier' },
  { id: 'messages', nom: 'Posts', regarde: 'Un post récent (moins d’un mois)', action: 'Publier un post par mois : nouveauté, offre, congés' },
  { id: 'produits', nom: 'Produits ou services', regarde: 'Listés, avec prix si le commerçant le veut', action: 'Lister vos produits ou services principaux' },
  { id: 'nom', nom: 'Nom', regarde: 'Le nom réel, sans mots-clés ajoutés', action: 'Remettre le nom réel du commerce, sans mots ajoutés' },
  { id: 'coherence', nom: 'Cohérence', regarde: 'Mêmes horaires, numéro et adresse sur la fiche, le site et les réseaux', action: 'Aligner horaires, numéro et adresse sur la fiche, le site et les réseaux' }
];

/* ---------- Préremplir depuis la fiche copiée ---------- */
export function preremplir(texte) {
  const f = extraireFaits(texte);
  const g = Object.fromEntries(POINTS.map((p) => [p.id, { etat: '?', constat: '' }]));
  const jours = Object.keys(f.horaires);
  if (f.telephone) g.telephone = { etat: '?', constat: `Numéro affiché : ${f.telephone.replace(/(\d{2})(?=\d)/g, '$1 ')}. À appeler pour vérifier qu’il répond.` };
  else g.telephone = { etat: 'Manque', constat: 'Aucun numéro trouvé sur la fiche.' };
  if (f.adresse) g.adresse = { etat: 'OK', constat: `Adresse affichée : ${f.adresse}.` };
  if (jours.length === 7) g.horaires = { etat: '?', constat: 'Horaires des sept jours renseignés. Jours fériés et congés : à vérifier.' };
  else if (jours.length) g.horaires = { etat: 'À faire', constat: `Horaires lus pour ${jours.length} jour(s) sur 7 (${JOURS.filter((j) => !jours.includes(j)).join(', ')} : à vérifier).` };
  else g.horaires = { etat: '?', constat: 'Aucun horaire lu dans le texte copié (déplier les horaires avant de copier, ou regarder la fiche).' };
  if (f.site) g.site = { etat: '?', constat: `Lien vers ${f.site}. À ouvrir sur un téléphone.` };
  else g.site = { etat: 'Manque', constat: 'Aucun lien vers un site sur la fiche.' };
  if (f.note) g.avis = { etat: '?', constat: `Note ${f.note}${f.nombre ? ` sur ${f.nombre} avis` : ''}. Réponses du commerçant : à compter.` };
  if (/\s[-|–—]\s|,\s*\S+\s+\d{5}|\b(pas cher|meilleur|n°\s?1|urgence 24)\b/i.test(f.nom)) g.nom = { etat: 'À faire', constat: `Le nom « ${f.nom} » semble contenir des mots ajoutés.` };
  return { commerce: f.nom, date: new Date().toISOString().slice(0, 10), points: g, bien: [], actions: [] };
}

/* ---------- Choisir ce qui est bien et les trois actions ---------- */
export function verifierGrille(G) {
  const erreurs = [];
  if (!G || !G.commerce) erreurs.push('commerce manque');
  for (const p of POINTS) {
    const x = (G.points || {})[p.id];
    if (!x) { erreurs.push(`point « ${p.id} » absent`); continue; }
    if (x.etat === '?') erreurs.push(`« ${p.nom} » : remplacer "etat": "?" par "OK", "À faire" ou "Manque", et écrire un constat d’une ligne`);
    else if (!ETATS.includes(x.etat)) erreurs.push(`« ${p.nom} » : état « ${x.etat} » inconnu (OK, À faire ou Manque)`);
    else if (/à vérifier|à compter|à appeler|aucun horaire lu/i.test(x.constat || '')) erreurs.push(`« ${p.nom} » : le constat prérempli dit encore « à vérifier » : le réécrire après vérification`);
  }
  return erreurs;
}

export function synthese(G) {
  const P = G.points || {};
  const bien = (G.bien && G.bien.length ? G.bien : POINTS.filter((p) => P[p.id] && P[p.id].etat === 'OK').slice(0, 2).map((p) => `${p.nom} : ${P[p.id].constat || 'à jour'}`)).slice(0, 2);
  const actions = (G.actions && G.actions.length ? G.actions : POINTS.filter((p) => P[p.id] && ['Manque', 'À faire'].includes(P[p.id].etat)).map((p) => P[p.id].action || p.action)).slice(0, 3);
  return { bien, actions };
}

export function construireHtml(G, { brouillon = false, offre = {} } = {}) {
  const { bien, actions } = synthese(G);
  const P = G.points || {};
  const o = { telephone: '07 80 00 81 37', email: '', visibilite: 'Visibilité Google : je tiens votre fiche à jour chaque mois, 39 € par mois, sans engagement.', site: 'Un site vitrine lisible sur téléphone : 590 € une fois, sans abonnement obligatoire.', ...offre };
  const date = new Date(G.date || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const marque = (e) => ({ OK: 'ok', 'À faire': 'faire', Manque: 'manque' }[e] || 'inconnu');
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Votre fiche Google, ${esc(G.commerce)}</title>
<style>
@page{size:A4;margin:12mm}
body{font:15px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1c2226;background:#fff;max-width:780px;margin:0 auto;padding:20px 16px}
h1{font-size:24px;line-height:1.2;margin:0}
h2{font-size:18px;margin:22px 0 8px}
.sous{color:#4a555d;margin:4px 0 0}
.brouillon{border:2px solid #9a3412;color:#9a3412;padding:6px 10px;font-weight:700;margin-bottom:12px}
ol,ul{padding-left:22px;margin:6px 0}
li{margin:4px 0}
.actions li{font-size:16px;font-weight:600}
table{border-collapse:collapse;width:100%;margin-top:6px}
td,th{border-bottom:1px solid #dde3e7;padding:6px 4px;text-align:left;vertical-align:top;font-size:14px}
th{color:#4a555d;font-weight:600}
.etat{white-space:nowrap;font-weight:700}
.ok{color:#166534}.faire{color:#9a3412}.manque{color:#991b1b}.inconnu{color:#4a555d}
.offre{background:#f2f5f7;padding:10px 14px;margin-top:18px}
footer{margin-top:16px;font-size:14px;color:#4a555d}
@media print{body{padding:0}}
</style></head><body>
${brouillon ? '<p class="brouillon">Brouillon : des points restent à vérifier.</p>' : ''}
<h1>Votre fiche Google : ${esc(G.commerce)}</h1>
<p class="sous">Diagnostic gratuit du ${esc(date)}, par Grégoire Muel. Vous gardez cette page, même sans suite.</p>

<h2>Ce qui est bien</h2>
${bien.length ? `<ul>${bien.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '<p>À compléter.</p>'}

<h2>Les trois actions à faire en premier</h2>
${actions.length ? `<ol class="actions">${actions.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>` : '<p>Rien d’urgent : votre fiche est bien tenue.</p>'}

<h2>Le détail</h2>
<table><tr><th>Point</th><th>État</th><th>Constat</th></tr>
${POINTS.map((p) => { const x = P[p.id] || { etat: '?' }; return `<tr><td>${esc(p.nom)}</td><td class="etat ${marque(x.etat)}">${esc(x.etat === '?' ? 'à vérifier' : x.etat)}</td><td>${esc(x.constat || p.regarde)}</td></tr>`; }).join('\n')}
</table>

<div class="offre"><strong>Ce que je peux faire pour vous.</strong> ${esc(o.visibilite)} ${esc(o.site)} Je ne promets aucune place dans Google : je promets un travail fait chaque mois, que je vous montre.</div>
<footer>Grégoire Muel · ${esc(o.telephone)}${o.email ? ' · ' + esc(o.email) : ''}</footer>
</body></html>
`;
}

/* ---------- Ligne de commande ---------- */
function principal() {
  const [commande, a, b] = process.argv.slice(2);
  if (commande === 'preparer') {
    if (!a || !existsSync(a)) { console.error('Usage : node outils/diagnostic-fiche.mjs preparer <fiche.txt> [nom]'); process.exit(1); }
    const G = preremplir(readFileSync(a, 'utf8'));
    const nom = b || slug(G.commerce) || 'commerce';
    const dossier = join(kit, 'diagnostics', nom);
    mkdirSync(dossier, { recursive: true });
    writeFileSync(join(dossier, 'grille.json'), JSON.stringify(G, null, 2) + '\n');
    const reste = POINTS.filter((p) => G.points[p.id].etat === '?').map((p) => p.nom);
    console.log(`Grille écrite : ${join(dossier, 'grille.json')}\nOuvre ce fichier dans un éditeur de texte et, pour chaque point dont "etat" vaut "?", écris "OK", "À faire" ou "Manque" (en regardant la fiche) et un "constat" d’une ligne : ${reste.join(', ')}.\nFacultatif : « bien » (2 lignes) et « actions » (3 lignes) pour remplacer le choix automatique.`);
    return;
  }
  if (commande === 'fabriquer') {
    if (!a || !existsSync(a)) { console.error('Usage : node outils/diagnostic-fiche.mjs fabriquer <grille.json> [--brouillon]'); process.exit(1); }
    const G = JSON.parse(readFileSync(a, 'utf8'));
    const brouillon = process.argv.includes('--brouillon');
    const erreurs = verifierGrille(G);
    if (erreurs.length && !brouillon) { console.error(`Grille incomplète. Ouvre ${a} dans un éditeur de texte et complète chaque point :\n- ` + erreurs.join('\n- ') + '\nPour une page provisoire marquée « brouillon » : ajouter --brouillon.'); process.exit(1); }
    const sortie = join(dirname(resolve(a)), 'diagnostic.html');
    writeFileSync(sortie, construireHtml(G, { brouillon: brouillon && erreurs.length > 0 }));
    console.log(`Diagnostic écrit : ${sortie}\nÀ montrer sur ton téléphone ou à imprimer. Jamais de lien public.`);
    return;
  }
  console.log('Commandes : preparer <fiche.txt> [nom] | fabriquer <grille.json> [--brouillon]');
  process.exit(commande ? 1 : 0);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
