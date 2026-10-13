/*
  Moteur de rendu, identique pour toutes les boutiques.
  Tout ce qui est propre à une boutique vient du contenu : textes, listes, horaires,
  vocabulaire du métier (contenu.metier), couleurs et polices (contenu.theme), parties affichées (contenu.sections).
  Utilisé par le serveur (src/worker.js), l'espace boutique (aperçu en direct) et outils/apercu.mjs.
*/
import { cssPolices } from './polices.js';

export const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const SEMAINE = [1, 2, 3, 4, 5, 6, 0];
const EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const paras = (s) => String(s || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  .map((p) => '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>').join('\n');
const telHref = (t) => 'tel:' + String(t || '').replace(/[^\d+]/g, '').replace(/^0/, '+33');
export const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
export const fmt = (m) => Math.floor(m / 60) + 'h' + (m % 60 ? String(m % 60).padStart(2, '0') : '');
const hhmm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const enMinutes = (s) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '').trim()); return m ? (+m[1]) * 60 + (+m[2]) : null; };
export const prixNombre = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.').replace(/[^\d.]/g, '')); return isFinite(n) && n > 0 ? n : null; };
const couleur = (c, d) => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? c : d);

/* Vocabulaire du métier, avec des valeurs par défaut neutres */
export function voc(C) {
  const M = C.metier || {}, P = M.produits || {}, O = M.offres || {}, D = M.demande || {};
  const genre = (x) => (x.feminin ? { un: 'une', nouveau: 'Nouvelle', e: 'e' } : { un: 'un', nouveau: 'Nouveau', e: '' });
  const gp = genre(P), go = genre(O);
  const ps = P.singulier || 'produit', pp = P.pluriel || 'produits', os = O.singulier || 'offre', op = O.pluriel || 'offres';
  const type = ['retrait', 'devis', 'lien'].includes(D.type) ? D.type : 'retrait';
  return {
    typeSchema: M.type_schema || 'Store',
    titrePage: M.titre_page || 'commerce de quartier',
    navBoutique: M.nav_boutique || 'La boutique',
    produits: {
      nav: P.nav || cap(pp), rubrique: P.rubrique || cap(pp) + ' du moment', singulier: ps, pluriel: pp,
      ajouter: `Ajouter ${gp.un} ${ps}`, nouveau: `${gp.nouveau} ${ps}`, e: gp.e,
      famille: P.famille || '', familles: Array.isArray(P.familles) ? P.familles.filter((f) => Array.isArray(f) && f[0]) : [],
      autres: P.autres || 'Autres ' + pp, origine: P.origine || 'Origine',
      exPrecision: P.exemple_precision || '', exPrix: P.exemple_prix || '',
    },
    offres: {
      nav: O.nav || cap(op), rubrique: O.rubrique || cap(op), singulier: os, pluriel: op, e: go.e,
      ajouter: `Ajouter ${go.un} ${os}`, nouveau: `${go.nouveau} ${os}`, bouton: O.bouton || 'Faire une demande',
    },
    demande: {
      type, rubrique: D.rubrique || 'Demandes reçues',
      quantite: type === 'retrait' ? (D.quantite || '') : '', unite: D.unite || '', parUnite: D.par_unite || '',
      date: D.date || (type === 'devis' ? 'Date souhaitée' : 'Jour du retrait'),
      precisions: D.precisions || (type === 'devis' ? 'Décrivez votre demande' : 'Précisions'),
      exemple: D.exemple || '', lien: D.lien || '', lienTexte: D.lien_texte || 'Réserver en ligne',
      nav: D.nav || (type === 'devis' ? 'Demander un devis' : 'Commander'),
    },
  };
}
export const affiche = (C, k) => !(C.sections && C.sections[k] === false);

