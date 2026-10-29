/* Espace boutique. Fonctionne avec le serveur (mode normal) ou seul dans un fichier (mode démonstration). */
import { rendreSite, horaires, JOURS, voc, cssTheme, cap, favicon } from './rendu.js';

const DEMO = window.ESPACE_DEMO || null;
const $ = (s, r) => (r || document).querySelector(s);
const el = (tag, attrs, ...enfants) => {
  const e = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v == null || v === false) return;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  });
  enfants.flat(Infinity).forEach((c) => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); });
  return e;
};
const copie = (o) => JSON.parse(JSON.stringify(o));
let nId = 0; const uid = (p) => (p || 'c') + (++nId);

/* ---------- Accès aux données ---------- */
const vraiApi = {
  async charger() {
    const r = await fetch('/api/contenu', { credentials: 'same-origin' });
    if (r.status === 401) return null;
    const j = await r.json();
    if (!j.ok) throw new Error(j.erreur || 'Erreur');
    return j;
  },
  async connexion(mdp) {
    const r = await fetch('/api/connexion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ motdepasse: mdp }) });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Connexion impossible.');
  },
  async deconnexion() { await fetch('/api/deconnexion', { method: 'POST' }); },
  async motDePasse(actuel, nouveau) {
    const r = await fetch('/api/mot-de-passe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actuel, nouveau }) });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Changement impossible.');
  },
  async enregistrer(C) {
    const r = await fetch('/api/contenu', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(C) });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) throw Object.assign(new Error(j.erreur), { session: true });
    if (!j.ok) throw new Error(j.erreur || 'Enregistrement impossible.');
  },
  async annuler() {
    const r = await fetch('/api/annuler', { method: 'POST' });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Impossible de revenir en arrière.');
    return j.contenu;
  },
  async video(fichier) {
    const r = await fetch('/api/video', { method: 'POST', headers: { 'Content-Type': fichier.type }, body: fichier });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Envoi de la vidéo impossible.');
    return j.url;
  },
  async photo(blob) {
    const r = await fetch('/api/photo', { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Envoi de la photo impossible.');
    return j.url;
  },
  async commandes() {
    const r = await fetch('/api/commandes');
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Commandes indisponibles.');
    return j.commandes;
  },
  async statut(id, statut) {
    const r = await fetch('/api/commandes/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statut }) });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(j.erreur || 'Modification impossible.');
  },
};

/* Petite mémoire du navigateur. Si le navigateur la refuse (aperçu protégé, navigation privée),
   on garde tout en mémoire le temps de la visite : la démonstration fonctionne quand même. */
const memoire = {};
/* La mémoire du navigateur est-elle utilisable ? (non dans l'aperçu de l'app Claude) */
const stockageOk = (() => { try { localStorage.setItem('espace-test', '1'); localStorage.removeItem('espace-test'); return true; } catch (e) { return false; } })();
/* Démonstration : les images déjà dans le fichier ne sont pas recopiées dans la mémoire du navigateur (place limitée à quelques Mo) */
const imagesDemo = [], indexDemo = new Map();
if (DEMO) JSON.stringify(DEMO.contenu, (k, x) => { if (typeof x === 'string' && x.length > 2000 && x.startsWith('data:') && !indexDemo.has(x)) { indexDemo.set(x, imagesDemo.length); imagesDemo.push(x); } return x; });
const versTexte = (v) => JSON.stringify(v, (k, x) => (typeof x === 'string' && indexDemo.has(x) ? '@image-demo:' + indexDemo.get(x) : x));
const depuisTexte = (t) => JSON.parse(t, (k, x) => (typeof x === 'string' && x.startsWith('@image-demo:') ? imagesDemo[+x.slice(12)] || '' : x));
/* Chaque démonstration a sa propre mémoire : tous les fichiers ouverts depuis l'ordinateur partagent la même mémoire du navigateur,
   la clé dépend donc du site et de sa version (une nouvelle démonstration repart toujours de zéro). */
const empreinte = (t) => { let h = 5381; for (let i = 0; i < t.length; i += 7) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h.toString(36) + t.length.toString(36); };
const PREFIXE = DEMO ? 'demo-' + empreinte(JSON.stringify(DEMO.contenu)) + '-' : 'espace-';
if (DEMO) { try { Object.keys(localStorage).filter((k) => k.startsWith('espace-demo-')).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* rien */ } }
function remettreAZero() {
  Object.keys(memoire).forEach((k) => { if (k.startsWith(PREFIXE)) delete memoire[k]; });
  try { Object.keys(localStorage).filter((k) => k.startsWith(PREFIXE)).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* rien */ }
}
const memo = {
  persiste: true,
  lire(k, d) {
    const c = PREFIXE + k;
    if (c in memoire) return depuisTexte(memoire[c]);
    try { const v = localStorage.getItem(c); return v ? depuisTexte(v) : d; } catch (e) { return d; }
  },
  ecrire(k, v) {
    const c = PREFIXE + k, s = versTexte(v);
    let ok = true;
    try { localStorage.setItem(c, s); } catch (e) { ok = false; }
    if (ok || DEMO) memoire[c] = s;
    if (DEMO && k === 'contenu') memo.persiste = ok;
    return ok || !!DEMO;
  },
};
const demoApi = {
  async charger() { return memo.lire('connecte', false) ? { contenu: memo.lire('contenu', copie(DEMO.contenu)), maquette: true } : null; },
  async connexion() { memo.ecrire('connecte', true); },
  async deconnexion() { memo.ecrire('connecte', false); },
  async motDePasse() { throw new Error('Indisponible dans la démonstration : le vrai site a son propre mot de passe.'); },
  async enregistrer(C) {
    const avant = memo.lire('contenu', copie(DEMO.contenu));
    if (!memo.ecrire('contenu', C)) throw new Error('Mémoire du téléphone pleine : retirez une photo.');
    /* « Revenir en arrière » de la démonstration : gardé pendant la visite, pour laisser la place au contenu */
    memoire[PREFIXE + 'precedent'] = versTexte(avant);
    try { localStorage.removeItem(PREFIXE + 'precedent'); } catch (e) { /* rien */ }
  },
  async annuler() { const p = memo.lire('precedent', null); if (!p) throw new Error('Aucune version précédente.'); memo.ecrire('contenu', p); return p; },
  async photo(blob) { return await new Promise((ok) => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(blob); }); },
  async video(fichier) { return await new Promise((ok) => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(fichier); }); },
  async commandes() {
    const V = voc(E.C || DEMO.contenu), o = (E.C || DEMO.contenu).offres || [], D = V.demande;
    const ex = (id, h, statut, nom, n, quand, txt) => {
      const lignes = [[cap(V.offres.singulier), (o[0] && o[0].nom) || cap(V.offres.singulier)]];
      if (D.quantite && n) lignes.push([D.quantite, String(n)]);
      lignes.push([D.date, quand], [D.precisions, txt], ['Nom', nom], ['Téléphone', '06 00 00 00 0' + id.slice(-1)]);
      return { id, recue: new Date(Date.now() - h * 3600e3).toISOString(), statut, nom, quantite: D.quantite ? n : null, lignes };
    };
    return memo.lire('commandes', [
      ex('ex1', 1, 'nouvelle', 'Exemple : Mme Martin', 8, 'samedi 19 décembre 2026, 10h30', D.exemple ? D.exemple.replace(/^Ex\. : /, '') : 'Rien de particulier'),
      ex('ex2', 26, 'confirmee', 'Exemple : M. Durand', 6, 'vendredi 18 décembre 2026, 18h', 'Rien de particulier'),
    ]);
  },
  async statut(id, statut) { const l = await demoApi.commandes(); l.forEach((c) => { if (c.id === id) c.statut = statut; }); memo.ecrire('commandes', l); },
};
const api = DEMO ? demoApi : vraiApi;

