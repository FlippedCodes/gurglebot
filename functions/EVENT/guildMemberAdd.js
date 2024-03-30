module.exports.run = async (member) => {
  if (member.guild.id !== config.guildId) return;

  // hide open channels that are required by discord role request system
  await member.roles.add(config.checkin.hideOpenChannels);

  // client.functions.get('ENGINE_checkin_oAuthParentServer').run(member);
};

module.exports.data = {
  name: 'guildMemberAdd',
};
