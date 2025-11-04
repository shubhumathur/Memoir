import React from 'react';
import { clsx } from 'clsx';

const MOODS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '😡', label: 'Angry', value: 'angry' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '🤔', label: 'Thoughtful', value: 'thoughtful' },
  { emoji: '😎', label: 'Confident', value: 'confident' },
];

interface MoodSelectorProps {
  selectedMoods: string[];
  onMoodToggle: (mood: string) => void;
}

export default function MoodSelector({ selectedMoods, onMoodToggle }: MoodSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">How are you feeling?</label>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => onMoodToggle(mood.value)}
            className={clsx(
              'px-4 py-2 rounded-xl border-2 transition-all duration-200 flex items-center gap-2',
              selectedMoods.includes(mood.value)
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 scale-105'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
            aria-label={`Select ${mood.label} mood`}
            aria-pressed={selectedMoods.includes(mood.value)}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-sm font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

