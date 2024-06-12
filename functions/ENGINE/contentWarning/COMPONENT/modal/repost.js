const { AttachmentBuilder } = require('discord.js');

module.exports.run = async (interaction) => {
  // get modal field id and user provided CW text
  const customID = interaction.components[0].components[0].customId;
  const userCW = interaction.fields.getTextInputValue(customID);

  // get message
  const IDregEx = /[0-9]/g;
  const messageID = customID.match(IDregEx).join('');
  const message = await interaction.channel.messages.fetch(messageID);

  // get all urls in content
  const urlRegEx = /http[s]?:\/\/(www\.)?(.*)?\/?(.)*/gm;
  const urlMatch = message.content.match(urlRegEx);

  // prepare message with spoiler
  const content = `**Content Warning: \`${userCW}\`**\n${urlMatch ? `||${message.content} ||` : message.content}`;

  // prepare username and avatar
  const username = message.member.nickname || message.author.username;
  const avatarURL = message.member.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });

  // prepare files with spoiler
  const files = message.attachments.map((file) => new AttachmentBuilder(file.url).setName(file.name).setSpoiler(true));

  // get webhook and send message
  const channel = message.channel;
  const channelWebhooks = await channel.fetchWebhooks();
  let hook = channelWebhooks.find((hook) => hook.owner.id === client.user.id);
  if (!hook) hook = await channel.createWebhook({ name: config.name }).catch(ERR);
  hook.send({
    content, username, avatarURL, files,
  }).catch(ERR);

  interaction.message.delete();
  message.delete();
};

module.exports.data = {
  name: 'dobAdd',
};
