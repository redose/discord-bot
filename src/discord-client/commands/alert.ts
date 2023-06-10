import type { User, EmergencyContact } from '@redose/types';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '.';
import type { EmergencyAlertsTable } from '../../tables';

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
      await knex.raw(`
        SELECT
          u.emergency_notes AS notes,
          u.emergency_notes_last_updated_at AS notes_last_updated_at,
          u.emergency_contact_policy AS contact_policy,
          json_agg(json_build_objet(
            'id', ec.id,
            'user_id', ec.user_id,
            'contact_id', ec.contact_id,
            'email', ec.email,
            'created_at', ec.created_at
          ))
        FROM users AS u
        INNER JOIN emergencyContacts AS ec
          ON ec.user_id
        WHERE u.id = $1
        GROUP BY u.id;
      `, [user.id]);

      const [emergencyInfo] = await Promise.all([
        Promise.all([
          knex<User>('users')
            .select('emergencyNotes', 'emergencyNotesLastUpdatedAt', 'emergencyContactPolicy')
            .where('id', user.id)
            .first()
            .then((record) => ({
              notes: record?.emergencyNotes,
              notesLastUpdatedAt: record?.emergencyNotesLastUpdatedAt,
              contactPolicy: record?.emergencyContactPolicy,
            })),

          knex<EmergencyContact>('emergencyContacts AS ec')
            .innerJoin('users AS u', 'u.id', 'ec.contactId')
            .where('ec.userId', user.id)
            .select('u.*')
            .then((xs) => xs.map(({ contactId }) => contactId)),
        ])
          .then(([userRecord, contacts]) => ({ ...userRecord, contacts })),

        knex<EmergencyAlertsTable>('emergencyAlerts').insert({
          description,
          targetUserId: user.id,
          guildId: interaction.guild!.id,
          channelId: interaction.channel!.id,
        }),
      ]);

      if (!emergencyInfo) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Alert Error')
              .setDescription('Could not find emergency info')
              .setColor('Red'),
          ],
        });
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
      }
    }
  },
};

export default alertCommand;
