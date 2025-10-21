import { Router } from 'express';
import JournalLog from '../models/JournalLog.js';
import { requireAuth } from '../middleware/auth.js';
import axios from 'axios';

const router = Router();

router.post('/create', requireAuth, async (req, res, next) => {
  try {
    const { content } = req.body;
    let sentiment = null, emotions = [], keywords = [];
    try {
      const r = await axios.post(process.env.SENTIMENT_URL || 'http://localhost:8001/sentiment', { text: content });
      sentiment = r.data.sentimentLabel || null;
      emotions = r.data.emotions || [];
      keywords = r.data.keywords || [];
    } catch {}
    const entry = await JournalLog.create({ userId: req.userId, content, sentiment, emotions, keywords });
    res.json(entry);
  } catch (e) { next(e); }
});

router.get('/list', requireAuth, async (req, res, next) => {
  try {
    const entries = await JournalLog.find({ userId: req.userId }).sort({ date: -1 }).limit(100);
    res.json(entries);
  } catch (e) { next(e); }
});

export default router;



