import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Leaderboard.css';

export default function Leaderboard() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [leaders, setLeaders] = useState([]);
  const [scope, setScope] = useState('global');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);
  const [location, setLocation] = useState({ village: user?.village || '', district: user?.district || '' });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setLeaders([]);
    api.leaderboard(scope)
      .then(({ leaders: results }) => { if (active) setLeaders(results); })
      .catch((requestError) => { if (active) setError(requestError.message || t('community_leaderboard_error')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [scope, t]);

  const saveLocation = async (event) => {
    event.preventDefault();
    setSavingLocation(true);
    setError('');
    try {
      const saved = await api.updateLocation(location);
      refreshUser({ ...user, ...saved });
      if (scope !== 'global') {
        setLeaders([]);
        const result = await api.leaderboard(scope);
        setLeaders(result.leaders);
      }
    } catch (requestError) {
      setError(requestError.message || t('community_location_save_error'));
    } finally {
      setSavingLocation(false);
    }
  };

  const medals = ['🥇', '🥈', '🥉'];
  const scopes = user?.role === 'student' ? ['global', 'villages', 'district', 'village'] : ['global', 'villages'];
  const topThree = leaders.slice(0, 3);
  // Reorder for Olympic podium display: 2nd, 1st, 3rd
  const podiumOrder = topThree.length >= 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;
  const isVillagesScope = scope === 'villages';

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1 className="page-title">{t('leaderboard_title')} 🏆</h1>
        <p className="page-subtitle">{t('leaderboard_sub')}</p>
      </div>

      <section className="card leaderboard-community-tools">
        <div className="leaderboard-scope-tabs" role="group" aria-label={t('community_leaderboard_scope')}>
          {scopes.map((value) => (
            <button type="button" className={scope === value ? 'active' : ''} key={value} onClick={() => setScope(value)}>{t(`community_scope_${value}`)}</button>
          ))}
        </div>
        <p>
          {scope === 'global'
            ? t('community_global_description')
            : scope === 'villages'
            ? t('community_villages_description')
            : scope === 'district'
            ? t('community_district_description')
            : t('community_village_description')}
        </p>
        {user?.role === 'student' && scope !== 'villages' && (
          <form className="leaderboard-location-form" onSubmit={saveLocation}>
            <label>{t('community_village_optional')}<input maxLength={80} value={location.village} onChange={(event) => setLocation((current) => ({ ...current, village: event.target.value }))} /></label>
            <label>{t('community_district_optional')}<input maxLength={80} value={location.district} onChange={(event) => setLocation((current) => ({ ...current, district: event.target.value }))} /></label>
            <button type="submit" className="btn btn-secondary btn-sm" disabled={savingLocation}>{savingLocation ? t('community_saving_location') : t('community_save_location')}</button>
            <small>{t('community_location_privacy')}</small>
          </form>
        )}
      </section>
      {error && <p className="community-message error" role="alert">{error}</p>}
      {loading ? <div className="loading">{t('loading')}</div> : null}
      {!loading && !leaders.length && !error && <p className="card leaderboard-empty">{t('community_no_local_leaders')}</p>}

      {!loading && topThree.length > 0 && (
        <div className="podium-container">
          {podiumOrder.map((l) => {
            const originalRank = leaders.findIndex((x) => x.id === l.id);
            const rankNum = l.rank || originalRank + 1;
            const isFirst = rankNum === 1;
            const isOwn = isVillagesScope
              ? (user?.village && l.name?.toLowerCase() === user.village.toLowerCase())
              : l.id === user?.id;

            return (
              <div key={l.id} className={`podium-card rank-${rankNum} ${isFirst ? 'podium-first' : ''}`}>
                <div className="podium-crown">{isFirst ? '👑' : medals[originalRank]}</div>
                <div className="podium-avatar">{isVillagesScope ? '🏘️' : '👤'}</div>
                <strong className="podium-name">{l.name}</strong>
                {isOwn && (
                  <span className="badge-pill podium-you-badge">
                    {isVillagesScope ? t('leaderboard_your_village') : t('leaderboard_you')}
                  </span>
                )}
                <div className="podium-xp">⚡ {l.xp} XP</div>
                <div className="podium-meta">
                  {isVillagesScope ? (
                    <span>👥 {l.active_students || 1} • 📍 {l.district}</span>
                  ) : (
                    <><span>{t('level_short')}{l.level}</span> • <span>🔥 {l.streak}</span></>
                  )}
                </div>
                <div className={`podium-stand stand-${rankNum}`}>#{rankNum}</div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && leaders.length > 0 && <div className="leaderboard-card card">
        <table className="leaderboard-table">
          <thead>
            {isVillagesScope ? (
              <tr>
                <th>{t('leaderboard_rank')}</th>
                <th>{t('leaderboard_village')}</th>
                <th>{t('leaderboard_xp')}</th>
                <th>{t('leaderboard_students_count')}</th>
                <th>{t('leaderboard_lessons_completed')}</th>
              </tr>
            ) : (
              <tr>
                <th>{t('leaderboard_rank')}</th>
                <th>{t('leaderboard_student')}</th>
                <th>{t('leaderboard_xp')}</th>
                <th>{t('dash_level_label')}</th>
                <th>{t('leaderboard_streak')}</th>
              </tr>
            )}
          </thead>
          <tbody>
            {leaders.map((l, i) => {
              const isOwn = isVillagesScope
                ? (user?.village && l.name?.toLowerCase() === user.village.toLowerCase())
                : l.id === user?.id;

              return (
                <tr key={l.id} className={isOwn ? 'highlight-row' : ''}>
                  <td className="rank-cell">{medals[i] || `#${l.rank || i + 1}`}</td>
                  <td className="student-cell">
                    <strong>{l.name}</strong>
                    {isVillagesScope && l.district && (
                      <small style={{ display: 'block', opacity: 0.75 }}>
                        {l.district}{l.state ? `, ${l.state}` : ''}
                      </small>
                    )}
                    {isOwn && (
                      <span className="badge-pill table-you-pill">
                        {isVillagesScope ? t('leaderboard_your_village') : t('leaderboard_you')}
                      </span>
                    )}
                  </td>
                  <td className="xp-cell"><strong>{l.xp}</strong></td>
                  {isVillagesScope ? (
                    <>
                      <td>👥 {l.active_students || 1}</td>
                      <td>📚 {l.lessons_completed || 0}</td>
                    </>
                  ) : (
                    <>
                      <td>{t('level_short')}{l.level}</td>
                      <td>🔥 {l.streak}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>}
    </div>
  );
}
