import test from 'node:test';
import assert from 'node:assert/strict';
import { getSpeechLocale, getSpeechRecognitionConstructor, SPEECH_LOCALES } from './speech.js';

test('speech locale mapping covers every supported application language', () => {
  assert.deepEqual(Object.keys(SPEECH_LOCALES).sort(), [
    'as', 'bho', 'bn', 'en', 'gu', 'hi', 'kn', 'ks', 'mai',
    'ml', 'mr', 'ne', 'or', 'pa', 'sa', 'ta', 'te', 'ur',
  ]);
  assert.equal(getSpeechLocale('hi'), 'hi-IN');
  assert.equal(getSpeechLocale('bn'), 'bn-IN');
  assert.equal(getSpeechLocale('ne'), 'ne-NP');
  assert.equal(getSpeechLocale('mai'), 'hi-IN');
  assert.equal(getSpeechLocale('unknown'), 'en-IN');
});

test('speech recognition constructor supports standard and WebKit browser APIs', () => {
  class StandardRecognition {}
  class WebkitRecognition {}

  assert.equal(getSpeechRecognitionConstructor({ SpeechRecognition: StandardRecognition }), StandardRecognition);
  assert.equal(getSpeechRecognitionConstructor({ webkitSpeechRecognition: WebkitRecognition }), WebkitRecognition);
  assert.equal(getSpeechRecognitionConstructor({}), null);
});
