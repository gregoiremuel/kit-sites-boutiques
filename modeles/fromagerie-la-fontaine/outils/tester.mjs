// Teste le vrai serveur sur cet ordinateur, sans rien mettre en ligne.
// Usage : node outils/tester.mjs [fichier de contenu]   (par défaut : contenu-initial.json)
// Lance « wrangler dev » avec un stockage vide et temporaire, un mot de passe de test et MAQUETTE = non,
// puis vérifie : site, mentions, espace boutique, connexion, enregistrement, interrupteurs des parties,
// photo, demande d'un client, statuts, retour en arrière, déconnexion, limites.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { verifier } from './verifier.mjs';

const racine = fileURLToPath(new URL('..', import.meta.url));
const fichier = resolve(process.argv[2] || join(racine, 'contenu-initial.json'));
const C = JSON.parse(readFileSync(fichier, 'utf8'));
const v = verifier(C);
if (v.erreurs.length) { console.error(`\nLe contenu a ${v.erreurs.length} erreur(s) : lancez d’abord « npm run verifier ».\n`); process.exit(1); }

const PORT = 8799, BASE = `http://127.0.0.1:${PORT}`;
const MDP = 'test-' + randomBytes(6).toString('hex');
const sel = randomBytes(16);
const HASH = `pbkdf2$10000$${sel.toString('base64')}$${pbkdf2Sync(MDP, sel, 10000, 32, 'sha256').toString('base64')}`;
const stockage = mkdtempSync(join(tmpdir(), 'boutique-test-'));
const wrangler = join(racine, 'node_modules', '.bin', 'wrangler');

/* Contenu autre que celui du projet : on le dépose dans le stockage local avant de démarrer */
if (process.argv[2]) {
  const r = spawnSync(wrangler, ['kv', 'key', 'put', 'contenu', '--path', fichier, '--binding', 'CONTENU', '--local', '--persist-to', stockage], { cwd: racine, encoding: 'utf8' });
  if (r.status !== 0) { console.error('Impossible de déposer le contenu de test :\n' + r.stderr); process.exit(1); }
}

