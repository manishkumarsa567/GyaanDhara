import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Auth.css';

const DEMO_ACCOUNTS = {
  student: { email: 'student@demo.com', password: 'student123' },
  teacher: { email: 'teacher@demo.com', password: 'teacher123' },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const from = location.state?.from;
      const destination = from?.pathname?.startsWith('/') && from.pathname !== '/login'
        ? `${from.pathname}${from.search || ''}${from.hash || ''}`
        : user.role === 'teacher' ? '/teacher' : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.status === 401 ? t('error_invalid_login') : err.message || t('error_invalid_login'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    setEmail(DEMO_ACCOUNTS[type].email);
    setPassword(DEMO_ACCOUNTS[type].password);
    setActiveDemo(type);
    setError('');
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-split">
        <aside className="auth-brand login-brand">
          <div className="auth-brand-glow" aria-hidden="true" />
          <div className="auth-brand-inner">
            <Link to="/" className="auth-brand-logo">
              <span className="auth-brand-icon" aria-hidden="true">✳</span>
              <div>
                <strong>{t('appName')}</strong>
                <span>{t('appTagline')}</span>
              </div>
            </Link>
            <span className="login-brand-kicker">
              <span aria-hidden="true">✦</span> {t('login_secure')}
            </span>
            <h2 className="auth-brand-title">{t('dash_path')}</h2>
            <p className="auth-brand-sub">{t('login_sub')}</p>

            <ul className="auth-features">
              <li>
                <span className="feat-icon">🎯</span>
                <div>
                  <strong>{t('landing_feat1_title')}</strong>
                  <small>{t('login_feature1')}</small>
                </div>
              </li>
              <li>
                <span className="feat-icon">🏆</span>
                <div>
                  <strong>{t('landing_feat2_title')}</strong>
                  <small>{t('login_feature2')}</small>
                </div>
              </li>
              <li>
                <span className="feat-icon">🤖</span>
                <div>
                  <strong>{t('landing_feat3_title')}</strong>
                  <small>{t('login_feature3')}</small>
                </div>
              </li>
            </ul>
            <div className="login-brand-note">
              <span className="login-brand-note-icon" aria-hidden="true">↗</span>
              <div>
                <strong>{t('login_trust')}</strong>
                <span>{t('login_languages')}</span>
              </div>
            </div>
          </div>
          <div className="auth-brand-pattern" aria-hidden="true" />
        </aside>

        <section className="auth-form-panel login-panel">
          <div className="login-panel-top">
            <LanguageSwitcher variant="auth" />
          </div>

          <div className="auth-form-wrap login-card">
            <div className="login-card-mark" aria-hidden="true">✳</div>
            <div className="auth-form-header">
              <h1>{t('login_welcome')}</h1>
              <p>{t('login_sub')}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">{t('login_email')}</label>
                <div className="input-icon-wrap">
                  <span className="input-icon">✉️</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setActiveDemo(null); }}
                    placeholder={t('login_email_ph')}
                    autoComplete="email"
                    aria-invalid={Boolean(error)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">{t('login_password')}</label>
                <div className="input-icon-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setActiveDemo(null); }}
                    placeholder={t('login_password_ph')}
                    autoComplete="current-password"
                    aria-invalid={Boolean(error)}
                    required
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? t('login_hide_pass') : t('login_show_pass')}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && <div className="auth-error" role="alert">{error}</div>}

              <button type="submit" className="btn btn-primary btn-full auth-submit login-submit" disabled={loading}>
                {loading ? t('login_loading') : t('login_btn')} →
              </button>
            </form>

            <div className="auth-divider"><span>{t('login_or')}</span></div>

            <div className="auth-demo">
              <p className="auth-demo-label">{t('login_demo')}</p>
              <div className="auth-demo-btns">
                <button
                  type="button"
                  className={`demo-btn demo-student ${activeDemo === 'student' ? 'active' : ''}`}
                  onClick={() => fillDemo('student')}
                >
                  <span>👨‍🎓</span>
                  <div>
                    <strong>{t('login_student')}</strong>
                    <small>student@demo.com</small>
                  </div>
                </button>
                <button
                  type="button"
                  className={`demo-btn demo-teacher ${activeDemo === 'teacher' ? 'active' : ''}`}
                  onClick={() => fillDemo('teacher')}
                >
                  <span>👩‍🏫</span>
                  <div>
                    <strong>{t('login_teacher')}</strong>
                    <small>teacher@demo.com</small>
                  </div>
                </button>
              </div>
            </div>

            <p className="auth-footer">
              {t('login_new')}{' '}
              <Link to="/register">{t('login_create')}</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
