import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

interface Prompt {
  text: string;
  category: string;
}

interface PromptPanelProps {
  tags?: string[];
  onSelectPrompt: (prompt: string) => void;
}

export default function PromptPanel({ tags = [], onSelectPrompt }: PromptPanelProps) {
  const { token } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, [tags]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const tagsParam = tags.length > 0 ? `?tags=${tags.join(',')}` : '';
      const res = await axios.get(`/insights/prompts${tagsParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrompts(res.data.prompts || res.data || []);
    } catch (e) {
      console.error('Failed to fetch prompts', e);
      // Fallback prompts
      setPrompts([
        { text: 'What made you smile today?', category: 'Reflection' },
        { text: 'Describe a moment when you felt proud of yourself.', category: 'Achievement' },
        { text: 'What are you grateful for right now?', category: 'Gratitude' },
        { text: 'What challenge did you overcome today?', category: 'Resilience' },
        { text: 'How did you take care of yourself today?', category: 'Self-care' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="space-y-3">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={60} />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        💡 AI Writing Prompts
      </h3>
      <div className="space-y-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt.text)}
            className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
            aria-label={`Use prompt: ${prompt.text}`}
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {prompt.text}
            </p>
            {prompt.category && (
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                {prompt.category}
              </span>
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}

