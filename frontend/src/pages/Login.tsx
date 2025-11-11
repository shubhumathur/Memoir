import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthCard from '../components/auth/AuthCard';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-hero-soft">
      <AuthCard title="Welcome back">
        {error && <p className="text-accent" role="alert">{error}</p>}
        <form onSubmit={submit} className="space-y-3" aria-label="Login form">
          <div>
            <label className="block mb-1 text-sm" htmlFor="email">Email</label>
            <input id="email" className="w-full px-3 py-2 rounded-xl border" type="email" value={email} onChange={e=>setEmail(e.target.value)} required aria-required="true" aria-label="Email address" />
          </div>
          <div>
            <label className="block mb-1 text-sm" htmlFor="password">Password</label>
            <input id="password" className="w-full px-3 py-2 rounded-xl border" type="password" value={password} onChange={e=>setPassword(e.target.value)} required aria-required="true" aria-label="Password" />
          </div>
          <button className="w-full bg-primary text-white py-2 rounded-2xl disabled:opacity-50" disabled={isLoading} aria-label="Log in">
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">No account? <Link to="/signup" className="text-primary">Sign up</Link></p>
      </AuthCard>
    </div>
  );
}