/* ---------- État ---------- */
const E = { C: null, base: '', maquette: false, ouverts: new Set(['annonce']) };
const modifie = () => JSON.stringify(E.C) !== E.base;
const racine = $('#app');

function toast(t) {
  let b = $('.toast'); if (!b) { b = el('div', { class: 'toast', role: 'status' }); document.body.append(b); }
  b.textContent = t; b.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { b.hidden = true; }, Math.max(3200, t.length * 55));
}

/* ---------- Connexion ---------- */
function ecranConnexion(message) {
  racine.replaceChildren();
  if (DEMO) appliquerTheme(DEMO.contenu);
  else if (!E.apparence) fetch('/api/apparence').then((r) => r.json()).then((j) => { if (j && j.ok) { E.apparence = j; appliquerTheme(j); const h = document.querySelector('.connexion h1'); if (h) h.textContent = j.boutique.nom; } }).catch(() => {});
  const nom = (DEMO && DEMO.contenu.boutique.nom) || (E.apparence && E.apparence.boutique.nom) || 'Votre boutique';
  const input = el('input', { id: 'mdp', type: 'password', autocomplete: 'current-password', required: true, placeholder: DEMO ? 'Tapez n’importe quoi' : '' });
  const voir = el('button', { type: 'button', text: 'Afficher', onclick: () => { input.type = input.type === 'password' ? 'text' : 'password'; voir.textContent = input.type === 'password' ? 'Afficher' : 'Masquer'; } });
  const err = el('p', { class: 'erreur', role: 'alert', hidden: !message, text: message || '' });
  /* bouton simple (pas « submit ») : fonctionne aussi dans les aperçus qui bloquent les formulaires */
  const seConnecter = async (e) => {
    if (e) e.preventDefault();
    if (bouton.disabled) return;
    err.hidden = true; bouton.disabled = true; bouton.textContent = 'Connexion…';
    try { await api.connexion(input.value); await demarrer(); }
    catch (x) { err.textContent = x.message; err.hidden = false; bouton.disabled = false; bouton.textContent = 'Se connecter'; }
  };
  const bouton = el('button', { class: 'btn', type: 'button', id: 'btn-connexion', text: 'Se connecter', onclick: seConnecter });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') seConnecter(e); });
  const form = el('form', {
    onsubmit: seConnecter,
  },
  el('h1', { text: nom }),
  el('p', { class: 'sous', text: 'Page de modification' }),
  DEMO ? el('p', { class: 'aide', text: 'Démonstration : aucun mot de passe n’est demandé, vos essais restent sur ce téléphone.' }) : null,
  el('div', { class: 'champ' }, el('label', { for: 'mdp', text: 'Mot de passe' }), el('div', { class: 'mdp' }, input, voir)),
  err, bouton,
  el('p', { class: 'aide', text: 'Mot de passe oublié ? Appelez Grégoire.' }),
  DEMO ? el('button', { type: 'button', class: 'btn sec', text: 'Revoir le site', onclick: vueSiteDemo }) : null,
  DEMO ? el('button', { type: 'button', class: 'btn discret', text: 'Remettre la démonstration à zéro', onclick: () => { remettreAZero(); ecranConnexion(); toast('Démonstration remise à zéro : le site est revenu à sa version d’origine.'); } }) : null);
  racine.append(el('main', { class: 'connexion' }, form));
  input.focus();
}

/* ---------- Champs ---------- */
function lire(obj, chemin) { return chemin.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj); }
function ecrire(obj, chemin, v) { const ks = chemin.split('.'); const der = ks.pop(); let o = obj; ks.forEach((k) => { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; }); o[der] = v; }

function champ(obj, def, apres) {
  const id = uid('f');
  const val = lire(obj, def.k);
  const maj = (v) => { ecrire(obj, def.k, v); changement(); if (apres) apres(); };
  const lab = el('label', { for: id }, def.l, def.ex ? el('span', { class: 'ex', text: ' (' + def.ex + ')' }) : null);
  if (def.t === 'case') {
    const c = el('input', { id, type: 'checkbox', checked: !!val, onchange: (e) => maj(e.target.checked) });
    return el('div', { class: 'champ' }, el('label', { class: 'interrupteur', for: id }, c, el('span', { class: 'rail', 'aria-hidden': 'true' }), def.l));
  }
  if (def.t === 'zone') return el('div', { class: 'champ' }, lab, el('textarea', { id, class: 'saisie', rows: def.lignes || 3, placeholder: def.ph || '', oninput: (e) => maj(e.target.value) }, val || ''));
  if (def.t === 'choix') {
    const s = el('select', { id, class: 'saisie', onchange: (e) => maj(e.target.value) }, el('option', { value: '', text: '—' }), def.options.map((o) => el('option', { value: o, text: o, selected: o === val })));
    return el('div', { class: 'champ' }, lab, s);
  }
  if (def.t === 'nombre') return el('div', { class: 'champ' }, lab, el('input', { id, class: 'saisie', type: 'number', inputmode: 'numeric', min: def.min, max: def.max, value: val == null ? '' : val, oninput: (e) => maj(e.target.value === '' ? '' : +e.target.value) }));
  if (def.t === 'photo') return champPhoto(id, def, val, maj);
  if (def.t === 'video') return champVideo(id, def, val, maj);
  return el('div', { class: 'champ' }, lab, el('input', { id, class: 'saisie', type: def.type || 'text', inputmode: def.mode, placeholder: def.ph || '', value: val || '', oninput: (e) => maj(e.target.value) }));
}

