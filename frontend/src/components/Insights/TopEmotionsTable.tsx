import React from 'react';
import Card from '../ui/Card';

interface TopEmotionsTableProps {
  emotions: Array<{ name: string; value: number }>;
  type: 'positive' | 'negative';
}

export default function TopEmotionsTable({ emotions, type }: TopEmotionsTableProps) {
  const sortedEmotions = [...emotions]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const colors = {
    positive: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    negative: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  };

  if (sortedEmotions.length === 0) {
    return (
      <Card>
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white capitalize">
          Top 5 {type} Emotions
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No {type} emotions detected yet.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-semibold mb-4 text-gray-900 dark:text-white capitalize">
        Top 5 {type} Emotions
      </h3>
      <div className="space-y-2">
        {sortedEmotions.map((emotion, index) => (
          <div
            key={emotion.name}
            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">#{index + 1}</span>
              <span className="font-medium text-gray-900 dark:text-white">{emotion.name}</span>
            </div>
            <span className={`px-3 py-1 rounded-lg ${colors[type]} font-semibold`}>
              {emotion.value}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Most frequently detected {type} emotions in your journal entries.
      </p>
    </Card>
  );
}

