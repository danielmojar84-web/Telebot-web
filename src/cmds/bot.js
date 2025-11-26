import { DBClient } from '../lib/dbClient.js';
const db = new DBClient();

export default {
  name: 'bot',
  aliases: [],
  role: 0,
  usage: '/bot list | /bot create <token> <adminId> <prefix>',
  delay: 2000,
  async run(bot, msg, args) {
    const sub = args[0];

    if (sub === 'list') {
      const bots = await db.listBots();
      if (bots.length === 0) return bot.sendMessage(msg.chat.id, 'No bots running.');
      let out = 'Running bots:\n';
      bots.forEach(b => {
        out += `• ${b.username} admin:${b.adminid} prefix:${b.prefix}\n`;
      });
      bot.sendMessage(msg.chat.id, out);

    } else if (sub === 'create') {
      const token = args[1];
      const adminId = args[2];
      const prefix = args[3] || '/';
      if (!token || !adminId) return bot.sendMessage(msg.chat.id, 'Usage: /bot create <token> <adminId> <prefix>');

      const username = token.split(':')[0] + 'bot';

      await db.insertOrUpdateBot({
        username,
        token,
        adminId,
        prefix,
        status: 'online'
      });

      bot.sendMessage(msg.chat.id, `Bot created: ${username}`);
    } else {
      bot.sendMessage(msg.chat.id, 'Invalid subcommand. Usage: /bot list | /bot create <token> <adminId> <prefix>');
    }
  }
};
