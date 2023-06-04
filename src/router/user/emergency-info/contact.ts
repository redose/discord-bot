import type { EmergencyContact } from '@redose/types';
import type { RequestHandler } from 'express';
import Joi from 'joi';
import type { ApplyRoutes } from '../..';
import { isAuthenticated, meUrlParam } from '../../../middleware';

interface EmergencyContactTable extends Omit<EmergencyContact, 'contact'> {
  contactId: string;
}

const userEmergencyContactRoutes: ApplyRoutes = (router, { validator, knex, discordClient }) => {
  async function getDiscordContact(
    { contactId, ...record }: EmergencyContactTable,
  ): Promise<EmergencyContact> {
    if (!contactId) return record;
    const discordUser = await discordClient.users.cache.get(contactId);
    if (!discordUser) throw new Error('Could not get user from Discord API');
    return {
      ...record,
      contact: {
        id: contactId,
        username: `${discordUser.username}#${discordUser.discriminator}`,
        avatar: discordUser.avatar || '/user/default-avatar.png',
      },
    };
  }

  function authorize(): RequestHandler {
    return async (req, res, next) => {
      const ownerId = await knex<EmergencyContactTable>('emergencyContacts')
        .where('id', req.params.contactId)
        .first()
        .then((record) => record?.userId);

      if (!ownerId) res.sendStatus(404);
      else if (ownerId !== req.session.userId) res.sendStatus(403);
      else next();
    };
  }

  router.post(
    '/user/:userId/emergency-info/contact',
    isAuthenticated(),

    validator.params(Joi.object({
      userId: Joi.string().required(),
    })
      .required()),

    validator.body(Joi.object({
      contactId: Joi.string().optional().allow(null),
      email: Joi
        .string()
        .trim()
        .email()
        .optional()
        .allow(null),
    })),

    meUrlParam(),

    async (req, res) => {
      if (!req.body.contactId && !req.body.email) res.sendStatus(400);
      else {
        const contact = await knex.transaction(async (trx) => {
          if (req.body.contactId) {
            const guild = await discordClient.guilds.fetch(req.session.guildId!);
            const guildMember = await guild.members.fetch(req.body.userId);
            if (!guildMember) return null;
          }

          return trx<EmergencyContactTable>('emergencyContacts')
            .insert({
              userId: res.locals.userId,
              contactId: req.body.contactId,
              email: req.body.email,
            })
            .returning('*')
            .then(([record]) => getDiscordContact(record));
        });

        if (contact === null) res.status(400).json({ message: 'User does not belong to guild' });
        else res.status(201).json(contact);
      }
    },
  );

  router.patch(
    '/user/emergency-info/contact/:contactId',
    isAuthenticated(),

    validator.params(Joi.object({
      id: Joi.string().required(),
    })
      .required()),

    validator.body(Joi.object({
      contactId: Joi.string(),
      email: Joi.string().trim().email(),
    })
      .required()),

    meUrlParam(),
    authorize(),

    (req, res, next) => {
      if (req.body.contactId || req.body.email) next();
      else {
        res.status(400).json({
          type: 'Missing values',
          message: 'Must provide either a contact ID or email.',
        });
      }
    },

    async (req, res) => {
      const emergencyInfo = await knex.transaction(async (trx) => {
        const updateSql = trx<EmergencyContactTable>('emergencyContacts')
          .where('id', req.params.id);

        if (req.body.contactId) {
          // await ensureUserExists(knex, req.body.contactId);
          updateSql.update('contactId', req.body.contactId || null);
        }

        if (req.body.email) updateSql.update('email', req.body.email || null);
        await updateSql;

        return trx<EmergencyContactTable>('emergencyContacts')
          .where('id', req.params.id)
          .first()
          .then((record) => getDiscordContact(record!));
      });

      res.json(emergencyInfo);
    },
  );

  router.delete(
    '/user/emergency-info/contact/:contactId',
    isAuthenticated(),

    validator.params(Joi.object({
      contactId: Joi.string().required(),
    })
      .required()),

    meUrlParam(),
    authorize(),

    async (req, res) => {
      await knex<EmergencyContactTable>('emergencyContacts')
        .where('id', req.params.contactId)
        .del();

      res.sendStatus(200);
    },
  );
};

export default userEmergencyContactRoutes;
