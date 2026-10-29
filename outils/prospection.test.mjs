// Essais du suivi de prospection (fichier imaginaire). Lancer : node --test outils/prospection.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lireCsv, bilan } from './prospection.mjs';

const P = lireCsv(readFileSync(new URL('../prospection/prospects-exemple.csv', import.meta.url), 'utf8'));

test('lecture : guillemets et point-virgule', () => {
  assert.equal(P.length, 4);
  assert.equal(P[1].notes, 'ne pas recontacter');
});

test('bilan : chiffres de la semaine, relances dues, refus jamais relancé', () => {
  const b = bilan(P, '2026-10-31');
  assert.deepEqual(b.semaine, { visites: 4, maquettes: 2, devis: 1, signes: 0, refus: 1 });
  assert.deepEqual(b.relances.map((p) => p.commerce), ['Boulangerie Exemple Un']);
  assert.ok(!b.relances.some((p) => p.statut === 'refus'));
  assert.equal(bilan([{ ...P[0], statut: 'peut-etre', ligne: 2 }], '2026-10-31').erreurs.length, 1);
});
