export const initialFarmState = { water: 55, soil: 50, crops: 55 };

export function applyFarmChoice(resources, effects) {
  return Object.fromEntries(
    Object.entries(resources).map(([key, value]) => [
      key,
      Math.min(100, Math.max(0, value + (effects[key] || 0))),
    ]),
  );
}

export function getFarmOutcome(resources) {
  const average = (resources.water + resources.soil + resources.crops) / 3;
  return Math.round(average);
}
