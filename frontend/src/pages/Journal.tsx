import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import Editor from '../components/Journal/Editor';
import MoodSelector from '../components/Journal/MoodSelector';
import TagInput from '../components/Journal/TagInput';
import EntryCard from '../components/Journal/EntryCard';
import PromptPanel from '../components/Journal/PromptPanel';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

type JournalEntry = {
  _id: string;
  date: string;
  content: string;
  sentiment: string;
  emotions: string[];
  keywords: string[];
  mood?: string;
  tags?: string[];
};

export default function Journal() {
  const [content, setContent] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showPromptPanel, setShowPromptPanel] = useState(true);

  const { token } = useAuth();

  // Autosave draft to localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('journal_draft');
    if (savedDraft) {
      setContent(savedDraft);
    }
  }, []);

  useEffect(() => {
    const autosaveTimer = setInterval(() => {
      if (content.trim()) {
        localStorage.setItem('journal_draft', content);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(autosaveTimer);
  }, [content]);

  const fetchEntries = useCallback(async () => {
    setFetching(true);
    try {
      const res = await axios.get('/journal/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch journal entries', e);
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const saveEntry = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await axios.post(
        '/journal/create',
        {
          content,
          mood: selectedMoods[0] || null,
          tags: tags.length > 0 ? tags : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setContent('');
      setSelectedMoods([]);
      setTags([]);
      localStorage.removeItem('journal_draft');
      fetchEntries();
    } catch (e) {
      console.error('Failed to save journal entry', e);
      alert('Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSelect = (promptText: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${promptText}` : promptText));
    setShowPromptPanel(false);
  };

  const handleMoodToggle = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const exportEntry = (entry: JournalEntry) => {
    const textContent = entry.content.replace(/<[^>]*>/g, '');
    const exportData = {
      date: entry.date,
      content: textContent,
      sentiment: entry.sentiment,
      emotions: entry.emotions,
      keywords: entry.keywords,
      mood: entry.mood,
      tags: entry.tags,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-entry-${entry.date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer maxWidth="7xl">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Daily Journal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Reflect on your thoughts, feelings, and experiences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Write Your Thoughts
                </h2>
                {showPromptPanel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPromptPanel(!showPromptPanel)}
                  >
                    Hide Prompts
                  </Button>
                )}
              </div>

              {showPromptPanel && (
                <div className="mb-4">
                  <PromptPanel tags={tags} onSelectPrompt={handlePromptSelect} />
                </div>
              )}

              <Editor
                content={content}
                onChange={setContent}
                onSave={saveEntry}
                isLoading={loading}
              />

              <div className="mt-4 space-y-4">
                <MoodSelector selectedMoods={selectedMoods} onMoodToggle={handleMoodToggle} />
                <TagInput tags={tags} onTagsChange={setTags} />
              </div>
            </Card>
          </div>

          {/* Right Column: Quick Actions */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setContent('');
                    setSelectedMoods([]);
                    setTags([]);
                  }}
                >
                  New Entry
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => (window.location.href = '/time-travel')}
                >
                  Time Travel
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Export all entries
                    const blob = new Blob([JSON.stringify(entries, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `journal-export-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export All
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Entry Timeline */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Your Journal Entries
          </h2>
          {fetching ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="rectangular" height={100} className="mt-2" />
                </Card>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 dark:text-gray-400">
                  No journal entries yet. Start writing to see your entries here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries.map((entry) => (
                <EntryCard
                  key={entry._id}
                  entry={entry}
                  onSelect={() => setSelectedEntry(entry)}
                  onExport={() => exportEntry(entry)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <Modal
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          title={new Date(selectedEntry.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          size="lg"
        >
          <div className="space-y-4">
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedEntry.content }}
            />

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium">
                {selectedEntry.sentiment || 'Unknown'}
              </span>
              {selectedEntry.mood && (
                <span className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm font-medium">
                  {selectedEntry.mood}
                </span>
              )}
            </div>

            {selectedEntry.emotions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Emotions:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.emotions.map((emotion, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-lg text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedEntry.keywords.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Key Topics:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => exportEntry(selectedEntry)}>
                Export
              </Button>
              <Button onClick={() => setSelectedEntry(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
