import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import AuthCard from '../components/auth/AuthCard';

export default function Signup() {
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [persona, setPersona] = useState('mentor');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;
    setIsLoading(true);
    setError('');
    try {
      await axios.post('/auth/register', { username, email, password, persona });
      await login(email, password);

      // If there is an onboarding draft, save it now
      const draft = localStorage.getItem('onboarding_draft');
      if (draft) {
        try {
          const onboarding = JSON.parse(draft);
          const headers = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
          await axios.post('/settings/onboarding', { onboarding }, headers);
          await axios.post('/habits/autogenerate', { onboarding }, headers);
          localStorage.removeItem('onboarding_draft');
          navigate('/habits');
          return;
        } catch {}
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-hero-soft">
      <AuthCard title="Create your account">
        {error && <p className="text-accent" role="alert">{error}</p>}
        <form onSubmit={submit} className="space-y-3" aria-label="Signup form">
          <div>
            <label className="block mb-1 text-sm" htmlFor="username">Username</label>
            <input id="username" className="w-full px-3 py-2 rounded-xl border" value={username} onChange={e=>setUsername(e.target.value)} required aria-required="true" aria-label="Username" />
          </div>
          <div>
            <label className="block mb-1 text-sm" htmlFor="email">Email</label>
            <input id="email" className="w-full px-3 py-2 rounded-xl border" type="email" value={email} onChange={e=>setEmail(e.target.value)} required aria-required="true" aria-label="Email address" />
          </div>
          <div>
            <label className="block mb-1 text-sm" htmlFor="password">Password</label>
            <input id="password" className="w-full px-3 py-2 rounded-xl border" type="password" value={password} onChange={e=>setPassword(e.target.value)} required aria-required="true" aria-label="Password" />
          </div>
          <div>
            <label className="block mb-1 text-sm" htmlFor="persona">AI Persona</label>
            <select id="persona" className="w-full px-3 py-2 rounded-xl border" value={persona} onChange={e=>setPersona(e.target.value)} aria-label="AI persona">
              <option value="mentor">Mentor</option>
              <option value="coach">Coach</option>
              <option value="psychologist">Psychologist</option>
            </select>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={agree} onChange={()=>setAgree(!agree)} aria-label="Agree to disclaimer" />
            <span>I agree to the disclaimer and understand this is not medical advice.</span>
          </label>
          <button className="w-full bg-primary text-white py-2 rounded-2xl disabled:opacity-50" disabled={!agree || isLoading} aria-label="Sign up">
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">Have an account? <Link to="/login" className="text-primary">Log in</Link></p>
      </AuthCard>
    </div>
  );
}


