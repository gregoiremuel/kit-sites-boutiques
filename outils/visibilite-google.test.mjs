// Essais du script « Visibilité Google » : fiche imaginaire, faux serveur d'IA (aucun réseau, aucune clé). Lancer : node --test outils/
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lireFiche, verifierFiche, lignesChiffres, construireRapportHtml, construirePrompts, controlerTexte, decouper, rediger, appelerIA, moisSuivant, moisPrecedent } from './visibilite-google.mjs';

const fiche = lireFiche(fileURLToPath(new URL('../visibilite-google/fiche-exemple.json', import.meta.url)));
const MOIS = '2026-10';

test('mois : précédent et suivant, passage d’année', () => {
  assert.equal(moisSuivant('2026-12'), '2027-01');
  assert.equal(moisPrecedent('2027-01'), '2026-12');
  assert.equal(moisSuivant('2026-10'), '2026-11');
});

test('fiche exemple valide, et fiche sans fait du mois refusée', () => {
  assert.deepEqual(verifierFiche(fiche, MOIS).erreurs, []);
  assert.ok(verifierFiche({ ...fiche, faits_du_mois: [] }, MOIS).erreurs.some((e) => /faits_du_mois/.test(e)));
  assert.ok(verifierFiche(fiche, '2026-13').erreurs.some((e) => /mois invalide/.test(e)));
});

test('chiffres : écart calculé, « non disponible » jamais transformé en zéro', () => {
  const l = Object.fromEntries(lignesChiffres(fiche, MOIS).map((x) => [x.cle, x]));
  assert.equal(l.appels.ecart, 7);
  assert.equal(l.itineraires.ecart, -5);
  assert.equal(l.clics_site.ce, null);
  assert.equal(l.clics_site.ecart, null);
});

test('rapport : chiffres de la fiche, aucune promesse, tout échappé', () => {
  const html = construireRapportHtml({ ...fiche, client: { ...fiche.client, nom: 'A <b>&</b> B' } }, MOIS);
  assert.match(html, /\+7/);
  assert.match(html, /−5/);
  assert.match(html, /non disponible/);
  assert.match(html, /Je ne promets aucune place dans Google/);
  assert.ok(!html.includes('<b>&</b>'));
  assert.ok(!/atelier muel/i.test(html));
});

