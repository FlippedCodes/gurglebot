module.exports.run = async (reaction, user) => {
  if (user.bot) return;

  // reaction logging
  client.functions.get('ENGINE_logger_reaction').run('added', reaction, user);
};

module.exports.data = {
  name: 'messageReactionAdd',
};
