import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { clsx } from 'clsx';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  const isAuthed = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup';

  return (
    <div className={clsx('min-h-screen', dark && 'dark')}> 
      <div className="flex min-h-screen">
        {isAuthed && (
          <aside className="w-64 hidden md:flex flex-col gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur p-4 border-r border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">JournAI</h2>
            <nav className="flex flex-col gap-1">
              <NavItem to="/dashboard" label="Home" />
              <NavItem to="/journal" label="Journal" />
              <NavItem to="/chat" label="Chat" />
              <NavItem to="/insights" label="Insights" />
              <NavItem to="/time-travel" label="Time Travel" />
              <NavItem to="/settings" label="Settings" />
              <button className="text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => navigate('/')}>Logout</button>
            </nav>
            <div className="mt-auto">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={dark} onChange={() => setDark(!dark)} />
                Dark mode
              </label>
            </div>
          </aside>
        )}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} className={clsx('px-3 py-2 rounded', active ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700')}> {label} </Link>
  );
}


