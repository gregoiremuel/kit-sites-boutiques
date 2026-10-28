// Vérifie un fichier de contenu avant toute démonstration ou mise en ligne.
// Usage : node outils/verifier.mjs [fichier]     (par défaut : contenu-initial.json)
// Sortie : liste des ERREURS (bloquantes), des ALERTES (à regarder) et des faits à faire valider par la boutique.
// Code de sortie 1 s'il reste une erreur.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rendreSite, rendreMentions, horaires, voc, STYLES, ORDRE_PARTIES, GABARITS } from '../public/assets/rendu.js';
import { POLICES } from '../public/assets/polices.js';

export const SCHEMA = 'site-boutique v2';
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
export const TYPES_SCHEMA = ['LocalBusiness', 'Store', 'Bakery', 'CafeOrCoffeeShop', 'Restaurant', 'BarOrPub', 'IceCreamShop', 'Winery',
  'Florist', 'BookStore', 'ClothingStore', 'ShoeStore', 'JewelryStore', 'LiquorStore', 'GroceryStore', 'HardwareStore', 'HomeGoodsStore',
  'FurnitureStore', 'GardenStore', 'PetStore', 'ToyStore', 'BikeStore', 'HobbyShop', 'MusicStore', 'SportingGoodsStore',
  'BeautySalon', 'HairSalon', 'NailSalon', 'DaySpa', 'TattooParlor', 'HealthClub', 'AutoRepair', 'Plumber', 'Electrician', 'Locksmith', 'HomeAndConstructionBusiness', 'Optician', 'ProfessionalService'];

/* Forme exacte attendue : chaque objet doit avoir ces clés, et aucune autre */
const FORME = {
  '': ['_schema', 'metier', 'theme', 'boutique', 'annonce', 'horaires', 'horaires_note', 'sections', 'textes', 'produits', 'offres', 'commandes', 'questions', 'presse', 'avis', 'mentions', 'credits_photos', 'reglages'],
  metier: ['type_schema', 'titre_page', 'nav_boutique', 'produits', 'offres', 'demande'],
  'metier.produits': ['nav', 'rubrique', 'singulier', 'pluriel', 'feminin', 'famille', 'familles', 'autres', 'origine', 'exemple_precision', 'exemple_prix'],
  'metier.offres': ['nav', 'rubrique', 'singulier', 'pluriel', 'feminin', 'bouton'],
  'metier.demande': ['type', 'nav', 'rubrique', 'quantite', 'unite', 'par_unite', 'date', 'precisions', 'exemple', 'lien', 'lien_texte'],
  theme: ['couleur', 'couleur_foncee', 'couleur_pale', 'accent', 'polices', 'accueil', 'titres', 'angles', 'offres_fond', 'ordre'],
  boutique: ['nom', 'telephone', 'adresse', 'ville', 'quartier', 'acces', 'email', 'instagram', 'logo'],
  annonce: ['afficher', 'texte'],
  horaires: JOURS,
  sections: ['boutique', 'produits', 'offres', 'presse', 'questions'],
  textes: ['titre', 'intro', 'photo_accueil', 'boutique_titre', 'boutique_texte', 'boutique_photo_1', 'boutique_photo_2', 'produits_titre', 'produits_intro', 'produits_photo', 'offres_titre', 'offres_texte', 'offres_photo', 'description_google'],
  commandes: ['actif', 'titre', 'intro', 'cle_web3forms', 'email', 'delai_heures', 'quantite_min', 'quantite_max', 'paiement', 'confirmation'],
  avis: ['note', 'nombre', 'date', 'lien'],
  mentions: ['raison_sociale', 'siret', 'directeur_publication', 'email_contact'],
  reglages: ['geo', 'url'],
};
const ELEMENTS = {
  produits: ['nom', 'origine', 'famille', 'detail', 'prix', 'photo'],
  offres: ['nom', 'description', 'prix', 'prix_unite'],
  questions: ['question', 'reponse'],
  presse: ['date', 'titre', 'source', 'lien'],
};

