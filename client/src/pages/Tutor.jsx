import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getSpeechLocale, getSpeechRecognitionConstructor } from '../utils/speech';
import SpeakButton from '../components/SpeakButton';
import TutorMarkdown from '../components/TutorMarkdown';
import './Tutor.css';

const DISTRICT_REGIONS = {
  araria: 'Bihar', arwal: 'Bihar', aurangabad: 'Bihar', banka: 'Bihar', begusarai: 'Bihar',
  bhagalpur: 'Bihar', bhojpur: 'Bihar', buxar: 'Bihar', darbhanga: 'Bihar', 'east champaran': 'Bihar',
  'purvi champaran': 'Bihar', gopalganj: 'Bihar', gaya: 'Bihar', jamui: 'Bihar', jehanabad: 'Bihar',
  kaimur: 'Bihar', katihar: 'Bihar', khagaria: 'Bihar', kishanganj: 'Bihar', lakhisarai: 'Bihar',
  madhepura: 'Bihar', madhubani: 'Bihar', munger: 'Bihar', muzaffarpur: 'Bihar', nalanda: 'Bihar',
  nawada: 'Bihar', patna: 'Bihar', purnia: 'Bihar', purnea: 'Bihar', rohtas: 'Bihar',
  saharsa: 'Bihar', samastipur: 'Bihar', saran: 'Bihar', sheikhpura: 'Bihar', sheohar: 'Bihar',
  sitamarhi: 'Bihar', siwan: 'Bihar', supaul: 'Bihar', vaishali: 'Bihar', 'west champaran': 'Bihar',
  'paschim champaran': 'Bihar',
  ajmer: 'Rajasthan', alwar: 'Rajasthan', banswara: 'Rajasthan', baran: 'Rajasthan', barmer: 'Rajasthan',
  bharatpur: 'Rajasthan', bhilwara: 'Rajasthan', bikaner: 'Rajasthan', bundi: 'Rajasthan', chittorgarh: 'Rajasthan',
  churu: 'Rajasthan', dausa: 'Rajasthan', dholpur: 'Rajasthan', dungarpur: 'Rajasthan', hanumangarh: 'Rajasthan',
  jaipur: 'Rajasthan', jaisalmer: 'Rajasthan', jalore: 'Rajasthan', jhalawar: 'Rajasthan', jhunjhunu: 'Rajasthan',
  jodhpur: 'Rajasthan', karauli: 'Rajasthan', kota: 'Rajasthan', nagaur: 'Rajasthan', pali: 'Rajasthan',
  pratapgarh: 'Rajasthan', rajsamand: 'Rajasthan', 'sawai madhopur': 'Rajasthan', sikar: 'Rajasthan',
  sirohi: 'Rajasthan', 'sri ganganagar': 'Rajasthan', tonk: 'Rajasthan', udaipur: 'Rajasthan',
  ayodhya: 'Awadh', 'ambedkar nagar': 'Awadh', amethi: 'Awadh', barabanki: 'Awadh', faizabad: 'Awadh',
  gonda: 'Awadh', hardoi: 'Awadh', 'kanpur dehat': 'Awadh', lucknow: 'Awadh', 'rae bareli': 'Awadh',
  raebareli: 'Awadh', sitapur: 'Awadh', sultanpur: 'Awadh', unnao: 'Awadh',
};

const PROMPT_CATEGORIES = [
  {
    id: 'village_math',
    label: '🌾 Village Math & Markets',
    questions: [
      'How do I multiply 12 by 5 using bags of grain from a village market?',
      'Explain fractions simply using a roti or field division.',
      'How do I calculate profit from selling crop harvest at a mandi?',
    ],
  },
  {
    id: 'science',
    label: '🔬 Rural Science',
    questions: [
      'How does photosynthesis help our crops grow in the sunlight?',
      'Why do groundwater wells change water level between seasons?',
      'How do solar tube wells turn sunlight into irrigation water?',
    ],
  },
  {
    id: 'dialects',
    label: '🗣️ Dialects & Languages',
    questions: [
      'Bhojpuri mein batawa: Computer kaise kaam karela?',
      'Explain how fractions work in simple Hindi with daily examples.',
      'How can I practice speaking English confidently in a rural school?',
    ],
  },
  {
    id: 'digital',
    label: '💻 Digital & Life Skills',
    questions: [
      'How can I protect my family from fake UPI messages and phone scams?',
      'What is an internet browser and how does it connect to websites?',
      'How do I earn XP, level up, and unlock mystery badges in GyaanDhara?',
    ],
  },
];

