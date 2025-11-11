import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

interface HeaderProps {
  onThemeToggle: () => void;
  isDark: boolean;
}

export default function Header({ onThemeToggle, isDark }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-xl font-bold text-neutral-900">
              journAI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-neutral-700 hover:text-primary transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/journal"
              className="text-neutral-700 hover:text-primary transition-colors font-medium"
            >
              Journal
            </Link>
            <Link
              to="/insights"
              className="text-neutral-700 hover:text-primary transition-colors font-medium"
            >
              Insights
            </Link>
            <Link
              to="/time-travel"
              className="text-neutral-700 hover:text-primary transition-colors font-medium"
            >
              Time Travel
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-neutral-900">{user.name || user.email}</span>
                  <span className="text-xs text-neutral-500">{user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

