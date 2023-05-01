import type { EmergencyContact, User } from '@redose/types';
import Joi from 'joi';
import type { ApplyRoutes } from '../..';
import { meUrlParam } from '../../../middleware';

const userEmergencyRoutes: ApplyRoutes = (router, { validator, knex }) => {
  router.get(
    '/user/:userId/emergency-info',

    validator.params(Joi.object({
      userId: Joi.string().required(),
    })
      .required()),

    meUrlParam(),

    async (req, res) => {
      const emergencyInfo = await Promise.all([
        knex<User>('users')
          .select(
            'id AS userId',
            'emergencyNotes AS notes',
            'emergencyNotesLastUpdatedAt AS notesLastUpdatedAt',
          )
          .where('id', res.locals.userId)
          .first(),

        knex<EmergencyContact>('emergencyContacts AS ec')
          .innerJoin('users AS u', 'u.id', 'ec.contactId')
          .select('ec.id', 'ec.contactEmail', 'u.id AS userId', 'ec.createdAt')
          .where('userId', res.locals.userId),
      ])
        .then(([user, contacts]) => ({ ...user, contacts }));

      res.json({ emergencyInfo });
    },
  );

  router.patch(
    '/user/:userId/emergency-info',

    validator.params(Joi.object({
      userId: Joi.string().required(),
    })
      .required()),

    validator.body(Joi.object({
      emergencyNotes: Joi.string().trim(),
    })
      .required()),

    meUrlParam(),

    async (req, res) => {
      const updatedUser = await knex.transaction(async (trx) => {
        const baseSql = trx<User>('users').where('id', res.locals.userId);

        const updateSql = baseSql.clone();
        if (req.body.emergencyNotes) {
          updateSql
            .update('emergencyNotes', req.body.emergencyNotes || null)
            .update('emergencyNotesLastUpdatedAt', knex.fn.now());
        }

        return baseSql
          .select(
            'id',
            'emergencyNotes',
            'emergencyNotesLastUpdatedAt',
            'createdAt',
          )
          .first();
      });

      res.json(updatedUser);
    },
  );
};

export default userEmergencyRoutes;
