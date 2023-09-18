const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle,
} = require('discord.js');

const buttons = new ActionRowBuilder()
  .addComponents([
    new ButtonBuilder()
      .setCustomId('repost')
      .setEmoji('👌')
      .setLabel('Auto-repost')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('delete')
      .setEmoji('✖️')
      .setLabel('Delete message')
      .setStyle(ButtonStyle.Danger),
  ]);

// content waning question text
function modalPrep(messageID) {
  const actionsRow = new ActionRowBuilder()
    .addComponents([
      new TextInputBuilder()
        .setCustomId(`contentWarning_Text_${messageID}`)
        .setRequired(true)
        .setLabel('What can ben seen in the picture?')
        .setPlaceholder('OV, anal vore, watersports, hard digestion,...')
        .setStyle(TextInputStyle.Short),
    ]);
  const modalCW = new ModalBuilder()
    .setCustomId('contentWarning_COMPONENT_modal_repost')
    .setTitle('Content Warning System');
  modalCW.addComponents(actionsRow);
  return modalCW;
}

module.exports.run = async (message) => {
  // check message, if it follows the conten warning rules
  let spoilerValidation = null;
  if (message.attachments.size) {
    spoilerValidation = message.attachments
      .map((attachment) => attachment.spoiler)
      .every((e) => e);
  }
  const urlRegEx = /http[s]?:\/\/(www\.)?(.*)?\/?(.)*/gm;
  const urlMatch = message.content.match(urlRegEx);
  if (urlMatch) {
    // check if link has spoiler terminators (||)
    const spoilerRegEx = /\|\|(.*?)http[s]?:\/\/(www\.)?(.*)?\/?(.)*/gm;
    const matches = message.content.match(spoilerRegEx);
    spoilerValidation = !!matches;
  }
  if (spoilerValidation === null) return;

  const stringValidation = !(config.contentWarning.cwStrings
    .map((searchString) => message.content.toLowerCase().search(searchString) === -1)
    .every((e) => e));
  if (stringValidation && spoilerValidation) return;

  // send message, informing user and providing options
  const bodyContent = `
  I noticed your message doesn't follow the content-warning rules of this channel.
  Please choose wisely 💊:
  - The blue pill will help you to autopost your message, but you won't be able to edit or delete it.
  - The red pill will destroy your message, and you have to repost it yourself.
  `;
  const messageReply = new EmbedBuilder()
    .setTitle('Hello!')
    .setDescription(bodyContent)
    .setFooter({ text: 'Please choose in the next 5 minutes, or your message will be deleted.' })
    .setColor('Orange');

  const modal = modalPrep(message.id);
  // post user option message
  const confirmMessage = await reply(message, {
    embeds: [messageReply], components: [buttons], fetchReply: true,
  });
  // start button collector
  const filter = (i) => message.author.id === i.user.id;
  const buttonCollector = confirmMessage.createMessageComponentCollector({ filter, time: 300000 });
  buttonCollector.on('collect', async (used) => {
    // cant stop, incase user aborts modal
    // buttonCollector.stop();
    if (used.customId === 'repost') return used.showModal(modal);
    // delete post
    confirmMessage.delete();
    message.delete();
    return;
  });
  buttonCollector.on('end', async (collected) => {
    if (collected.size === 0) {
      confirmMessage.delete();
      message.delete();
    }
  });
};

module.exports.data = {
  name: 'check',
};
