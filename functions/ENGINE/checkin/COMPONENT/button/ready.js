const {
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

const buttons = new ActionRowBuilder()
  .addComponents([
    new ButtonBuilder()
      .setCustomId('checkin_COMPONENT_button_disabled')
      .setEmoji('👌')
      .setLabel('I\'m ready!')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
  ]);

module.exports.run = async (interaction) => {
  await interaction.deferReply();

  if (interaction.channel.parentId !== config.checkin.categoryID) return messageFail(interaction, 'This channel is not a checkin channel.');
  await client.functions.get('ENGINE_checkin_postReaction').run(interaction);

  // ping team, once
  const messages = await interaction.channel.messages.fetch();
  const mentions = messages.filter((message) => message.mentions.roles.has(config.teamRole));
  if (!mentions.size === 0) interaction.channel.send(`<@&${config.teamRole}>`);

  // gray out button
  interaction.message.edit({ components: [buttons] });
};

module.exports.data = {
  name: 'ready',
};
