import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { DBClient } from './lib/dbClient.js';
import { BotManager, globalBotManager } from './lib/botManager.js';

// Load config.json safely for Node 22 without assert
const config = JSON.parse(fs.readFileSync(path.resolve('./config.json')));

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('web'));

const db = new DBClient();
const manager = globalBotManager; // BotManager instance exported from lib/botManager.js

// Start all bots from PostgreSQL on server launch
async function ensureStarted() {
  try {
    await manager.startAll();
  } catch(e) {
    console.error('startAll failed', e.message);
  }
}
ensureStarted();

// API: create bot (store in PostgreSQL and start)
app.post('/api/bot/create', async (req, res) => {
  try {
    const { token, adminId, prefix } = req.body;
    if (!token || !adminId) return res.status(400).json({ error:'token and adminId required' });

    const username = token.split(':')[0] + 'bot';
    const meta = { username, token, adminId: String(adminId), prefix: prefix || '/', status: 'online' };

    await db.insertOrUpdateBot(meta);

    if (!manager.bots.has(username)) {
      await manager.startBot(meta);
    }

    return res.json({ ok: true, saved: meta });
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// API: list bots
app.get('/api/bot/list', async (req, res) => {
  try {
    const list = await db.listBots();
    const running = manager.listRunning();
    return res.json({ db: list, running });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
});

// API: logout bot by username
app.post('/api/bot/logout', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'username required' });

    await db.deleteBot(username);
    await manager.stopBot(username);

    return res.json({ ok: true });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
});

const port = config.port || 3000;
app.listen(port, () => console.log('Server running on port', port));
      
