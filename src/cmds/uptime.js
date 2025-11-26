export default {
  name: "uptime",
  aliases: ["up"],
  description: "Show uptime & RAM usage",
  role: 0,
  usage: "/uptime",
  delay: 1000,
  run(bot,msg,args){
    const uptime = process.uptime();
    const days = Math.floor(uptime/86400);
    const hours = Math.floor((uptime%86400)/3600);
    const mins = Math.floor((uptime%3600)/60);
    const secs = Math.floor(uptime%60);
    const ram = (process.memoryUsage().rss/1024/1024).toFixed(1);
    const out = `Uptime: ${days}d ${hours}h ${mins}m ${secs}s\nRAM: ${ram} MB`;
    bot.sendMessage(msg.chat.id, out);
  }
};
