import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [persona, setPersona] = useState('mentor');
  const [agree, setAgree] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Create account</h2>
        <label className="block mb-2 text-sm">Username</label>
        <input className="w-full mb-4 px-3 py-2 rounded border bg-transparent" value={username} onChange={e=>setUsername(e.target.value)} required />
        <label className="block mb-2 text-sm">Email</label>
        <input className="w-full mb-4 px-3 py-2 rounded border bg-transparent" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label className="block mb-2 text-sm">Password</label>
        <input className="w-full mb-4 px-3 py-2 rounded border bg-transparent" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <label className="block mb-2 text-sm">AI Persona</label>
        <select className="w-full mb-4 px-3 py-2 rounded border bg-transparent" value={persona} onChange={e=>setPersona(e.target.value)}>
          <option value="mentor">Mentor</option>
          <option value="coach">Coach</option>
          <option value="psychologist">Psychologist</option>
        </select>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={()=>setAgree(!agree)} />
          <span>I agree to the disclaimer and understand this is not medical advice.</span>
        </label>
        <button className="w-full bg-blue-600 text-white py-2 rounded mt-4" disabled={!agree}>Sign up</button>
        <p className="mt-4 text-sm text-center">Have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
      </form>
    </div>
  );
}


