export default {
  name: "help",
  aliases: ["h"],
  description: "Show commands list or details",
  role: 0,
  usage: "/help [command]",
  delay: 1000,
  async run(bot,msg,args){
    const cmds = ['help','uptime','bot','logout'];
    if (args[0]) {
      const name = args[0];
      // minimal detail
      return bot.sendMessage(msg.chat.id, `Command: ${name} - no extra metadata here.`);
    }
    return bot.sendMessage(msg.chat.id, 'Commands: ' + cmds.join(', '));
  }
};
