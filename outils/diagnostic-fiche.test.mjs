// Essais du diagnostic de fiche (fiche imaginaire). Lancer : node --test outils/diagnostic-fiche.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { preremplir, verifierGrille, synthese, construireHtml, POINTS } from './diagnostic-fiche.mjs';

const FICHE = `Plomberie Exemple - Plombier pas cher Paris 15
4,3 (27 avis)
Plombier
12 rue Imaginaire, 75015 Paris
01 23 45 67 89
lundi 08:00–18:00
mardi 08:00–18:00
mercredi 08:00–18:00
jeudi 08:00–18:00
vendredi 08:00–17:00`;

test('préremplissage : ce qui se lit est rempli, le reste vaut « ? »', () => {
  const G = preremplir(FICHE);
  assert.equal(G.points.adresse.etat, 'OK');
  assert.equal(G.points.horaires.etat, 'À faire');
  assert.match(G.points.horaires.constat, /samedi, dimanche/);
  assert.equal(G.points.site.etat, 'Manque');
  assert.equal(G.points.nom.etat, 'À faire');
  assert.match(G.points.avis.constat, /4,3 sur 27 avis/);
  assert.equal(G.points.photos.etat, '?');
  assert.equal(Object.keys(G.points).length, POINTS.length);
});

test('grille incomplète refusée, puis complète acceptée', () => {
  const G = preremplir(FICHE);
  assert.ok(verifierGrille(G).length > 0);
  for (const p of POINTS) if (G.points[p.id].etat === '?') G.points[p.id].etat = 'OK';
  assert.match(verifierGrille(G).join('|'), /constat prérempli/);
  for (const p of POINTS) G.points[p.id].constat = 'Vérifié sur la fiche.';
  assert.deepEqual(verifierGrille(G), []);
  G.points.photos.etat = 'peut-être';
  assert.match(verifierGrille(G).join('|'), /inconnu/);
});

test('trois actions au plus, dans l’ordre de priorité, deux points forts', () => {
  const G = preremplir(FICHE);
  for (const p of POINTS) if (G.points[p.id].etat === '?') G.points[p.id].etat = 'OK';
  G.points.photos.etat = 'Manque';
  const s = synthese(G);
  assert.equal(s.actions.length, 3);
  assert.match(s.actions[0], /jours fériés/);
  assert.match(s.actions[1], /photos/);
  assert.equal(s.bien.length, 2);
});

test('page : aucune note sur 100, tout échappé, brouillon marqué', () => {
  const G = preremplir(FICHE.replace('Plomberie Exemple', 'A <script>x</script>'));
  const h = construireHtml(G, { brouillon: true });
  assert.ok(!h.includes('<script>x'));
  assert.match(h, /Brouillon/);
  assert.ok(!/\/\s?100|score/i.test(h));
  assert.match(h, /Je ne promets aucune place dans Google/);
  assert.match(h, /noindex/);
});
