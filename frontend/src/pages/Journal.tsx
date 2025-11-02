import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

type JournalEntry = {
  _id: string;
  date: string;
  content: string;
  sentiment: string;
  emotions: string[];
  keywords: string[];
};

export default function Journal() {
  const [text, setText] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const { token } = useAuth();

  const fetchEntries = async () => {
    try {
      const res = await axios.get('/journal/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch journal entries', e);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const saveEntry = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('/journal/create', { content: text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setText('');
      fetchEntries();
      // Show success feedback
      alert('Journal entry saved successfully!');
    } catch (e) {
      console.error('Failed to save journal entry', e);
      alert('Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Daily Journal</h1>

      {/* New Entry Section */}
      <div className="rounded border bg-white dark:bg-gray-800 p-4 shadow">
        <h2 className="text-lg font-medium mb-3">Write Your Thoughts</h2>
        <textarea
          className="w-full h-32 p-3 rounded border bg-transparent resize-none"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="How are you feeling today? Write about your day..."
        />
        <div className="mt-3 flex justify-end">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            onClick={saveEntry}
            disabled={loading || !text.trim()}
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      {/* Past Entries Section */}
      <div className="rounded border bg-white dark:bg-gray-800 p-4 shadow">
        <h2 className="text-lg font-medium mb-3">Your Journal Entries</h2>
        {entries.length === 0 ? (
          <p className="text-gray-500">No journal entries yet. Start writing to see your entries here.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {entries.map((entry) => (
              <div
                key={entry._id}
                className="p-4 rounded border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(entry.sentiment)}`}>
                    {entry.sentiment || 'Unknown'}
                  </span>
                </div>
                <p className="text-sm line-clamp-3">{entry.content}</p>
                {entry.emotions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.emotions.slice(0, 3).map((emotion, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {emotion}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">
                {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedEntry(null)}
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <span className={`px-3 py-1 rounded font-medium ${getSentimentColor(selectedEntry.sentiment)}`}>
                Sentiment: {selectedEntry.sentiment || 'Unknown'}
              </span>
            </div>

            <div className="mb-4">
              <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
            </div>

            {selectedEntry.emotions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Emotions Detected:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.emotions.map((emotion, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedEntry.keywords.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Key Topics:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.keywords.map((keyword, i) => (
                    <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