test('prompts : fiche numérotée, avis sans réponse seulement, pas de nom de famille', () => {
  const p = construirePrompts(fiche, MOIS);
  assert.match(p.posts, /1\. Les galettes des rois/);
  assert.match(p.posts, /novembre 2026/);
  assert.match(p.avis, /Identifiant a1/);
  assert.match(p.avis, /Identifiant a2/);
  assert.ok(!/Identifiant a3/.test(p.avis));
  assert.ok(!/\{\{/.test(p.posts + p.avis));
});

test('contrôle : repère promesses, mots interdits, chiffres inventés, cadeaux, avis négatif', () => {
  const al = controlerTexte("Découvrez notre meilleur pain, garanti ! Tarte à 4,50 € — #boulangerie", fiche, { type: 'post' });
  const tout = al.join('|');
  assert.match(tout, /découvrez/i);
  assert.match(tout, /meilleur/);
  assert.match(tout, /garanti/);
  assert.match(tout, /chiffre\(s\) absent\(s\)/);
  assert.match(tout, /prix absent\(s\)/);
  assert.match(controlerTexte('Pain à 12 € la pièce.', fiche, { type: 'post' }).join('|'), /prix absent\(s\) de la fiche : 12/);
  assert.match(tout, /tiret long/);
  assert.match(tout, /hashtag/);
  const r = controlerTexte('Nous sommes désolés, un remboursement vous sera offert. Écrivez à moi@exemple.fr', fiche, { type: 'avis', note: 2 });
  assert.match(r.join('|'), /remboursement|cadeau/);
  assert.match(r.join('|'), /adresse e-mail/);
  assert.match(r.join('|'), /3 étoiles ou moins/);
  assert.match(controlerTexte('Le pain sans gluten est prêt.', fiche, { type: 'post' }).join('|'), /sans gluten/);
});

test('contrôle : un texte propre ne donne rien, et les numéros de faits sont vérifiés', () => {
  const bon = 'Les galettes des rois sont en vente à partir du 2 janvier. Passez les voir au comptoir, nous vous attendons du mardi au samedi dès 7 h.\nFaits utilisés : 1\nBouton : Appeler';
  assert.deepEqual(controlerTexte(bon.replace(/\nFaits.*$/s, ''), fiche, { type: 'post' }).filter((a) => !/court/.test(a)), []);
  assert.match(controlerTexte(bon, fiche, { type: 'post', faitsMax: 2 }).join('|'), /^$|court/);
  assert.match(controlerTexte(bon.replace('utilisés : 1', 'utilisés : 7'), fiche, { type: 'post', faitsMax: 2 }).join('|'), /numéro absent/);
  assert.match(controlerTexte('Texte sans source.', fiche, { type: 'post', faitsMax: 2 }).join('|'), /Faits utilisés/);
});

test('découpage de la réponse de l’IA', () => {
  const t = '### POST 1\nTexte un\nFaits utilisés : 1\n\n### POST 2\nTexte deux\n\n### AVIS a1\nMerci.';
  assert.deepEqual(decouper(t, 'POST').map((b) => b.id), ['1', '2']);
  assert.equal(decouper(t, 'AVIS')[0].texte, 'Merci.');
});

test('rédiger avec un faux serveur d’IA : fichiers écrits, clé envoyée en en-tête, rien d’autre', async () => {
  const vues = [];
  const serveur = http.createServer((req, res) => {
    let corps = '';
    req.on('data', (c) => (corps += c));
    req.on('end', () => {
      const j = JSON.parse(corps);
      vues.push({ cle: req.headers['x-api-key'], version: req.headers['anthropic-version'], modele: j.model });
      const reponse = /Écris \*\*/.test(j.messages[0].content)
        ? '### POST 1\nLes galettes des rois sont en vente à partir du 2 janvier. Passez au comptoir du mardi au samedi, dès 7 h, ou appelez-nous pour réserver la vôtre pour le week-end. Nous les préparons le matin même, en deux tailles.\nFaits utilisés : 1\nBouton : Appeler'
        : '### AVIS a1\nMerci Camille pour ce message sur le pain au levain.\n\n### AVIS a2\nNous avons lu votre message sur l’attente du samedi. Appelez-nous au 01 23 45 67 89, nous en parlerons.\nAlerte : à relire avec le commerçant avant publication';
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ content: [{ type: 'text', text: reponse }] }));
    });
  });
  await new Promise((ok) => serveur.listen(0, '127.0.0.1', ok));
  const url = `http://127.0.0.1:${serveur.address().port}/v1/messages`;
  try {
    const sortie = mkdtempSync(join(tmpdir(), 'vg-'));
    const appel = (a) => appelerIA({ ...a, cle: 'cle-de-test', url });
    const r = await rediger({ f: fiche, mois: MOIS, sortie, modele: 'claude-haiku-5-5', appel });
    assert.deepEqual(r, { posts: 1, avis: 2 });
    for (const n of ['rapport.html', 'a-valider.md', 'brouillons-posts.md', 'brouillons-avis.md', 'controle.md']) assert.ok(existsSync(join(sortie, n)), n);
    assert.match(readFileSync(join(sortie, 'brouillons-posts.md'), 'utf8'), /BROUILLON, rien n'est publié/);
    const c = readFileSync(join(sortie, 'controle.md'), 'utf8');
    assert.match(c, /a2 : .*3 étoiles ou moins/);
    assert.deepEqual(vues.map((v) => v.cle), ['cle-de-test', 'cle-de-test']);
    assert.equal(vues[0].version, '2023-06-01');
    assert.equal(vues[0].modele, 'claude-haiku-5-5');
  } finally { serveur.close(); }
});

test('sans clé, l’appel refuse et ne contacte rien', async () => {
  await assert.rejects(() => appelerIA({ systeme: 'x', utilisateur: 'y', cle: '', url: 'http://127.0.0.1:1' }), /ANTHROPIC_API_KEY/);
});
