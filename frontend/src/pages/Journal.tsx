import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Journal() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);

  const fetchEntries = async () => {
    try {
      const res = await axios.get('/journal/list');
      // Ensure entries is always an array
      setEntries(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch journal entries', e);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const saveEntry = async () => {
    try {
      const res = await axios.post('/journal/create', { content: text });
      setResult(res.data.sentiment || 'No sentiment');
      setText('');
      fetchEntries();
    } catch (e) {
      console.error('Failed to save journal entry', e);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Journal</h1>
      <textarea className="w-full h-48 p-3 rounded border bg-transparent" value={text} onChange={e => setText(e.target.value)} />
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={saveEntry}>Save Journal</button>
        <button className="px-4 py-2 rounded border" onClick={() => setResult(entries.length > 0 ? entries[0].sentiment : null)}>Analyze Mood</button>
      </div>
      {result && <div className="p-3 rounded bg-white dark:bg-gray-800 shadow">Sentiment: <span className="font-semibold">{result}</span></div>}
      <div className="mt-6">
        <h3 className="font-medium mb-2">Past entries</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {entries.length > 0 ? entries.map((entry, i) => (
            <div key={i} className="p-2 rounded border">{new Date(entry.date).toLocaleDateString()}</div>
          )) : <div>No journal entries found.</div>}
        </div>
      </div>
    </div>
  );
}