async function reduire(fichier, maxCote, qualite) {
  const url = URL.createObjectURL(fichier);
  try {
    const im = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error('Photo illisible : essayez une autre.')); i.src = url; });
    const r = Math.min(1, maxCote / Math.max(im.naturalWidth, im.naturalHeight));
    const cv = document.createElement('canvas');
    cv.width = Math.round(im.naturalWidth * r); cv.height = Math.round(im.naturalHeight * r);
    cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
    return await new Promise((ok) => cv.toBlob(ok, 'image/jpeg', qualite));
  } finally { URL.revokeObjectURL(url); }
}

/* Vidéo de fond : fichier MP4 ou WebM (20 Mo au plus), ou lien */
const VIDEO_OK = /^(https:\/\/\S+\.(mp4|webm)(\?\S*)?|\/videos\/[a-z0-9-]+|\/assets\/\S+\.(mp4|webm)|data:video\/(mp4|webm);base64,\S+)$/i;
function champVideo(id, def, val, maj) {
  const etat = el('span', { class: 'ex', 'aria-live': 'polite' });
  const apercu = el('div', { class: 'video-apercu' });
  const montrer = (v) => {
    apercu.replaceChildren();
    if (v && VIDEO_OK.test(v)) apercu.append(el('video', { src: v, muted: true, loop: true, playsinline: true, autoplay: true, preload: 'metadata', 'aria-hidden': 'true' }));
    retirer.hidden = !v; lien.value = v && !/^data:/.test(v) ? v : '';
  };
  const max = DEMO ? 8 : 20;
  const fichier = el('input', {
    id, type: 'file', accept: 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov',
    onchange: async (e) => {
      const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
      if (!/^video\/(mp4|webm)$/.test(f.type)) { etat.textContent = 'Ce format (souvent .mov sur iPhone) ne se lit pas partout : il faut un fichier MP4. Voir « Vidéo de fond » dans le guide, ou envoyez la vidéo à Grégoire.'; return; }
      if (f.size > max * 1024 * 1024) { etat.textContent = `Vidéo trop lourde (${Math.round(f.size / 1048576)} Mo) : ${max} Mo au plus${DEMO ? ' dans la démonstration' : ''}. Raccourcissez-la (10 à 20 secondes suffisent) ou réduisez sa qualité.`; return; }
      etat.textContent = 'Envoi de la vidéo…';
      try { const u = await api.video(f); maj(u); montrer(u); etat.textContent = 'Vidéo prête : cochez « Vidéo en fond » si besoin, puis enregistrez.'; } catch (x) { etat.textContent = x.message; }
    },
  });
  const choisir = el('label', { class: 'btn sec petit', for: id, text: val ? 'Changer la vidéo' : 'Choisir une vidéo' });
  const retirer = el('button', { type: 'button', class: 'btn discret petit', text: 'Retirer', onclick: () => { maj(''); montrer(''); etat.textContent = 'Vidéo retirée : la photo reprend sa place.'; } });
  const lien = el('input', { class: 'saisie', type: 'url', placeholder: 'ou collez un lien https://….mp4', 'aria-label': 'Lien de la vidéo', onchange: (e) => { const v = e.target.value.trim(); if (!v) return; if (!VIDEO_OK.test(v)) { etat.textContent = 'Lien non valable : il doit commencer par https:// et finir par .mp4 ou .webm.'; return; } maj(v); montrer(v); etat.textContent = 'Lien enregistré : pensez à enregistrer.'; } });
  montrer(val);
  return el('div', { class: 'champ' }, el('span', { class: 'lab', text: def.l }), def.ex ? el('span', { class: 'ex', text: def.ex }) : null,
    el('div', { class: 'video-champ' }, apercu, el('div', {}, el('div', { class: 'actions' }, choisir, retirer, fichier), lien, etat)));
}

function champPhoto(id, def, val, maj) {
  const vignette = el('div', { class: 'vignette', 'aria-hidden': 'true' });
  const montrer = (v) => { vignette.style.backgroundImage = v ? `url("${String(v).replace(/"/g, '%22')}")` : ''; retirer.hidden = !v; };
  const etat = el('span', { class: 'ex', 'aria-live': 'polite' });
  const fichier = el('input', {
    id, type: 'file', accept: 'image/*',
    onchange: async (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      etat.textContent = 'Préparation de la photo…';
      try {
        const blob = await reduire(f, DEMO ? 1200 : 1800, DEMO ? 0.72 : 0.82);
        etat.textContent = 'Envoi…';
        const u = await api.photo(blob);
        maj(u); montrer(u); etat.textContent = 'Photo prête : pensez à enregistrer.';
      } catch (x) { etat.textContent = x.message; }
      e.target.value = '';
    },
  });
  const choisir = el('label', { class: 'btn sec petit', for: id, text: val ? 'Changer la photo' : 'Choisir une photo' });
  const retirer = el('button', { type: 'button', class: 'btn discret petit', text: 'Retirer', onclick: () => { maj(''); montrer(''); choisir.textContent = 'Choisir une photo'; } });
  montrer(val);
  return el('div', { class: 'champ' }, el('span', { class: 'lab', text: def.l }),
    el('div', { class: 'photo' }, vignette, el('div', {}, el('div', { class: 'actions' }, choisir, retirer, fichier), etat)));
}

/* ---------- Listes (fromages, plateaux, questions, presse) ---------- */
function editeurListe(cle, cfg) {
  const boite = el('div', { class: 'liste' });
  const dessiner = (ouvrir) => {
    const L = E.C[cle] = E.C[cle] || [];
    boite.replaceChildren();
    L.forEach((it, i) => {
      const titre = el('b', { text: it[cfg.titre] || cfg.sansTitre });
      const sous = el('span', { class: 's', text: cfg.sous ? cfg.sous(it) : '' });
      const mini = cfg.photo ? el('span', { class: 'mini', hidden: !it[cfg.photo], style: it[cfg.photo] ? `background-image:url("${String(it[cfg.photo]).replace(/"/g, '%22')}")` : '' }) : null;
      const majResume = () => { titre.textContent = it[cfg.titre] || cfg.sansTitre; sous.textContent = cfg.sous ? cfg.sous(it) : ''; if (mini) mini.hidden = !it[cfg.photo]; if (mini) mini.style.backgroundImage = it[cfg.photo] ? `url("${String(it[cfg.photo]).replace(/"/g, '%22')}")` : ''; };
      const sup = el('button', {
        type: 'button', class: 'btn danger petit', text: 'Supprimer',
        onclick: () => {
          if (!sup.classList.contains('confirmer')) { sup.classList.add('confirmer'); sup.textContent = 'Confirmer la suppression'; setTimeout(() => { sup.classList.remove('confirmer'); sup.textContent = 'Supprimer'; }, 4000); return; }
          L.splice(i, 1); changement(); dessiner();
        },
      });
      const bouger = (d) => { const j = i + d; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; changement(); dessiner(j); };
      const corps = el('div', { class: 'item-corps' },
        el('div', { class: 'grille' }, cfg.champs.map((def) => champ(it, def, majResume))),
        el('div', { class: 'item-outils' },
          el('div', { class: 'ordre' },
            el('button', { type: 'button', class: 'btn sec petit', disabled: i === 0, onclick: () => bouger(-1), 'aria-label': 'Monter', text: 'Monter' }),
            el('button', { type: 'button', class: 'btn sec petit', disabled: i === L.length - 1, onclick: () => bouger(1), 'aria-label': 'Descendre', text: 'Descendre' })),
          sup));
      boite.append(el('details', { class: 'item', open: ouvrir === i }, el('summary', {}, mini, el('span', { class: 'txt' }, titre, sous)), corps));
    });
    if (!L.length) boite.append(el('p', { class: 'vide', text: cfg.vide }));
    boite.append(el('button', { type: 'button', class: 'btn sec ajouter', text: cfg.ajouter, onclick: () => { L.push(copie(cfg.nouveau)); changement(); dessiner(L.length - 1); const f = boite.querySelector('details[open] input, details[open] textarea'); if (f) f.focus(); } }));
  };
  dessiner();
  return boite;
}

