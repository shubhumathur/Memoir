import { Router } from 'express';
import User from '../models/User.js';
import JournalLog from '../models/JournalLog.js';
import ChatLog from '../models/ChatLog.js';
import Habit from '../models/Habit.js';
import { requireAuth } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const router = Router();

// Get user settings
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

// Update user settings
router.post('/update', requireAuth, async (req, res, next) => {
  try {
    const { persona, privacySettings, theme } = req.body;
    const updateData = {};
    if (persona) updateData.persona = persona;
    if (privacySettings) updateData.privacySettings = privacySettings;
    if (theme) updateData.theme = theme;

    const user = await User.findByIdAndUpdate(req.userId, { $set: updateData }, { new: true }).select('-passwordHash');
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

// Get user insights/stats
router.get('/insights', requireAuth, async (req, res, next) => {
  try {
    const journalCount = await JournalLog.countDocuments({ userId: req.userId });
    const chatCount = await ChatLog.countDocuments({ userId: req.userId });
    const habitCount = await Habit.countDocuments({ userId: req.userId });

    const recentEntries = await JournalLog.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      journalCount,
      chatCount,
      habitCount,
      recentEntries,
    });
  } catch (e) {
    next(e);
  }
});

// Export user data
router.get('/export', requireAuth, async (req, res, next) => {
  try {
    const journals = await JournalLog.find({ userId: req.userId });
    const chats = await ChatLog.find({ userId: req.userId });
    const habits = await Habit.find({ userId: req.userId });
    const user = await User.findById(req.userId).select('-passwordHash');

    const exportData = {
      user,
      journals,
      chats,
      habits,
      exportedAt: new Date().toISOString(),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="memoir-data-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (e) {
    next(e);
  }
});

// Load demo data
router.post('/load-demo', requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId;

    // Add demo journal entries
    const demoEntries = [
      {
        userId,
        date: new Date(),
        content: 'Felt calm after a long walk. Coffee with a friend lifted my mood. The weather was perfect today.',
        sentiment: 'Positive',
        emotions: ['Joy', 'Calm'],
        keywords: ['calm', 'walk', 'coffee', 'friend', 'mood', 'weather'],
        mood: 'happy',
        tags: ['friends', 'outdoor'],
      },
      {
        userId,
        date: new Date(Date.now() - 86400000),
        content: 'Anxious about looming deadline at work but completed key tasks. Feeling more in control now.',
        sentiment: 'Neutral',
        emotions: ['Anxiety', 'Relief'],
        keywords: ['anxious', 'deadline', 'work', 'tasks', 'control'],
        mood: 'anxious',
        tags: ['work', 'stress'],
      },
      {
        userId,
        date: new Date(Date.now() - 2 * 86400000),
        content: 'Tired, but journaling helped me process my day. Grateful for small moments of peace.',
        sentiment: 'Positive',
        emotions: ['Calm', 'Gratitude'],
        keywords: ['tired', 'journaling', 'process', 'grateful', 'peace'],
        mood: 'calm',
        tags: ['gratitude', 'self-care'],
      },
      {
        userId,
        date: new Date(Date.now() - 3 * 86400000),
        content: 'Had a productive day. Finished a project I\'ve been working on. Feeling accomplished!',
        sentiment: 'Positive',
        emotions: ['Joy', 'Pride'],
        keywords: ['productive', 'project', 'accomplished'],
        mood: 'confident',
        tags: ['achievement', 'work'],
      },
      {
        userId,
        date: new Date(Date.now() - 4 * 86400000),
        content: 'Struggled with focus today. Took breaks and managed to get through the day.',
        sentiment: 'Neutral',
        emotions: ['Tired'],
        keywords: ['struggled', 'focus', 'breaks'],
        mood: 'tired',
        tags: ['challenge'],
      },
    ];

    await JournalLog.insertMany(demoEntries);

    // Add demo habits
    const demoHabits = [
      {
        userId,
        name: 'Morning Meditation',
        description: '10 minutes of mindfulness meditation',
        streak: 5,
        longestStreak: 7,
        completedDates: [
          new Date(),
          new Date(Date.now() - 86400000),
          new Date(Date.now() - 2 * 86400000),
          new Date(Date.now() - 3 * 86400000),
          new Date(Date.now() - 4 * 86400000),
        ],
      },
      {
        userId,
        name: 'Daily Journaling',
        description: 'Write at least one journal entry per day',
        streak: 3,
        longestStreak: 10,
        completedDates: [
          new Date(),
          new Date(Date.now() - 86400000),
          new Date(Date.now() - 2 * 86400000),
        ],
      },
      {
        userId,
        name: 'Evening Walk',
        description: '30-minute walk in the evening',
        streak: 2,
        longestStreak: 5,
        completedDates: [
          new Date(),
          new Date(Date.now() - 86400000),
        ],
      },
    ];

    await Habit.insertMany(demoHabits);

    res.json({ message: 'Demo data loaded successfully', entries: demoEntries.length, habits: demoHabits.length });
  } catch (e) {
    next(e);
  }
});

// Delete all user data
router.delete('/data', requireAuth, async (req, res, next) => {
  try {
    const { confirmDelete } = req.body;
    if (confirmDelete !== 'DELETE_ALL_DATA') {
      return res.status(400).json({ error: 'Confirmation required. Please type "DELETE_ALL_DATA" to confirm.' });
    }

    // Delete all user data
    await JournalLog.deleteMany({ userId: req.userId });
    await ChatLog.deleteMany({ userId: req.userId });
    await Habit.deleteMany({ userId: req.userId });

    // Reset user settings to defaults
    await User.findByIdAndUpdate(req.userId, {
      $set: {
        persona: 'mentor',
        privacySettings: { localOnly: false },
        theme: 'light'
      }
    });

    res.json({ message: 'All user data has been deleted successfully.' });
  } catch (e) { next(e); }
});

// Change password
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.userId, { passwordHash: newPasswordHash });

    res.json({ message: 'Password changed successfully' });
  } catch (e) {
    next(e);
  }
});

export default router;
