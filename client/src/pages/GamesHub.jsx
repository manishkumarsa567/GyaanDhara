import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import './GamesHub.css';

export default function GamesHub() {
  const { t, lang } = useLanguage();
  const [catalog, setCatalog] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.gamesCatalog(lang), api.gamesStats()])
      .then(([cat, st]) => {
        setCatalog(cat);
        setStats(st);
      })
      .finally(() => setLoading(false));
  }, [lang]);

  const games = useMemo(() => {
    if (!catalog) return [];
    let list = catalog.games;
    if (filter !== 'all') list = list.filter((g) => g.category === filter);
    if (difficulty !== 'all') list = list.filter((game) => game.difficulty === difficulty);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((game) => game.name.toLowerCase().includes(q)
        || game.engine.includes(q)
        || catalog.categories.find((category) => category.id === game.category)?.name.toLowerCase().includes(q));
    }
    if (sortBy === 'xp-high') list = [...list].sort((a, b) => b.xp - a.xp);
    else if (sortBy === 'xp-low') list = [...list].sort((a, b) => a.xp - b.xp);
    else if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [catalog, filter, difficulty, search, sortBy]);

  const diffLabel = (d) => t(`diff_${d}`) || d;
  const engineLabel = (e) => t(`engine_${e}`) || e.replace(/_/g, ' ');
  const difficulties = [...new Set(catalog?.games.map((game) => game.difficulty) || [])].sort();

  if (loading) return <div className="loading">{t('loading')}</div>;

  return (
    <div className="games-hub">
      <div className="games-hero card">
        <div>
          <h1 className="page-title">🎮 {t('games_title')}</h1>
          <p className="page-subtitle">{t('games_sub')}</p>
        </div>
        <div className="games-hero-stats">
          <div>
            <strong>{catalog?.totalGames || 55}</strong>
            <span>{t('games_total')}</span>
          </div>
          <div>
            <strong>{stats?.uniqueGamesPlayed || 0}</strong>
            <span>{t('games_played')}</span>
          </div>
          <div>
            <strong>{stats?.totalXpFromGames || 0}</strong>
            <span>{t('games_xp_earned')}</span>
          </div>
        </div>
      </div>

      <section className="games-filter-panel card" aria-labelledby="games-filter-title">
        <div className="games-filter-heading">
          <div>
            <h2 id="games-filter-title">Find your next game</h2>
            <p>Filter by subject and challenge level, or sort the games your way.</p>
          </div>
          <span className="games-result-count" role="status">{games.length} of {catalog?.totalGames || 0} games</span>
        </div>
        <div className="games-filter-controls">
          <label className="games-search-wrap">
            <span>Search games</span>
            <input
              type="search"
              placeholder={t('games_search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="games-search"
            />
          </label>
          <label className="games-select-wrap">
            <span>Difficulty</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              <option value="all">All difficulties</option>
              {difficulties.map((level) => <option value={level} key={level}>{diffLabel(level)}</option>)}
            </select>
          </label>
          <label className="games-select-wrap">
            <span>Sort by</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="name">Name</option>
              <option value="xp-high">Most XP</option>
              <option value="xp-low">Least XP</option>
            </select>
          </label>
          <button
            type="button"
            className="games-reset-filters"
            onClick={() => {
              setFilter('all');
              setDifficulty('all');
              setSortBy('featured');
              setSearch('');
            }}
            disabled={filter === 'all' && difficulty === 'all' && sortBy === 'featured' && !search}
          >
            Reset filters
          </button>
        </div>
        <div className="games-filter-label">Subject</div>
        <div className="games-filters" role="group" aria-label="Filter games by subject">
          <button
            type="button"
            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            {t('games_all')} ({catalog?.totalGames})
          </button>
          {catalog?.categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`filter-chip ${filter === c.id ? 'active' : ''}`}
              aria-pressed={filter === c.id}
              onClick={() => setFilter(c.id)}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </section>

      <div className="games-grid">
        {games.map((g) => (
          <Link key={g.slug} to={`/games/${g.slug}`} className="game-card card">
            <span className="game-card-icon">{g.icon}</span>
            <h3>{g.name}</h3>
            <p className="game-card-meta">
              <span className={`badge-pill difficulty-${g.difficulty}`}>{diffLabel(g.difficulty)}</span>
              <span>+{g.xp} XP</span>
            </p>
            <span className="game-card-engine">{engineLabel(g.engine)}</span>
          </Link>
        ))}
      </div>

      {games.length === 0 && <p className="muted" style={{ textAlign: 'center' }}>{t('games_none')}</p>}
    </div>
  );
}
