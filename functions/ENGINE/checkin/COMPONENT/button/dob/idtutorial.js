module.exports.run = async (interaction) => {
  if (!interaction.member.roles.cache.has(config.teamRole)) return messageFail(interaction, 'Please wait for a staff member to verify you.\nYou can\'t use the buttons.');
  await interaction.deferReply();

  if (interaction.channel.parentId !== config.checkin.categoryID) return messageFail(interaction, 'This channel is not a check-in channel.');

  interaction.channel.send(`Hey, <@${interaction.channel.name}> seems like you are not following the ID verification instructions correctly. Please have another read of <https://discord.com/channels/300051375914483715/496948681656893440/496985167160672267> and try again ^^`);
};

module.exports.data = {
  name: 'ready',
};
