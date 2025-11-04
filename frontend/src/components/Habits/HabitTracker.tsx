import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface Habit {
  _id: string;
  name: string;
  description?: string;
  streak: number;
  longestStreak: number;
  completedDates: string[];
  createdAt: string;
}

interface HabitTrackerProps {
  habits: Habit[];
  onToggleComplete: (habitId: string, completed: boolean) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitTracker({ habits, onToggleComplete, onDelete }: HabitTrackerProps) {
  const isCompletedToday = (habit: Habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    return habit.completedDates.some((date: string | Date) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const dateTime = new Date(dateObj);
      dateTime.setHours(0, 0, 0, 0);
      return dateTime.getTime() === todayTime;
    });
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {habits.map((habit) => {
        const completed = isCompletedToday(habit);
        return (
          <motion.div
            key={habit._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card hover className="h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {habit.name}
                  </h3>
                  {habit.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {habit.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onDelete(habit._id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Delete habit ${habit.name}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {habit.streak}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Day Streak</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Best: {habit.longestStreak}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Longest Streak</div>
                </div>
              </div>

              <Button
                variant={completed ? 'secondary' : 'primary'}
                className="w-full"
                onClick={() => onToggleComplete(habit._id, !completed)}
              >
                {completed ? '✓ Completed Today' : 'Mark as Complete'}
              </Button>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

