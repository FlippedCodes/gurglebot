const { EmbedBuilder } = require('discord.js');

module.exports.run = async (interaction, body, title, color, footer, ephemeral) => {
  // needs to be local as settings overlap from dofferent embed-requests
  const embed = new EmbedBuilder();

  if (body) embed.setDescription(body);
  if (title) embed.setTitle(title);
  if (color) embed.setColor(color);
  if (footer) embed.setFooter(footer);

  const options = {
    embeds: [embed],
    components: [],
    ephemeral: !!ephemeral,
  };

  return reply(interaction, options).catch(ERR);
};

module.exports.data = {
  name: 'richEmbedMessage',
};
