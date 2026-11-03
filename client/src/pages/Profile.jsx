import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Portfolio from './Portfolio';
import './Profile.css';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [village, setVillage] = useState(user?.village || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [locationError, setLocationError] = useState('');

  const saveLocation = async (event) => {
    event.preventDefault();
    setLocationBusy(true);
    setLocationMessage('');
    setLocationError('');
    try {
      const location = await api.updateLocation({ village, district });
      refreshUser({ ...user, ...location });
      setLocationMessage(t('profile_location_saved'));
    } catch (error) {
      setLocationError(error.message || t('profile_location_error'));
    } finally {
      setLocationBusy(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-avatar" aria-hidden="true">👤</div>
        <div>
          <p className="profile-eyebrow">{t('profile_eyebrow')}</p>
          <h1 className="page-title">{user?.name}</h1>
          <p className="profile-email">{user?.email}</p>
        </div>
      </header>

      <section className="profile-details card" aria-label={t('profile_details')}>
        <div><span>{t('profile_role')}</span><strong>{t(user?.role === 'teacher' ? 'nav_teacher' : 'profile_student')}</strong></div>
        <div><span>{t('portfolio_level')}</span><strong>{t('level_short')}{user?.level || 1}</strong></div>
        <div><span>{t('dash_total_xp')}</span><strong>⚡ {user?.xp || 0}</strong></div>
      </section>

      {user?.role === 'student' && (
        <form className="profile-location card" onSubmit={saveLocation}>
          <div>
            <h2>{t('profile_location_title')}</h2>
            <p>{t('profile_location_help')}</p>
          </div>
          <div className="profile-location-fields">
            <label>{t('profile_village')}<input maxLength={80} required value={village} onChange={(event) => setVillage(event.target.value)} /></label>
            <label>{t('profile_district')}<input maxLength={80} required value={district} onChange={(event) => setDistrict(event.target.value)} /></label>
            <button type="submit" className="btn btn-primary" disabled={locationBusy}>{locationBusy ? t('profile_location_saving') : t('profile_location_save')}</button>
          </div>
          {locationMessage && <p className="profile-location-success" role="status">{locationMessage}</p>}
          {locationError && <p className="profile-location-error" role="alert">{locationError}</p>}
        </form>
      )}

      {user?.role === 'student' ? (
        <section className="profile-portfolio-section" aria-label={t('nav_portfolio')}>
          <div className="profile-section-heading">
            <p>{t('profile_achievements')}</p>
            <h2>🏆 {t('nav_portfolio')}</h2>
          </div>
          <Portfolio />
        </section>
      ) : (
        <section className="card profile-teacher-card">
          <span aria-hidden="true">👩‍🏫</span>
          <div><h2>{t('profile_teacher_title')}</h2><p>{t('profile_teacher_help')}</p></div>
          <Link className="btn btn-primary" to="/teacher">{t('nav_teacher')}</Link>
        </section>
      )}
    </div>
  );
}
