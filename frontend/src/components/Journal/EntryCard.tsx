import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface EntryCardProps {
  entry: {
    _id: string;
    date: string;
    content: string;
    sentiment: string;
    emotions: string[];
    keywords: string[];
    mood?: string;
    tags?: string[];
  };
  onSelect: () => void;
  onEdit?: () => void;
  onExport?: () => void;
}

export default function EntryCard({ entry, onSelect, onEdit, onExport }: EntryCardProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'negative':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'neutral':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Strip HTML tags for preview
  const textContent = entry.content.replace(/<[^>]*>/g, '').trim();
  const preview = textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card hover className="cursor-pointer" onClick={onSelect}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {formatDate(entry.date)}
            </h3>
            <span
              className={clsx(
                'inline-block px-2 py-1 rounded-lg text-xs font-medium',
                getSentimentColor(entry.sentiment)
              )}
            >
              {entry.sentiment || 'Unknown'}
            </span>
          </div>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onExport && (
              <Button variant="ghost" size="sm" onClick={onExport}>
                Export
              </Button>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">{preview}</p>

        {entry.emotions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {entry.emotions.slice(0, 3).map((emotion, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs"
              >
                {emotion}
              </span>
            ))}
          </div>
        )}

        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

