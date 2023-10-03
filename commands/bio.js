const {
  EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
} = require('discord.js');

const menu = (bioList) => new ActionRowBuilder()
  .addComponents([
    new StringSelectMenuBuilder()
      .setCustomId('bioChoice')
      .setPlaceholder('Select a Bio')
      .addOptions(bioList.map((bio) => (
        new StringSelectMenuOptionBuilder()
          .setLabel(bio.name)
          .setValue(bio.id)
      ))),
  ]);

module.exports.run = async (interaction) => {
  const member = interaction.options.getMentionable('user', true);
  const PFP = await member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 });

  const bios = await client.functions.get('ENGINE_bio_getBios').run(interaction, member);
  if (!bios.length) return messageFail(interaction, `${member} doesn't have any.`);
  const allowedAll = bios.every((bio) => bio.allowed);
  const allowedBios = bios.filter((bio) => bio.allowed);
  if (!allowedBios.length) return messageFail(interaction, `I can't show you the bioses of ${member} because they are either NSFW or NSFL. and you don't have those roles.`);

  const body = `**${member}s Bio List**
${allowedBios.map((bio) => `- [${bio.name}](${bio.link})`).join('\n')}

Select a bio below to see its details. (This will display images about the bio.)
${!allowedAll ? '**Because you don\'t have the NSFW and/or NSFL role, the list is incomplete!**' : ''}`;

  const message = new EmbedBuilder().setDescription(body).setColor('Blue').setThumbnail(PFP);
  const menuComp = menu(allowedBios);
  const initialMessage = await reply(interaction, { embeds: [message], components: [menuComp] });

  const filter = (interaction) => interaction.customId === 'bioChoice';
  const selectCollector = initialMessage.createMessageComponentCollector({ filter, time: 120 * 1000 });
  selectCollector.on('collect', async (used) => {
    // selectCollector.stop();
    used.deferUpdate();
    const finalBio = allowedBios.find((bio) => bio.id === used.values[0]);
    if (!finalBio) return reply(interaction, { embeds: [message.setDescription('oNo! Something went wrong... Please try again.')], ephemeral: true }, true);
    const finalEmbed = new EmbedBuilder()
      .setColor('Green')
      .setAuthor({ name: member.displayName, iconURL: PFP })
      .setTitle(finalBio.name)
      .setURL(finalBio.link)
      .addFields(finalBio.fields)
      .setDescription(finalBio.description);
    // url needs to be set so images are put into the same embed
    const pics = finalBio.embeds.map((url) => new EmbedBuilder().setURL(finalBio.link).setImage(url));
    return reply(interaction, { embeds: [finalEmbed, ...pics], ephemeral: true }, true);
  });
};

module.exports.data = new CmdBuilder()
  .setName('bio')
  .setDescription('See details about the bios from someone else.')
  .setDMPermission(false)
  .addMentionableOption((option) => option
    .setName('user')
    .setDescription('Provide the user you want to get the bios from.')
    .setRequired(true));
