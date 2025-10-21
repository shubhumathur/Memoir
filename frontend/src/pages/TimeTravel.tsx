import { useState } from 'react';
import axios from 'axios';

export default function TimeTravel() {
  const [start, setStart] = useState('2025-09-01');
  const [end, setEnd] = useState('2025-09-15');
  const [summary, setSummary] = useState('');

  const generateSummary = async () => {
    try {
      const res = await axios.post('/insights/summary', { journals: [], start, end });
      setSummary(res.data.summary || 'No summary available');
    } catch (e) {
      console.error('Failed to generate summary', e);
      setSummary('Error generating summary');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Time Travel</h1>
      <div className="flex gap-3 items-center">
        <input type="date" className="px-3 py-2 rounded border bg-transparent" value={start} onChange={e => setStart(e.target.value)} />
        <span>to</span>
        <input type="date" className="px-3 py-2 rounded border bg-transparent" value={end} onChange={e => setEnd(e.target.value)} />
        <button className="ml-auto px-4 py-2 rounded bg-blue-600 text-white" onClick={generateSummary}>Generate</button>
      </div>
      <div className="p-4 rounded bg-white dark:bg-gray-800 shadow">
        <h3 className="font-medium mb-2">AI Reflection Summary</h3>
        <p className="text-sm text-gray-700 dark:text-gray-200">{summary}</p>
      </div>
    </div>
  );
}


