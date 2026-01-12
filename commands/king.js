const moment = require('moment');

let timeout = moment();

module.exports.run = async (interaction) => {
  // check channel
  if (interaction.channel.id !== config.kingOfTheHill.whitelistChannelID) return messageFail(interaction, 'You can\'t run this command here, find the right channel to run this in :3');
  // get role
  const role = await interaction.guild.roles.fetch(config.kingOfTheHill.roleID);
  // get role members and check if there are any members
  const roleMembers = Array.from(role.members.values());
  if (roleMembers[0]) {
    // check if user is already king
    if (roleMembers[0].id === interaction.member.id) return messageFail(interaction, 'You can\'t dethrone yourself!');
  }
  // check timer and reset it
  if (!timeout.isBefore(moment())) return messageFail(interaction, 'It\'s too early to dethrone the new king. Please try again later.');
  const { min, max } = config.kingOfTheHill.timeout;
  const rog = Math.floor(Math.random() * (max - min + 1) + min);
  timeout = moment().add(rog, 'ms');
  // get user from role and remove them
  // TODO: uncomment when event is done
  if (roleMembers[0]) {
    await roleMembers[0].roles.remove(role);
  }
  // give the role to the new king
  await interaction.member.roles.add(role);
  // output to user and log
  messageSuccess(interaction, 'You are now the new king of the hill! Enjoy while it lasts...');
  interaction.guild.channels.cache.get(config.kingOfTheHill.logChannelID).send(`${interaction.member.id}`);
};

module.exports.data = new CmdBuilder()
  .setName('king')
  .setDescription('Claim your crown for king of the hill.');
