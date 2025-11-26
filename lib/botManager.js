import TelegramBot from 'node-telegram-bot-api';
import { DBClient } from './dbClient.js';

export class BotManager {
  constructor() {
    this.db = new DBClient();
    this.bots = new Map();
  }

  async startAll() {
    try {
      const list = await this.db.listBots();
      for (const row of list) {
        const { username, token, adminId, prefix } = row;
        if (this.bots.has(username)) continue;
        await this.startBot({ username, token, adminId, prefix });
      }
    } catch(e){ console.error(e); }
  }

  async startBot(meta) {
    const bot = new TelegramBot(meta.token, { polling:true });

    bot.on('new_chat_members', msg => {
      const adder = msg.from?.first_name || 'Someone';
      const added = msg.new_chat_members.map(u=>u.first_name).join(', ');
      const group = msg.chat.title || 'this group';
      bot.sendMessage(msg.chat.id, `${adder} added ${added}, welcome to ${group}!`);
    });

    this.bots.set(meta.username, { bot, meta });

    await this.db.insertOrUpdateBot({
      username: meta.username,
      token: meta.token,
      adminId: meta.adminId,
      prefix: meta.prefix || '/',
      status: 'online'
    });

    console.log('Started', meta.username);
    return { bot, meta };
  }

  async stopBot(username) {
    if (!this.bots.has(username)) return;
    const { bot } = this.bots.get(username);
    try { bot.stopPolling(); } catch(e){}
    this.bots.delete(username);
    await this.db.deleteBot(username);
  }

  listRunning() { return Array.from(this.bots.values()).map(v=>v.meta); }
}
