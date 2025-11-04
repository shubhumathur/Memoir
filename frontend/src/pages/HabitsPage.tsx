import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import HabitTracker from '../components/Habits/HabitTracker';
import Skeleton from '../components/ui/Skeleton';
import { motion } from 'framer-motion';

interface Habit {
  _id: string;
  name: string;
  description?: string;
  streak: number;
  longestStreak: number;
  completedDates: string[];
  createdAt: string;
}

export default function HabitsPage() {
  const { token } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (token) {
      fetchHabits();
    }
  }, [token]);

  const fetchHabits = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get('/habits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(res.data || []);
    } catch (e: any) {
      console.error('Failed to fetch habits', e);
      // If endpoint doesn't exist yet, show empty state
      if (e.response?.status === 404) {
        setHabits([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    setSaving(true);
    try {
      await axios.post(
        '/habits',
        { name: newHabitName, description: newHabitDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewHabitName('');
      setNewHabitDescription('');
      setShowAddModal(false);
      fetchHabits();
    } catch (e) {
      console.error('Failed to create habit', e);
      alert('Failed to create habit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (habitId: string, completed: boolean) => {
    try {
      await axios.patch(
        `/habits/${habitId}`,
        { completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchHabits();
    } catch (e) {
      console.error('Failed to update habit', e);
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    try {
      await axios.delete(`/habits/${habitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHabits();
    } catch (e) {
      console.error('Failed to delete habit', e);
    }
  };

  return (
    <PageContainer maxWidth="7xl">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Habit Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Build healthy habits and track your progress
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>+ Add Habit</Button>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="rectangular" height={100} className="mt-4" />
              </Card>
            ))}
          </div>
        ) : habits.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                No habits yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building healthy habits by adding your first one.
              </p>
              <Button onClick={() => setShowAddModal(true)}>Add Your First Habit</Button>
            </div>
          </Card>
        ) : (
          <HabitTracker
            habits={habits}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewHabitName('');
          setNewHabitDescription('');
        }}
        title="Add New Habit"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Habit Name *
            </label>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g., Morning Meditation"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={newHabitDescription}
              onChange={(e) => setNewHabitDescription(e.target.value)}
              placeholder="Add a brief description..."
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHabit} isLoading={saving} disabled={!newHabitName.trim()}>
              Add Habit
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}

