import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './pages/App';
import Skeleton from './components/ui/Skeleton';

// Lazy load pages for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Journal = lazy(() => import('./pages/Journal'));
const Chat = lazy(() => import('./pages/Chat'));
const Insights = lazy(() => import('./pages/Insights'));
const TimeTravel = lazy(() => import('./pages/TimeTravel'));
const Settings = lazy(() => import('./pages/Settings'));
const Habits = lazy(() => import('./pages/HabitsPage'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton variant="text" width={200} />
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Suspense fallback={<LoadingFallback />}><Landing /></Suspense> },
      { path: 'login', element: <Suspense fallback={<LoadingFallback />}><Login /></Suspense> },
      { path: 'signup', element: <Suspense fallback={<LoadingFallback />}><Signup /></Suspense> },
      { path: 'dashboard', element: <Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense> },
      { path: 'journal', element: <Suspense fallback={<LoadingFallback />}><Journal /></Suspense> },
      { path: 'chat', element: <Suspense fallback={<LoadingFallback />}><Chat /></Suspense> },
      { path: 'insights', element: <Suspense fallback={<LoadingFallback />}><Insights /></Suspense> },
      { path: 'time-travel', element: <Suspense fallback={<LoadingFallback />}><TimeTravel /></Suspense> },
      { path: 'habits', element: <Suspense fallback={<LoadingFallback />}><Habits /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<LoadingFallback />}><Settings /></Suspense> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);