/* ---------- Horaires ---------- */
const ORDRE = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
/* Contrôle des horaires : chaque plage ouvre avant de fermer, et les plages d'un même jour ne se chevauchent pas */
function erreurHoraires() {
  const H = E.C.horaires || {};
  for (const j of ORDRE) {
    const plages = Array.isArray(H[j]) ? H[j] : [];
    for (let i = 0; i < plages.length; i++) {
      const [a, b] = plages[i];
      if (!a || !b) return `${j} : renseignez l’heure d’ouverture et de fermeture.`;
      if (a >= b) return `${j} : la fermeture (${b}) doit être après l’ouverture (${a}).`;
      if (i > 0 && a < plages[i - 1][1]) return `${j} : les plages se chevauchent.`;
    }
  }
  return '';
}
function editeurHoraires() {
  const H = E.C.horaires = E.C.horaires || {};
  const boite = el('div', { class: 'jours' });
  const alerte = el('p', { class: 'aide', role: 'alert', hidden: true, style: 'color:#9a1b1b;font-weight:600' });
  const verifier = () => { const m = erreurHoraires(); alerte.textContent = m; alerte.hidden = !m; };
  const dessiner = () => {
    boite.replaceChildren();
    ORDRE.forEach((j) => {
      const plages = H[j] = Array.isArray(H[j]) ? H[j] : [];
      const id = uid('o');
      const ouvert = el('input', { id, type: 'checkbox', checked: plages.length > 0, onchange: (e) => { H[j] = e.target.checked ? [['09:00', '13:00']] : []; changement(); dessiner(); } });
      const droite = el('div', { class: 'plages' },
        el('label', { class: 'interrupteur', for: id }, ouvert, el('span', { class: 'rail', 'aria-hidden': 'true' }), plages.length ? 'Ouvert' : 'Fermé'));
      plages.forEach((p, i) => {
        const a = el('input', { class: 'saisie', type: 'time', step: 900, value: p[0], 'aria-label': `${j}, ouverture`, onchange: (e) => { p[0] = e.target.value; changement(); verifier(); } });
        const b = el('input', { class: 'saisie', type: 'time', step: 900, value: p[1], 'aria-label': `${j}, fermeture`, onchange: (e) => { p[1] = e.target.value; changement(); verifier(); } });
        droite.append(el('div', { class: 'plage' }, a, el('span', { text: 'à' }), b,
          plages.length > 1 ? el('button', { type: 'button', class: 'btn discret petit', text: 'Retirer', onclick: () => { plages.splice(i, 1); changement(); dessiner(); } }) : null));
      });
      if (plages.length && plages.length < 3) droite.append(el('button', { type: 'button', class: 'btn discret petit', style: 'justify-self:start', text: 'Ajouter une plage (pause de midi)', onclick: () => { const d = plages[plages.length - 1]; plages.push([d[1] < '15:30' ? '15:30' : d[1], '19:30']); changement(); dessiner(); } }));
      boite.append(el('div', { class: 'jour' }, el('span', { class: 'nomj', text: j }), droite));
    });
  };
  dessiner(); verifier();
  return el('div', { class: 'pan-corps', style: 'padding:0' }, boite, alerte,
    champ(E.C, { k: 'horaires_note', l: 'Précision sous les horaires', ex: 'facultatif', ph: 'Ex. : horaires élargis pendant les fêtes' }));
}

/* ---------- Demandes reçues ---------- */
const STATUTS = [['nouvelle', 'Nouvelle'], ['confirmee', 'Confirmée'], ['retiree', 'Terminée'], ['annulee', 'Annulée']];
function listeCommandes() {
  const V = voc(E.C);
  const boite = el('div', { class: 'cmds' }, el('p', { class: 'aide', text: 'Chargement des demandes…' }));
  const charger = async () => {
    try {
      const L = await api.commandes();
      E.nouvelles = L.filter((c) => c.statut === 'nouvelle').length;
      majResumes();
      boite.replaceChildren();
      if (!L.length) { boite.append(el('p', { class: 'vide', text: 'Aucune demande pour l’instant. Elles arrivent aussi par e-mail.' })); return; }
      L.forEach((c) => {
        const lignes = Array.isArray(c.lignes) ? c.lignes : [];
        const etiquette = el('span', { class: 'etiquette ' + c.statut, text: (STATUTS.find((s) => s[0] === c.statut) || [, c.statut])[1] });
        const titre = (c.nom || 'Client') + (c.quantite ? ', ' + c.quantite + (V.demande.unite ? ' ' + V.demande.unite : '') : '');
        const carte = el('div', { class: 'cmd ' + c.statut },
          el('div', { class: 'cmd-tete' }, el('b', { text: titre }), etiquette),
          el('dl', {}, lignes.filter((l) => l[0] !== 'Nom').map(([k, v]) => [el('dt', { text: k }), el('dd', {}, k === 'Téléphone' ? el('a', { href: 'tel:' + String(v).replace(/[^\d+]/g, ''), text: v }) : v)]),
            el('dt', { text: 'Reçue' }), el('dd', { text: new Date(c.recue).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) })),
          el('div', { class: 'statuts', role: 'group', 'aria-label': 'Statut' }, STATUTS.map(([v, t]) => el('button', {
            type: 'button', 'aria-pressed': String(c.statut === v), text: t,
            onclick: async () => { try { await api.statut(c.id, v); charger(); } catch (x) { toast(x.message); } },
          }))));
        boite.append(carte);
      });
    } catch (x) { boite.replaceChildren(el('p', { class: 'erreur', text: x.message })); }
  };
  charger();
  return el('div', { class: 'pan-corps', style: 'padding:0' },
    el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px' }, el('h3', { text: 'Demandes reçues', style: 'font-size:1.125rem' }), el('button', { type: 'button', class: 'btn discret petit', text: 'Actualiser', onclick: charger })),
    boite);
}

