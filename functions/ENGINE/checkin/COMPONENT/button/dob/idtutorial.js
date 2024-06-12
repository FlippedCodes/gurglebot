module.exports.run = async (interaction) => {
  if (!interaction.member.roles.cache.has(config.teamRole)) return messageFail(interaction, 'Please wait for a staff member to verify you.\nYou can\'t use the buttons.');
  if (interaction.channel.parentId !== config.checkin.categoryID) return messageFail(interaction, 'This channel is not a check-in channel.');

  // remvove user reaction
  const channel = await interaction.guild.channels.cache.get(config.checkin.reaction.channel);
  const message = await channel.messages.fetch(config.checkin.reaction.message);
  const content = `# ${message.content.split('# ')[2]}`;

  interaction.channel.send(content);
  messageSuccess(interaction, 'Instructions sent.', undefined, true);
};

module.exports.data = {
  name: 'idtutorial',
};
