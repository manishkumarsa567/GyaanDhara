import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Auth.css';

export default function Register() {
  const { lang, t, languages } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    preferred_language: lang,
    village: '',
    district: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setForm((f) => ({ ...f, preferred_language: lang }));
  }, [lang]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'teacher' ? '/teacher' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <aside className="auth-brand">
          <div className="auth-brand-inner">
            <Link to="/" className="auth-brand-logo">
              <span className="auth-brand-icon">📚</span>
              <div>
                <strong>{t('appName')}</strong>
                <span>{t('appTagline')}</span>
              </div>
            </Link>
            <h2 className="auth-brand-title">{t('register_title')}</h2>
            <ul className="auth-features">
              <li><span>🎯</span> {t('login_feature1')}</li>
              <li><span>🏆</span> {t('login_feature2')}</li>
              <li><span>🤖</span> {t('login_feature3')}</li>
            </ul>
          </div>
          <div className="auth-brand-pattern" aria-hidden="true" />
        </aside>

        <section className="auth-form-panel">
          <LanguageSwitcher variant="auth" />
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <h1>{t('register_title')}</h1>
              <p>{t('register_sub')}</p>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>{t('register_name')}</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>{t('login_email')}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>{t('register_password')}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={6}
                  required
                />
              </div>
              <div className="input-group">
                <label>{t('register_role')}</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="student">{t('register_student')}</option>
                  <option value="teacher">{t('register_teacher')}</option>
                </select>
              </div>
              {form.role === 'student' && (
                <>
                  <div className="input-group">
                    <label>{t('community_village_optional')}</label>
                    <input maxLength={80} value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>{t('community_district_optional')}</label>
                    <input maxLength={80} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
                  </div>
                  <p className="auth-location-note">{t('community_location_privacy')}</p>
                </>
              )}
              <div className="input-group">
                <label>{t('register_lang')}</label>
                <select
                  value={form.preferred_language}
                  onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>{l.native}</option>
                  ))}
                </select>
              </div>
              {error && <div className="auth-error" role="alert">{error}</div>}
              <button type="submit" className="btn btn-primary btn-full auth-submit" disabled={loading}>
                {loading ? t('register_loading') : t('register_btn')}
              </button>
            </form>
            <p className="auth-footer">
              {t('register_have')} <Link to="/login">{t('register_login')}</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
