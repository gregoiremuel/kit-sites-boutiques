/*
  Moteur de rendu « agence » : toutes les pages du site à partir du contenu (un seul objet JSON).
  Utilisé par le serveur (src/worker.js), par l'aperçu de l'espace de modification et par outils/apercu.mjs.
*/
import { cssPolices } from './polices.js';

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const slug = (s) => String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const hex = (c, d) => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? c : d);
const num = (i) => String(i + 1).padStart(2, '0');

/* Données utiles, nettoyées */
export function donnees(C) {
  const liste = (k) => (Array.isArray(C[k]) ? C[k] : []);
  const secteurs = liste('secteurs').filter((s) => s && s.id && s.nom);
  const realisations = liste('realisations').filter((x) => x && x.id && x.nom && x.visible !== false)
    .map((x) => ({ ...x, photos: (Array.isArray(x.photos) ? x.photos : []).filter(Boolean), interventions: (Array.isArray(x.interventions) ? x.interventions : []).filter(Boolean) }));
  const metiers = liste('metiers').filter((m) => m && m.id && m.nom).map((m) => ({ ...m, points: (Array.isArray(m.points) ? m.points : []).filter(Boolean) }));
  const etapes = liste('etapes').filter((e) => e && e.titre).map((e) => ({ ...e, points: (Array.isArray(e.points) ? e.points : []).filter(Boolean) }));
  const A = C.affichage || {};
  const equipe = A.equipe === false ? [] : liste('equipe').filter((p) => p && p.nom);
  const references = A.references === false ? [] : liste('references').filter((r) => r && r.nom);
  const chiffres = A.chiffres === false ? [] : liste('chiffres').filter((c) => c && c.valeur && c.libelle);
  const lots = liste('lots').filter((l) => typeof l === 'string' && l.trim());
  const secteur = (id) => secteurs.find((s) => s.id === id) || null;
  const secteursUtiles = secteurs.filter((s) => realisations.some((x) => x.secteur === s.id));
  return { secteurs, secteursUtiles, realisations, metiers, etapes, equipe, references, chiffres, lots, secteur };
}

