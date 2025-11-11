import { Router } from 'express';
import Habit from '../models/Habit.js';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

// Get all habits for user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (e) {
    next(e);
  }
});

// Create a new habit
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, description, frequency = 'daily', reminderTime, autoAdded = false } = req.body;
    const habit = await Habit.create({
      userId: req.userId,
      name,
      description,
      streak: 0,
      longestStreak: 0,
      completedDates: [],
      frequency,
      reminderTime,
      autoAdded,
    });
    res.json(habit);
  } catch (e) {
    next(e);
  }
});

// Autogenerate habits from onboarding
router.post('/autogenerate', requireAuth, async (req, res, next) => {
  try {
    const onboarding = req.body?.onboarding || (await User.findById(req.userId))?.onboarding || {};

    const habits = [];
    const push = (title, description, reminderTime = '20:00') =>
      habits.push({ name: title, description, frequency: 'daily', reminderTime, autoAdded: true });

    const sleepHours = Number(onboarding.sleepHours || 0);
    const activityLevel = String(onboarding.activityLevel || '').toLowerCase();
    const hobbies = Array.isArray(onboarding.hobbies) ? onboarding.hobbies : [];
    const stressLevel = Number(onboarding.stressLevel || 0);
    const preferredTime = onboarding.preferredTime || '21:00';

    if (sleepHours && sleepHours < 6) push('Wind-down routine', 'No screens 30 min before bed', '22:00');
    if (activityLevel === 'sedentary') push('Short walk', '10-minute walk post-lunch', '16:00');
    if (hobbies.map(h => h.toLowerCase()).includes('reading')) push('Reading', 'Read 20 minutes', '21:00');
    if (stressLevel >= 4) push('Breathing exercise', '5-minute guided breathing', preferredTime);
    // Baseline
    if (habits.length < 3) push('Daily journaling', 'Write for 5 minutes', '20:00');

    // Save
    const created = await Habit.insertMany(habits.map(h => ({ ...h, userId: req.userId })));
    res.json({ habits: created });
  } catch (e) {
    next(e);
  }
});

// Update habit (mark as completed or update details)
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, completed } = req.body;

    const habit = await Habit.findOne({ _id: id, userId: req.userId });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    if (name !== undefined) habit.name = name;
    if (description !== undefined) habit.description = description;

    if (completed !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const completedToday = habit.completedDates.some(
        date => new Date(date).setHours(0, 0, 0, 0) === today.getTime()
      );

      if (completed && !completedToday) {
        habit.completedDates.push(today);
        habit.streak += 1;
        if (habit.streak > habit.longestStreak) {
          habit.longestStreak = habit.streak;
        }
      } else if (!completed && completedToday) {
        habit.completedDates = habit.completedDates.filter(
          date => new Date(date).setHours(0, 0, 0, 0) !== today.getTime()
        );
        // Recalculate streak
        habit.completedDates.sort((a, b) => b - a);
        let currentStreak = 0;
        let expectedDate = new Date();
        expectedDate.setHours(0, 0, 0, 0);
        
        for (const date of habit.completedDates) {
          const dateStr = new Date(date).setHours(0, 0, 0, 0);
          if (dateStr === expectedDate.getTime()) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
          } else {
            break;
          }
        }
        habit.streak = currentStreak;
      }
    }

    await habit.save();
    res.json(habit);
  } catch (e) {
    next(e);
  }
});

// Delete a habit
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findOneAndDelete({ _id: id, userId: req.userId });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json({ message: 'Habit deleted successfully' });
  } catch (e) {
    next(e);
  }
});

export default router;

