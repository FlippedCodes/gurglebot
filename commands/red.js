module.exports.run = async (interaction) => {
  await interaction.deferReply({ ephemeral: true });
  // only guild command
  if (!await interaction.inGuild()) return messageFail(interaction, 'This command is for servers only.');
  // check if user is owner
  if (interaction.user.id !== '172031697355800577') return messageFail(interaction, 'You don\'t have access to this command! òwó');

  // prepare username, avatar and message
  const contentText = await interaction.channel.send(interaction.options.getString('message', true)).catch(ERR);
  const username = interaction.message.member.nickname;
  const avatarURL = interaction.message.member.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });

  // get webhook and send message
  const channel = interaction.message.channel;
  const channelWebhooks = await channel.fetchWebhooks();
  let hook = channelWebhooks.find((hook) => hook.owner.id === client.user.id);
  if (!hook) hook = await channel.createWebhook({ name: config.name }).catch(ERR);
  hook.send({
    content: `\`\`\`ansi
[2;31m${contentText}[0m
\`\`\``,
    username,
    avatarURL,
  }).catch(ERR);
  reply(interaction, 'Sent!');
};

module.exports.data = new CmdBuilder()
  .setName('red')
  .setDescription('For Shade.')
  .addStringOption((option) => option.setName('message').setDescription('Tell me what to say.').setRequired(true));