const serveur = spawn(wrangler, ['dev', '--port', String(PORT), '--ip', '127.0.0.1', '--persist-to', stockage, '--show-interactive-dev-session=false',
  '--var', 'ADMIN_HASH:' + HASH, '--var', 'SESSION_SECRET:' + randomBytes(24).toString('hex'), '--var', 'MAQUETTE:non'],
{ cwd: racine, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
let journal = '';
serveur.stdout.on('data', (d) => { journal += d; });
serveur.stderr.on('data', (d) => { journal += d; });
const arreter = () => { try { process.kill(-serveur.pid, 'SIGTERM'); } catch (e) { /* déjà arrêté */ } try { rmSync(stockage, { recursive: true, force: true }); } catch (e) { /* rien */ } };
process.on('SIGINT', () => { arreter(); process.exit(130); });

let ok = 0; const echecs = [];
const verif = (cond, nom) => { if (cond) { ok++; console.log('  ok      ' + nom); } else { echecs.push(nom); console.log('  ÉCHEC   ' + nom); } };
let cookie = '';
const req = (chemin, o = {}) => fetch(BASE + chemin, { redirect: 'manual', ...o, headers: { ...(o.headers || {}), ...(cookie && o.cookie !== false ? { Cookie: cookie } : {}) } });
const corpsJson = (data) => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

async function attendre() {
  for (let i = 0; i < 90; i++) {
    try { const r = await fetch(BASE + '/'); if (r.status === 200) return true; } catch (e) { /* pas encore prêt */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function tests() {
  const S = C.sections, K = C.commandes, D = C.metier.demande;
  const formulaire = !!(K.actif && S.offres && C.offres.length && D.type !== 'lien');
  console.log(`\nTest du serveur local avec ${fichier} (${C.boutique.nom})\n`);

  /* Site public */
  let r = await req('/'); let h = await r.text();
  verif(r.status === 200 && h.includes(C.boutique.nom.replace(/'/g, '&#39;')), 'Le site s’affiche avec le nom de la boutique');
  verif(!/undefined|NaN|\[object Object\]/.test(h.replace(/<script[\s\S]*?<\/script>/g, '')), 'Aucun « undefined » ni « NaN » dans la page');
  verif(!h.includes('class="maquette"') && !h.includes('noindex'), 'Pas de bandeau de proposition quand MAQUETTE = non');
  verif(h.includes('id="demande"') === formulaire, `Formulaire de demande ${formulaire ? 'présent' : 'absent'} comme prévu`);
  r = await req('/mentions-legales'); verif(r.status === 200 && (await r.text()).includes('Cloudflare'), 'Mentions légales');
  for (const f of ['/assets/site.css', '/assets/site.js', '/assets/rendu.js', '/assets/polices.js', '/assets/admin.js', '/assets/admin.css']) {
    r = await req(f); verif(r.status === 200, 'Fichier ' + f);
  }
  const polices = (await import('../public/assets/polices.js')).POLICES[C.theme.polices];
  for (const [, , f] of polices.fichiers) { r = await req('/fonts/' + f); verif(r.status === 200, 'Police ' + f); }
  /* Chaque gabarit se rend sans erreur, avec sa classe, son menu, ses horaires et sans mot « undefined » */
  const { rendreSite, GABARITS } = await import('../public/assets/rendu.js');
  const { POLICES: TOUTES } = await import('../public/assets/polices.js');
  for (const g of GABARITS) {
    const page = rendreSite({ ...C, theme: { ...C.theme, gabarit: g } }, { maquette: false });
    verif(page.includes(`class="g-${g} `) && page.includes('id="horaires"') && page.includes('id="menu-btn"') && !/undefined|NaN|\[object Object\]/.test(page.replace(/<script[\s\S]*?<\/script>/g, '')), `Gabarit « ${g} » : page complète`);
  }
  for (const [nom, jeu] of Object.entries(TOUTES)) {
    for (const [, , f] of jeu.fichiers) { r = await req('/fonts/' + f); if (r.status !== 200) verif(false, `Police ${nom} : ${f} manquante`); }
  }
  r = await req('/photos/nexistepas'); verif(r.status === 404, 'Photo inconnue : 404');

  /* Espace boutique */
  r = await req('/admin'); verif([301, 302, 307, 308].includes(r.status) && /\/admin\/$/.test(r.headers.get('location') || ''), `/admin redirige vers /admin/ (${r.status} ${r.headers.get('location')})`);
  r = await req('/admin/'); const ha = await r.text();
  verif(r.status === 200 && ha.includes('noindex'), 'Page de l’espace boutique (non indexée)');
  verif(/no-store/.test(r.headers.get('cache-control') || '') && r.headers.get('x-frame-options') === 'DENY', 'Espace boutique : jamais en cache, pas dans un cadre');
  r = await req('/api/apparence'); let j = await r.json();
  verif(j.ok && j.boutique.nom === C.boutique.nom && j.theme.couleur === C.theme.couleur, 'Couleurs et nom pour l’écran de connexion');
  r = await req('/api/contenu'); verif(r.status === 401, 'Contenu refusé sans connexion');
  r = await req('/api/connexion', { method: 'POST', ...corpsJson({ motdepasse: 'mauvais-mot-de-passe' }) }); verif(r.status === 401, 'Mauvais mot de passe refusé');
  r = await req('/api/connexion', { method: 'POST', ...corpsJson({ motdepasse: MDP }) });
  const sc = r.headers.get('set-cookie') || '';
  cookie = (sc.match(/boutique_session=[^;]+/) || [''])[0];
  verif(r.status === 200 && cookie && /HttpOnly/i.test(sc) && /SameSite=Strict/i.test(sc) && /Secure/i.test(sc), 'Bon mot de passe : session ouverte (cookie protégé)');
  r = await req('/api/contenu'); j = await r.json();
  verif(j.ok && j.contenu._schema === 'site-boutique v2' && j.contenu.boutique.nom === C.boutique.nom, 'Lecture du contenu une fois connecté');
  const base = j.contenu;

  /* Enregistrement, réglages protégés */
  const m = structuredClone(base);
  m.annonce = { afficher: true, texte: 'Fermé exceptionnellement samedi' };
  m.horaires.lundi = [['10:00', '12:00']];
  m.metier = { pirate: true }; m.theme = { couleur: '#ff00ff' };
  r = await req('/api/contenu', { method: 'PUT', ...corpsJson(m) }); verif((await r.json()).ok, 'Enregistrement');
  h = await (await req('/')).text();
  verif(h.includes('Fermé exceptionnellement samedi') && h.includes('10h–12h'), 'Le message et un horaire modifiés apparaissent sur le site');
  j = await (await req('/api/contenu')).json();
  verif(JSON.stringify(j.contenu.metier) === JSON.stringify(base.metier) && j.contenu.theme.couleur === base.theme.couleur, 'Le métier et les couleurs ne peuvent pas être changés depuis l’espace boutique');

  /* Interrupteurs des parties */
  const sans = structuredClone(j.contenu);
  sans.sections = { boutique: false, produits: false, offres: false, presse: false, questions: false };
  await req('/api/contenu', { method: 'PUT', ...corpsJson(sans) });
  h = await (await req('/')).text();
  verif(['boutique', 'produits', 'offres', 'demande', 'presse', 'questions'].every((id) => !h.includes(`id="${id}"`)) && h.includes('id="horaires"'), 'Interrupteurs : toutes les parties masquées, horaires toujours là');
  if (formulaire) {
    r = await req('/api/commande', { method: 'POST', cookie: false, ...corpsJson({ sujet: 'x', nom: 'Test', telephone: '0600000000', lignes: [] }) });
    verif(r.status === 403, 'Demande refusée par le serveur quand la partie est masquée');
  }
  const avec = structuredClone(sans);
  avec.sections = { boutique: true, produits: true, offres: true, presse: true, questions: true };
  await req('/api/contenu', { method: 'PUT', ...corpsJson(avec) });
  h = await (await req('/')).text();
  const attendu = { boutique: !!(C.textes.boutique_titre || C.textes.boutique_texte), produits: C.produits.length > 0, offres: C.offres.length > 0, questions: C.questions.length > 0, demande: !!(K.actif && C.offres.length && D.type !== 'lien') };
  verif(Object.entries(attendu).every(([id, oui]) => h.includes(`id="${id}"`) === oui), 'Interrupteurs : les parties reviennent');

  /* Photo */
  const jpeg = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
  r = await req('/api/photo', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: jpeg }); j = await r.json();
  verif(j.ok && /^\/photos\/[a-z0-9-]+$/.test(j.url), 'Envoi d’une photo');
  if (j.ok) { r = await req(j.url); verif(r.status === 200 && r.headers.get('content-type') === 'image/jpeg' && /immutable/.test(r.headers.get('cache-control') || ''), 'La photo envoyée s’affiche'); }

  /* Vidéo de fond : envoi et lecture par morceaux (Safari en a besoin) */
  const fauxMp4 = Buffer.alloc(4096, 7);
  r = await req('/api/video', { method: 'POST', headers: { 'Content-Type': 'video/mp4' }, body: fauxMp4 }); j = await r.json();
  verif(j.ok && /^\/videos\//.test(j.url), 'Envoi d’une vidéo');
  if (j.ok) {
    r = await req(j.url, { cookie: false, headers: { Range: 'bytes=0-99' } });
    verif(r.status === 206 && r.headers.get('content-range') === 'bytes 0-99/4096' && (await r.arrayBuffer()).byteLength === 100, 'La vidéo se lit par morceaux');
    r = await req(j.url, { cookie: false }); verif(r.status === 200 && r.headers.get('content-type') === 'video/mp4' && r.headers.get('accept-ranges') === 'bytes', 'La vidéo s’affiche en entier');
  }
  r = await req('/api/video', { method: 'POST', headers: { 'Content-Type': 'video/quicktime' }, body: fauxMp4 }); verif(r.status === 415, 'Vidéo .mov refusée (format non lu partout)');
  r = await req('/api/photo', { method: 'POST', headers: { 'Content-Type': 'text/html' }, body: '<b>' }); verif(r.status === 415, 'Fichier qui n’est pas une photo refusé');

  /* Demande d'un client */
  if (formulaire) {
    r = await req('/api/commande', { method: 'POST', cookie: false, ...corpsJson({ sujet: 'Commande de test', nom: 'Client Test', telephone: '06 00 00 00 00', quantite: 6, lignes: [['Choix', C.offres[0].nom], ['Nom', 'Client Test']] }) });
    verif(r.status === 200, 'Un client envoie une demande');
    r = await req('/api/commande', { method: 'POST', cookie: false, ...corpsJson({ nom: '', telephone: '12', lignes: [] }) });
    verif(r.status === 400, 'Demande incomplète refusée');
    j = await (await req('/api/commandes')).json();
    const cmd = (j.commandes || []).find((c) => c.nom === 'Client Test');
    verif(cmd && cmd.statut === 'nouvelle', 'La demande arrive dans l’espace boutique');
    if (cmd) {
      r = await req('/api/commandes/' + cmd.id, { method: 'PATCH', ...corpsJson({ statut: 'confirmee' }) }); verif(r.status === 200, 'Changement de statut');
      j = await (await req('/api/commandes')).json();
      verif(j.commandes.find((c) => c.id === cmd.id).statut === 'confirmee', 'Le statut est gardé');
      r = await req('/api/commandes/' + cmd.id, { method: 'PATCH', ...corpsJson({ statut: 'nimportequoi' }) }); verif(r.status === 400, 'Statut inconnu refusé');
    }
  } else console.log('  (pas de formulaire de demande pour cette boutique : tests des demandes sautés)');

  /* Retour en arrière, déconnexion */
  r = await req('/api/annuler', { method: 'POST' }); j = await r.json();
  verif(j.ok && j.contenu.sections.boutique === false, 'Revenir en arrière rétablit la version précédente');
  r = await req('/api/deconnexion', { method: 'POST' }); verif(/Max-Age=0/.test(r.headers.get('set-cookie') || ''), 'Déconnexion');
  cookie = '';
  r = await req('/api/contenu'); verif(r.status === 401, 'Après déconnexion, le contenu est refusé');
  r = await req('/api/contenu', { method: 'PUT', ...corpsJson(base) }); verif(r.status === 401, 'Enregistrement refusé sans connexion');

  /* Limites */
  for (let i = 0; i < 8; i++) await req('/api/connexion', { method: 'POST', ...corpsJson({ motdepasse: 'faux-' + i }) });
  r = await req('/api/connexion', { method: 'POST', ...corpsJson({ motdepasse: MDP }) });
  verif(r.status === 429, 'Après 8 mauvais mots de passe, la connexion est bloquée un quart d’heure');
}

const pret = await attendre();
if (!pret) { console.error('\nLe serveur local ne démarre pas. Journal :\n' + journal.slice(-3000)); arreter(); process.exit(1); }
try { await tests(); } catch (e) { echecs.push('Erreur pendant les tests : ' + e.message); console.log('  ÉCHEC   ' + e.stack); }
arreter();
console.log(`\n${ok} vérification(s) réussie(s), ${echecs.length} échec(s).\n`);
process.exit(echecs.length ? 1 : 0);
