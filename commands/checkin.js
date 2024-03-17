module.exports.run = async (interaction) => {
  await interaction.deferReply();

  // // check if user is teammember
  // DISABLED: No need to check who asks for it
  // if (!interaction.member.roles.cache.find(({ id }) => id === config.teamRole)) return messageFail(interaction, 'You don\'t have access to this command! òwó');

  if (interaction.channel.parentId !== config.checkin.categoryID) return messageFail(interaction, 'This channel is not a check-in channel.');
  await client.functions.get('ENGINE_checkin_postReaction').run(interaction);
};

module.exports.data = new CmdBuilder()
  .setName('checkin')
  .setDescription('Shows the check-in menu without pinging team.');
