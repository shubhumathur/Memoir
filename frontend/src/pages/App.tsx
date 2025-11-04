import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import OnboardingModal from '../components/OnboardingModal';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const isAuthed = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup';

  useEffect(() => {
    if (!isLoading && !user && isAuthed) {
      navigate('/login');
    }
  }, [user, isLoading, isAuthed, navigate]);

  useEffect(() => {
    if (user && isAuthed) {
      const hasCompletedOnboarding = localStorage.getItem('memoir_onboarding_completed');
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user, isAuthed]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isAuthed && <Header onThemeToggle={toggleTheme} isDark={isDark} />}
      <div className="flex min-h-screen pt-16">
        {isAuthed && <Sidebar />}
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}


