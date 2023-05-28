import type { UserNote } from '@redose/types';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '.';

const noteCommand: Command = {
  meta: new SlashCommandBuilder()
    .setName('note')
    .setDescription('Manage and create notes associated with a user')
    .addSubcommand((subcommand) => subcommand
      .setName('add')
      .setDescription('Create a new note for a user')
      .addUserOption((option) => option
        .setName('user')
        .setDescription('User to associate note to')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('contents')
        .setDescription('Contents of the note')
        .setRequired(true))),

  async execute(interaction, { knex }) {
    const userId = interaction.options.getUser('user')!.id;
    if (userId === interaction.user.id) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle('note add - Error')
            .setDescription('You cannot repeat yourself.')
            .setColor('#fe3333'),
        ],
      });
    }

    await knex<UserNote>('userNotes').insert({
      userId,
      content: interaction.options.getString('content')!,
      createdBy: interaction.user.id,
    });

    return interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle('note add - Success')
          .setDescription('Note successfully created.')
          .setColor('#33fe33'),
      ],
    });
  },
};

export default noteCommand;