/* ---------- Mot de passe : changé ici, gardé par le serveur (empreinte, jamais le mot de passe) ---------- */
function blocMotDePasse() {
  const champMdp = (id, libelle, auto) => { const i = el('input', { id, type: 'password', autocomplete: auto, class: 'saisie' }); return [i, el('div', { class: 'champ' }, el('label', { for: id, text: libelle }), i)]; };
  const [a, ba] = champMdp('mdp-actuel', 'Mot de passe actuel', 'current-password');
  const [n, bn] = champMdp('mdp-nouveau', 'Nouveau mot de passe (12 caractères au moins)', 'new-password');
  const [c, bc] = champMdp('mdp-confirme', 'Nouveau mot de passe, une seconde fois', 'new-password');
  const msg = el('p', { class: 'aide', role: 'status', 'aria-live': 'polite' });
  const dire = (texte, erreur) => { msg.textContent = texte; msg.className = erreur ? 'erreur' : 'aide'; msg.setAttribute('role', erreur ? 'alert' : 'status'); };
  const bouton = el('button', { type: 'button', class: 'btn', text: 'Changer le mot de passe', onclick: async () => {
    if (n.value.length < 12) return dire('Le nouveau mot de passe doit faire 12 caractères au moins (une phrase, par exemple).', true);
    if (n.value !== c.value) return dire('Les deux nouveaux mots de passe ne sont pas identiques.', true);
    bouton.disabled = true; dire('Changement en cours…');
    try { await api.motDePasse(a.value, n.value); a.value = n.value = c.value = ''; dire('Mot de passe changé. Gardez-le dans un gestionnaire de mots de passe : il ne peut pas être relu.'); }
    catch (x) { dire(x.message, true); }
    bouton.disabled = false;
  } });
  return el('div', { class: 'pan-corps', style: 'padding:0' },
    el('p', { class: 'aide', text: 'Choisissez une phrase longue et unique, que vous n’utilisez nulle part ailleurs. Vous restez connecté ; les autres appareils devront utiliser le nouveau mot de passe à leur prochaine connexion. Si vous l’oubliez, Grégoire peut le réinitialiser.' }),
    ba, bn, bc, el('div', { class: 'actions' }, bouton), msg);
}

/* ---------- Rubriques (construites avec le vocabulaire du métier) ---------- */
const nb = (n, sing, plur, e) => n + ' ' + (n > 1 ? plur : sing) + ' affiché' + (e || '') + (n > 1 ? 's' : '');
const masque = (k) => E.C.sections && E.C.sections[k] === false;
const interrupteurPartie = (k, texte) => champ(E.C, { k: 'sections.' + k, l: texte || 'Afficher cette partie sur le site', t: 'case' });

