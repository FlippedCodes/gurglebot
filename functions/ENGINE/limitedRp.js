const { EmbedBuilder } = require('discord.js');

let users = [];

async function updatePoints() {
  users.forEach((user) => {
    activeUser = users.find((userTemp) => userTemp.id === user.id);

    // check how often the deletion time fits into lastPointsDeletion
    const difference = Date.now() - user.lastPointsDeletion;
    const points = Math.round(difference / config.reducedRP.pointsDeletionTime);
    // remove that amount of points
    activeUser.points -= points;
    // check if points go into negative and delete entire entry and return
    if (Math.sign(activeUser.points) === -1) return users = users.filter((userTemp) => userTemp.id !== user.id);
    // if points drop under threshold, reset warn
    if (activeUser.points < config.reducedRP.warnThreshold) activeUser.warned = false;
    // update lastPointsDeletion when points where adjusted
    if (points !== 0) activeUser.lastPointsDeletion = Date.now();
  });
}

module.exports.run = async (message) => {
  // check messages for all rp messages and convert them to points
  const rpRegex = /(?:\w*)[*_]{1,2}.*?[*_]{1,2}(?:\w*)/gm;
  const findings = message.cleanContent.match(rpRegex);
  if (!findings) return;
  const points = findings.join().length;

  // check if there is a user already to add the points to and check warnings.
  const id = message.author.id;
  const user = users.find((user) => user.id === id);
  if (user) {
    user.points += points;
  } else {
    await users.push({
      id,
      points,
      warned: false,
      lastPointsDeletion: Date.now(),
    });
  }

  // Update point counts
  await updatePoints();

  const activeUser = users.find((user) => user.id === id);
  // sometimes user is deleted by updatePoints beforehand.
  if (!activeUser) return;
  // console.log(activeUser);
  if (activeUser.points < config.reducedRP.warnThreshold) return;
  // TEMP: get testing report channel
  const notify = await message.client.channels.fetch('1169354618719973437');
  const embed = new EmbedBuilder()
    .addFields([
      { name: 'User ID', value: `\`${activeUser.id}\``, inline: true },
      { name: 'Current Points', value: String(activeUser.points), inline: true },
      // { name: 'Warned', value: prettyCheck(activeUser.warned), inline: true },
      { name: 'lastPointsUpdate', value: `<t:${activeUser.lastPointsDeletion}:f>`, inline: true },
    ]);
  // check if user has been warned
  if (activeUser.warned) {
    // delete rp message
    embed.setColor('Red').setDescription(`<@${activeUser.id}> would have their message deleted.`);
  } else {
    // warn user
    activeUser.warned = true;
    embed.setColor('Orange').setDescription(`<@${activeUser.id}> would have been warned.`);
  }
  notify.send({ embeds: [embed] });
};

module.exports.help = {
  name: 'ENGINE_limitedRp',
};
