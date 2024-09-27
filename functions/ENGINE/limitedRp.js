const { EmbedBuilder } = require('discord.js');

let leaderboardMessage;

let users = [];

async function postLeaderboard() {
  const leaderboardChannel = await client.channels.fetch(config.reducedRP.leaderboardChannel);

  const fields = users
    .sort((a, b) => b.points - a.points)
    // discord field limit
    .slice(0, 25)
    .map((entry) => ({ name: `${entry.id}`, value: `<@${entry.id}>\nPoints: ${entry.points}\nWarning-Level: ${entry.warnLevel}` }));
  const embed = new EmbedBuilder()
    .setFooter({
      text: `Highest warn level is ${config.reducedRP.warnThresholds.length} at ${config.reducedRP.warnThresholds[config.reducedRP.warnThresholds.length - 1]} points.`,
    })
    .setTitle('RP Leaderboard')
    .setColor(users.filter((entry) => entry.warnLevel !== 0).length === 0 ? 'Green' : 'Orange')
    .addFields([...fields]);
  if (!leaderboardMessage) return leaderboardMessage = await leaderboardChannel.send({ embeds: [embed] });
  return leaderboardMessage.edit({ embeds: [embed] });
}

module.exports.run = async (message) => {
  // check messages for all rp messages and convert them to points
  const rpRegex = /(?:\w*)[*_]{1,2}.*?[*_]{1,2}(?:\w*)/gm;
  const findings = message.cleanContent.match(rpRegex);
  if (!findings) return;
  const points = findings.join().length;
  console.debug(points);

  // check if there is a user already to add the points to and check warnings.
  const id = message.author.id;
  const user = users.find((user) => user.id === id);
  if (user) {
    user.points += points;
  } else {
    await users.push({
      id,
      points,
      warnLevel: 0,
      lastPointsDeletion: Date.now(),
    });
  }

  // Update point counts
  users.forEach((user) => {
    const activeUser = users.find((userTemp) => userTemp.id === user.id);

    // check how often the deletion time fits into lastPointsDeletion
    const difference = Date.now() - user.lastPointsDeletion;
    const points = Math.round(difference / config.reducedRP.pointsDeletionTime);
    // remove that amount of points
    activeUser.points -= points;
    // check if points go into negative and delete entire entry and return
    if (Math.sign(activeUser.points) === -1) return users = users.filter((userTemp) => userTemp.id !== user.id);
    // if points drop under threshold, reset warn
    if (activeUser.points < config.reducedRP.warnThreshold) activeUser.warned = false;

    // set warn levels
    config.reducedRP.warnThresholds.every((threshold, i) => {
      // add warn level
      if (activeUser.points >= threshold) {
        // only step one warn at the time
        if (activeUser.warnLevel >= (i + 1)) return true;
        // overflow protection
        if (activeUser.warnLevel === config.reducedRP.warnThresholds.length) return true;
        activeUser.warnLevel += 1;
        // reset points to warn threshold, so it fair and user goes through each stage
        activeUser.points = config.reducedRP.warnThresholds[activeUser.warnLevel - 1];
        // TODO: Inform user
        return false;
      }
      // remove warn level, if above statement is false. Don't ask me how, but it happend to work ¯\_(ツ)_/¯
      if (activeUser.warnLevel === (i + 1)) {
        // underflow protection
        if (activeUser.warnLevel === 0) return false;
        activeUser.warnLevel -= 1;
        return false;
      }
      return true;
    });

    // update lastPointsDeletion when points where adjusted
    if (points !== 0) activeUser.lastPointsDeletion = Date.now();
  });
  // TEMP: get testing report channel
  await postLeaderboard();

  // // check if user has been warned
  // if (activeUser.warned) {
  //   // delete rp message
  //   embed.setColor('Red').setDescription(`<@${activeUser.id}> would have their message deleted.`);
  // } else {
  //   // warn user
  //   activeUser.warned = true;
  //   embed.setColor('Orange').setDescription(`<@${activeUser.id}> would have been warned.`);
  // }
};

module.exports.help = {
  name: 'ENGINE_limitedRp',
};
