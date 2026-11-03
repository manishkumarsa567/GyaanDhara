import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLocalTutorGuidance,
  getLearnerRegion,
  getLocalFallbackExample,
} from './tutor-context.js';

test('regional guidance uses broad region names without including precise profile location', () => {
  const context = { district: 'Darbhanga', village: 'Example village' };
  const guidance = buildLocalTutorGuidance(context, 'en');

  assert.equal(getLearnerRegion(context), 'Bihar');
  assert.match(guidance, /broad region Bihar/);
  assert.match(guidance, /grain sacks/);
  assert.doesNotMatch(guidance, /Darbhanga|Example village/);
});

test('regional guidance does not infer a region for an unknown district', () => {
  assert.equal(getLearnerRegion({ district: 'Unknown district' }), null);
  const guidance = buildLocalTutorGuidance({ district: 'Unknown district' }, 'hi');

  assert.match(guidance, /Do not guess the learner's state, district, customs, or dialect/);
  assert.doesNotMatch(guidance, /Unknown district/);
});

test('rule-based math examples are localized and limited to relevant math questions', () => {
  const context = { district: 'Jaipur' };
  assert.match(getLocalFallbackExample(context, 'en', 'multiplication'), /water stored for crops/);
  assert.match(getLocalFallbackExample(context, 'hi', 'fractions'), /फसल के लिए जमा पानी/);
  assert.match(getLocalFallbackExample(context, 'bho', 'algebra'), /हाट में अनाज/);
  assert.equal(getLocalFallbackExample(context, 'en', 'digital'), '');
  assert.equal(getLocalFallbackExample({ district: 'Unknown' }, 'en', 'multiplication'), '');
});

test('dialect guidance respects Bhojpuri and avoids fabricating unsupported dialect words', () => {
  const bhojpuriGuidance = buildLocalTutorGuidance({ district: 'Patna' }, 'bho');
  const awadhiGuidance = buildLocalTutorGuidance({ district: 'Lucknow' }, 'hi');

  assert.match(bhojpuriGuidance, /clear, respectful Bhojpuri/);
  assert.match(awadhiGuidance, /Awadhi, Rajasthani/);
  assert.match(awadhiGuidance, /only when confident/);
});
