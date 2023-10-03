const { PermissionsBitField } = require('discord.js');

// cache system was implemented cause i don't know if discord.js caches properly. and it was still pretty slow
// DISABLED: because we don't have multiple commands anymore. it was also not working with multi-user usage, locking the output for another member, that actually had access to the channels
// let cache = [];

function prepareFields(orgText) {
  const lines = orgText.split('\n');
  const args = [];
  let description = '';
  lines.forEach((line) => {
    // get rid of empty lines
    if (line === '') return;
    const split = line.split(': ');
    // get rid of pesky cdn links
    if (split[0].includes('cdn.discordapp.com')) return;
    // return if there is no colon and therefor normal description
    if (!split[1]) return description += `${split[0]}\n\n`;
    // max of 25 fields
    if (args.length > 25) return description += `**${split[0]}**\n${split[1]}\n\n`;
    // add to description if value is too long
    if (split[1].length >= 250) return description += `**${split[0]}:** ${split[1]}\n\n`;
    args.push({ name: split[0], value: split[1], inline: true });
  });
  // description = description.replace(/\n{2,}/g, '\n\n');
  return [description, args];
}

module.exports.run = async (interaction, member) => {
  // const cachedEntry = cache.find((entry) => entry.id === member.id);
  // if (cachedEntry) return cachedEntry.bios;

  const bioRawCollections = await Promise.all(
    config.bio.bioChannels.map(async (channelID) => {
      const channel = await interaction.guild.channels.fetch(channelID);
      const threads = await channel.threads.fetch();
      return threads.threads;
    }),
  );

  const biosRaw = [];
  bioRawCollections
    .filter((collection) => collection.size)
    .forEach((collection) => {
      const out = collection.map((thread) => thread);
      biosRaw.push(...out);
    });

  // horrible code IK, but JS didn't want as i wanted to do it

  const bios = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const thread of biosRaw) {
    const bioMessage = await thread.fetchStarterMessage().catch(() => null);
    // async await didn't want to play nicely, so I filter afterwards
    if (!bioMessage) bios.push({ name: null });
    else if (bioMessage.author.id !== member.id) bios.push({ name: null });
    else {
      const [description, fields] = prepareFields(bioMessage.content);
      const embeds = [];
      embeds.push(...bioMessage.embeds.map((embed) => embed.url));
      embeds.push(...bioMessage.attachments.map((attachment) => attachment.url));
      await bios.push({
        id: bioMessage.id,
        name: thread.name,
        link: bioMessage.url,
        description,
        fields,
        embeds,
        // check if user can see channel and their for has permissions
        allowed: thread.parent.permissionsFor(interaction.member).has(PermissionsBitField.Flags.ViewChannel),
      });
    }
  }

  const biosFinal = bios.filter((bio) => bio.name);

  // cache.push({ id: member.id, bios: biosFinal });
  // setTimeout(() => {
  //   cache = cache.filter((entry) => entry.id !== member.id);
  // }, 1.8e+6); // 30 mins

  return biosFinal;
};

module.exports.help = {
  name: 'getBios',
};
