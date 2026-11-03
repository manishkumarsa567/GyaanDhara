import assert from 'node:assert/strict';
import test from 'node:test';
import { applyFarmChoice, getFarmOutcome, initialFarmState } from './farmSimulationState.js';

test('farm decisions change separate resources and clamp them to valid percentages', () => {
  const next = applyFarmChoice(initialFarmState, { water: -8, soil: 2, crops: 8 });
  assert.deepEqual(next, { water: 47, soil: 52, crops: 63 });
  assert.deepEqual(
    applyFarmChoice({ water: 98, soil: 3, crops: 50 }, { water: 20, soil: -10 }),
    { water: 100, soil: 0, crops: 50 },
  );
});

test('end-of-season farm outcome reflects all three resource meters', () => {
  assert.equal(getFarmOutcome({ water: 60, soil: 45, crops: 75 }), 60);
});
