const userDoB = require('../../database/models/UserDoB');

function sendMessage(EmbedBuilder, interaction, userTag, userID, allow, teammemberTag, serverName) {
  // needs to be local as settings overlap from different embed-requests
  const embed = new EmbedBuilder();

  let color = 16741376;
  if (allow) color = 4296754;

  embed
    .setColor(color)
    .setDescription(`${userTag} got added to the DB!`)
    .addFields([
      { name: 'ID', value: userID, inline: true },
      { name: 'Allow', value: prettyCheck(allow), inline: true },
      { name: 'Created by', value: teammemberTag, inline: true },
      { name: 'Created on', value: serverName, inline: true },
    ]);

  const content = { embeds: [embed] };
  // send feedback
  reply(interaction, content);
  // send in log
  interaction.guild.channels.cache.find(({ id }) => id === config.DoBchecking.logChannelID).send(content);
}

const postFail = (interaction, user) => messageFail(interaction, `\`${user.id}\` (\`${user.tag}\`) doesn't exist in the DB.`);

async function changeUser(ID, allow) {
  if (await !userDoB.findOne({ where: { ID } }).catch(ERR)) return false;
  await userDoB.update({ allow }, { where: { ID } }).catch(ERR);
  return true;
}

async function searchUser(ID) {
  const result = await userDoB.findOne({ where: { ID } }).catch(ERR);
  return result;
}

module.exports.run = async (interaction, moment, EmbedBuilder) => {
  const command = interaction.options;
  // get user and ID
  const user = command.getUser('user', true);
  const userID = user.id;
  // get allow state
  const allow = command.getBoolean('allow', true);
  // change allow
  const changed = await changeUser(userID, allow);
  // check if entry existed
  if (!changed) return postFail(interaction, user);
  // search entry
  const DBentry = await searchUser(userID);
  if (!DBentry) return postFail(interaction, user);
  // get teamember and servername tag
  const teammember = client.users.fetch(DBentry.teammemberID);
  const teammemberTag = teammember ? teammember.tag : 'Unknown';
  const server = client.guilds.cache.find(({ id }) => id === DBentry.serverID);
  const serverName = server ? server.name : 'Unknown';
  // send log and user confirmation
  sendMessage(EmbedBuilder, interaction, user.tag, userID, DBentry.allow, teammemberTag, serverName);
};

module.exports.data = { subcommand: true };
