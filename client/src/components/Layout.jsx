import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import LanguageSwitcher from './LanguageSwitcher';
import SpeakButton from './SpeakButton';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { lowLiteracyMode, toggleLowLiteracyMode } = useAccessibility();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDashboardView = pathname === '/dashboard';

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);
  const navigationGuide = [
    t('nav_dashboard'),
    t('nav_learn'),
    t('nav_games'),
    t('nav_tutor'),
    user?.role === 'student' ? t('nav_stories') : '',
    t('nav_leaderboard'),
    user?.role === 'student' ? t('nav_community') : '',
    t('nav_profile'),
    user?.role === 'teacher' ? t('nav_teacher') : '',
  ].filter(Boolean).join('. ');

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="container header-inner">
          <NavLink to="/dashboard" className="logo">
            <span className="logo-icon">📚</span>
            <span>
              <strong>{t('appName')}</strong>
              <small>{t('appTagline')}</small>
            </span>
          </NavLink>
          <button
            type="button"
            className={`mobile-menu-toggle ${menuOpen ? 'is-open' : ''}`}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav id="main-navigation" className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            <NavLink to="/dashboard" onClick={closeMenu} aria-label={t('nav_dashboard')}><span aria-hidden="true">🏠</span><span className="low-literacy-hide">{t('nav_dashboard')}</span></NavLink>
            <NavLink to="/subjects" onClick={closeMenu} aria-label={t('nav_learn')}><span aria-hidden="true">📖</span><span className="low-literacy-hide">{t('nav_learn')}</span></NavLink>
            <NavLink to="/games" onClick={closeMenu} aria-label={t('nav_games')}><span aria-hidden="true">🎮</span><span className="low-literacy-hide">{t('nav_games')}</span></NavLink>
            <NavLink to="/tutor" onClick={closeMenu} aria-label={t('nav_tutor')}><span aria-hidden="true">🤖</span><span className="low-literacy-hide">{t('nav_tutor')}</span></NavLink>
            {user?.role === 'student' && <NavLink to="/stories" onClick={closeMenu} aria-label={t('nav_stories')}><span aria-hidden="true">📚</span><span className="low-literacy-hide">{t('nav_stories')}</span></NavLink>}
            <NavLink to="/leaderboard" onClick={closeMenu} aria-label={t('nav_leaderboard')}><span aria-hidden="true">🏆</span><span className="low-literacy-hide">{t('nav_leaderboard')}</span></NavLink>
            {user?.role === 'student' && <NavLink to="/community" onClick={closeMenu} aria-label={t('nav_community')}><span aria-hidden="true">🤝</span><span className="low-literacy-hide">{t('nav_community')}</span></NavLink>}
            {user?.role === 'teacher' && <NavLink to="/teacher" onClick={closeMenu} aria-label={t('nav_teacher')}><span aria-hidden="true">👩‍🏫</span><span className="low-literacy-hide">{t('nav_teacher')}</span></NavLink>}
          </nav>
          <div className="header-user">
            <LanguageSwitcher variant="header" />
            <span className="xp-badge">⚡ {user?.xp || 0} XP</span>
            <NavLink to="/profile" className="user-name-badge" aria-label={t('nav_profile')}>
              <span aria-hidden="true">👤</span><span className="user-name-label">{user?.name}</span>
            </NavLink>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
              {t('logout')}
            </button>
          </div>
        </div>
      </header>
      <main className="app-main container">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="container">{t('footer')}</div>
      </footer>
    </div>
  );
}
