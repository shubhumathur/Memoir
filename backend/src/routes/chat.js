import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import axios from 'axios';
import ChatLog from '../models/ChatLog.js';

const router = Router();

router.post('/send', requireAuth, async (req, res, next) => {
  try {
    const { message, persona = 'mentor' } = req.body;
    const userId = req.userId;

    // Find or create chat log for user and persona
    let chatLog = await ChatLog.findOne({ userId, persona });
    if (!chatLog) {
      chatLog = await ChatLog.create({ userId, persona, messages: [] });
    }

    // Add user message
    chatLog.messages.push({ role: 'user', text: message });
    await chatLog.save();

    // Get AI response
    const r = await axios.post(process.env.CHAT_URL || 'http://localhost:8002/chat', { message, persona, history: chatLog.messages });
    const reply = r.data.reply;

    // Add assistant message
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