function panneaux() {
  const V = voc(E.C), P = V.produits, O = V.offres, D = V.demande;
  const familles = P.famille && P.familles.length ? P.familles.map((f) => f[0]) : null;
  const sousProduit = (f) => [f.origine, familles && f.famille ? P.famille.toLowerCase() + ' : ' + f.famille.toLowerCase() : '', f.prix].filter(Boolean).join(', ');
  const L = [
    {
      id: 'annonce', titre: 'Message en haut du site',
      resume: () => (E.C.annonce && E.C.annonce.afficher && E.C.annonce.texte ? 'Affiché : « ' + E.C.annonce.texte + ' »' : 'Aucun message affiché'),
      corps: () => [
        el('p', { class: 'aide', text: 'Pour une fermeture exceptionnelle, les commandes des fêtes, une nouveauté…' }),
        champ(E.C, { k: 'annonce.afficher', l: 'Afficher le message', t: 'case' }),
        champ(E.C, { k: 'annonce.texte', l: 'Texte du message', ph: 'Ex. : Fermé le samedi 1er novembre' }),
      ],
    },
    {
      id: 'horaires', titre: 'Horaires',
      resume: () => { const { TXT } = horaires(E.C); const d = new Date().getDay(); return 'Aujourd’hui (' + JOURS[d] + ') : ' + TXT[d].toLowerCase(); },
      corps: () => [editeurHoraires()],
    },
    {
      id: 'produits', titre: P.rubrique,
      resume: () => (masque('produits') ? 'Masqué sur le site' : nb((E.C.produits || []).length, P.singulier, P.pluriel, P.e)),
      corps: () => [
        interrupteurPartie('produits'),
        el('p', { class: 'aide', text: (familles ? `Sur le site, ils sont rangés par ${P.famille.toLowerCase()}. ` : '') + 'Le prix et la photo sont facultatifs.' }),
        editeurListe('produits', {
          titre: 'nom', sansTitre: P.nouveau, sous: sousProduit, photo: 'photo', vide: 'La liste est vide pour l’instant.', ajouter: P.ajouter,
          nouveau: { nom: '', origine: '', famille: familles ? familles[0] : '', detail: '', prix: '', photo: '' },
          champs: [
            { k: 'nom', l: 'Nom' }, { k: 'origine', l: P.origine, ex: 'facultatif' },
            familles ? { k: 'famille', l: P.famille, t: 'choix', options: familles } : null,
            { k: 'detail', l: 'Précision', ex: 'facultatif', ph: P.exPrecision ? 'Ex. : ' + P.exPrecision : '' },
            { k: 'prix', l: 'Prix', ex: 'facultatif', ph: P.exPrix ? 'Ex. : ' + P.exPrix : '' }, { k: 'photo', l: 'Photo', t: 'photo' },
          ].filter(Boolean),
        }),
      ],
    },
    {
      id: 'offres', titre: O.rubrique,
      resume: () => (masque('offres') ? 'Masqué sur le site' : nb((E.C.offres || []).length, O.singulier, O.pluriel, O.e)),
      corps: () => [
        interrupteurPartie('offres', `Afficher les ${O.pluriel} sur le site${D.type === 'lien' ? '' : ' (et le formulaire de demande)'}`),
        D.quantite && D.parUnite ? el('p', { class: 'aide', text: `Avec un prix ${D.parUnite}, le formulaire affiche une estimation au client.` }) : null,
        editeurListe('offres', {
          titre: 'nom', sansTitre: O.nouveau, sous: (p) => p.prix || (p.prix_unite && D.parUnite ? p.prix_unite + ' € ' + D.parUnite : (D.type === 'devis' ? 'Prix sur devis' : 'Prix selon la composition')),
          vide: 'La liste est vide pour l’instant.', ajouter: O.ajouter, nouveau: { nom: '', description: '', prix: '', prix_unite: '' },
          champs: [
            { k: 'nom', l: 'Nom' }, { k: 'description', l: 'Description', t: 'zone' },
            { k: 'prix', l: 'Prix affiché', ex: 'facultatif', ph: 'Ex. : à partir de 35 €' },
            D.quantite && D.parUnite ? { k: 'prix_unite', l: 'Prix ' + D.parUnite, ex: 'pour l’estimation', ph: 'Ex. : 8,50', mode: 'decimal' } : null,
          ].filter(Boolean),
        }),
      ],
    },
    D.type === 'lien' ? null : {
      id: 'demandes', titre: D.rubrique,
      resume: () => (E.nouvelles ? E.nouvelles + (E.nouvelles > 1 ? ' nouvelles demandes' : ' nouvelle demande') : (E.C.commandes && E.C.commandes.actif ? 'Formulaire en ligne' : 'Formulaire masqué')),
      corps: () => [
        listeCommandes(),
        el('details', { class: 'item' }, el('summary', {}, el('span', { class: 'txt' }, el('b', { text: 'Réglages du formulaire' }), el('span', { class: 's', text: 'Affichage, délai, envoi par e-mail' }))),
          el('div', { class: 'item-corps' },
            champ(E.C, { k: 'commandes.actif', l: 'Afficher le formulaire de demande', t: 'case' }),
            el('div', { class: 'grille' },
              champ(E.C, { k: 'commandes.delai_heures', l: 'Délai minimum (heures)', t: 'nombre', min: 0, max: 240 }),
              D.quantite ? champ(E.C, { k: 'commandes.quantite_min', l: D.quantite + ' : minimum', t: 'nombre', min: 1, max: 100 }) : null,
              D.quantite ? champ(E.C, { k: 'commandes.quantite_max', l: D.quantite + ' : maximum', t: 'nombre', min: 1, max: 500 }) : null),
            champ(E.C, { k: 'commandes.titre', l: 'Titre' }),
            champ(E.C, { k: 'commandes.intro', l: 'Texte d’introduction', t: 'zone' }),
            champ(E.C, { k: 'commandes.paiement', l: 'Phrase sur le prix et le paiement' }),
            champ(E.C, { k: 'commandes.confirmation', l: 'Message affiché après l’envoi', t: 'zone' }),
            champ(E.C, { k: 'commandes.cle_web3forms', l: 'Clé Web3Forms', ex: 'pour recevoir les demandes par e-mail' }),
            champ(E.C, { k: 'commandes.email', l: 'E-mail de secours', ex: 'utilisé si la clé est vide', type: 'email' }))),
      ],
    },
    {
      id: 'textes', titre: 'Photos et textes',
      resume: () => 'Accueil, ' + V.navBoutique.toLowerCase() + ', ' + P.pluriel + ', ' + O.pluriel,
      corps: () => {
        const g = (titre, champs, avant) => el('details', { class: 'item' }, el('summary', {}, el('span', { class: 'txt' }, el('b', { text: titre }))), el('div', { class: 'item-corps' }, avant || null, champs.map((d) => champ(E.C, d))));
        return [
          g('Accueil', [{ k: 'textes.photo_accueil', l: 'Grande photo', t: 'photo' }, { k: 'textes.video_accueil', l: 'Vidéo de fond', ex: 'MP4 sans son, 10 à 20 secondes, 20 Mo au plus. La photo reste l’image d’attente.', t: 'video' }, { k: 'textes.fond_video', l: 'Vidéo en fond (sinon la photo)', t: 'case' }, { k: 'textes.titre', l: 'Grand titre' }, { k: 'textes.intro', l: 'Phrase sous le titre', t: 'zone' }]),
          g(V.navBoutique, [{ k: 'textes.boutique_titre', l: 'Titre' }, { k: 'textes.boutique_texte', l: 'Texte', ex: 'une ligne vide entre deux paragraphes', t: 'zone', lignes: 6 }, { k: 'textes.boutique_photo_1', l: 'Grande photo', t: 'photo' }, { k: 'textes.boutique_photo_2', l: 'Petite photo', t: 'photo' }], interrupteurPartie('boutique')),
          g(cap(P.pluriel), [{ k: 'textes.produits_titre', l: 'Titre' }, { k: 'textes.produits_intro', l: 'Texte', t: 'zone' }, { k: 'textes.produits_photo', l: 'Photo à côté de la liste', t: 'photo' }]),
          g(cap(O.pluriel), [{ k: 'textes.offres_titre', l: 'Titre' }, { k: 'textes.offres_texte', l: 'Texte', t: 'zone' }, { k: 'textes.offres_photo', l: 'Photo de fond', t: 'photo' }]),
          g('Pour Google', [{ k: 'textes.description_google', l: 'Description affichée dans les résultats Google', t: 'zone' }, { k: 'credits_photos', l: 'Crédit des photos', ex: 'facultatif' }]),
        ];
      },
    },
    {
      id: 'questions', titre: 'Questions pratiques',
      resume: () => (masque('questions') ? 'Masqué sur le site' : nb((E.C.questions || []).length, 'question', 'questions', 'e')),
      corps: () => [interrupteurPartie('questions'), editeurListe('questions', { titre: 'question', sansTitre: 'Nouvelle question', vide: 'Aucune question.', ajouter: 'Ajouter une question', nouveau: { question: '', reponse: '' }, champs: [{ k: 'question', l: 'Question' }, { k: 'reponse', l: 'Réponse', t: 'zone' }] })],
    },
    {
      id: 'presse', titre: 'Avis Google et presse',
      resume: () => (masque('presse') ? 'Masqué sur le site' : nb((E.C.presse || []).length, 'article', 'articles', '')),
      corps: () => [
        interrupteurPartie('presse'),
        el('h3', { text: 'Avis Google', style: 'font-size:1.125rem' }),
        el('div', { class: 'grille' }, [{ k: 'avis.note', l: 'Note', ph: '4,8' }, { k: 'avis.nombre', l: 'Nombre d’avis' }, { k: 'avis.date', l: 'Relevé le' }, { k: 'avis.lien', l: 'Lien vers les avis', type: 'url' }].map((d) => champ(E.C, d))),
        el('h3', { text: 'Articles de presse', style: 'font-size:1.125rem' }),
        editeurListe('presse', { titre: 'titre', sansTitre: 'Nouvel article', sous: (a) => [a.source, a.date].filter(Boolean).join(', '), vide: 'Aucun article.', ajouter: 'Ajouter un article', nouveau: { titre: '', source: '', date: '', lien: '' }, champs: [{ k: 'titre', l: 'Titre' }, { k: 'source', l: 'Journal ou auteur' }, { k: 'date', l: 'Date', ph: 'Ex. : Mars 2026' }, { k: 'lien', l: 'Lien', type: 'url', ph: 'https://…' }] }),
      ],
    },
    {
      id: 'motdepasse', titre: 'Mot de passe',
      resume: () => 'Changer le mot de passe de cette page',
      corps: () => [blocMotDePasse()],
    },
    {
      id: 'infos', titre: 'Coordonnées et mentions légales',
      resume: () => [E.C.boutique.telephone, E.C.boutique.adresse].filter(Boolean).join(', '),
      corps: () => [
        el('div', { class: 'grille' }, [
          { k: 'boutique.nom', l: 'Nom de la boutique' }, { k: 'boutique.telephone', l: 'Téléphone', type: 'tel' },
          { k: 'boutique.adresse', l: 'Adresse' }, { k: 'boutique.ville', l: 'Code postal et ville' },
          { k: 'boutique.quartier', l: 'Quartier' }, { k: 'boutique.acces', l: 'Accès', ex: 'métro, bus ou parking' },
          { k: 'boutique.email', l: 'E-mail', ex: 'facultatif', type: 'email' }, { k: 'boutique.instagram', l: 'Lien Instagram', ex: 'facultatif', type: 'url' }, { k: 'boutique.logo', l: 'Logo', ex: 'facultatif', t: 'photo' },
        ].map((d) => champ(E.C, d))),
        el('h3', { text: 'Mentions légales', style: 'font-size:1.125rem' }),
        el('div', { class: 'grille' }, [{ k: 'mentions.raison_sociale', l: 'Raison sociale' }, { k: 'mentions.siret', l: 'SIRET', mode: 'numeric' }, { k: 'mentions.directeur_publication', l: 'Directeur de la publication' }, { k: 'mentions.email_contact', l: 'E-mail de contact', type: 'email' }].map((d) => champ(E.C, d))),
      ],
    },
  ];
  return L.filter(Boolean);
}
let PANNEAUX = [];

