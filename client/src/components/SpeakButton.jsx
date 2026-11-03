import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getSpeechLocale } from '../utils/speech';

export default function SpeakButton({ text, className = 'btn btn-secondary' }) {
  const { lang, t } = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  const toggleSpeech = () => {
    if (!speechAvailable || !text) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLocale(lang);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const label = speaking ? t('voice_stop') : t('voice_listen');
  return (
    <button
      type="button"
      className={className}
      onClick={toggleSpeech}
      disabled={!speechAvailable || !text}
      aria-label={speechAvailable ? label : t('voice_unavailable')}
      aria-pressed={speaking}
      title={speechAvailable ? label : t('voice_unavailable')}
    >
      <span aria-hidden="true">{speaking ? '⏹️' : '🔊'}</span>
      <span className="low-literacy-hide">{label}</span>
    </button>
  );
}
