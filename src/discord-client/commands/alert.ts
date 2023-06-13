import type { User, EmergencyContact, EmergencyContactPolicy } from '@redose/types';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '.';
import type { EmergencyAlertsTable } from '../../tables';

interface EmergencyInfo {
  notes?: string;
  notesLastUpdatedAt?: Date;
  contactPolicy: EmergencyContactPolicy;

}

const alertCommand: Command = {
  meta: new SlashCommandBuilder()
    .setName('alert')
    .setDescription('Alerts set parties that there is an emergency. Should only be used in an emergency!')
    .addUserOption((option) => option
      .setName('user')
      .setDescription('User in need of assistance.')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('description')
      .setDescription('Description of what the nature of the emergency is.')),

  async execute(interaction, { logger, knex, client }) {
    const user = interaction.options.getUser('user', true);
    const description = interaction.options.getString('description') || undefined;

    const exists = await knex<EmergencyAlertsTable>('emergencyAlerts')
      .where('targetUserId', user.id)
      .where('guildId', interaction.guild!.id)
      .whereNull('closedBy')
      .orderBy('createdAt', 'desc')
      .first()
      .then(Boolean);

    if (exists) {
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle('Alert Already Active')
            .setDescription(`An alert is already active for <@${user.id}>.`)
            .setColor('Red'),
        ],
      });
    } else {
      const [emergencyInfo] = await knex.transaction(async (trx) => Promise.all([
        trx.raw(/* sql */`
          SELECT
            u.emergency_notes AS notes,
            u.emergency_notes_last_updated_at AS notes_last_updated_at,
            u.emergency_contact_policy AS contact_policy,
            json_agg(json_build_object(
              'id', ec.id,
              'contactId', ec.contact_id,
              'email', ec.email,
              'createdAt', ec.created_at
            )) AS contacts
          FROM users AS u
          INNER JOIN emergencyContacts AS ec
            ON ec.user_id = u.id
          WHERE u.id = $1
          GROUP BY u.id
          LIMIT 1;
        `, [user.id]),

        trx<EmergencyAlertsTable>('emergencyAlerts').insert({
          description,
          targetUserId: user.id,
          guildId: interaction.guild!.id,
          channelId: interaction.channel!.id,
        }),
      ]));

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('EMERGENCY ALERT')
            .setDescription(`@everyone An emergency alert has been triggered for <@${user.id}>.`
              .concat(description ? `\n\n**Description:** ${description}` : '')
              .concat(emergencyInfo?.contacts?.length && emergencyInfo?.notes?.trim()
                ? '' : '\n\n***NOTE: This user has no emergency notes***'))
            .setColor('Red'),
        ],
      });

      if (!emergencyInfo) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Alert Error')
              .setDescription('Could not find emergency info')
              .setColor('Red'),
          ],
        });
<<<<<<< HEAD
      } else if (!emergencyInfo?.notes?.trim()) {
        await Promise.all([
          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Emergency Alert')
                .setDescription('User did not set emergency notes in case of overdose.')
                .setColor('Red'),
            ],
          }),
        ]);
=======
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('EMERGENCY ALERT')
              .setDescription(`@everyone An emergency alert has been triggered for <@${user.id}>.`
                .concat(description ? `\n\n**Description:** ${description}` : '')
                .concat(emergencyInfo?.contacts?.length && emergencyInfo?.notes?.trim()
                  ? '' : '\n\n***NOTE: This user has no emergency notes***'))
              .setColor('Red'),
          ],
        });
>>>>>>> main
      }
    }
  },
};

export default alertCommand;