/* Mise en page choisie pour la boutique (contenu.theme) : quelques variantes testées, la première valeur sert par défaut */
export const STYLES = { accueil: ['photo', 'partage', 'sobre'], titres: ['simple', 'filet'], angles: ['doux', 'droits'], offres_fond: ['photo', 'clair'] };
export const ORDRE_PARTIES = ['boutique', 'produits', 'offres', 'presse', 'questions'];
export function styleSite(C) {
  const T = C.theme || {};
  const choix = (k) => (STYLES[k].includes(T[k]) ? T[k] : STYLES[k][0]);
  const o = Array.isArray(T.ordre) ? T.ordre.filter((k, i, a) => ORDRE_PARTIES.includes(k) && a.indexOf(k) === i) : [];
  return { accueil: choix('accueil'), titres: choix('titres'), angles: choix('angles'), offres: choix('offres_fond'), ordre: [...o, ...ORDRE_PARTIES.filter((k) => !o.includes(k))] };
}

/* Horaires : { lundi: [["09:00","13:00"], …], … } -> minutes par jour (0 = dimanche) */
export function horaires(C) {
  const H = {}, TXT = {};
  JOURS.forEach((j, d) => {
    const plages = ((C.horaires || {})[j] || [])
      .map((p) => [enMinutes(p && p[0]), enMinutes(p && p[1])])
      .filter((p) => p[0] != null && p[1] != null && p[0] < p[1])
      .sort((a, b) => a[0] - b[0]);
    H[d] = plages;
    TXT[d] = plages.length ? plages.map((s) => fmt(s[0]) + '–' + fmt(s[1])).join(' et ') : 'Fermé';
  });
  return { H, TXT };
}
function resumeHoraires(TXT) {
  const groupes = [];
  SEMAINE.forEach((d) => {
    const g = groupes[groupes.length - 1];
    if (g && g.txt === TXT[d]) g.fin = d; else groupes.push({ debut: d, fin: d, txt: TXT[d] });
  });
  return groupes.map((g) => {
    const n = SEMAINE.indexOf(g.fin) - SEMAINE.indexOf(g.debut) + 1;
    const jours = n === 1 ? cap(JOURS[g.debut]) : n === 2 ? `${cap(JOURS[g.debut])} et ${JOURS[g.fin]}` : `Du ${JOURS[g.debut]} au ${JOURS[g.fin]}`;
    return `<li>${esc(jours)} : ${esc(g.txt === 'Fermé' ? 'fermé' : g.txt)}</li>`;
  }).join('\n');
}