export default function Tutor() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic');
  const chapter = searchParams.get('chapter');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(() => (
    topic
      ? `Please explain ${chapter ? `${chapter} from ${topic}` : topic} in more detail, step by step, with a real-world example.`
      : ''
  ));
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('village_math');
  const [clearing, setClearing] = useState(false);

  const recognitionSupported = Boolean(getSpeechRecognitionConstructor());
  const chatMessagesRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(input);
  inputRef.current = input;

  // Resolve user region
  const normalizedDistrict = (user?.district || '').trim().toLowerCase();
  const userRegion = DISTRICT_REGIONS[normalizedDistrict] || null;

  useEffect(() => {
    api.tutorHistory().then((history) => {
      if (history.length) {
        setMessages(history);
      } else {
        setMessages([
          {
            role: 'assistant',
            content: `${t('tutor_welcome')}\n\nI adapt my examples to your village life, local markets, and dialect. What would you like to explore today?`,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    });
  }, [lang]);

  // Smooth scroll within chat container only without scrolling parent window
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, loading]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
  }, []);

  const toggleListening = () => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setSpeechError(t('speech_recognition_unavailable'));
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    setSpeechError('');
    const recognition = new Recognition();
    const startingText = inputRef.current.trim();
    recognition.lang = getSpeechLocale(lang);
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      if (transcript) setInput(`${startingText} ${transcript}`.trim());
    };
    recognition.onerror = (event) => {
      setListening(false);
      const errorKey = event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'speech_microphone_denied'
        : event.error === 'no-speech'
          ? 'speech_no_input'
          : 'speech_recognition_error';
      setSpeechError(t(errorKey));
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (error) {
      recognitionRef.current = null;
      setListening(false);
      setSpeechError(error.message || t('speech_recognition_error'));
    }
  };

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: msg, created_at: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const { reply } = await api.tutorChat(msg, lang);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: reply, created_at: new Date().toISOString() },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: t('tutor_error') || 'Sorry, I had trouble processing that. Please try again.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleClearHistory = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await api.tutorClear();
      setMessages([
        {
          role: 'assistant',
          content: 'Chat refreshed! Ask a new question or choose a topic below.',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    } finally {
      setClearing(false);
    }
  };

  const appendModifier = (phrase) => {
    setInput((curr) => (curr ? `${curr.trim()} ${phrase}` : phrase));
  };

  return (
    <div className="tutor-page">
      {/* Hero Header */}
      <div className="tutor-hero-card">
        <div className="tutor-hero-top">
          <div className="tutor-hero-badge">
            <span className="mascot-avatar">🦉</span>
            <div className="badge-details">
              <div className="hero-title-row">
                <h1 className="hero-title">{t('tutor_title')}</h1>
                <span className="persona-tag">The Village Wisdom Bot · गाँव का ज्ञान गुरु</span>
              </div>
              <p className="hero-subtitle">
                Context-aware AI tutor that explains complex concepts using relatable rural metaphors, local market examples, and regional dialects.
              </p>
            </div>
          </div>
          <div className="tutor-hero-actions">
            <SpeakButton
              text={`${t('tutor_sub')} Ask questions about math, science, or English in your mother tongue.`}
              className="btn btn-secondary tutor-voice-guide-btn"
            />
          </div>
        </div>

        {/* Dynamic Context & Engine Status Bar */}
        <div className="tutor-context-ribbon">
          <div className="context-pill geo-context">
            <span className="pill-icon">📍</span>
            {user?.district ? (
              <span>
                <strong>{user.district}</strong>
                {userRegion ? ` (${userRegion} Region)` : ''} · Local Metaphors Active 🌾
              </span>
            ) : (
              <span>
                <strong>Rural Context Active 🌾</strong>
              </span>
            )}
          </div>

          {user && (
            <div className="context-pill student-stat">
              <span className="pill-icon">⚡</span>
              <span>Level {user.level || 1} · {user.xp || 0} XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="tutor-layout">
        {/* Chat Card */}
        <div className="card chat-window">
          {/* Chat Window Top Bar */}
          <div className="chat-window-header">
            <div className="chat-status-indicator">
              <span className="online-avatar">🦉</span>
              <div>
                <strong>Village Wisdom Bot</strong>
                <span className="status-caption">Always listening · Speaks your language</span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                type="button"
                className="btn btn-sm btn-subtle-clear"
                onClick={handleClearHistory}
                disabled={clearing || loading || messages.length <= 1}
                title="Start a fresh conversation"
              >
                <span>🗑️</span>
                <span className="low-literacy-hide">Clear Chat</span>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages" ref={chatMessagesRef}>
            {messages.map((m, i) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div key={i} className={`chat-message-row ${m.role}`}>
                  <div className={`sender-avatar ${m.role}`}>
                    {isAssistant ? '🦉' : '👤'}
                  </div>
                  <div className="chat-message-body">
                    <div className="message-header-info">
                      <span className="message-sender-name">
                        {isAssistant ? 'Village Wisdom Bot' : (user?.name || 'You')}
                      </span>
                      {isAssistant && <span className="ai-verified-tag">Guruji AI</span>}
                    </div>

                    <div className={`chat-bubble ${m.role}`}>
                      {isAssistant ? (
                        <TutorMarkdown content={m.content} />
                      ) : (
                        <div className="user-message-text">{m.content}</div>
                      )}
                    </div>

                    {/* Assistant Message Action Toolbar */}
                    {isAssistant && (
                      <div className="message-actions-toolbar">
                        <SpeakButton
                          text={m.content}
                          className="btn btn-sm bubble-action-btn speak-action"
                        />
                        <button
                          type="button"
                          className="btn btn-sm bubble-action-btn copy-action"
                          onClick={() => handleCopy(m.content, i)}
                          title="Copy answer to clipboard"
                        >
                          <span aria-hidden="true">{copiedIndex === i ? '✓' : '📋'}</span>
                          <span>{copiedIndex === i ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="chat-message-row assistant">
                <div className="sender-avatar assistant">🦉</div>
                <div className="chat-message-body">
                  <div className="chat-bubble assistant typing-bubble">
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="typing-text">Thinking with village wisdom...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Modifier Chips above input */}
          <div className="quick-modifier-bar">
            <span className="modifier-label">Quick modifiers:</span>
            <button
              type="button"
              className="modifier-chip"
              onClick={() => appendModifier('Please give a familiar village market or crop example.')}
            >
              🌾 Add village example
            </button>
            <button
              type="button"
              className="modifier-chip"
              onClick={() => appendModifier('Explain this very simply step by step.')}
            >
              💡 Make it simpler
            </button>
          </div>

          {/* Chat Input Row */}
          <div className="chat-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={t('tutor_placeholder') || 'Ask your question in any language or dialect...'}
              aria-label={t('tutor_placeholder') || 'Ask your doubt'}
              disabled={loading}
            />

            <button
              type="button"
              className={`btn btn-secondary tutor-mic-button ${listening ? 'listening' : ''}`}
              onClick={toggleListening}
              disabled={loading || !recognitionSupported}
              aria-label={listening ? t('speech_stop') : t('speech_start')}
              aria-pressed={listening}
              title={listening ? t('speech_stop') : 'Speak your question'}
            >
              <span aria-hidden="true">{listening ? '⏹️' : '🎙️'}</span>
              <span className="low-literacy-hide">{listening ? 'Listening...' : 'Speak'}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary tutor-send-btn"
              onClick={() => send()}
              disabled={loading || !input.trim()}
            >
              <span aria-hidden="true">➤</span>
              <span className="low-literacy-hide">{t('send') || 'Send'}</span>
            </button>
          </div>

          <p className={`tutor-speech-status ${speechError ? 'has-error' : ''}`} role="status" aria-live="polite">
            {speechError || (listening ? 'Listening to your voice... Speak clearly into your microphone.' : '')}
          </p>
        </div>

        {/* Sidebar */}
        <aside className="card tutor-sidebar">
          <div className="sidebar-header">
            <h3>{t('tutor_quick') || 'Explore Topics'}</h3>
            <span className="sidebar-badge">Village Wisdom</span>
          </div>

          {/* Category Tabs */}
          <div className="category-tabs">
            {PROMPT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-tab-btn ${activeTab === cat.id ? 'active' : ''}`}
                onClick={() => setActiveTab(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Prompt Questions */}
          <div className="suggestions">
            {PROMPT_CATEGORIES.find((c) => c.id === activeTab)?.questions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                className="suggestion-btn"
                onClick={() => send(q)}
              >
                <span className="suggestion-arrow">➜</span>
                <span>{q}</span>
              </button>
            ))}
          </div>

        </aside>
      </div>
    </div>
  );
}
