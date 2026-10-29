// Essais de la cohérence des coordonnées (fiche imaginaire). Lancer : node --test outils/coherence.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { comparer } from './coherence.mjs';
import { extraireFaits } from './fabrique-maquette.mjs';

const faits = extraireFaits('Plomberie Exemple\n12 rue Imaginaire, 75015 Paris\n01 23 45 67 89');

test('page cohérente : tout est ok, même avec un lien tel: et des espaces', () => {
  const r = comparer(faits, '<h1>Plomberie Exemple</h1><p>12, rue Imaginaire<br>75015 Paris</p><a href="tel:+33123456789">01&nbsp;23 45 67 89</a>');
  assert.ok(r.every((x) => x.ok), JSON.stringify(r));
});

test('autre numéro et adresse différente : écarts signalés', () => {
  const r = comparer(faits, '<h1>Plomberie Exemple</h1><p>14 avenue Autre, 75016 Paris</p><p>06 11 22 33 44</p>');
  const ko = r.filter((x) => !x.ok).map((x) => x.point);
  assert.deepEqual(ko.sort(), ['Adresse', 'Code postal', 'Téléphone'].sort());
  assert.match(r.find((x) => x.point === 'Téléphone').detail, /0611223344/);
});

test('numéro en plus du bon : signalé à part', () => {
  const r = comparer(faits, 'Plomberie Exemple 12 rue Imaginaire 75015 01 23 45 67 89 et 06 11 22 33 44');
  assert.ok(r.find((x) => x.point === 'Téléphone').ok);
  assert.equal(r.find((x) => x.point === 'Autre numéro').ok, false);
});
