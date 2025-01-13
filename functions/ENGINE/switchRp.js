const { EmbedBuilder } = require('discord.js');

const stickyMessageBody = 'You can only send every third message. Please, keep it a two-person RP. (Otherwise, this idea doesn\'t work.)';

module.exports.run = async (message) => {
  // get last message count for sending user.
  const last3Messages = await message.channel.messages.fetch({ limit: 4 });
  const msgCount = last3Messages.filter((msgFilt) => message.author.id === msgFilt.author.id).size;
  if (msgCount >= 2) return message.delete();

  // identify sticky message
  const oldStickyMsg = last3Messages.find((msgFind) => msgFind.author.id === client.user.id && msgFind.embeds[0].data.description === stickyMessageBody);
  if (oldStickyMsg) await oldStickyMsg.delete();

  // post new stick message
  const embed = new EmbedBuilder()
    .setDescription(stickyMessageBody)
    .setFooter({ text: 'Excess messages will be deleted without warning.' });
  return message.channel.send({ embeds: [embed] });
};

module.exports.help = {
  name: 'switchRp',
};
