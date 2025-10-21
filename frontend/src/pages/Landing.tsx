import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-900">
      <h1 className="text-4xl md:text-6xl font-extrabold text-center">JournAI</h1>
      <p className="text-center max-w-xl text-gray-600 dark:text-gray-300">Your AI companion for reflective journaling, mood tracking, and compassionate insights.</p>
      <div className="flex gap-4">
        <Link to="/login" className="px-5 py-3 rounded bg-blue-600 text-white">Login</Link>
        <Link to="/signup" className="px-5 py-3 rounded border border-gray-300 dark:border-gray-700">Sign up</Link>
      </div>
    </div>
  );
}


