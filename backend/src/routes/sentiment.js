import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import axios from 'axios';

const router = Router();

router.post('/analyze', requireAuth, async (req, res, next) => {
  try {
    const { text } = req.body;
    try {
      const r = await axios.post(process.env.SENTIMENT_URL || 'http://localhost:8001/sentiment', { text });
      return res.json(r.data);
    } catch {}
    // fallback
    const label = Math.random() > 0.5 ? 'Positive' : 'Neutral';
    return res.json({ sentimentLabel: label, emotions: ['Calm'], keywords: ['demo'] });
  } catch (e) { next(e); }
});

export default router;



