import type { User, WebSession } from '@redose/types';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '.';

const sessionCommand: Command = {
  meta: new SlashCommandBuilder()
    .setName('session')
    .setDescription('Begins a new session.'),

  async execute(interaction, { logger, knex, client }) {
    const isInValidGuild = interaction.guild?.id
      && client.guilds.cache.map(({ id }) => id).includes(interaction.guild.id);

    if (!isInValidGuild) {
      logger.warn('Session attempted to be created for invalid guild:', interaction.guild);
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle('Session Error')
            .setDescription('Bot is not enabled for this Discord server.'),
        ],
      });
    } else {
      const sessionId = await knex.transaction(async (trx) => {
        await Promise.all([
          trx<WebSession>('webSessions')
            .where('userId', interaction.user.id)
            .whereNull('loggedOutAt')
            .update('loggedOutAt', knex.fn.now()),

          trx<User>('users')
            .where('id', interaction.user.id)
            .first()
            .then((a) => (a ? null : trx<User>('users')
              .insert({ id: interaction.user.id }))),
        ]);

        return trx<WebSession>('webSessions')
          .insert({
            userId: interaction.user.id,
            guildId: interaction.guild!.id,
          })
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
            .setURL(`http://localhost:8080/authenticate/${sessionId}`),
        ],
      });
    }
  },
};

export default sessionCommand;
