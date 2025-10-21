import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <label className="block mb-2 text-sm">Email</label>
        <input className="w-full mb-4 px-3 py-2 rounded border bg-transparent" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label className="block mb-2 text-sm">Password</label>
        <input className="w-full mb-6 px-3 py-2 rounded border bg-transparent" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
        <p className="mt-4 text-sm text-center">No account? <Link to="/signup" className="text-blue-600">Sign up</Link></p>
      </form>
    </div>
  );
}


