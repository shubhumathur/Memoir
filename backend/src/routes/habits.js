import { Router } from 'express';
import Habit from '../models/Habit.js';
import { requireAuth } from '../middleware/auth.js';

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
    const { name, description } = req.body;
    const habit = await Habit.create({
      userId: req.userId,
      name,
      description,
    });
    res.json(habit);
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

