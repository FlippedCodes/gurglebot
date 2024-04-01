module.exports.run = async (message) => {
  // return if unwanted
  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;

  // checking if staffmember
  // TODO: foreach, with more roles
  // const staff = message.member.roles.cache.has(config.teamRole);

  // TODO: make more pretty
  // DEPRECATED: Just denied channel history
  // if (message.channel.parentId === config.openChannelCategory) {
  //   const loggingChannel = await message.guild.channels.fetch('1223649922100891739');
  //   await loggingChannel.send(`Deleted message:\n\`\`\`${message.content}\`\`\``);
  //   return message.delete();
  // }

  if (config.contentWarning.checkChannels.includes(message.channel.id)) return client.functions.get('ENGINE_contentWarning_check').run(message);

  if (config.linkReplace.checkChannels.includes(message.channel.id)) return client.functions.get('ENGINE_linkReplace_check').run(message);

  // check if channel channel is a limited RP zone
  if (!DEBUG && config.reducedRP.channels.includes(message.channel.id)) return client.functions.get('ENGINE_limitedRp').run(message);
  // if (config.reducedRP.channels.includes(message.channel.id)) return client.functions.get('ENGINE_limitedRp').run(message);

  // non command function: check-in complete questioning Reaction adding
  if (message.mentions.roles.has(config.teamRole)
    && message.channel.parentId === config.checkin.categoryID) return client.functions.get('ENGINE_checkin_postReaction').run(message);

  if (message.channel.id === '455334868788969473') {
    const sendMessage = (parsed) => {
      const content = parsed.pop();
      // word edgecase
      if (parsed.slice(-2)[0] !== '' && parsed.slice(-2)[0].slice(-1) !== ' ') return;
      // console.log(content);
      message.reply(`Hello ${content}\nI'm GurgleBot!`);
    };
    const split1 = message.cleanContent.toLowerCase().split('im ');
    if (split1.length !== 1) return sendMessage(split1);
    const split2 = message.cleanContent.toLowerCase().split('i\'m ');
    if (split2.length !== 1) return sendMessage(split2);
    const split3 = message.cleanContent.toLowerCase().split('i am ');
    if (split3.length !== 1) return sendMessage(split3);
    const split4 = message.cleanContent.toLowerCase().split('i’m ');
    if (split4.length !== 1) return sendMessage(split3);
  }
};

module.exports.data = {
  name: 'messageCreate',
};
