module.exports.run = async (memberOld, memberNew) => {
  const checkedIn = await memberNew.roles.cache.find(({ id }) => id === config.checkin.checkinRole);
  if (!checkedIn) return memberNew.roles.set([config.checkin.hideOpenChannels]);
};

module.exports.data = {
  name: 'guildMemberUpdate',
};
