export default function(bot){
  bot.on('new_chat_members', msg=>{
    const adder = msg.from?.first_name || 'Someone';
    const added = msg.new_chat_members.map(u=>u.first_name).join(', ');
    const group = msg.chat.title || 'this group';
    bot.sendMessage(msg.chat.id, `${adder} added ${added}, welcome to ${group}!`);
  });
}
