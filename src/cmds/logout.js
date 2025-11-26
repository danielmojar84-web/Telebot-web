import { DBClient } from '../lib/dbClient.js';
const db = new DBClient();

export default {
  name: 'logout',
  aliases: [],
  role: 3,
  usage: '/logout @username',
  delay: 2000,
  async run(bot, msg, args) {
    const username = args[0]?.replace('@', '');
    if (!username) return bot.sendMessage(msg.chat.id, 'Usage: /logout @username');

    try {
      if (global.botManager?.bots?.has(username)) {
        const { bot: userBot } = global.botManager.bots.get(username);
        userBot.stopPolling();
        global.botManager.bots.delete(username);
      }

      await db.deleteBot(username);
      bot.sendMessage(msg.chat.id, `Logged out ${username}`);
    } catch (e) {
      bot.sendMessage(msg.chat.id, 'Error: ' + e.message);
    }
  }
};