/* Mots et tics qui font « site IA » (voir le prompt) */
/* Clés acceptées sans être obligatoires (ajoutées après le prompt) */
const FACULTATIVES = { textes: ['video_accueil', 'fond_video'], theme: ['gabarit'], 'metier.demande': ['qui', 'etape_jour', 'jour_phrase', 'sujet', 'sans_prix'], reglages: ['bandeau', 'illustration'] };
const INTERDITS = [
  [/\bbienvenue\b/i, 'Bienvenue'], [/\bdécouvr(ez|ir)\b/i, 'Découvrez'], [/n['’]hésitez pas/i, 'N’hésitez pas'], [/au c(œ|oe)ur d/i, 'au cœur de'],
  [/\bvéritable/i, 'véritable'], [/\bincontournable/i, 'incontournable'], [/\bpassion/i, 'passion'], [/savoir-faire unique/i, 'savoir-faire unique'],
  [/\bsublim/i, 'sublimer'], [/\bécrin/i, 'écrin'], [/\bexpérience/i, 'expérience'], [/\bunivers\b/i, 'univers'], [/\bauthentique/i, 'authentique'],
  [/\bde qualité\b/i, 'de qualité'], [/un large choix/i, 'un large choix'], [/\ben savoir plus\b/i, 'En savoir plus'], [/\bniché/i, 'niché'],
  [/\bhavre\b/i, 'havre'], [/\bpépite/i, 'pépite'], [/\bvoyage (gustatif|des sens)/i, 'voyage gustatif'], [/\bsavoureu(x|se) mélange/i, 'savoureux mélange'],
];
const SIGLES = new Set(['AOP', 'AOC', 'IGP', 'SIRET', 'RER', 'TVA', 'SNCF', 'RATP', 'BIO', 'MOF', 'DJ', 'CB']);

const HEX = /^#[0-9a-f]{6}$/i;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const URL_HTTPS = /^https:\/\/[^\s<>"]+\.[^\s<>"]+$/i;
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TEL = /(?:\+33\s?|\b0)[1-9](?:[\s.-]?\d{2}){4}\b/g;
const chiffres = (t) => String(t || '').replace(/\D/g, '').replace(/^33/, '0');
const estTexte = (v) => typeof v === 'string';
const vide = (v) => !estTexte(v) || !v.trim();

/* Contraste WCAG */
function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export const contraste = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
function tsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (!d) return { t: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let t = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  t *= 60; if (t < 0) t += 360;
  return { t, s, l };
}

export function verifier(C) {
  const erreurs = [], alertes = [], avalider = [];
  const E = (m) => erreurs.push(m), A = (m) => alertes.push(m);
  if (!C || typeof C !== 'object' || Array.isArray(C)) { E('Le fichier ne contient pas un objet JSON.'); return { erreurs, alertes, avalider }; }

  /* 1. Forme : clés manquantes ou en trop, types */
  let casse = false; // un objet ou une liste manque : impossible de continuer
  const lire = (chemin) => chemin.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), C);
  for (const [chemin, cles] of Object.entries(FORME)) {
    const o = chemin ? lire(chemin) : C;
    const nom = chemin || 'racine';
    if (!o || typeof o !== 'object' || Array.isArray(o)) { E(`« ${nom} » doit être un objet { … }.`); casse = true; continue; }
    cles.filter((k) => !(k in o) && !(chemin === 'boutique' && k === 'logo')).forEach((k) => E(`Clé manquante : ${chemin ? chemin + '.' : ''}${k}`));
    Object.keys(o).filter((k) => !cles.includes(k) && !(FACULTATIVES[chemin] || []).includes(k)).forEach((k) => E(`Clé inconnue (faute de frappe ?) : ${chemin ? chemin + '.' : ''}${k}`));
  }
  for (const [liste, cles] of Object.entries(ELEMENTS)) {
    if (!Array.isArray(C[liste])) { E(`« ${liste} » doit être une liste [ … ].`); casse = true; continue; }
    C[liste].forEach((x, i) => {
      if (!x || typeof x !== 'object' || Array.isArray(x)) { E(`${liste}[${i}] doit être un objet.`); casse = true; return; }
      cles.filter((k) => !(k in x)).forEach((k) => E(`Clé manquante : ${liste}[${i}].${k}`));
      Object.keys(x).filter((k) => !cles.includes(k)).forEach((k) => E(`Clé inconnue : ${liste}[${i}].${k}`));
      cles.forEach((k) => { if (k in x && !estTexte(x[k])) E(`${liste}[${i}].${k} doit être un texte entre guillemets (même vide : "").`); });
    });
  }
  if (casse) return { erreurs, alertes, avalider };

  const texteObligatoire = (chemin) => { const v = lire(chemin); if (!estTexte(v)) E(`${chemin} doit être un texte.`); else if (!v.trim()) E(`${chemin} est vide.`); };
  const texteFacultatif = (chemin) => { const v = lire(chemin); if (!estTexte(v)) E(`${chemin} doit être un texte (vide autorisé : "").`); };
  const booleen = (chemin) => { if (typeof lire(chemin) !== 'boolean') E(`${chemin} doit valoir true ou false (sans guillemets).`); };

  if (C._schema !== SCHEMA) E(`_schema doit valoir "${SCHEMA}".`);

  /* 2. Métier */
  const M = C.metier, P = M.produits, O = M.offres, D = M.demande;
  if (!TYPES_SCHEMA.includes(M.type_schema)) E(`metier.type_schema « ${M.type_schema} » inconnu. Choisir parmi : ${TYPES_SCHEMA.join(', ')}.`);
  texteObligatoire('metier.titre_page'); texteObligatoire('metier.nav_boutique');
  if (estTexte(M.titre_page) && /^[A-ZÀ-Ý]/.test(M.titre_page)) A('metier.titre_page commence par une majuscule : il suit le nom (« Nom, fromagerie à Auteuil »), mettez une minuscule sauf nom propre.');
  ['nav', 'rubrique', 'singulier', 'pluriel', 'autres', 'origine'].forEach((k) => texteObligatoire('metier.produits.' + k));
  ['famille', 'exemple_precision', 'exemple_prix'].forEach((k) => texteFacultatif('metier.produits.' + k));
  ['nav', 'rubrique', 'singulier', 'pluriel', 'bouton'].forEach((k) => texteObligatoire('metier.offres.' + k));
  booleen('metier.produits.feminin'); booleen('metier.offres.feminin');
  [['metier.produits', P], ['metier.offres', O]].forEach(([c, x]) => {
    ['singulier', 'pluriel'].forEach((k) => { if (estTexte(x[k]) && /^[A-ZÀ-Ý]/.test(x[k])) E(`${c}.${k} doit être en minuscules (il est placé au milieu des phrases).`); });
    ['nav', 'rubrique'].forEach((k) => { if (estTexte(x[k]) && /^[a-zà-ÿ]/.test(x[k])) E(`${c}.${k} doit commencer par une majuscule.`); });
  });
  if (!Array.isArray(P.familles)) E('metier.produits.familles doit être une liste (vide autorisée : []).');
  else {
    const codes = [];
    P.familles.forEach((f, i) => {
      if (!Array.isArray(f) || f.length !== 2 || vide(f[0]) || vide(f[1])) E(`metier.produits.familles[${i}] doit être ["Code", "Titre affiché"], deux textes non vides.`);
      else { if (codes.includes(f[0])) E(`Famille en double : ${f[0]}`); codes.push(f[0]); }
    });
    if (vide(P.famille) && P.familles.length) E('metier.produits.famille est vide alors que des familles sont listées : donnez le nom du regroupement (ex. « Lait ») ou videz familles ([]).');
    if (!vide(P.famille) && !P.familles.length) E('metier.produits.famille est rempli mais familles est vide : videz famille ("") ou listez les familles.');
    C.produits.forEach((x, i) => {
      if (codes.length && x.famille && !codes.includes(x.famille)) A(`produits[${i}] (${x.nom}) : famille « ${x.famille} » absente de metier.produits.familles, il ira dans « ${P.autres} ».`);
      if (codes.length && !x.famille) A(`produits[${i}] (${x.nom}) : sans famille, il ira dans « ${P.autres} ».`);
      if (!codes.length && x.famille) E(`produits[${i}].famille doit être vide ("") puisque les produits ne sont pas regroupés.`);
    });
  }
  if (!['retrait', 'devis', 'lien'].includes(D.type)) E('metier.demande.type doit valoir "retrait", "devis" ou "lien".');
  ['nav', 'rubrique'].forEach((k) => texteObligatoire('metier.demande.' + k));
  ['quantite', 'unite', 'par_unite', 'date', 'precisions', 'exemple', 'lien', 'lien_texte'].forEach((k) => texteFacultatif('metier.demande.' + k));
  const prixUnite = C.offres.filter((x) => !vide(x.prix_unite));
  if (D.type === 'retrait') {
    if (vide(D.date)) E('metier.demande.date est vide (ex. « Jour du retrait »).');
    if (vide(D.precisions)) E('metier.demande.precisions est vide (ex. « Goûts, allergies »).');
    if (!vide(D.quantite) && vide(D.unite)) E('metier.demande.unite est vide alors que quantite est rempli (ex. « pers. »).');
    if (prixUnite.length && (vide(D.quantite) || vide(D.par_unite))) E('Des offres ont un prix_unite : metier.demande.quantite et par_unite doivent être remplis (ex. « Nombre de personnes », « par personne »).');
  }
  if (D.type === 'devis') {
    if (vide(D.precisions)) E('metier.demande.precisions est vide (ex. « Décrivez le travail à faire »).');
    if (!vide(D.quantite)) A('metier.demande.quantite est ignoré pour un devis : mettez "".');
    if (prixUnite.length) A('prix_unite est ignoré pour un devis : mettez "".');
  }
  if (D.type === 'lien') {
    if (!URL_HTTPS.test(D.lien || '')) E('metier.demande.lien doit être l’adresse https:// de l’outil de réservation de la boutique.');
    texteObligatoire('metier.demande.lien_texte');
  } else if (!vide(D.lien)) A('metier.demande.lien est ignoré (type différent de "lien").');
  if (!vide(D.date) && /^[a-zà-ÿ]/.test(D.date)) E('metier.demande.date doit commencer par une majuscule (c’est un libellé).');

  /* 3. Couleurs et polices */
  const T = C.theme;
  ['couleur', 'couleur_foncee', 'couleur_pale', 'accent'].forEach((k) => { if (!HEX.test(T[k] || '')) E(`theme.${k} doit être une couleur #rrggbb (6 chiffres hexadécimaux).`); });
  if (!POLICES[T.polices]) E(`theme.polices doit valoir ${Object.keys(POLICES).map((k) => '"' + k + '"').join(', ')}.`);
  if ('gabarit' in T && !GABARITS.includes(T.gabarit)) E(`theme.gabarit doit valoir ${GABARITS.map((x) => '"' + x + '"').join(', ')}.`);
  const gabarit = GABARITS.includes(T.gabarit) ? T.gabarit : 'standard';
  Object.entries(STYLES).forEach(([k, valeurs]) => { if (!valeurs.includes(T[k])) E(`theme.${k} doit valoir ${valeurs.map((x) => '"' + x + '"').join(' ou ')}.`); });
  if (!Array.isArray(T.ordre) || T.ordre.length !== ORDRE_PARTIES.length || !ORDRE_PARTIES.every((k) => T.ordre.includes(k))) E(`theme.ordre doit contenir une fois chacune de ces parties, dans l'ordre voulu : ${ORDRE_PARTIES.map((x) => '"' + x + '"').join(', ')}.`);
  const sansPhoto = (v) => !String(v || '').trim();
  const TX = C.textes || {};
  if (TX.video_accueil && !/^(https:\/\/\S+\.(mp4|webm)(\?\S*)?|\/videos\/[a-z0-9-]+|\/assets\/\S+\.(mp4|webm)|data:video\/(mp4|webm);base64,\S+)$/i.test(TX.video_accueil)) E('textes.video_accueil : un fichier envoyé, ou un lien https se terminant par .mp4 ou .webm.');
  if ('fond_video' in TX && typeof TX.fond_video !== 'boolean') E('textes.fond_video doit valoir true ou false.');
  if (gabarit === 'standard' && ['photo', 'partage'].includes(T.accueil) && sansPhoto((C.textes || {}).photo_accueil)) A(`theme.accueil vaut "${T.accueil}" mais textes.photo_accueil est vide : prenez "sobre" tant qu'il n'y a pas de photo.`);
  if (gabarit === 'standard' && T.offres_fond === 'photo' && sansPhoto((C.textes || {}).offres_photo) && (C.offres || []).length) A('theme.offres_fond vaut "photo" mais textes.offres_photo est vide : prenez "clair".');
  if (['couleur', 'couleur_foncee', 'couleur_pale', 'accent'].every((k) => HEX.test(T[k] || ''))) {
    const r = (a, b) => Math.round(contraste(a, b) * 100) / 100;
    const regle = (a, b, min, quoi) => { const x = r(a, b); if (x < min) E(`Contraste trop faible (${String(x).replace('.', ',')} pour ${String(min).replace('.', ',')} minimum) : ${quoi}.`); };
    regle('#ffffff', T.couleur, 4.5, 'texte blanc sur theme.couleur (boutons, menu) : assombrissez couleur');
    regle('#ffffff', T.couleur_foncee, 4.5, 'texte blanc sur theme.couleur_foncee');
    regle(T.couleur_foncee, T.couleur_pale, 4.5, 'theme.couleur_foncee sur theme.couleur_pale (fonds clairs)');
    regle('#dfe7ed', T.couleur_foncee, 4.5, 'texte clair du pied de page sur theme.couleur_foncee : assombrissez couleur_foncee');
    regle(r('#1f2328', T.accent) >= r('#ffffff', T.accent) ? '#1f2328' : '#ffffff', T.accent, 4.5, 'texte sur theme.accent (message en haut du site, bandeau d’appel) : éclaircissez ou assombrissez accent');
    regle('#1f2328', T.couleur_pale, 7, 'texte sur theme.couleur_pale');
    if (lum(T.couleur_foncee) >= lum(T.couleur)) E('theme.couleur_foncee doit être plus foncée que theme.couleur.');
    if (lum(T.couleur_pale) < 0.75) E('theme.couleur_pale doit être très claire (fond des parties alternées).');
    const c = tsl(T.couleur), p = tsl(T.couleur_pale);
    if (c.t >= 250 && c.t <= 295 && c.s > 0.3) A('theme.couleur est violette : tic « site IA », à garder seulement si c’est vraiment la couleur de la boutique.');
    if (c.t >= 5 && c.t <= 30 && c.s > 0.45 && c.l >= 0.38 && p.t >= 25 && p.t <= 55 && p.s > 0.2) A('theme : terracotta sur fond crème, le trio « site IA ». À garder seulement si c’est vraiment la devanture.');
    if (Math.abs(c.t - tsl(T.couleur_foncee).t) > 25 && c.s > 0.15) A('theme.couleur_foncee n’est pas de la même teinte que couleur (elle devrait en être la version foncée).');
  }

  /* 4. Boutique */
  ['nom', 'telephone', 'adresse', 'ville'].forEach((k) => texteObligatoire('boutique.' + k));
  ['quartier', 'acces', 'email', 'instagram'].forEach((k) => texteFacultatif('boutique.' + k));
  const B = C.boutique;
  const telB = chiffres(B.telephone);
  if (!/^0[1-9]\d{8}$/.test(telB)) E(`boutique.telephone « ${B.telephone} » n’est pas un numéro français à 10 chiffres.`);
  else if (!/^0[1-9]( \d{2}){4}$/.test(B.telephone)) A('boutique.telephone : écrivez-le « 01 42 88 07 55 » (groupes de deux chiffres).');
  if (!/^\d{5} \S/.test(B.ville || '')) E('boutique.ville doit commencer par le code postal : « 75016 Paris ».');
  if (B.email && !EMAIL.test(B.email)) E('boutique.email n’est pas une adresse valide.');
  if (B.instagram && !/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?$/.test(B.instagram)) E('boutique.instagram doit être un lien https://www.instagram.com/compte/');

  /* 5. Annonce et horaires */
  booleen('annonce.afficher'); texteFacultatif('annonce.texte');
  if (C.annonce.afficher && vide(C.annonce.texte)) E('annonce.afficher vaut true mais le texte est vide.');
  if (!estTexte(C.horaires_note)) E('horaires_note doit être un texte (vide autorisé).');
  let ouverts = 0;
  JOURS.forEach((j) => {
    const plages = C.horaires[j];
    if (!Array.isArray(plages)) { E(`horaires.${j} doit être une liste : [] si fermé, [["09:00","13:00"]] sinon.`); return; }
    let fin = -1;
    plages.forEach((p, i) => {
      if (!Array.isArray(p) || p.length !== 2 || !HHMM.test(p[0] || '') || !HHMM.test(p[1] || '')) { E(`horaires.${j}[${i}] doit être ["HH:MM","HH:MM"] (ex. ["09:00","13:00"]).`); return; }
      const a = +p[0].slice(0, 2) * 60 + +p[0].slice(3), b = +p[1].slice(0, 2) * 60 + +p[1].slice(3);
      if (a >= b) E(`horaires.${j}[${i}] : l’ouverture (${p[0]}) doit précéder la fermeture (${p[1]}).`);
      if (a <= fin) E(`horaires.${j} : plages qui se chevauchent ou dans le désordre.`);
      fin = b;
    });
    if (plages.length) ouverts++;
    if (plages.length > 3) A(`horaires.${j} : plus de 3 plages, vérifiez.`);
  });
  if (!ouverts) E('Aucun jour d’ouverture dans les horaires.');

  /* 6. Parties affichées */
  Object.keys(C.sections).forEach((k) => { if (typeof C.sections[k] !== 'boolean') E(`sections.${k} doit valoir true ou false.`); });
  const S = C.sections, X = C.textes;
  if (S.produits && !C.produits.some((x) => !vide(x.nom))) A('sections.produits est activé mais la liste produits est vide : la partie ne s’affichera pas.');
  if (S.offres && !C.offres.some((x) => !vide(x.nom))) A('sections.offres est activé mais la liste offres est vide : la partie et le formulaire ne s’afficheront pas.');
  if (S.questions && !C.questions.length) A('sections.questions est activé mais il n’y a aucune question.');
  if (S.boutique && vide(X.boutique_texte)) A('sections.boutique est activé mais textes.boutique_texte est vide.');
  if (S.presse && !C.presse.length && vide(C.avis.note)) A('sections.presse est activé mais il n’y a ni article ni note Google.');

  /* 7. Textes et photos */
  FORME.textes.forEach((k) => texteFacultatif('textes.' + k));
  ['titre', 'intro', 'description_google'].forEach((k) => texteObligatoire('textes.' + k));
  const photos = FORME.textes.filter((k) => /photo/.test(k)).map((k) => ['textes.' + k, X[k]]).concat(C.produits.map((x, i) => [`produits[${i}].photo`, x.photo]));
  let unsplash = false;
  photos.forEach(([c, v]) => {
    if (vide(v)) return;
    if (/googleusercontent|gstatic|maps\.google|ggpht/i.test(v)) E(`${c} : photo de Google interdite (droits). Utilisez vos photos ou une photo libre.`);
    else if (/^https:\/\/images\.unsplash\.com\/photo-[\w-]+$/.test(v)) unsplash = true;
    else if (/^https:\/\/images\.unsplash\.com\//.test(v)) E(`${c} : lien Unsplash à écrire sans « ? » ni paramètres : https://images.unsplash.com/photo-…`);
    else if (!/^(https:\/\/\S+|\/photos\/[a-z0-9-]+)$/.test(v)) E(`${c} : lien de photo invalide.`);
  });
  if (unsplash && vide(C.credits_photos)) E('Photos Unsplash utilisées : credits_photos doit citer les photographes et « Unsplash ».');
  if (unsplash && !/unsplash/i.test(C.credits_photos || '')) A('credits_photos ne mentionne pas Unsplash.');
  const lg = (chemin, v, max, min = 0) => { if (estTexte(v) && v.trim() && (v.length > max || v.length < min)) A(`${chemin} : ${v.length} caractères (conseillé : ${min ? min + ' à ' : ''}${max}).`); };
  lg('textes.titre', X.titre, 70); lg('textes.intro', X.intro, 260); lg('textes.description_google', X.description_google, 160, 70);
  lg('textes.boutique_texte', X.boutique_texte, 900); lg('textes.produits_intro', X.produits_intro, 260); lg('textes.offres_texte', X.offres_texte, 260);
  lg('annonce.texte', C.annonce.texte, 140);

  /* 8. Listes */
  C.produits.forEach((x, i) => { if (vide(x.nom)) E(`produits[${i}].nom est vide.`); });
  C.offres.forEach((x, i) => {
    if (vide(x.nom)) E(`offres[${i}].nom est vide.`);
    lg(`offres[${i}].description`, x.description, 200);
    if (!vide(x.prix_unite) && !/^\d+([,.]\d{1,2})?$/.test(x.prix_unite.trim())) E(`offres[${i}].prix_unite doit être un nombre seul (ex. "8,50"), sans € ni texte.`);
  });
  C.questions.forEach((x, i) => {
    if (vide(x.question) || vide(x.reponse)) E(`questions[${i}] : question et réponse obligatoires.`);
    else if (!x.question.trim().endsWith('?')) A(`questions[${i}] : la question ne finit pas par « ? ».`);
    lg(`questions[${i}].reponse`, x.reponse, 400);
  });
  if (C.questions.length > 6) A('Plus de 6 questions : gardez les 3 à 5 plus utiles.');
  C.presse.forEach((x, i) => {
    if (vide(x.titre)) E(`presse[${i}].titre est vide.`);
    if (!URL_HTTPS.test(x.lien || '')) E(`presse[${i}].lien doit être une adresse https://`);
    if (x.date && !/^(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre) \d{4}$/.test(x.date)) A(`presse[${i}].date : écrivez « Mars 2026 ».`);
  });

  /* 9. Demandes en ligne */
  const K = C.commandes;
  booleen('commandes.actif');
  ['titre', 'intro', 'paiement', 'confirmation', 'cle_web3forms', 'email'].forEach((k) => texteFacultatif('commandes.' + k));
  const entier = (k, min, max) => { const v = K[k]; if (!Number.isInteger(v) || v < min || v > max) E(`commandes.${k} doit être un nombre entier entre ${min} et ${max} (sans guillemets).`); };
  entier('delai_heures', 0, 240); entier('quantite_min', 1, 100); entier('quantite_max', 1, 500);
  if (Number.isInteger(K.quantite_min) && Number.isInteger(K.quantite_max) && K.quantite_min > K.quantite_max) E('commandes.quantite_min dépasse quantite_max.');
  if (K.cle_web3forms && !UUID.test(K.cle_web3forms)) E('commandes.cle_web3forms doit être vide ou une clé Web3Forms (format 8-4-4-4-12).');
  if (K.email && !EMAIL.test(K.email)) E('commandes.email n’est pas une adresse valide.');
  if (K.actif && D.type !== 'lien') {
    ['titre', 'intro', 'confirmation'].forEach((k) => texteObligatoire('commandes.' + k));
    if (!S.offres || !C.offres.length) A('commandes.actif vaut true mais aucune offre n’est affichée : le formulaire ne s’affichera pas.');
  }

  /* 10. Avis, mentions, réglages */
  const AV = C.avis;
  FORME.avis.forEach((k) => texteFacultatif('avis.' + k));
  if (!vide(AV.note)) {
    if (!/^[0-5],\d$/.test(AV.note)) E('avis.note doit s’écrire « 4,8 ».');
    if (!/^\d+$/.test(AV.nombre || '')) E('avis.nombre doit être un nombre entre guillemets (« 56 »).');
    if (vide(AV.date)) E('avis.date est vide : indiquez le jour du relevé (« 12 octobre 2026 »).');
    if (!/^https:\/\/(maps\.google\.[a-z.]+|www\.google\.[a-z.]+\/maps|maps\.app\.goo\.gl|g\.page|goo\.gl\/maps)\S*$/.test(AV.lien || '')) E('avis.lien doit pointer vers la fiche Google de la boutique.');
  }
  FORME.mentions.forEach((k) => texteFacultatif('mentions.' + k));
  if (C.mentions.siret && !/^\d{14}$/.test(C.mentions.siret.replace(/\s/g, ''))) E('mentions.siret doit compter 14 chiffres.');
  if (!estTexte(C.credits_photos)) E('credits_photos doit être un texte.');
  const R = C.reglages;
  if (!Array.isArray(R.geo) || (R.geo.length && (R.geo.length !== 2 || !R.geo.every((n) => typeof n === 'number')))) E('reglages.geo doit être [latitude, longitude], deux nombres sans guillemets, ou [] si inconnu.');
  else if (R.geo.length && (R.geo[0] < 41 || R.geo[0] > 51.2 || R.geo[1] < -5.3 || R.geo[1] > 9.7)) A('reglages.geo est hors de France métropolitaine : latitude et longitude inversées ?');
  if (R.url && !URL_HTTPS.test(R.url)) E('reglages.url doit être vide ou une adresse https://');
  if ('illustration' in R && typeof R.illustration !== 'boolean') E('reglages.illustration doit valoir true ou false.');
  if ('bandeau' in R && typeof R.bandeau !== 'string') E('reglages.bandeau doit être un texte (ou absent).');
  if (R.illustration === true && !String(C.credits_photos || '').trim()) A('reglages.illustration vaut true : créditez les photos dans credits_photos.');

  /* 11. Style des textes écrits pour le site (pas les noms propres ni les titres d'articles) */
  const visibles = [];
  const ajouter = (c, v) => { if (estTexte(v) && v.trim()) visibles.push([c, v]); };
  ['titre', 'intro', 'boutique_titre', 'boutique_texte', 'produits_titre', 'produits_intro', 'offres_titre', 'offres_texte', 'description_google'].forEach((k) => ajouter('textes.' + k, X[k]));
  ajouter('annonce.texte', C.annonce.texte); ajouter('horaires_note', C.horaires_note);
  ['titre', 'intro', 'paiement', 'confirmation'].forEach((k) => ajouter('commandes.' + k, K[k]));
  C.offres.forEach((x, i) => { ajouter(`offres[${i}].nom`, x.nom); ajouter(`offres[${i}].description`, x.description); });
  C.produits.forEach((x, i) => { ajouter(`produits[${i}].detail`, x.detail); });
  C.questions.forEach((x, i) => { ajouter(`questions[${i}].question`, x.question); ajouter(`questions[${i}].reponse`, x.reponse); });
  ajouter('metier.titre_page', M.titre_page); ajouter('metier.nav_boutique', M.nav_boutique);
  ['nav', 'rubrique', 'autres', 'origine'].forEach((k) => ajouter('metier.produits.' + k, P[k]));
  ['nav', 'rubrique', 'bouton'].forEach((k) => ajouter('metier.offres.' + k, O[k]));
  ['nav', 'rubrique', 'quantite', 'date', 'precisions', 'exemple', 'lien_texte'].forEach((k) => ajouter('metier.demande.' + k, D[k]));
  visibles.forEach(([c, v]) => {
    if (v.includes('!')) E(`${c} : point d’exclamation interdit.`);
    if (/\p{Extended_Pictographic}/u.test(v)) E(`${c} : emoji interdit.`);
    if (/ · |·/.test(v)) E(`${c} : « · » interdit comme séparateur.`);
    if (/—/.test(v)) E(`${c} : tiret long « — » interdit (virgule, deux-points ou nouvelle phrase).`);
    if (/\s–\s/.test(v) && !/\d\s–\s\d/.test(v)) E(`${c} : tiret « – » en incise interdit (virgule, deux-points ou nouvelle phrase).`);
    if (/\[|\]|\{\{|TODO|lorem|xxx|à valider|à compléter|à confirmer|\?\?/i.test(v)) E(`${c} : texte provisoire (« ${v.slice(0, 40)}… ») : mettez la vraie valeur ou laissez vide, et notez le point dans la liste « à valider ».`);
    INTERDITS.forEach(([re, mot]) => { if (re.test(v)) E(`${c} : « ${mot} » fait « site IA », reformulez.`); });
    (v.match(/\b[A-ZÀ-Ý]{3,}\b/g) || []).filter((w) => !SIGLES.has(w)).forEach((w) => A(`${c} : « ${w} » en capitales.`));
    (v.match(TEL) || []).forEach((t) => { if (chiffres(t) !== telB) E(`${c} : le numéro ${t} n’est pas celui de la boutique (${B.telephone}).`); });
  });
  if (/^(bienvenue|découvrez)/i.test(X.titre || '')) E('textes.titre : commencez par un fait concret, pas par « Bienvenue » ou « Découvrez ».');

  /* 12. Rendu réel du site avec le moteur commun */
  try {
    const html = rendreSite(C, { maquette: true, css: '', js: '', lienMentions: '#', apiCommande: '' });
    const mentions = rendreMentions(C, { css: '' });
    const texte = html.replace(/<script[\s\S]*?<\/script>/g, '');
    if (/undefined|NaN|\[object Object\]|>null</.test(texte + mentions)) E('Le site rendu contient « undefined », « NaN » ou « null » : un champ a une mauvaise forme.');
    if ((html.match(/<h1[\s>]/g) || []).length !== 1) E('Le site rendu doit avoir exactement un grand titre (h1).');
    const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
    try { JSON.parse(ld[1]); } catch (e) { E('Les données pour Google (JSON-LD) sont illisibles.'); }
    const V = voc(C);
    const attendu = {
      boutique: S.boutique && !!(X.boutique_titre || X.boutique_texte), produits: S.produits && C.produits.some((x) => x.nom),
      offres: S.offres && C.offres.some((x) => x.nom), questions: S.questions && C.questions.some((x) => x.question),
      demande: !!(K.actif && S.offres && C.offres.some((x) => x.nom) && V.demande.type !== 'lien'),
    };
    Object.entries(attendu).forEach(([id, oui]) => { if (html.includes(`id="${id}"`) !== oui) E(`Rendu : la partie « ${id} » devrait être ${oui ? 'affichée' : 'masquée'}.`); });
    if (!html.includes('href="tel:+33')) E('Rendu : le bouton d’appel est absent.');
    const { TXT } = horaires(C);
    avalider.push('Horaires : ' + [1, 2, 3, 4, 5, 6, 0].map((d) => ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'][d] + ' ' + TXT[d].toLowerCase()).join(' ; '));
  } catch (e) {
    E('Le moteur n’arrive pas à fabriquer le site : ' + e.message);
  }

  /* Faits à faire valider par la boutique */
  const prix = [];
  C.produits.forEach((x) => { if (x.prix) prix.push(`${x.nom} : ${x.prix}`); });
  C.offres.forEach((x) => { if (x.prix || x.prix_unite) prix.push(`${x.nom} : ${x.prix || x.prix_unite + ' € ' + D.par_unite}`); });
  visibles.filter(([c]) => c !== 'metier.demande.exemple').forEach(([c, v]) => { (v.match(/\d+(?:[,.]\d+)?\s?€/g) || []).forEach((p) => prix.push(`${c} : ${p}`)); });
  if (prix.length) avalider.push('Prix affichés : ' + prix.join(' ; '));
  if (C.annonce.afficher) avalider.push('Message en haut du site : ' + C.annonce.texte);
  if (K.actif && D.type !== 'lien') avalider.push(`Demandes en ligne : ${D.type === 'devis' ? 'devis' : 'commande à retirer'}, délai ${K.delai_heures} h${D.quantite ? `, ${K.quantite_min} à ${K.quantite_max} ${D.unite}` : ''}`);
  if (!C.mentions.raison_sociale || !C.mentions.siret || !C.mentions.directeur_publication) avalider.push('Mentions légales à compléter avant la mise en ligne définitive : raison sociale, SIRET, directeur de la publication.');
  const style = `gabarit ${T.gabarit || 'standard'}, accueil ${T.accueil}, titres ${T.titres}, angles ${T.angles}, offres ${T.offres_fond}, polices ${T.polices}, couleur ${T.couleur}, ordre : ${(Array.isArray(T.ordre) ? T.ordre : []).join(' > ')}`;
  return { erreurs, alertes, avalider, style };
}

/* Utilisation en ligne de commande */
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const fichier = resolve(process.argv[2] || fileURLToPath(new URL('../contenu-initial.json', import.meta.url)));
  let C;
  try { C = JSON.parse(readFileSync(fichier, 'utf8')); } catch (e) {
    console.error(`\nERREUR : ${fichier} n’est pas un JSON valide.\n  ${e.message}\n  (Guillemets droits "…", pas de virgule après le dernier élément, pas de commentaire.)\n`);
    process.exit(1);
  }
  const { erreurs, alertes, avalider, style } = verifier(C);
  console.log(`\nVérification de ${fichier}${C.boutique && C.boutique.nom ? ' (' + C.boutique.nom + ')' : ''}\n`);
  if (style) console.log('  Style : ' + style + '\n');
  erreurs.forEach((m) => console.log('  ERREUR   ' + m));
  alertes.forEach((m) => console.log('  ALERTE   ' + m));
  if (avalider.length) { console.log('\n  À faire valider par la boutique :'); avalider.forEach((m) => console.log('   - ' + m)); }
  console.log(`\n${erreurs.length ? `${erreurs.length} erreur(s) à corriger.` : 'Aucune erreur.'} ${alertes.length} alerte(s).\n`);
  process.exit(erreurs.length ? 1 : 0);
}
