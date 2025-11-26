import express from 'express';
import { DBClient } from '../../lib/dbClient.js';
import { globalBotManager } from '../../index.js';

const router = express.Router();
const db = new DBClient();

router.post('/create', async (req, res) => {
  try {
    const { token, adminId, prefix } = req.body;
    if (!token || !adminId) return res.status(400).json({ ok: false, error: 'Missing token or adminId' });

    const username = token.split(':')[0] + 'bot';

    await db.insertOrUpdateBot({
      username,
      token,
      adminId,
      prefix: prefix || '/',
      status: 'online'
    });

    if (!globalBotManager.bots.has(username)) {
      await globalBotManager.startBot({ username, token, adminId, prefix: prefix || '/' });
    }

    res.json({ ok: true, message: 'Bot created and started', username });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