function src(p, largeur) {
  if (!p) return '';
  p = String(p).trim();
  if (/^https:\/\/images\.unsplash\.com\//.test(p)) return p.split('?')[0] + `?auto=format&fit=crop&w=${largeur}&q=70`;
  if (/^(https:\/\/|data:image\/|\/photos\/)/i.test(p)) return p;
  return '';
}
function img(p, largeur, cls, prio) {
  const s = src(p, largeur);
  if (!s) return '';
  return `<img class="${cls}" src="${esc(s)}" alt="" ${prio ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

/* Couleurs et polices de la boutique (variables CSS de site.css et admin.css) */
export function cssTheme(C, url) {
  const T = C.theme || {};
  return `${cssPolices(T.polices, url)}\n:root{--bleu:${couleur(T.couleur, '#46667f')};--bleu-fonce:${couleur(T.couleur_foncee, '#2f4b61')};--bleu-pale:${couleur(T.couleur_pale, '#edf2f5')};--paille:${couleur(T.accent, '#efd58b')}}`;
}
export const favicon = (C) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="5" fill="${couleur((C.theme || {}).couleur, '#46667f')}"/><text x="16" y="23" font-family="Georgia,serif" font-weight="700" font-size="20" fill="#ffffff" text-anchor="middle">${esc(cap(((C.boutique || {}).nom || 'B').replace(/^(la |le |les |l')/i, '')).charAt(0))}</text></svg>`);

/*
  o = { maquette, urlPolice: (fichier) => url, css | cssHref, js | jsHref, lienMentions, lienAdmin, apiCommande }
*/
function tete(C, o, titre, description) {
  const theme = cssTheme(C, o.urlPolice || ((f) => '/fonts/' + f));
  const style = o.css != null ? `<style>\n${o.css}\n${theme}\n</style>` : `<link rel="stylesheet" href="${o.cssHref || '/assets/site.css'}">\n<style>${theme}</style>`;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(description)}">
${o.maquette ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:title" content="${esc(titre)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="${couleur((C.theme || {}).couleur, '#46667f')}">
<link rel="icon" href="${favicon(C)}">
${style}
</head>`;
}

export function rendreSite(C, o = {}) {
  const V = voc(C), B = C.boutique || {}, T = C.textes || {}, A = C.avis || {}, K = C.commandes || {};
  const produits = affiche(C, 'produits') ? (C.produits || []).filter((x) => x && x.nom) : [];
  const offres = affiche(C, 'offres') ? (C.offres || []).filter((x) => x && x.nom) : [];
  const presse = affiche(C, 'presse') ? (C.presse || []).filter((x) => x && x.titre) : [];
  const questions = affiche(C, 'questions') ? (C.questions || []).filter((x) => x && x.question) : [];
  const avecBoutique = affiche(C, 'boutique') && (T.boutique_titre || T.boutique_texte);
  const { H, TXT } = horaires(C);

  const nom = B.nom || 'Boutique';
  const adresseComplete = `${B.adresse || ''}, ${B.ville || ''}`;
  const destination = encodeURIComponent(`${nom}, ${adresseComplete}`);
  const itineraire = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  const planSrc = `https://www.google.com/maps?q=${destination}&output=embed`;
  const tel = telHref(B.telephone);
  const lienMentions = o.lienMentions || '/mentions-legales';
  const D = V.demande;

  const demandeActive = !!(K.actif && offres.length && (D.type !== 'lien' || D.lien));
  const formulaire = demandeActive && D.type !== 'lien';
  const CMD = formulaire ? {
    type: D.type, boutique: nom, telephone: B.telephone || '', maquette: !!o.maquette,
    email: K.email || '', cle: K.cle_web3forms || '', api: o.apiCommande || '',
    delai: Math.max(0, +K.delai_heures || 0), min: Math.max(1, +K.quantite_min || 1), max: Math.max(1, +K.quantite_max || 40),
    confirmation: K.confirmation || 'Merci, votre demande est partie. La boutique vous rappelle pour confirmer.',
    offres: offres.map((p) => ({ nom: p.nom, prixUnite: prixNombre(p.prix_unite) })),
    voc: { offre: cap(V.offres.singulier), quantite: D.quantite, unite: D.unite, date: D.date, precisions: D.precisions, devis: D.type === 'devis' },
  } : null;
  const donneesJs = `var H=${JSON.stringify(H)},INCONNUS=[],CMD=${JSON.stringify(CMD).replace(/</g, '\\u003c')};`;
  const scripts = o.js != null ? `<script>\n${donneesJs}\n${o.js}\n</script>` : `<script>${donneesJs}</script>\n<script src="${o.jsHref || '/assets/site.js'}" defer></script>`;

  const bandeauMaquette = o.maquette
    ? `<div class="maquette" role="note">Proposition de site pour ${esc(nom)}, préparée par Grégoire Muel. Maquette non publiée : textes, prix et photos à valider ensemble.</div>` : '';
  const annonce = C.annonce && C.annonce.afficher && C.annonce.texte ? `<div class="annonce" role="status">${esc(C.annonce.texte)}</div>` : '';

  const ST = styleSite(C);
  const navDe = { boutique: avecBoutique ? ['#boutique', V.navBoutique] : null, produits: produits.length ? ['#produits', V.produits.nav] : null, offres: offres.length ? ['#offres', V.offres.nav] : null };
  const liensNav = [
    ...ST.ordre.flatMap((k) => (k === 'offres' ? [navDe.offres, formulaire ? ['#demande', D.nav] : null] : [navDe[k] || null])),
    ['#horaires', 'Horaires et accès'],
  ].filter(Boolean).map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join('');

  const ligneProduit = (f) => {
    const meta = [f.origine, f.detail].filter(Boolean).map(esc).join('. ');
    const photo = f.photo ? img(f.photo, 240, 'vignette') : '';
    return `<li${photo ? ' class="avec-photo"' : ''}>${photo}<span class="n">${esc(f.nom)}</span><span class="p">${esc(f.prix || '')}</span>${meta ? `<span class="m">${meta}</span>` : ''}</li>`;
  };
  const listeProduits = () => {
    const P = V.produits;
    if (!P.famille || !P.familles.length) return `<ul class="carte">\n          ${produits.map(ligneProduit).join('\n          ')}\n        </ul>`;
    const g = new Map(), titres = new Map(P.familles.map((f) => [f[0], f[1] || f[0]]));
    produits.forEach((f) => { const k = titres.has(f.famille) ? f.famille : '__autres'; if (!g.has(k)) g.set(k, []); g.get(k).push(f); });
    return [...P.familles.map((f) => f[0]), '__autres'].filter((k) => g.has(k)).map((k, i) => {
      const n = g.get(k).length;
      return `<details class="famille"${i === 0 ? ' open' : ''}>
          <summary><span>${esc(k === '__autres' ? P.autres : titres.get(k))}<small>${n} ${n > 1 ? esc(P.pluriel) : esc(P.singulier)}</small></span></summary>
          <ul class="carte">
            ${g.get(k).map(ligneProduit).join('\n            ')}
          </ul>
        </details>`;
    }).join('\n        ');
  };
  const prixOffre = (p) => {
    const pu = prixNombre(p.prix_unite);
    return p.prix ? esc(p.prix) : pu && D.parUnite ? (pu % 1 ? pu.toFixed(2) : String(pu)).replace('.', ',') + ' € ' + esc(D.parUnite) : '';
  };
  const ligneOffre = (p) => `<li><b>${esc(p.nom)}</b><span class="p">${prixOffre(p)}</span>${p.description ? `<span>${esc(p.description)}</span>` : ''}</li>`;
  const ligneArticle = (a) => {
    const sous = [a.source, a.date ? String(a.date).charAt(0).toLowerCase() + String(a.date).slice(1) : ''].filter(Boolean).join(', ');
    return `<li><a href="${esc(a.lien)}" target="_blank" rel="noopener"><span class="t">${esc(a.titre)}</span>${sous ? `<span class="d">${esc(sous)}</span>` : ''}</a></li>`;
  };
  const articles = () => {
    const visibles = presse.slice(0, 2), autres = presse.slice(2);
    let h = `<ul class="articles">\n        ${visibles.map(ligneArticle).join('\n        ')}\n      </ul>`;
    if (autres.length) h += `\n      <details class="plus"><summary>Articles plus anciens (${autres.length})</summary><ul class="articles">${autres.map(ligneArticle).join('')}</ul></details>`;
    return h;
  };
  const ligneQuestion = (q) => `<details><summary>${esc(q.question)}</summary><div class="rep">${paras(q.reponse)}</div></details>`;
  const ligneHoraire = (d) => `<div data-jour="${d}"><dt>${JOURS[d]}</dt><dd>${esc(TXT[d])}</dd></div>`;
  const avis = A.note ? `<p class="avis">Note Google : <strong>${esc(A.note)} sur 5</strong>, ${esc(A.nombre)} avis${A.date ? ' (relevé le ' + esc(A.date) + ')' : ''}.${A.lien ? ` <a href="${esc(A.lien)}" target="_blank" rel="noopener">Lire les avis</a>` : ''}</p>` : '';

  const sectionDemande = () => {
    const min = Math.max(1, +K.quantite_min || 1), max = Math.max(min, +K.quantite_max || 40);
    const parDefaut = Math.min(Math.max(6, min), max), delai = Math.round(+K.delai_heures || 0);
    const devis = D.type === 'devis';
    const choix = offres.map((p, i) => {
      const prix = prixOffre(p) || (devis ? 'Prix sur devis' : 'Prix selon la composition');
      return `<label class="choix"><input type="radio" name="offre" value="${i}"${i === 0 ? ' checked' : ''}><span class="choix-txt"><b>${esc(p.nom)}</b>${p.description ? `<span>${esc(p.description)}</span>` : ''}<em>${prix}</em></span></label>`;
    }).join('\n            ');
    const quantite = D.quantite ? `
          <div class="cmd-ligne">
            <div class="champ-bloc">
              <label for="cmd-pers">${esc(D.quantite)}</label>
              <div class="stepper"><button type="button" data-pas="-1" aria-label="Un de moins">−</button><input id="cmd-pers" name="quantite" type="number" inputmode="numeric" min="${min}" max="${max}" value="${parDefaut}"><button type="button" data-pas="1" aria-label="Un de plus">+</button></div>
            </div>
            <p class="estimation" id="cmd-estim" aria-live="polite" hidden></p>
          </div>` : '';
    const quand = devis
      ? `<div class="champ-bloc"><label for="cmd-date">${esc(D.date)} <span class="fac">(facultatif)</span></label><input class="saisie" id="cmd-date" name="date" type="date"></div>`
      : `<div class="cmd-ligne">
            <div class="champ-bloc"><label for="cmd-date">${esc(D.date)}</label><input class="saisie" id="cmd-date" name="date" type="date" required></div>
            <div class="champ-bloc"><label for="cmd-heure">Heure</label><select class="saisie" id="cmd-heure" name="heure" required></select></div>
          </div>
          <p class="cmd-info" id="cmd-jour" aria-live="polite"></p>`;
    return `
  <section class="sec${fond('demande')}" id="demande">
    <div class="wrap cmd">
      <div class="cmd-intro">
        <h2>${esc(K.titre || V.offres.bouton)}</h2>
        ${K.intro ? `<p class="intro">${esc(K.intro)}</p>` : ''}
        <ol class="cmd-etapes">
          <li>${devis ? `Choisissez le type de ${esc(V.offres.singulier)} et décrivez votre demande.` : `Choisissez ${V.offres.e ? 'une' : 'un'} ${esc(V.offres.singulier)}${D.quantite ? ' et indiquez : ' + esc(D.quantite.toLowerCase()) : ''}.`}</li>
          <li>${devis ? 'Indiquez la date qui vous arrange.' : `Indiquez le jour et l'heure du retrait${delai ? `, au moins ${delai}\u00a0h à l'avance` : ''}.`}</li>
          <li>La boutique vous rappelle pour confirmer.</li>
        </ol>
        ${K.paiement ? `<p class="hnote">${esc(K.paiement)}</p>` : ''}
        <p class="hnote">Pour une demande urgente, appelez le <a href="${tel}">${esc(B.telephone)}</a>.</p>
      </div>
      <div class="cmd-zone">
        <form class="cmd-form" id="cmd-form" novalidate>
          <fieldset>
            <legend>${esc(cap(V.offres.singulier))}</legend>
            <div class="choix-liste">
            ${choix}
            </div>
          </fieldset>${quantite}
          ${quand}
          <div class="champ-bloc"><label for="cmd-msg">${esc(D.precisions)}${devis ? '' : ' <span class="fac">(facultatif)</span>'}</label><textarea class="saisie" id="cmd-msg" name="message" rows="${devis ? 5 : 3}"${D.exemple ? ` placeholder="${esc(D.exemple)}"` : ''}${devis ? ' required' : ''}></textarea></div>
          <div class="cmd-ligne">
            <div class="champ-bloc"><label for="cmd-nom">Nom</label><input class="saisie" id="cmd-nom" name="nom" type="text" autocomplete="name" required></div>
            <div class="champ-bloc"><label for="cmd-tel">Téléphone</label><input class="saisie" id="cmd-tel" name="telephone" type="tel" autocomplete="tel" inputmode="tel" required></div>
          </div>
          <div class="champ-bloc"><label for="cmd-mail">E-mail <span class="fac">(facultatif)</span></label><input class="saisie" id="cmd-mail" name="email" type="email" autocomplete="email"></div>
          <input type="checkbox" name="botcheck" class="piege" tabindex="-1" autocomplete="off" aria-hidden="true">
          <p class="cmd-erreur" id="cmd-erreur" role="alert" hidden></p>
          <button class="btn cmd-envoyer" type="button">Envoyer la demande</button>
          <p class="cmd-rgpd">Vos coordonnées servent uniquement à traiter cette demande.</p>
        </form>
        <div class="cmd-ok" id="cmd-ok" tabindex="-1" hidden></div>
      </div>
    </div>
  </section>`;
  };

  const offresPhoto = ST.offres === 'photo';
  const bOffre = offresPhoto ? ['btn btn-blanc', 'btn btn-clair'] : ['btn', 'btn btn-contour'];
  const boutonsOffres = () => {
    if (demandeActive && D.type === 'lien') return `<a class="${bOffre[0]}" href="${esc(D.lien)}" target="_blank" rel="noopener">${esc(D.lienTexte)}</a><a class="${bOffre[1]}" href="${tel}">Appeler</a>`;
    if (formulaire) return `<a class="${bOffre[0]}" href="#demande">${esc(V.offres.bouton)}</a><a class="${bOffre[1]}" href="${tel}">Appeler</a>`;
    return `<a class="${bOffre[0]}" href="${tel}">Appeler la boutique</a>`;
  };

  /* Parties affichées, dans l'ordre choisi ; la demande suit toujours les offres, les horaires ferment la page */
  const avecPresse = !!(presse.length || (avis && affiche(C, 'presse')));
  const visibles = { boutique: !!avecBoutique, produits: produits.length > 0, offres: offres.length > 0, presse: avecPresse, questions: questions.length > 0 };
  const suite = [];
  ST.ordre.forEach((k) => { if (visibles[k]) { suite.push(k); if (k === 'offres' && formulaire) suite.push('demande'); } });
  suite.push('horaires');
  /* Fonds alternés (blanc, pâle) ; une partie à photo de fond compte comme une partie */
  const pales = new Set();
  suite.forEach((k, i) => { if (i % 2 && !(k === 'offres' && offresPhoto)) pales.add(k); });
  const fond = (id) => (pales.has(id) ? ' alt' : '');

  const accueil = () => {
    const sobre = ST.accueil === 'sobre';
    const haut = `<div class="top"><div class="wrap">
    <a class="nom" href="#contenu">${esc(nom)}</a>
    <nav class="nav" aria-label="Menu principal">${liensNav}</nav>
    <a class="tel" href="${tel}">${esc(B.telephone)}</a>
    <button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
  </div></div>`;
    const texte = (cls) => `<div class="${cls}">
    <h1>${esc(T.titre || nom)}</h1>
    ${T.intro ? `<p>${esc(T.intro)}</p>` : ''}
    <p class="statut" data-statut hidden><span></span></p>
    <div class="actions">
      <a class="${sobre ? 'btn' : 'btn btn-blanc'}" href="${tel}">Appeler la boutique</a>
      <a class="${sobre ? 'btn btn-contour' : 'btn btn-clair'}" href="${itineraire}" target="_blank" rel="noopener">Itinéraire</a>
    </div>
  </div>`;
    if (ST.accueil === 'partage') {
      const photo = src(T.photo_accueil, 10) ? `<div class="hero-photo">${img(T.photo_accueil, 1400, 'ph-accueil', true)}</div>` : '';
      return `<header class="hero hero-partage">
  ${haut}
  <div class="wrap hero-grille${photo ? '' : ' sans-photo'}">
  ${texte('hero-body')}
  ${photo}
  </div>
</header>`;
    }
    if (sobre) return `<header class="hero hero-sobre">
  ${haut}
  ${texte('wrap hero-body')}
</header>`;
    return `<header class="hero">
  ${img(T.photo_accueil, 2200, 'fond', true)}
  ${haut}
  ${texte('wrap hero-body')}
</header>`;
  };

  const parties = {
    boutique: () => `
  <section class="sec${fond('boutique')}" id="boutique">
    <div class="wrap about${src(T.boutique_photo_1, 10) ? '' : ' sans-photo'}">
      ${src(T.boutique_photo_1, 10) ? `<div>${img(T.boutique_photo_1, 1400, 'ph-main')}</div>` : ''}
      <div class="txt">
        <h2>${esc(T.boutique_titre || V.navBoutique)}</h2>
        ${paras(T.boutique_texte)}
        ${img(T.boutique_photo_2, 1000, 'ph-small')}
      </div>
    </div>
  </section>`,
    produits: () => `
  <section class="sec${fond('produits')}" id="produits">
    <div class="wrap ctr${src(T.produits_photo, 10) ? '' : ' sans-photo'}">
      <div>
        <h2>${esc(T.produits_titre || V.produits.rubrique)}</h2>
        ${T.produits_intro ? `<p class="intro">${esc(T.produits_intro)}</p>` : ''}
        ${listeProduits()}
      </div>
      ${img(T.produits_photo, 1000, 'ph')}
    </div>
  </section>`,
    offres: () => `
  <section class="sec ${offresPhoto ? 'plateaux' : 'offres-clair' + fond('offres')}" id="offres">
    ${offresPhoto ? img(T.offres_photo, 2000, 'fond') : ''}
    <div class="wrap grid">
      <div>
        <h2>${esc(T.offres_titre || V.offres.rubrique)}</h2>
        ${T.offres_texte ? `<p class="intro">${esc(T.offres_texte)}</p>` : ''}
        <div class="actions">${boutonsOffres()}</div>
        ${offresPhoto ? '' : img(T.offres_photo, 1200, 'ph-offre')}
      </div>
      <ul class="pl">
        ${offres.map(ligneOffre).join('\n        ')}
      </ul>
    </div>
  </section>`,
    presse: () => `
  <section class="sec${fond('presse')}" id="presse">
    <div class="wrap presse-grid">
      <div>
        <h2>Ils en parlent</h2>
        ${avis}
      </div>
      <div>
      ${presse.length ? articles() : ''}
      </div>
    </div>
  </section>`,
    questions: () => `
  <section class="sec${fond('questions')}" id="questions">
    <div class="wrap">
      <h2>Questions pratiques</h2>
      <div class="faq">
        ${questions.map(ligneQuestion).join('\n        ')}
      </div>
    </div>
  </section>`,
  };

  const jsonld = {
    '@context': 'https://schema.org', '@type': V.typeSchema, name: nom, description: T.description_google || '', telephone: B.telephone,
    address: { '@type': 'PostalAddress', streetAddress: B.adresse, postalCode: (B.ville || '').split(' ')[0], addressLocality: (B.ville || '').split(' ').slice(1).join(' '), addressCountry: 'FR' },
    openingHoursSpecification: [],
  };
  const R = C.reglages || {};
  if (Array.isArray(R.geo) && R.geo.length === 2) jsonld.geo = { '@type': 'GeoCoordinates', latitude: R.geo[0], longitude: R.geo[1] };
  if (R.url) jsonld.url = R.url;
  JOURS.forEach((j, d) => H[d].forEach((s) => jsonld.openingHoursSpecification.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: EN[d], opens: hhmm(s[0]), closes: hhmm(s[1]) })));

  return `${tete(C, o, `${nom}, ${V.titrePage}`, T.description_google || '')}
<body class="accueil-${ST.accueil} titres-${ST.titres} angles-${ST.angles}">
<a class="skip" href="#contenu">Aller au contenu</a>
${bandeauMaquette}
${annonce}
${accueil()}

<main id="contenu">
${suite.filter((k) => k !== 'demande' && k !== 'horaires').map((k) => parties[k]() + (k === 'offres' && formulaire ? sectionDemande() : '')).join('\n')}

  <section class="sec${fond('horaires')}" id="horaires">
    <div class="wrap">
      <div class="visit">
        <div>
          <h2>Horaires et accès</h2>
          <dl class="hours">
            ${SEMAINE.map(ligneHoraire).join('\n            ')}
          </dl>
          <p class="statut" data-statut hidden><span></span></p>
          ${C.horaires_note ? `<p class="hnote">${esc(C.horaires_note)}</p>` : ''}
        </div>
        <div class="infos">
          <div><h3>Adresse</h3><p class="gros">${esc(B.adresse)}<br>${esc(B.ville)}</p></div>
          ${B.acces ? `<div><h3>Accès</h3><p>${esc(B.acces)}</p></div>` : ''}
          <div><h3>Téléphone</h3><a class="gros" href="${tel}">${esc(B.telephone)}</a></div>
          ${B.email ? `<div><h3>E-mail</h3><a href="mailto:${esc(B.email)}">${esc(B.email)}</a></div>` : ''}
          <div class="actions"><a class="btn" href="${itineraire}" target="_blank" rel="noopener">Itinéraire</a></div>
        </div>
      </div>
      <div class="carte-box">
        <div>
          <button class="btn btn-contour" id="plan-btn" type="button" data-src="${esc(planSrc)}">Afficher le plan</button>
          <p>Le plan est fourni par Google Maps. Il ne se charge que si vous cliquez.</p>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap">
    <a class="nom" href="#contenu">${esc(nom)}</a>
    <div class="foot-grid">
      <div><h3>Adresse</h3><p>${esc(B.adresse)}<br>${esc(B.ville)}${B.quartier ? '<br>' + esc(B.quartier) : ''}</p></div>
      <div><h3>Horaires</h3><ul>${resumeHoraires(TXT)}</ul></div>
      <div><h3>Contact</h3><ul>
        <li><a href="${tel}">${esc(B.telephone)}</a></li>
        ${B.email ? `<li><a href="mailto:${esc(B.email)}">${esc(B.email)}</a></li>` : ''}
        ${B.instagram ? `<li><a href="${esc(B.instagram)}" target="_blank" rel="noopener">Instagram</a></li>` : ''}
      </ul></div>
    </div>
    <div class="legal">
      <a href="${lienMentions}">Mentions légales</a>
      ${o.lienAdmin ? `<a href="${o.lienAdmin}">Espace boutique</a>` : ''}
      <span>© ${new Date().getFullYear()} ${esc(nom)}</span>
      ${C.credits_photos ? `<span>${esc(C.credits_photos)}</span>` : ''}
    </div>
  </div>
</footer>

<div class="sheet" id="menu" hidden>
  <div class="sheet-top">
    <span class="nom">${esc(nom)}</span>
    <button class="menu-btn" type="button" data-fermer style="display:inline-flex">Fermer</button>
  </div>
  <nav aria-label="Menu">${liensNav}</nav>
  <div class="actions"><a class="btn btn-blanc" href="${tel}">Appeler</a><a class="btn btn-clair" href="${itineraire}" target="_blank" rel="noopener">Itinéraire</a></div>
</div>

<nav class="bar" aria-label="Actions rapides">
  <a class="btn" href="${tel}">Appeler</a>
  <a class="btn btn-contour" href="${itineraire}" target="_blank" rel="noopener">Itinéraire</a>
</nav>

<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
${scripts}
</body>
</html>
`;
}

export function rendreMentions(C, o = {}) {
  const B = C.boutique || {}, M = C.mentions || {};
  const nom = B.nom || 'Boutique';
  const k = (v) => (v ? esc(v) : '<em>à compléter</em>');
  const demandes = C.commandes && C.commandes.actif && voc(C).demande.type !== 'lien';
  return `${tete(C, o, 'Mentions légales, ' + nom, 'Mentions légales du site de ' + nom)}
<body>
<main class="sec"><div class="wrap" style="max-width:760px">
  <p><a href="/">← Retour au site</a></p>
  <h1 style="font-size:2.25rem;margin:28px 0 36px">Mentions légales</h1>
  <h2 style="font-size:1.125rem;margin:28px 0 10px">Éditeur du site</h2>
  <p>${k(M.raison_sociale)}<br>${esc(B.adresse)}, ${esc(B.ville)}<br>Téléphone : ${esc(B.telephone)}<br>SIRET : ${k(M.siret)}<br>Directeur de la publication : ${k(M.directeur_publication)}${M.email_contact ? '<br>Contact : ' + esc(M.email_contact) : ''}</p>
  <h2 style="font-size:1.125rem;margin:28px 0 10px">Hébergement</h2>
  <p>Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, États-Unis.</p>
  <h2 style="font-size:1.125rem;margin:28px 0 10px">Données personnelles et cookies</h2>
  <p>Ce site ne dépose pas de cookie de mesure d'audience ni de publicité. Le plan Google Maps n'est chargé que si vous cliquez sur « Afficher le plan » ; Google peut alors déposer ses propres cookies.</p>
  ${demandes ? `<p style="margin-top:12px">Le formulaire de demande transmet vos nom, téléphone, e-mail et message à la boutique. Ils sont conservés 180 jours au plus et servent uniquement à traiter votre demande${C.commandes.cle_web3forms ? ", l'e-mail de notification passant par le service Web3Forms" : ''}. Vous pouvez demander leur suppression à la boutique.</p>` : ''}
  <h2 style="font-size:1.125rem;margin:28px 0 10px">Photos</h2>
  <p>${esc(C.credits_photos || 'Photos : ' + nom)}</p>
</div></main>
</body>
</html>
`;
}
