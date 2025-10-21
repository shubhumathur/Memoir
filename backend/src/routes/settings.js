import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

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

export default router;



