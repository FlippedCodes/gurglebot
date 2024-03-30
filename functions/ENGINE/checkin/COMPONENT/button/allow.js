module.exports.run = async (interaction) => {
  if (!interaction.member.roles.cache.has(config.teamRole)) return messageFail(interaction, 'Please wait for a Staffmember to verify you.\nYou can\'t use the buttons.');
  await interaction.deferUpdate();

  const checkinChannel = interaction.channel;

  const userID = checkinChannel.name;
  const member = await interaction.guild.members.fetch(userID);
  await member.roles.add(config.checkin.checkinRole);
  await member.roles.remove(config.checkin.hideOpenChannels).catch(ERR);

  // post welcome message
  const welcomeChannel = member.guild.channels.cache.get(config.checkin.welcomeChannel);
  welcomeChannel.send(`${member}, you are checked-in now!\nYou can check out some roles in <#669278640667623434>!\nHave a great time on the server! :3`);
  await client.functions.get('ENGINE_checkin_transcriptChannel').run(checkinChannel);
  // delete channel
  await checkinChannel.delete();
};

module.exports.data = {
  name: 'allow',
};
