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

  // ping team, once
  const messages = await interaction.channel.messages.fetch();
  const found = await messages.filter((msg) => msg.author.id === channel.name);
  if (!found) return messageFail(interaction, 'Please answer the questions, before pressing the button.');

  // gray out button
  interaction.message.edit({ components: [buttons] });

  if (interaction.channel.parentId !== config.checkin.categoryID) return messageFail(interaction, 'This channel is not a check-in channel.');
  await client.functions.get('ENGINE_checkin_postReaction').run(interaction);
};

module.exports.data = {
  name: 'ready',
};
