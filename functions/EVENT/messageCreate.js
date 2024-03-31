module.exports.run = async (message) => {
  // return if unwanted
  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;

  // checking if staffmember
  // TODO: foreach, with more roles
  // const staff = message.member.roles.cache.has(config.teamRole);

  // TODO: make more pretty
  if (message.channel.parentId === config.openChannelCategory) {
    const loggingChannel = await message.guild.channels.fetch('1223649922100891739');
    await loggingChannel.send(`Deleted message:\n\`\`\`${message.content}\`\`\``);
    return message.delete();
  }

  if (config.contentWarning.checkChannels.includes(message.channel.id)) return client.functions.get('ENGINE_contentWarning_check').run(message);

  if (config.linkReplace.checkChannels.includes(message.channel.id)) return client.functions.get('ENGINE_linkReplace_check').run(message);

  // check if channel channel is a limited RP zone
  if (!DEBUG && config.reducedRP.channels.includes(message.channel.id)) return client.functions.get('ENGINE_limitedRp').run(message);
  // if (config.reducedRP.channels.includes(message.channel.id)) return client.functions.get('ENGINE_limitedRp').run(message);

  // non command function: check-in complete questioning Reaction adding
  if (message.mentions.roles.has(config.teamRole)
    && message.channel.parentId === config.checkin.categoryID) return client.functions.get('ENGINE_checkin_postReaction').run(message);
};

module.exports.data = {
  name: 'messageCreate',
};
