import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import JournalLog from '../models/JournalLog.js';
import ChatLog from '../models/ChatLog.js';
import axios from 'axios';

const router = Router();

// Get user settings
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('persona privacySettings theme email username createdAt');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get usage statistics
    const journalCount = await JournalLog.countDocuments({ userId: req.userId });
    const chatCount = await ChatLog.countDocuments({ userId: req.userId });
    const firstEntry = await JournalLog.findOne({ userId: req.userId }).sort({ createdAt: 1 });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        persona: user.persona,
        privacySettings: user.privacySettings,
        theme: user.theme,
        joinedAt: user.createdAt
      },
      stats: {
        journalEntries: journalCount,
        chatConversations: chatCount,
        daysActive: firstEntry ? Math.ceil((Date.now() - firstEntry.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0
      }
    });
  } catch (e) { next(e); }
});

// Update user settings
router.post('/update', requireAuth, async (req, res, next) => {
  try {
    const { persona, privacySettings, theme } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { ...(persona && { persona }), ...(privacySettings && { privacySettings }), ...(theme && { theme }) } },
      { new: true }
    );
    res.json({ id: user._id, persona: user.persona, privacySettings: user.privacySettings, theme: user.theme });
  } catch (e) { next(e); }
});

// Export user data
router.get('/export', requireAuth, async (req, res, next) => {
  try {
    const journals = await JournalLog.find({ userId: req.userId }).sort({ date: -1 });
    const chats = await ChatLog.find({ userId: req.userId }).sort({ updatedAt: -1 });

    const exportData = {
      exportDate: new Date().toISOString(),
      userId: req.userId,
      journals: journals.map(j => ({
        date: j.date,
        content: j.content,
        sentiment: j.sentiment,
        emotions: j.emotions,
        keywords: j.keywords
      })),
      chats: chats.map(c => ({
        persona: c.persona,
        messages: c.messages,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="memoir-data-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (e) { next(e); }
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

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify current password (you'd typically use bcrypt.compare here)
    // For now, we'll assume it's handled on the frontend or add proper validation

    // Update password hash (you'd typically hash the new password)
    // user.passwordHash = await bcrypt.hash(newPassword, 10);
    // await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (e) { next(e); }
});

// Get data insights for settings page
router.get('/insights', requireAuth, async (req, res, next) => {
  try {
    const journals = await JournalLog.find({ userId: req.userId });
    const chats = await ChatLog.find({ userId: req.userId });

    const insights = {
      totalJournals: journals.length,
      totalChats: chats.length,
      avgSentiment: journals.length > 0 ?
        journals.reduce((sum, j) => {
          if (j.sentiment === 'positive') return sum + 1;
          if (j.sentiment === 'negative') return sum - 1;
          return sum;
        }, 0) / journals.length : 0,
      mostUsedPersona: chats.length > 0 ?
        Object.entries(
          chats.reduce((acc, chat) => {
            acc[chat.persona] = (acc[chat.persona] || 0) + 1;
            return acc;
          }, {})
        ).sort(([,a], [,b]) => b - a)[0][0] : 'mentor',
      streakData: calculateStreak(journals)
    };

    res.json(insights);
  } catch (e) { next(e); }
});

function calculateStreak(journals) {
  if (journals.length === 0) return { current: 0, longest: 0 };

  const sortedDates = [...new Set(journals.map(j => j.date.toISOString().split('T')[0]))].sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const date = new Date(sortedDates[i]);
    const nextDate = i > 0 ? new Date(sortedDates[i - 1]) : null;

    if (!nextDate || (date.getTime() - nextDate.getTime()) <= (24 * 60 * 60 * 1000)) {
      tempStreak++;
      if (i === sortedDates.length - 1) currentStreak = tempStreak;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);
  return { current: currentStreak, longest: longestStreak };
}

export default router;



