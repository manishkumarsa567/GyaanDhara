import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import NcertChapter from './pages/NcertChapter';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import Tutor from './pages/Tutor';
import Leaderboard from './pages/Leaderboard';
import TeacherDashboard from './pages/TeacherDashboard';
import GamesHub from './pages/GamesHub';
import GamePlay from './pages/GamePlay';
import Portfolio from './pages/Portfolio';
import TeacherActivity from './pages/TeacherActivity';
import Community from './pages/Community';
import Stories from './pages/Stories';
import Profile from './pages/Profile';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  if (loading) return <div className="loading">{t('loading_app')}</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  if (loading) return <div className="loading">{t('loading_app')}</div>;
  if (user) return <Navigate to={user.role === 'teacher' ? '/teacher' : '/dashboard'} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/games" element={<GamesHub />} />
        <Route path="/games/:slug" element={<GamePlay />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/learn/ncert/:grade/:subjectId/:chapterId" element={<NcertChapter />} />
        <Route path="/lesson/:id" element={<Lesson />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/tutor" element={<Tutor />} />
        <Route path="/stories" element={<PrivateRoute roles={['student']}><Stories /></PrivateRoute>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/activities/:id" element={<TeacherActivity />} />
        <Route path="/community" element={<PrivateRoute roles={['student']}><Community /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
