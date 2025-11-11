import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import axios from 'axios';
import ChatLog from '../models/ChatLog.js';
import User from '../models/User.js';
import JournalLog from '../models/JournalLog.js';

const router = Router();

function craftSupportiveReply({ message, persona, onboarding }) {
  const text = String(message || '').toLowerCase();
  const suggestions = [];

  if (text.includes('deadline') || text.includes('workload') || text.includes('exam') || text.includes('assign')) {
    suggestions.push('Block your next 25 minutes for one focused task (Pomodoro).');
    suggestions.push('Write a quick 3-item priority list and defer the rest.');
  }
  if (text.includes('anx') || text.includes('panic') || text.includes('overwhelm') || (onboarding?.stressLevel >= 4)) {
    suggestions.push('Try 4-7-8 breathing for 2 minutes to settle your body.');
  }
  if (onboarding?.sleepHours && onboarding.sleepHours < 6) {
    suggestions.push('Create a 30‑min wind‑down (no screens) before bed tonight.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Take a brief pause: 5 slow breaths while relaxing your shoulders.');
    suggestions.push('Note one small next step you can do in under 10 minutes.');
  }

  const followUps = [
    'What would make the next hour feel a little easier?',
    'Which small step feels doable right now?',
    'Where would you like support first—energy, focus, or emotions?',
  ];
  const followUp = followUps[Math.floor(Math.random() * followUps.length)];

  const openings = {
    mentor: `I hear how this is weighing on you. It makes sense to feel this way.`,
    coach: `You’ve already taken a strong first step by naming it.`,
    psychologist: `It’s valid to feel this—thank you for sharing it with me.`,
  };

  return `${openings[persona] || openings.mentor} Here are two gentle ideas you can try now: 1) ${suggestions[0]} 2) ${suggestions[1]}. ${followUp}`.slice(0, 600);
}

function looksGeneric(reply = '') {
  const r = reply.toLowerCase();
  const genericPhrases = [
    'emotions can be complex',
    'can you help me understand what\'s coming up',
    'tell me more',
    'i\'m here to listen',
  ];
  return r.length < 60 || genericPhrases.some(p => r.includes(p));
}

router.post('/send', requireAuth, async (req, res, next) => {
  try {
    const { message, persona = 'mentor' } = req.body;
    const userId = req.userId;

    let chatLog = await ChatLog.findOne({ userId, persona });
    if (!chatLog) {
      chatLog = await ChatLog.create({ userId, persona, messages: [] });
    }

    chatLog.messages.push({ role: 'user', text: message });
    await chatLog.save();

    let reply = '';

    const [user, recentJournals] = await Promise.all([
      User.findById(userId).select('onboarding username persona'),
      JournalLog.find({ userId }).sort({ date: -1 }).limit(3)
    ]);

    const onboarding = user?.onboarding || {};
    const journalsSnippet = recentJournals.map(j => `- ${new Date(j.date).toLocaleDateString()}: ${String(j.content).slice(0, 140)}`).join('\n');

    const contextPrefix = `System: You are an empathetic ${persona}. Always 1) validate feelings, 2) offer two practical suggestions to try right now, 3) ask one brief follow-up question, 4) keep under 120 words, 5) avoid repeating the same sentence.\nUser profile: sleepHours=${onboarding.sleepHours || 'n/a'}, activity=${onboarding.activityLevel || 'n/a'}, stress=${onboarding.stressLevel || 'n/a'}, moodAvg=${onboarding.moodAvg || 'n/a'}\nRecent journals:\n${journalsSnippet || 'No recent entries'}\nHuman: ${message}\nAssistant:`;

    try {
      const r = await axios.post(
        process.env.CHAT_URL || 'http://localhost:8002/chat',
        { message: contextPrefix, persona, history: chatLog.messages },
        { timeout: 8000 }
      );
      reply = r.data?.reply || '';
    } catch (err) {
      reply = '';
    }

    // Rule-based enhancement if LLM reply is low-quality or missing
    if (!reply || looksGeneric(reply)) {
      reply = craftSupportiveReply({ message, persona, onboarding });
    }

    chatLog.messages.push({ role: 'assistant', text: reply });
    await chatLog.save();

    return res.json({ reply });
  } catch (e) { next(e); }
});

router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const { persona = 'mentor' } = req.query;
    const chatLog = await ChatLog.findOne({ userId: req.userId, persona });
    if (!chatLog) {
      return res.json({ messages: [] });
    }
    res.json({ messages: chatLog.messages });
  } catch (e) { next(e); }
});

export default router;



