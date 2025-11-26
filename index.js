import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import config from './config.json' assert { type: 'json' };
import { AnythingClient } from './lib/anythingClient.js';
import { BotManager } from './lib/botManager.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('web'));

const anything = new AnythingClient(config.anything || {});
const manager = new BotManager({anythingClient: anything, config});

async function ensureStarted() {
  try {
    await manager.startAllFromDB();
  } catch(e) {
    console.error('startAllFromDB failed', e.message);
  }
}
ensureStarted();

// API: create bot (store in Anything and start)
app.post('/api/bot/create', async (req, res) => {
  try {
    const { token, admin_id, prefix } = req.body;
    if (!token || !admin_id) return res.status(400).json({error:'token and admin_id required'});
    const meta = {
      token, admin_id: String(admin_id), prefix: prefix || '/',
      created_at: new Date().toISOString()
    };
    const saved = await anything.insertBot(meta);
    // Try to start immediately
    await manager.startBotInstance(saved);
    return res.json({ok:true, saved});
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// API: list bots
app.get('/api/bot/list', async (req, res) => {
  try {
    const list = await anything.listBots();
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
    // delete from db
    await anything.deleteBotByUsername(username);
    // stop running
    await manager.stopBotByUsername(username);
    return res.json({ ok: true });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
});

const port = config.port || 3000;
app.listen(port, ()=>console.log('Server running on port', port));
