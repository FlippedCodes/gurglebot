const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const welcomeMessage = (userID) => `
Hey there <@!${userID}>! Welcome to TDM.
Before we let you in I'm going to ask you some questions, before a staff member is going to let you in.

:one: - How did you find our server?
:two: - Are you on any other vore servers?
:three: - Do you like vore, and what is your favorite?
:four: - Please let us know your DoB (Date of Birth) in the following format: \`YYYY-MM-DD\`.
:five: - Please provide your ID as in https://discord.com/channels/300051375914483715/496948681656893440/496985167160672267 described.

When you are done please press the button below, so we know that you are done, and ready to be reviewed.
`;

const buttons = new ActionRowBuilder()
  .addComponents([
    new ButtonBuilder()
      .setCustomId('checkin_COMPONENT_button_ready')
      .setEmoji('👌')
      .setLabel('I\'m ready!')
      .setStyle(ButtonStyle.Primary),
  ]);

// calculate user creation
function calcUserAge(user) {
  const currentDate = new Date();
  const creationDate = new Date(user.createdAt);
  const msDiff = Math.abs(currentDate - creationDate);
  return Math.ceil(msDiff / (1000 * 60 * 60 * 24));
}

async function createChannel(guild, user, topic) {
  const channel = await guild.channels.create({ name: user.id, topic, parent: config.checkin.categoryID }).catch(ERR);
  await channel.lockPermissions().catch(ERR);
  // needs to be delayed, because API limit causes permissions to be set in reverse order.
  setTimeout(async () => {
    await channel.permissionOverwrites.edit(user.id, { ViewChannel: true }).catch(ERR);
    await channel.send({ content: welcomeMessage(user.id), components: [buttons] }).catch(ERR);
  }, 3 * 1000);
}

module.exports.run = async (reaction) => {
  if (DEBUG) return;
  // check emoji and channel
  const configReaction = config.checkin.reaction;
  if (reaction.message_id !== configReaction.message) return;
  if (reaction.emoji.name !== configReaction.emoji) return;
  // get guild and user
  const guild = await client.guilds.cache.find((guild) => guild.id === reaction.guild_id);
  const user = await client.users.fetch(reaction.member.user.id, false);
  // check if user already has check-in channel
  const checkinChannel = await guild.channels.cache.find((channel) => channel.name === user.id);
  if (!checkinChannel) {
    const dayDiff = calcUserAge(user);
    // TODO: add DB table to check if user was in guild before
    // Create channel, set settings and edit channel topic
    const topic = `
    Username: ${user.tag}
    Avatar: ${user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}
    Days since creation: ${dayDiff};
    Creation date: ${user.createdAt}`;
    await createChannel(guild, user, topic);
  }
  // remove user reaction
  const reactionChannel = await guild.channels.cache.get(config.checkin.reaction.channel);
  const reactionMessage = await reactionChannel.messages.fetch(config.checkin.reaction.message);
  const initalReaction = await reactionMessage.reactions.cache.get(config.checkin.reaction.emoji);
  initalReaction.users.remove(user);
};

module.exports.help = {
  name: 'initReaction',
};
