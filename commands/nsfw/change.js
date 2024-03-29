const userDoB = require('../../database/models/UserDoB');

function sendMessage(EmbedBuilder, interaction, userTag, userID, age, DoB, allow, teammemberTag) {
  // needs to be local as settings overlap from different embed-requests
  const embed = new EmbedBuilder();

  let color = 16741376;
  if (allow) color = 4296754;

  embed
    .setColor(color)
    .setDescription(`${userTag} got updated in the DB!`)
    .addFields([
      { name: 'ID', value: userID, inline: true },
      { name: 'Age', value: String(age), inline: true },
      { name: 'DoB', value: DoB, inline: true },
      { name: 'Allow', value: prettyCheck(allow), inline: true },
      { name: 'Created by', value: teammemberTag, inline: true },
    ]);

  const content = { embeds: [embed] };
  // send feedback
  reply(interaction, content);
  // send in log
  interaction.guild.channels.cache.find(({ id }) => id === config.DoBchecking.logChannelID).send(content);
}

async function updateUser(ID, DoB, allow, teammemberID) {
  if (!await userDoB.findOne({ where: { ID } }).catch(ERR)) return false;
  await userDoB.update({ DoB, allow, teammemberID }, { where: { ID } }).catch(ERR);
  return true;
}

function getAge(moment, DoB) {
  const age = moment().diff(DoB, 'years');
  return age;
}

module.exports.run = async (interaction, moment, EmbedBuilder) => {
  const command = interaction.options;
  // get user and ID
  const user = command.getUser('user', true);
  const userID = user.id;
  // get date
  const date = moment(command.getString('date', true), config.DoBchecking.dateFormats, false);
  // validate date
  if (!date.isValid()) return messageFail(interaction, 'Your provided DoB is not a date!');
  // get allow
  const age = getAge(moment, date);
  const allow = false;
  // format date
  const formatDate = date.format(config.DoBchecking.dateFormats[0]);
  // add entry
  const added = await updateUser(userID, formatDate, allow, interaction.user.id);
  // report to user if entry added
  if (added) {
    // send log and user confirmation
    sendMessage(EmbedBuilder, interaction, user.tag, userID, age, formatDate, allow, interaction.user.tag);
  } else {
    messageFail(interaction, 'Entry doesn\'t exist yet. Use the add command to add it first.');
  }
};

module.exports.data = { subcommand: true };
