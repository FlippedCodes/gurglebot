module.exports.run = async (interaction) => {
  await interaction.deferReply({ ephemeral: true });
  // only guild command
  if (!await interaction.inGuild()) return messageFail(interaction, 'This command is for servers only.');
  // check if user is owner
  if (!interaction.member.roles.cache.find(({ id }) => id === '542778181556502540')) return messageFail(interaction, 'You don\'t have access to this command! òwó');

  // prepare username, avatar and message
  const content = await interaction.channel.send(interaction.options.getString('message', true)).catch(ERR);
  const username = message.member.nickname || message.author.username;
  const avatarURL = message.member.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });

  // get webhook and send message
  const channel = message.channel;
  const channelWebhooks = await channel.fetchWebhooks();
  let hook = channelWebhooks.find((hook) => hook.owner.id === client.user.id);
  if (!hook) hook = await channel.createWebhook({ name: config.name }).catch(ERR);
  hook.send({
    content, username, avatarURL,
  }).catch(ERR);
};

module.exports.data = new CmdBuilder()
  .setName('red')
  .setDescription('For Shade.')
  .addStringOption((option) => option.setName('message').setDescription('Tell me what to say.').setRequired(true));
