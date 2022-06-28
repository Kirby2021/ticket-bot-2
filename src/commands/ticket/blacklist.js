const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require('discord.js');
const collection = require('../../models/guildConfig');

module.exports = {
  data: {
    name: 'blacklist',
    description: 'Blacklist a role from creating tickets.',
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: 'role',
        description: 'The role to blacklist.',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
  },
  chatInputRun: async (interaction) => {
    await interaction.deferReply();

    const { client, guild } = interaction;
    const role = interaction.options.getMentionable('role');
    const data = await collection.findOne({
      guildId: guild.id,
    });

    if (role.managed) {
      return interaction.editReply(
        `${client.config.emojis.cross} | You cannot blacklist a integrated role.`,
      );
    }

    if (data.blackListedRoleIds.includes(role.id)) {
      return interaction.editReply(
        `${client.config.emojis.cross} | That role is already blacklisted.`,
      );
    }

    await collection.findOneAndUpdate(
      { guildId: guild.id },
      { $push: { blackListedRoleIds: role.id } },
    );

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(
        `${
          client.config.emojis.tick
        } | Successfully blacklisted ${role.toString()}.`,
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