function src(p, largeur) {
  if (!p) return '';
  p = String(p).trim();
  if (/^https:\/\/images\.unsplash\.com\//.test(p)) return p.split('?')[0] + `?auto=format&fit=crop&w=${largeur}&q=72`;
  if (/^(https:\/\/|data:image\/|\/photos\/|\/assets\/)/i.test(p)) return p;
  return '';
}
const essai = (p) => /^https:\/\/images\.unsplash\.com\//.test(String(p || ''));
function img(p, largeur, cls, prio, alt) {
  const s = src(p, largeur);
  return s ? `<img class="${cls}" src="${esc(s)}" alt="${esc(alt || '')}" ${prio ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">` : '';
}
/* Une photo de réalisation qui n'est pas encore celle du chantier le dit */
const illus = (p) => (essai(p) ? '<span class="illus">Photo d’illustration</span>' : '');

/* Texte simple : paragraphes séparés par une ligne vide, « ## titre », « - liste » */
function texteRiche(s) {
  return String(s || '').split(/\n\s*\n/).map((bloc) => {
    let html = '', liste = [], para = [];
    const finL = () => { if (liste.length) { html += '<ul>' + liste.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>'; liste = []; } };
    const finP = () => { if (para.length) { html += '<p>' + para.map(esc).join('<br>') + '</p>'; para = []; } };
    bloc.split('\n').map((l) => l.trim()).filter(Boolean).forEach((l) => {
      if (l.startsWith('## ')) { finP(); finL(); html += '<h2>' + esc(l.slice(3)) + '</h2>'; } else if (l.startsWith('- ')) { finP(); liste.push(l.slice(2)); } else { finL(); para.push(l); }
    });
    finP(); finL();
    return html;
  }).join('\n');
}

const ico = {
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h18M3 16h18"/></svg>',
  fermer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  tel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h3l1.5 4-2 1.3a12 12 0 0 0 6.1 6.1l1.3-2 4 1.5v3a1.8 1.8 0 0 1-1.9 1.8A16.6 16.6 0 0 1 4.8 5.4a1.8 1.8 0 0 1 1.8-1.9z"/></svg>',
  fleche: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
  gauche: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>',
  coche: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>',
};

export const favicon = (C) => src((C.agence || {}).logo, 64) || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#262a59"/></svg>');
const telHref = (t) => 'tel:' + String(t || '').replace(/[^\d+]/g, '').replace(/^0/, '+33');

/* Barre d'appel au contact, réutilisée en bas de plusieurs pages */
function appel(C) {
  const A = C.accueil || {}, G = C.agence || {};
  return `
  <section class="appel">
    ${img(A.photo_appel, 2000, 'appel-img', false, '')}
    <div class="wrap appel-in">
      <h2>${esc(A.appel_titre || 'Parlons de votre projet')}</h2>
      ${A.appel_texte ? `<p>${esc(A.appel_texte)}</p>` : ''}
      <div class="actions">
        <a class="btn btn-or" href="/contact">Décrire mon projet</a>
        ${G.telephone ? `<a class="btn btn-ligne-clair" href="${telHref(G.telephone)}">${ico.tel}<span>${esc(G.telephone)}</span></a>` : ''}
      </div>
    </div>
  </section>`;
}

/* o = { maquette, urlPolice, css | cssHref, js | jsHref, lienAdmin, apiContact, apercu } */
function document_(C, o, page) {
  const G = C.agence || {}, T = C.theme || {}, K = C.contact || {};
  const nom = G.nom || 'Agence';
  const theme = `${cssPolices(o.urlPolice || ((f) => '/fonts/' + f))}\n:root{--fond:${hex(T.fond, '#f7f5f0')};--encre:${hex(T.encre, '#15172e')};--gris:${hex(T.gris, '#585b70')};--trait:${hex(T.trait, '#e2ded4')};--marine:${hex(T.marine, '#262a59')};--or:${hex(T.or, '#f8c151')}}`;
  const style = o.css != null ? `<style>\n${o.css}\n${theme}\n</style>` : `<link rel="stylesheet" href="${o.cssHref || '/assets/site.css'}">\n<style>${theme}</style>`;
  const marque = src(G.nom_image, 600) ? `<img src="${esc(src(G.nom_image, 600))}" alt="${esc(nom)}">` : esc(nom);
  const marqueClaire = src(G.nom_image_blanc, 600) ? `<img src="${esc(src(G.nom_image_blanc, 600))}" alt="${esc(nom)}">` : esc(nom);
  const nav = [['/expertises', 'Expertises'], ['/realisations', 'Réalisations'], ['/agence', 'L’agence']];
  const actif = (h) => (page.rubrique === h ? ' aria-current="page"' : '');
  const reseaux = [['linkedin', 'LinkedIn'], ['instagram', 'Instagram']].filter(([k]) => /^https:\/\//.test(G[k] || ''));
  const AG = {
    nom, api: o.apiContact || '', maquette: !!o.maquette, apercu: !!o.apercu, cle: K.cle_web3forms || '', email: K.email || G.email || '',
    actif: K.actif !== false, confirmation: String(K.confirmation || 'Merci, votre demande est bien partie.'),
  };
  const donneesJs = `var AGENCE=${JSON.stringify(AG).replace(/</g, '\\u003c')};`;
  const scripts = o.js != null ? `<script>\n${donneesJs}\n${o.js}\n</script>` : `<script>${donneesJs}</script>\n<script src="${o.jsHref || '/assets/site.js'}" defer></script>`;
  const titre = page.titre ? `${page.titre}, ${nom}` : `${nom}, ${G.activite || ''}`.replace(/, $/, '');
  const desc = page.description || G.description_google || '';

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(desc)}">
${o.maquette ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:title" content="${esc(titre)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
${page.image && src(page.image, 1200) ? `<meta property="og:image" content="${esc(src(page.image, 1200))}">` : ''}
<meta name="theme-color" content="${hex(T.fond, '#f7f5f0')}">
<link rel="icon" href="${esc(favicon(C))}">
${style}
</head>
<body class="${page.classe || ''}">
<a class="skip" href="#contenu">Aller au contenu</a>
${o.maquette ? `<div class="maquette" role="note">Proposition de site pour ${esc(nom)}, préparée par Grégoire Muel. Version de travail non publiée : textes et photos à valider.</div>` : ''}
${C.annonce && C.annonce.afficher && C.annonce.texte ? `<div class="annonce" role="status">${esc(C.annonce.texte)}</div>` : ''}
<header class="tete">
  <div class="tete-in">
    <a class="marque" href="/" aria-label="${esc(nom)}, accueil">${marque}</a>
    <nav class="nav" aria-label="Menu principal">${nav.map(([h, t]) => `<a href="${h}"${actif(h)}>${t}</a>`).join('')}<a class="btn btn-petit" href="/contact"${actif('/contact')}>Contact</a></nav>
    <button class="ico menu-btn" type="button" id="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="menu">${ico.menu}</button>
  </div>
</header>
<div class="volet" id="menu" hidden>
  <div class="volet-in">
    <button class="ico ico-fermer" type="button" data-fermer aria-label="Fermer le menu">${ico.fermer}</button>
    <ul>${[['/', 'Accueil'], ...nav, ['/contact', 'Contact']].map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul>
    ${G.telephone ? `<a class="volet-tel" href="${telHref(G.telephone)}">${ico.tel}<span>${esc(G.telephone)}</span></a>` : ''}
  </div>
</div>
<main id="contenu">
${page.corps}
</main>
<footer class="pied">
  <div class="wrap">
    <div class="pied-haut">
      <a class="pied-marque" href="/" aria-label="${esc(nom)}, accueil">${marqueClaire}</a>
      ${G.activite || G.zone ? `<p class="pied-act">${esc([G.activite, G.zone].filter(Boolean).join(' · '))}</p>` : ''}
    </div>
    <div class="pied-cols">
      <div><h2>Le site</h2><ul>${nav.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}<li><a href="/contact">Contact</a></li></ul></div>
      <div><h2>Nous trouver</h2><ul>
        ${G.adresse ? `<li>${esc(G.adresse)}<br>${esc([G.code_postal, G.ville].filter(Boolean).join(' '))}</li>` : (G.ville ? `<li>${esc(G.ville)}</li>` : '')}
      </ul></div>
      <div><h2>Nous joindre</h2><ul>
        ${G.telephone ? `<li><a href="${telHref(G.telephone)}">${esc(G.telephone)}</a></li>` : ''}
        ${G.email ? `<li><a href="mailto:${esc(G.email)}">${esc(G.email)}</a></li>` : ''}
        ${reseaux.map(([k, t]) => `<li><a href="${esc(G[k])}" target="_blank" rel="noopener">${t}</a></li>`).join('')}
      </ul></div>
    </div>
    <div class="legal">
      <a href="/mentions-legales">Mentions légales</a>
      <a href="/confidentialite">Confidentialité</a>
      ${o.lienAdmin ? `<a href="${o.lienAdmin}">Espace de modification</a>` : ''}
      <span>© ${new Date().getFullYear()} ${esc(nom)}</span>
      ${C.credits_photos ? `<span class="credits">${esc(C.credits_photos)}</span>` : ''}
    </div>
  </div>
</footer>
${page.jsonld ? `<script type="application/ld+json">${JSON.stringify(page.jsonld).replace(/</g, '\\u003c')}</script>` : ''}
${scripts}
</body>
</html>
`;
}

/* ---------- Morceaux ---------- */
const meta = (x) => [x.lieu, x.surface].filter(Boolean).join(' · ');
const carte = (D, x, grande) => `<li class="carte${grande ? ' carte-grande' : ''}"><a href="/realisations/${esc(x.id)}">
      <span class="carte-img">${x.photos[0] ? img(x.photos[0], grande ? 1600 : 1000, 'carte-photo', false, '') + illus(x.photos[0]) : '<span class="sans-photo">Photos à venir</span>'}</span>
      <span class="carte-txt"><span class="carte-sec">${esc((D.secteur(x.secteur) || {}).nom || '')}</span><span class="carte-nom">${esc(x.nom)}</span>${meta(x) ? `<span class="carte-meta">${esc(meta(x))}</span>` : ''}</span>
    </a></li>`;
const titreSection = (sur, titre, id) => `<p class="sur">${esc(sur)}</p><h2${id ? ` id="${id}"` : ''}>${esc(titre)}</h2>`;
const listeCoches = (pts) => (pts.length ? `<ul class="coches">${pts.map((p) => `<li>${ico.coche}<span>${esc(p)}</span></li>`).join('')}</ul>` : '');
const etapesHtml = (D) => (D.etapes.length ? `<ol class="etapes">${D.etapes.map((e, i) => `<li><span class="etape-num">${num(i)}</span><h3>${esc(e.titre)}</h3>${e.points.length ? `<ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ol>` : '');
const referencesHtml = (D) => `<ul class="refs">${D.references.map((r) => `<li>${src(r.logo, 400) ? `<img src="${esc(src(r.logo, 400))}" alt="${esc(r.nom)}" loading="lazy">` : `<span>${esc(r.nom)}</span>`}</li>`).join('')}</ul>`;
const initiales = (n) => String(n || '').split(/[\s-]+/).filter(Boolean).map((m) => m[0]).slice(0, 2).join('').toUpperCase();

/* Repères de confiance sous la grande photo (courts : trois ou quatre) */
const garHero = (C) => (Array.isArray((C.accueil || {}).reperes) ? C.accueil.reperes : []).filter((x) => typeof x === 'string' && x.trim()).slice(0, 4);

/* ---------- Pages ---------- */
function accueil(C, D) {
  const A = C.accueil || {}, G = C.agence || {};
  const video = /^https:\/\/\S+\.(mp4|webm)(\?\S*)?$/i.test(A.video || '') ? A.video : '';
  /* Grille de l'accueil : 6 projets (un grand et cinq) ou 3, pour qu'aucune case ne reste vide */
  const une = D.realisations.filter((x) => x.a_la_une), base = une.length >= 3 ? une : D.realisations;
  const choix = base.slice(0, base.length >= 6 ? 6 : Math.min(3, base.length));
  return {
    classe: 'p-accueil', image: A.photo, rubrique: '/',
    jsonld: { '@context': 'https://schema.org', '@type': 'GeneralContractor', name: G.nom, description: G.description_google || '', telephone: G.telephone || undefined, email: G.email || undefined,
      address: G.adresse ? { '@type': 'PostalAddress', streetAddress: G.adresse, postalCode: G.code_postal, addressLocality: G.ville, addressCountry: 'FR' } : undefined,
      areaServed: G.zone || undefined, ...((C.reglages || {}).url ? { url: C.reglages.url } : {}), sameAs: ['linkedin', 'instagram'].map((k) => G[k]).filter((u) => /^https:\/\//.test(u || '')) },
    corps: `
  <section class="hero">
    ${video ? `<video class="hero-media" autoplay muted loop playsinline${src(A.photo, 2200) ? ` poster="${esc(src(A.photo, 2200))}"` : ''}><source src="${esc(video)}"></video>` : img(A.photo, 2400, 'hero-media', true, '')}
    <div class="hero-txt wrap">
      ${A.sur_titre ? `<p class="sur sur-clair">${esc(A.sur_titre)}</p>` : ''}
      <h1>${esc(A.titre || G.nom)}</h1>
      ${A.texte ? `<p class="hero-chapo">${esc(A.texte)}</p>` : ''}
      <div class="actions">
        <a class="btn btn-or" href="/contact">Parler de votre projet</a>
        ${D.realisations.length ? '<a class="btn btn-ligne-clair" href="/realisations">Voir les réalisations</a>' : ''}
      </div>
      ${garHero(C).length ? `<ul class="hero-gar">${garHero(C).map((g) => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}
    </div>
  </section>
  ${A.intro_titre || A.intro_texte ? `
  <section class="sec intro">
    <div class="wrap intro-grille">
      <div class="intro-txt">
        <p class="sur">${esc(G.nom || '')}</p>
        ${A.intro_titre ? `<h2>${esc(A.intro_titre)}</h2>` : ''}
        <div class="prose">${texteRiche(A.intro_texte)}</div>
        <a class="lien" href="/agence">L’agence ${ico.fleche}</a>
      </div>
      ${src(A.photo_intro, 1200) ? `<figure class="intro-fig">${img(A.photo_intro, 1200, 'intro-img', false, '')}</figure>` : ''}
    </div>
    ${D.chiffres.length ? `<div class="wrap"><ul class="chiffres">${D.chiffres.map((c) => `<li><b>${esc(c.valeur)}</b><span>${esc(c.libelle)}</span></li>`).join('')}</ul></div>` : ''}
  </section>` : ''}
  ${D.metiers.length ? `
  <section class="sec sombre" aria-labelledby="t-exp">
    <div class="wrap">
      <div class="sec-tete">${titreSection('Expertises', 'Trois métiers, un seul interlocuteur', 't-exp')}</div>
      <ol class="metiers">
        ${D.metiers.map((m, i) => `<li><a href="/expertises#${esc(m.id)}"><span class="metier-num">${num(i)}</span><h3>${esc(m.nom)}</h3>${m.accroche ? `<p>${esc(m.accroche)}</p>` : ''}<span class="lien">En détail ${ico.fleche}</span></a></li>`).join('\n        ')}
      </ol>
    </div>
  </section>` : ''}
  ${choix.length ? `
  <section class="sec" aria-labelledby="t-real">
    <div class="wrap">
      <div class="sec-tete sec-tete-ligne"><div>${titreSection('Réalisations', 'Des projets livrés', 't-real')}</div><a class="lien" href="/realisations">Toutes les réalisations ${ico.fleche}</a></div>
      <ul class="cartes cartes-une">
        ${choix.map((x, i) => carte(D, x, i === 0 && choix.length === 6)).join('\n        ')}
      </ul>
    </div>
  </section>` : ''}
  ${D.etapes.length ? `
  <section class="sec clair" aria-labelledby="t-met">
    <div class="wrap">
      <div class="sec-tete">${titreSection('Méthode', 'Du premier rendez-vous à la réception', 't-met')}</div>
      ${etapesHtml(D)}
    </div>
  </section>` : ''}
  ${D.references.length ? `
  <section class="sec" aria-labelledby="t-refs">
    <div class="wrap">
      <div class="sec-tete">${titreSection('Références', 'Ils nous ont confié leurs locaux', 't-refs')}</div>
      ${referencesHtml(D)}
    </div>
  </section>` : ''}
  ${appel(C)}`,
  };
}

function pageExpertises(C, D) {
  return {
    classe: 'p-expertises', titre: 'Expertises', rubrique: '/expertises', image: (D.metiers[0] || {}).photo,
    description: `Space planning, maîtrise d'œuvre et contractant général : les métiers de ${(C.agence || {}).nom || 'l’agence'}.`,
    corps: `
  <section class="tete-page wrap">
    <p class="sur">Expertises</p>
    <h1>Concevoir, coordonner, livrer</h1>
    <p class="chapo">${esc((C.agence || {}).activite || '')}${(C.agence || {}).zone ? ', ' + esc(C.agence.zone) : ''}.</p>
  </section>
  ${D.metiers.map((m, i) => `
  <section class="sec metier${i % 2 ? ' inverse' : ''}" id="${esc(m.id)}">
    <div class="wrap metier-grille">
      ${src(m.photo, 1400) ? `<figure class="metier-fig">${img(m.photo, 1400, 'metier-img', i === 0, '')}</figure>` : ''}
      <div class="metier-txt">
        <span class="metier-num">${num(i)}</span>
        <h2>${esc(m.nom)}</h2>
        ${m.accroche ? `<p class="chapo">${esc(m.accroche)}</p>` : ''}
        ${m.texte ? `<div class="prose">${texteRiche(m.texte)}</div>` : ''}
        ${listeCoches(m.points)}
      </div>
    </div>
  </section>`).join('')}
  ${D.etapes.length ? `
  <section class="sec clair" aria-labelledby="t-met">
    <div class="wrap">
      <div class="sec-tete">${titreSection('Méthode', 'Trois étapes, un seul responsable', 't-met')}</div>
      ${etapesHtml(D)}
    </div>
  </section>` : ''}
  ${D.lots.length ? `
  <section class="sec" aria-labelledby="t-lots">
    <div class="wrap">
      <div class="sec-tete">${titreSection('Tous corps d’état', 'Les travaux que nous coordonnons', 't-lots')}</div>
      <ul class="lots">${D.lots.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    </div>
  </section>` : ''}
  ${appel(C)}`,
  };
}

function pageRealisations(C, D, secteurId) {
  const s = secteurId ? D.secteur(secteurId) : null;
  const liste = s ? D.realisations.filter((x) => x.secteur === s.id) : D.realisations;
  return {
    classe: 'p-realisations', titre: s ? 'Réalisations : ' + s.nom : 'Réalisations', rubrique: '/realisations', image: (liste[0] && liste[0].photos[0]) || '',
    corps: `
  <section class="tete-page wrap">
    <p class="sur">Réalisations</p>
    <h1>Des locaux transformés</h1>
    ${D.secteursUtiles.length > 1 ? `<nav class="filtres" aria-label="Filtrer par secteur"><a href="/realisations"${!s ? ' aria-current="page"' : ''}>Tout</a>${D.secteursUtiles.map((x) => `<a href="/realisations?secteur=${esc(x.id)}"${s && s.id === x.id ? ' aria-current="page"' : ''}>${esc(x.nom)}</a>`).join('')}</nav>` : ''}
  </section>
  <section class="sec sec-serre">
    <div class="wrap">
      ${liste.length ? `<ul class="cartes">${liste.map((x) => carte(D, x, false)).join('\n        ')}</ul>` : '<p class="vide">Aucune réalisation en ligne pour le moment.</p>'}
    </div>
  </section>
  ${appel(C)}`,
  };
}

function pageRealisation(C, D, id) {
  const i = D.realisations.findIndex((x) => x.id === id);
  if (i < 0) return null;
  const x = D.realisations[i], s = D.secteur(x.secteur);
  const prec = D.realisations[(i - 1 + D.realisations.length) % D.realisations.length], suiv = D.realisations[(i + 1) % D.realisations.length];
  const fiche = [['Client', x.client], ['Lieu', x.lieu], ['Surface', x.surface], ['Mission', x.mission], ['Année', x.annee], ['Secteur', s && s.nom]].filter(([, v]) => v);
  const [p0, ...autres] = x.photos;
  return {
    classe: 'p-realisation', titre: x.nom, rubrique: '/realisations', image: p0, description: x.accroche || `${x.nom} : ${meta(x)}`,
    corps: `
  <section class="real-tete">
    <div class="real-fig">${p0 ? img(p0, 2200, 'real-img', true, x.nom) + illus(p0) : '<span class="sans-photo">Photos à venir</span>'}</div>
    <div class="wrap real-titre">
      <nav class="fil" aria-label="Fil d’Ariane"><a href="/realisations">Réalisations</a>${s ? ` <span aria-hidden="true">/</span> <a href="/realisations?secteur=${esc(s.id)}">${esc(s.nom)}</a>` : ''}</nav>
      <h1>${esc(x.nom)}</h1>
      ${x.accroche ? `<p class="chapo">${esc(x.accroche)}</p>` : ''}
    </div>
  </section>
  <section class="sec sec-serre">
    <div class="wrap real-grille">
      ${fiche.length ? `<dl class="fiche">${fiche.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
      <div class="real-txt">
        ${x.texte ? `<div class="prose">${texteRiche(x.texte)}</div>` : ''}
        ${x.interventions.length ? `<h2 class="h-petit">Interventions</h2>${listeCoches(x.interventions)}` : ''}
      </div>
    </div>
  </section>
  ${autres.length ? `
  <section class="sec sec-serre" aria-label="Photos du projet">
    <div class="wrap"><ul class="galerie">${autres.map((u) => `<li>${img(u, 1400, 'galerie-img', false, x.nom)}${illus(u)}</li>`).join('')}</ul></div>
  </section>` : ''}
  ${D.realisations.length > 1 ? `
  <nav class="wrap suite" aria-label="Autres réalisations">
    <a href="/realisations/${esc(prec.id)}">${ico.gauche}<span><small>Précédente</small>${esc(prec.nom)}</span></a>
    <a href="/realisations/${esc(suiv.id)}"><span><small>Suivante</small>${esc(suiv.nom)}</span>${ico.fleche}</a>
  </nav>` : ''}
  ${appel(C)}`,
  };
}

function pageAgence(C, D) {
  const P = C.presentation || {}, Gr = C.garanties || {}, G = C.agence || {};
  const gpts = (Array.isArray(Gr.points) ? Gr.points : []).filter(Boolean);
  return {
    classe: 'p-agence', titre: P.titre || 'L’agence', rubrique: '/agence', image: P.photo,
    corps: `
  <section class="tete-page wrap">
    <p class="sur">${esc(G.nom || '')}</p>
    <h1>${esc(P.titre || 'L’agence')}</h1>
  </section>
  <section class="sec sec-serre">
    <div class="wrap intro-grille">
      <div class="prose prose-grande">${texteRiche(P.texte)}</div>
      ${src(P.photo, 1200) ? `<figure class="intro-fig">${img(P.photo, 1200, 'intro-img', true, '')}</figure>` : ''}
    </div>
  </section>
  ${Gr.titre || gpts.length ? `
  <section class="sec sombre" aria-labelledby="t-eng">
    <div class="wrap engagements">
      <div>${titreSection('Garanties', Gr.titre || 'Nos engagements', 't-eng')}${Gr.texte ? `<p class="chapo">${esc(Gr.texte)}</p>` : ''}</div>
      ${listeCoches(gpts)}
    </div>
  </section>` : ''}
  ${D.equipe.length ? `
  <section class="sec" aria-labelledby="t-eq">
    <div class="wrap">
      <div class="sec-tete">${titreSection('L’équipe', 'Vos interlocuteurs', 't-eq')}</div>
      <ul class="equipe">${D.equipe.map((p) => `<li>${src(p.photo, 600) ? img(p.photo, 600, 'portrait', false, p.nom) : `<span class="portrait portrait-vide" aria-hidden="true">${esc(initiales(p.nom))}</span>`}<b>${esc(p.nom)}</b>${p.role ? `<span>${esc(p.role)}</span>` : ''}</li>`).join('')}</ul>
    </div>
  </section>` : ''}
  ${D.references.length ? `
  <section class="sec clair" aria-labelledby="t-refs">
    <div class="wrap">
      <div class="sec-tete">${titreSection('Références', 'Ils nous ont confié leurs locaux', 't-refs')}</div>
      ${referencesHtml(D)}
    </div>
  </section>` : ''}
  ${appel(C)}`,
  };
}

function pageContact(C, D) {
  const G = C.agence || {}, K = C.contact || {};
  const types = (Array.isArray(K.types) ? K.types : []).filter(Boolean);
  const carte = G.adresse ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([G.nom, G.adresse, G.code_postal, G.ville].filter(Boolean).join(' '))}` : '';
  return {
    classe: 'p-contact', titre: 'Contact', rubrique: '/contact',
    corps: `
  <section class="tete-page wrap">
    <p class="sur">Contact</p>
    <h1>Parlons de votre projet</h1>
    <p class="chapo">Quelques lignes sur vos locaux, vos délais et votre budget suffisent pour commencer.${K.delai_reponse ? ' Nous vous répondons sous ' + esc(K.delai_reponse) + '.' : ''}</p>
  </section>
  <section class="sec sec-serre">
    <div class="wrap contact-grille">
      ${K.actif === false ? `<div class="demande"><p>Le formulaire est fermé pour le moment : appelez-nous ou écrivez-nous.</p></div>` : `<form class="demande" id="demande" novalidate>
        <div class="champs">
          <div class="champ"><label for="d-nom">Nom et prénom</label><input class="saisie" id="d-nom" name="nom" autocomplete="name" required></div>
          <div class="champ"><label for="d-soc">Société <span class="fac">(facultatif)</span></label><input class="saisie" id="d-soc" name="societe" autocomplete="organization"></div>
          <div class="champ"><label for="d-mail">E-mail</label><input class="saisie" id="d-mail" name="email" type="email" autocomplete="email" required></div>
          <div class="champ"><label for="d-tel">Téléphone</label><input class="saisie" id="d-tel" name="telephone" type="tel" autocomplete="tel" inputmode="tel" required></div>
          ${types.length ? `<div class="champ"><label for="d-type">Type de locaux</label><select class="saisie" id="d-type" name="type"><option value="">Choisir</option>${types.map((t) => `<option>${esc(t)}</option>`).join('')}</select></div>` : ''}
          <div class="champ"><label for="d-surf">Surface approximative <span class="fac">(facultatif)</span></label><input class="saisie" id="d-surf" name="surface" placeholder="Ex. : 300 m²"></div>
          <div class="champ large"><label for="d-ville">Ville du projet</label><input class="saisie" id="d-ville" name="ville" autocomplete="address-level2"></div>
          <div class="champ large"><label for="d-msg">Votre projet</label><textarea class="saisie" id="d-msg" name="message" rows="6" placeholder="Rénovation, aménagement, déménagement, délais souhaités…"></textarea></div>
        </div>
        <input type="checkbox" name="botcheck" class="piege" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="demande-erreur" role="alert" hidden></p>
        <button class="btn" type="button" data-envoyer>Envoyer la demande</button>
        <p class="note">Vos coordonnées servent uniquement à répondre à votre demande. <a href="/confidentialite">Confidentialité</a></p>
      </form>
      <div class="demande-ok" tabindex="-1" hidden></div>`}
      <aside class="coord" aria-label="Coordonnées">
        <h2>${esc(G.nom || '')}</h2>
        <ul>
          ${G.adresse ? `<li><small>Adresse</small>${esc(G.adresse)}<br>${esc([G.code_postal, G.ville].filter(Boolean).join(' '))}${carte ? `<br><a href="${esc(carte)}" target="_blank" rel="noopener">Itinéraire</a>` : ''}</li>` : ''}
          ${G.telephone ? `<li><small>Téléphone</small><a href="${telHref(G.telephone)}">${esc(G.telephone)}</a></li>` : ''}
          ${G.email ? `<li><small>E-mail</small><a href="mailto:${esc(G.email)}">${esc(G.email)}</a></li>` : ''}
          ${G.zone ? `<li><small>Zone d’intervention</small>${esc(G.zone)}</li>` : ''}
        </ul>
      </aside>
    </div>
  </section>`,
  };
}

function pageMentions(C) {
  const M = C.mentions || {}, G = C.agence || {};
  const k = (v) => (v ? esc(v) : '<em>à compléter</em>');
  return {
    classe: 'p-texte', titre: 'Mentions légales',
    corps: `
  <section class="tete-page wrap"><h1>Mentions légales</h1></section>
  <section class="sec sec-serre"><div class="wrap prose">
    <h2>Éditeur du site</h2>
    <p>${k(M.raison_sociale)}${M.forme ? ', ' + esc(M.forme) : ''}<br>Siège : ${k(M.adresse)}<br>RCS : ${k(M.rcs)}<br>Directeur de la publication : ${k(M.directeur_publication)}<br>Contact : ${k(M.email || G.email)}</p>
    <h2>Hébergement</h2>
    <p>Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, États-Unis.</p>
    ${M.mediateur ? `<h2>Médiation de la consommation</h2><p>${esc(M.mediateur)}</p>` : ''}
    <h2>Photos</h2>
    <p>${esc(C.credits_photos || 'Photos : ' + (G.nom || ''))}</p>
  </div></section>`,
  };
}

function pageConfidentialite(C) {
  const K = C.contact || {}, G = C.agence || {};
  return {
    classe: 'p-texte', titre: 'Confidentialité',
    corps: `
  <section class="tete-page wrap"><h1>Confidentialité</h1></section>
  <section class="sec sec-serre"><div class="wrap prose">
    <h2>Ce que le site enregistre</h2>
    <p>Le site ne dépose aucun cookie de mesure d’audience ni de publicité.</p>
    <h2>Les demandes de contact</h2>
    <p>Quand vous envoyez une demande, les informations du formulaire sont transmises à ${esc(G.nom || 'l’agence')}${K.cle_web3forms ? ', par e-mail via le service Web3Forms' : ''}. Elles servent uniquement à répondre à votre demande et sont conservées 180 jours au plus dans l’espace de gestion du site, sauf si un contrat est conclu.</p>
    <h2>Vos droits</h2>
    <p>Vous pouvez demander l’accès, la correction ou la suppression de vos données${G.email ? ` en écrivant à <a href="mailto:${esc(G.email)}">${esc(G.email)}</a>` : ''}, et saisir la CNIL.</p>
  </div></section>`,
  };
}

function page404() {
  return { classe: 'p-texte', titre: 'Page introuvable', corps: `
  <section class="tete-page wrap">
    <h1>Page introuvable</h1>
    <p class="chapo">Cette page n’existe pas ou plus.</p>
    <p class="actions"><a class="btn" href="/">Retour à l’accueil</a> <a class="btn btn-ligne" href="/realisations">Réalisations</a></p>
  </section>` };
}

/* Toutes les adresses du site (plan du site, démonstration, tests) */
export function routes(C) {
  const D = donnees(C);
  return ['/', '/expertises', '/realisations', ...(D.secteursUtiles.length > 1 ? D.secteursUtiles.map((s) => '/realisations?secteur=' + s.id) : []),
    ...D.realisations.map((x) => '/realisations/' + x.id), '/agence', '/contact', '/mentions-legales', '/confidentialite'];
}

/* Rend une adresse : { statut, html } */
export function rendrePage(C, chemin, o = {}) {
  const D = donnees(C);
  const [p0, requete = ''] = String(chemin || '/').split('?');
  let p = '/';
  try { p = decodeURI(p0).replace(/\/+$/, '') || '/'; } catch (e) { p = '/__'; }
  const secQ = (new URLSearchParams(requete).get('secteur') || '').slice(0, 60);
  let page = null, m;
  if (p === '/') page = accueil(C, D);
  else if (p === '/expertises') page = pageExpertises(C, D);
  else if (p === '/realisations') page = pageRealisations(C, D, D.secteur(secQ) ? secQ : '');
  else if ((m = p.match(/^\/realisations\/([a-z0-9-]+)$/))) page = pageRealisation(C, D, m[1]);
  else if (p === '/agence') page = pageAgence(C, D);
  else if (p === '/contact') page = pageContact(C, D);
  else if (p === '/mentions-legales') page = pageMentions(C);
  else if (p === '/confidentialite') page = pageConfidentialite(C);
  const statut = page ? 200 : 404;
  return { statut, html: document_(C, o, page || page404()) };
}
