import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import axios from 'axios';

const router = Router();

router.post('/send', requireAuth, async (req, res, next) => {
  try {
    const { message, persona = 'mentor' } = req.body;
    const r = await axios.post(process.env.CHAT_URL || 'http://localhost:8002/chat', { message, persona });
    return res.json(r.data);
  } catch (e) { next(e); }
});

export default router;



