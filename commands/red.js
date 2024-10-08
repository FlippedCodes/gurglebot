module.exports.run = async (interaction) => {
  await interaction.deferReply({ ephemeral: true });
  // only guild command
  if (!await interaction.inGuild()) return messageFail(interaction, 'This command is for servers only.');
  // check if user is owner
  if (interaction.user.id !== '542778181556502540') return messageFail(interaction, 'You don\'t have access to this command! òwó');

  // prepare username, avatar and message
  const contentText = await interaction.options.getString('message', true);
  const username = interaction.member.nickname;
  const avatarURL = interaction.member.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });

  // get webhook and send message
  const channel = interaction.channel;
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