/* ---------- Démonstration en un seul fichier : le site d'abord, puis l'espace boutique ---------- */
function vueSiteDemo() {
  let v = document.getElementById('demo-site');
  if (!v) {
    v = el('div', { id: 'demo-site', class: 'apercu-plein', role: 'region', 'aria-label': 'Aperçu du site' },
      el('div', { class: 'barre' }, el('span', { class: 'barre-titre' }, el('b', { text: 'Démonstration' }),
          /* Démonstration hébergée dans /demos/ d'un site : lien de retour vers ce site */
          /^https?:$/.test(location.protocol) && /\/demos\//.test(location.pathname) ? el('a', { href: '/', text: '← Retour au site' }) : null),
        el('button', { type: 'button', class: 'btn petit', text: 'Essayer la page de modification', onclick: () => { v.hidden = true; document.body.style.overflow = ''; } })),
      el('iframe', { title: 'Le site' }));
    document.body.append(v);
  }
  /* le site tel qu'il est « en ligne » dans la démonstration : la dernière version enregistrée */
  v.querySelector('iframe').srcdoc = rendreSite(memo.lire('contenu', copie(DEMO.contenu)), { maquette: true, urlPolice: (f) => DEMO.polices[f] || '', css: DEMO.css, js: DEMO.js, lienMentions: '#', apiCommande: '' });
  v.hidden = false; document.body.style.overflow = 'hidden';
}
let siteMontre = false;

/* ---------- Aperçu en direct ---------- */
let cadres = [];
function rendreApercu() {
  const o = DEMO
    ? { maquette: true, urlPolice: (f) => DEMO.polices[f] || '', css: DEMO.css, js: DEMO.js, lienMentions: '#', apiCommande: '', calme: true }
    : { maquette: E.maquette, cssHref: '/assets/site.css', jsHref: '/assets/site.js', lienMentions: '#', apiCommande: '', calme: true };
  const page = rendreSite(E.C, o);
  cadres.forEach((f) => {
    let y = 0; try { y = f.contentWindow.scrollY; } catch (e) { /* rien */ }
    f.onload = () => { try { f.contentWindow.scrollTo(0, y); } catch (e) { /* rien */ } };
    f.srcdoc = page;
  });
}
let minuteur;
function changement() {
  majBarre(); majResumes();
  clearTimeout(minuteur); minuteur = setTimeout(rendreApercu, 450);
}
function majResumes() { PANNEAUX.forEach((p) => { const r = document.getElementById('res-' + p.id); if (r) r.textContent = p.resume(); }); }

/* ---------- Barre d'enregistrement ---------- */
let barre, etatBarre, bEnr, bAnn;
function majBarre() {
  const m = modifie();
  etatBarre.textContent = m ? 'Modifications non enregistrées' : 'Tout est enregistré';
  etatBarre.className = 'etat ' + (m ? 'modifie' : 'ok');
  bEnr.disabled = !m; bAnn.textContent = m ? 'Annuler' : 'Revenir en arrière'; bAnn.title = m ? 'Annuler les modifications non enregistrées' : 'Rétablir la version enregistrée juste avant';
}
async function enregistrer() {
  const eh = erreurHoraires(); if (eh) { toast('Horaires à corriger : ' + eh); return; }
  bEnr.disabled = true; bEnr.textContent = 'Enregistrement…';
  try {
    await api.enregistrer(E.C);
    E.base = JSON.stringify(E.C);
    toast(DEMO ? (memo.persiste ? 'Enregistré (démonstration : dans ce navigateur seulement).' : stockageOk ? 'Enregistré pour cette visite seulement : la mémoire du navigateur est pleine. Retirez des photos pour que ça reste.' : 'Enregistré pour cette visite seulement : cet aperçu ne garde rien après fermeture. Ouvrez le fichier dans un navigateur pour garder vos essais.') : 'Enregistré. Le site est à jour d’ici une minute.');
  } catch (x) {
    if (x.session) { toast('Session expirée : reconnectez-vous, vos modifications sont gardées.'); memo.ecrire('brouillon', E.C); ecranConnexion(x.message); return; }
    toast(x.message);
  }
  bEnr.textContent = 'Enregistrer'; majBarre();
}
async function annuler() {
  if (modifie()) { E.C = JSON.parse(E.base); dessinerEditeur(); rendreApercu(); toast('Modifications annulées.'); return; }
  if (!bAnn.classList.contains('confirmer')) { bAnn.classList.add('confirmer'); bAnn.textContent = 'Confirmer'; setTimeout(() => { bAnn.classList.remove('confirmer'); majBarre(); }, 4000); return; }
  bAnn.classList.remove('confirmer');
  try { E.C = await api.annuler(); E.base = JSON.stringify(E.C); dessinerEditeur(); rendreApercu(); toast('Version précédente rétablie.'); } catch (x) { toast(x.message); }
  majBarre();
}

/* ---------- Écran principal ---------- */
let editeur;
function dessinerEditeur() {
  editeur.replaceChildren(
    el('section', { class: 'intro-edit' },
      el('h1', { text: 'Bonjour' }),
      el('p', { class: 'aide', text: 'Touchez une rubrique pour la modifier, puis « Enregistrer » en bas de l’écran. L’aperçu montre le résultat avant d’enregistrer.' })),
    ...PANNEAUX.map((p) => {
      const d = el('details', { class: 'pan', id: 'pan-' + p.id, open: E.ouverts.has(p.id) },
        el('summary', {}, el('h2', { text: p.titre }), el('span', { class: 'resume', id: 'res-' + p.id, text: p.resume() }), el('span', { class: 'chev', 'aria-hidden': 'true' })));
      let rempli = false;
      const remplir = () => { if (rempli) return; rempli = true; d.append(el('div', { class: 'pan-corps' }, p.corps())); };
      if (d.open) remplir();
      d.addEventListener('toggle', () => { if (d.open) { remplir(); E.ouverts.add(p.id); } else E.ouverts.delete(p.id); });
      return d;
    }));
}

function ecranPrincipal() {
  racine.replaceChildren();
  const nom = E.C.boutique.nom || 'Votre boutique';
  document.title = nom + ' : page de modification';
  PANNEAUX = panneaux();
  appliquerTheme(E.C);
  const plein = el('div', { class: 'apercu-plein', hidden: true },
    el('div', { class: 'barre' }, el('b', { text: 'Aperçu' }), el('button', { type: 'button', class: 'btn sec petit', text: 'Fermer l’aperçu', onclick: () => { plein.hidden = true; document.body.style.overflow = ''; } })),
    el('iframe', { title: 'Aperçu du site', sandbox: 'allow-scripts allow-same-origin allow-popups' }));
  editeur = el('div', { class: 'editeur' });
  const colonne = el('aside', { class: 'apercu-col', 'aria-label': 'Aperçu du site' },
    el('div', { class: 'tel-cadre' }, el('p', { text: 'Aperçu, tel que sur un téléphone' }), el('iframe', { title: 'Aperçu du site', sandbox: 'allow-scripts allow-same-origin allow-popups' })));
  cadres = [colonne.querySelector('iframe'), plein.querySelector('iframe')];

  etatBarre = el('span', { class: 'etat' });
  bEnr = el('button', { type: 'button', class: 'btn', text: 'Enregistrer', onclick: enregistrer });
  bAnn = el('button', { type: 'button', class: 'btn danger', onclick: annuler });
  barre = el('div', { class: 'barre-enr', role: 'region', 'aria-label': 'Enregistrement' }, el('div', { class: 'in' }, etatBarre,
    el('button', { type: 'button', class: 'btn sec btn-apercu', text: 'Aperçu', onclick: () => { plein.hidden = false; document.body.style.overflow = 'hidden'; rendreApercu(); } }),
    bAnn, bEnr));

  racine.append(
    el('header', { class: 'haut' }, el('div', { class: 'haut-in' },
      el('div', { class: 'haut-titre' }, el('b', { text: nom }), el('span', { text: 'Page de modification' })),
      DEMO ? el('button', { type: 'button', class: 'btn', text: 'Voir le site', onclick: () => { plein.hidden = false; rendreApercu(); } })
        : el('a', { class: 'btn', href: '/', target: '_blank', rel: 'noopener', text: 'Voir le site' }),
      el('button', { type: 'button', class: 'btn', text: 'Se déconnecter', onclick: async () => { if (modifie() && !confirm2()) return; await api.deconnexion(); ecranConnexion(); } }))),
    DEMO ? el('aside', { class: 'bandeau', 'aria-label': 'Information' }, 'Démonstration : vos essais restent sur ce téléphone, rien n’est publié. ', el('button', { type: 'button', text: 'Tout remettre à zéro', onclick: () => { remettreAZero(); ecranConnexion(); toast('Démonstration remise à zéro : le site est revenu à sa version d’origine.'); } }))
      : (E.maquette ? el('aside', { class: 'bandeau', 'aria-label': 'Information', text: 'Le site est encore en mode proposition : les commandes ne sont pas envoyées.' }) : null),
    el('main', { class: 'cadre' }, editeur, colonne), barre, plein);
  dessinerEditeur(); majBarre(); rendreApercu();
  api.commandes().then((L) => { E.nouvelles = L.filter((c) => c.statut === 'nouvelle').length; majResumes(); }).catch(() => {});
}
let avertiDeco = false;
function confirm2() { if (avertiDeco) return true; avertiDeco = true; toast('Des modifications ne sont pas enregistrées. Touchez encore « Se déconnecter » pour les abandonner.'); return false; }

function normaliser(C) {
  C.boutique = C.boutique || {}; C.textes = C.textes || {}; C.commandes = C.commandes || {}; C.annonce = C.annonce || {};
  C.sections = Object.assign({ boutique: true, produits: true, offres: true, presse: true, questions: true }, C.sections || {});
  ['produits', 'offres', 'questions', 'presse'].forEach((k) => { if (!Array.isArray(C[k])) C[k] = []; });
  return C;
}
function appliquerTheme(C) {
  let st = document.getElementById('theme-boutique');
  if (!st) { st = el('style', { id: 'theme-boutique' }); document.head.append(st); }
  st.textContent = cssTheme(C, DEMO ? (f) => DEMO.polices[f] || '' : (f) => '/fonts/' + f);
  const meta = document.querySelector('meta[name=theme-color]'); if (meta && C.theme && C.theme.couleur) meta.setAttribute('content', C.theme.couleur);
  const icone = document.querySelector('link[rel=icon]'); if (icone && C.boutique && C.boutique.nom) icone.setAttribute('href', favicon(C));
}
async function demarrer() {
  try {
    const r = await api.charger();
    if (!r) { ecranConnexion(); return; }
    const brouillon = memo.lire('brouillon', null);
    E.C = normaliser(r.contenu); E.base = JSON.stringify(E.C); E.maquette = !!r.maquette;
    if (brouillon && !DEMO) { E.C = normaliser(brouillon); memo.ecrire('brouillon', null); toast('Vos modifications non enregistrées ont été récupérées.'); }
    ecranPrincipal();
  } catch (x) {
    racine.replaceChildren(el('main', { class: 'connexion' }, el('div', { class: 'erreur', text: 'Impossible de charger la page de modification : ' + x.message + ' Vérifiez la connexion internet et rechargez la page.' })));
  } finally {
    /* démonstration : on montre d'abord le site, une seule fois */
    if (DEMO && DEMO.siteDabord && !siteMontre) { siteMontre = true; vueSiteDemo(); }
  }
}

window.addEventListener('beforeunload', (e) => { if (E.C && modifie()) { e.preventDefault(); e.returnValue = ''; } });
demarrer();
