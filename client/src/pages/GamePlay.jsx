import { useEffect, useState } from 'react';

import { Link, useParams, useNavigate } from 'react-router-dom';

import { api } from '../api';

import { useAuth } from '../context/AuthContext';

import { useLanguage } from '../context/LanguageContext';

import GameEngine from '../games/GameEngine';

import './GamePlay.css';



function ManualPanel({ manual, t, onClose }) {
  if (!manual) return null;
  return (
    <div className="game-manual card">
      <div className="manual-header">
        <h3>📘 {manual.title}</h3>
        {onClose && (
          <button
            type="button"
            className="manual-close-btn"
            onClick={onClose}
            aria-label="Close rules"
          >
            ✕
          </button>
        )}
      </div>
      {manual.fallback && <p className="manual-fallback">{t('games_manual_fallback')}</p>}
      <ol>
        {manual.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <p className="manual-tip"><strong>{t('games_tip')}:</strong> {manual.tip}</p>
    </div>
  );
}

export default function GamePlay() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { t, lang } = useLanguage();
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    api.gamePlay(slug, lang)
      .then((data) => {
        setSession(data);
        if (data?.showManualOnStart) {
          setShowManual(true);
        }
      })
      .catch(() => navigate('/games'))
      .finally(() => setLoading(false));
  }, [slug, lang, navigate]);

  const handleComplete = async (score, total) => {
    try {
      const res = await api.gameComplete(slug, { score, total, timeSeconds: 60, lang });
      setResult(res);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      refreshUser({ ...user, xp: res.newXp, level: res.newLevel });
    } catch (e) {
      alert(e.message);
    }
  };

  const playNextLevel = () => {
    setResult(null);
    setLoading(true);
    api.gamePlay(slug, lang)
      .then((data) => {
        setSession(data);
        if (data?.showManualOnStart) {
          setShowManual(true);
        }
      })
      .finally(() => setLoading(false));
  };

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (!session) return null;

  const { game, content, progress, manual, passThreshold } = session;

  return (
    <div className="game-play">
      <div className="game-play-header">
        <div className="game-play-nav-row">
          <Link to="/games" className="back-link">
            ← {t('games_back')}
          </Link>
          {manual && (
            <button
              type="button"
              className={`manual-toggle-btn ${showManual ? 'active' : ''}`}
              onClick={() => setShowManual((prev) => !prev)}
            >
              <span>{showManual ? `✕ ${t('games_manual_hide') || 'Hide Rules'}` : `📖 ${t('games_manual_rules') || 'Game Rules & Manual'}`}</span>
            </button>
          )}
        </div>
        <div className="game-play-title">
          <span className="game-play-icon">{game.icon}</span>
          <div>
            <h1>{game.name}</h1>
            <p>
              {game.engine.replace(/_/g, ' ')} • +{game.xp} XP • {t('games_level')} {progress?.level || 1}/{game.maxLevel || 3}
              {' • '}{t('games_pass_need')} {passThreshold}%
            </p>
            {progress?.mastery > 0 && (
              <p className="game-mastery">{t('games_mastery')}: {progress.mastery}%</p>
            )}
          </div>
        </div>
      </div>

      {!result && manual && showManual && (
        <ManualPanel manual={manual} t={t} onClose={() => setShowManual(false)} />
      )}



      {result ? (

        <div className={`game-complete card ${result.passed ? 'passed' : 'failed'}`}>

          <h2>{result.passed ? `🎉 ${t('games_passed')}` : `💪 ${t('games_try_again')}`}</h2>

          <p className="game-accuracy">

            {result.accuracy}% {t('games_accuracy')}

            {!result.passed && ` — ${t('games_need')} ${passThreshold}%`}

          </p>

          <p>{result.message || result.suggestion}</p>

          <p>

            +{result.xpEarned} XP • {t('dash_total_xp')}: <strong>{result.newXp}</strong> • {t('dash_level')} {result.newLevel}

          </p>



          {!result.passed && result.hints?.length > 0 && (

            <div className="game-hints">

              <h3>💡 {t('games_hints')}</h3>

              <ul>

                {result.hints.map((h, i) => (

                  <li key={i}>{h}</li>

                ))}

              </ul>

            </div>

          )}



          {result.manual && (

            <ManualPanel manual={result.manual} t={t} />

          )}



          {result.passed && result.levelUnlocked && (

            <p className="level-unlock">🔓 {t('games_level_unlocked')} {result.nextLevel}</p>

          )}

          {result.passed && result.atMaxLevel && (

            <p className="level-max">🏆 {t('games_max_level')}</p>

          )}



          <div className="game-complete-actions">

            {result.passed && result.levelUnlocked && !result.atMaxLevel ? (

              <button type="button" className="btn btn-primary" onClick={playNextLevel}>

                {t('games_next_level')} →

              </button>

            ) : (

              <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>

                {t('games_play_again')}

              </button>

            )}

            <Link to="/tutor" className="btn btn-secondary">{t('lesson_ask_tutor')}</Link>

            <Link to="/games" className="btn btn-secondary">{t('games_more')}</Link>

          </div>

        </div>

      ) : (

        <GameEngine
          engine={content.engine}
          data={content.data}
          mode={content.mode}
          intro={content.intro}
          onComplete={handleComplete}
        />

      )}

    </div>

  );

}
