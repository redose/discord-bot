import type { WebSession } from '@redose/types';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '.';
import { ensureUserExists } from '../../utils';

const sessionCommand: Command = {
  meta: new SlashCommandBuilder()
    .setName('session')
    .setDescription('Begins a new session.'),

  async execute(interaction, { knex }) {
    const sessionId = await knex.transaction(async (trx) => {
      await Promise.all([
        ensureUserExists(trx, interaction.user.id),

        trx<WebSession>('webSessions')
          .where('userId', interaction.user.id)
          .whereNull('loggedOutAt')
          .update('loggedOutAt', knex.fn.now()),
      ]);

      return trx<WebSession>('webSessions')
        .insert({ userId: interaction.user.id })
        .returning('id')
        .then(([{ id }]) => id);
    });

    await interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle('Session Created')
          .setDescription('Being your session by clicking here.')
          .setImage('https://avatars.githubusercontent.com/u/42881543?s=280&v=4')
          .setURL(`http://localhost:8080/session/${sessionId}`),
      ],
    });
  },
};

export default sessionCommand;
