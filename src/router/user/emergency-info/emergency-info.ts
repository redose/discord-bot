import type { EmergencyContact, User } from '@redose/types';
import Joi from 'joi';
import type { ApplyRoutes } from '../..';
import { isAuthenticated, meUrlParam } from '../../../middleware';

const userEmergencyRoutes: ApplyRoutes = (router, { validator, knex }) => {
  router.get(
    '/user/:userId/emergency-info',
    isAuthenticated(),

    validator.params(Joi.object({
      userId: Joi.string().required(),
    })
      .required()),

    meUrlParam(),

    async (req, res) => {
      const [user, contacts] = await Promise.all([
        knex<User>('users')
          .select(
            'id AS userId',
            'emergencyNotes AS notes',
            'emergencyNotesLastUpdatedAt AS notesLastUpdatedAt',
            'emergencyContactPolicy AS contactPolicy',
          )
          .where('id', res.locals.userId)
          .first(),

        knex<EmergencyContact>('emergencyContacts').where('userId', res.locals.userId),
      ]);

      if (!user) res.sendStatus(404);
      else if (res.locals.userId !== req.session.userId) res.sendStatus(403);
      else res.json({ ...user, contacts });
    },
  );

  router.patch(
    '/user/:userId/emergency-info',
    isAuthenticated(),

    validator.params(Joi.object({
      userId: Joi.string().required(),
    })
      .required()),

    validator.body(Joi.object({
      notes: Joi.string().trim().allow(null),
      contactPolicy: Joi.string().valid('WHITELIST_ONLY', 'WHITELIST_AND_STAFF', 'DISABLED'),
    })
      .required()),

    meUrlParam(),

    async (req, res) => {
      const updatedUser = await knex.transaction(async (trx) => {
        const baseSql = trx<User>('users').where('id', res.locals.userId);

        const updateSql = baseSql.clone();
        if (req.body.notes || req.body.notes === null) {
          updateSql
            .update('emergencyNotes', req.body.notes)
            .update('emergencyNotesLastUpdatedAt', knex.fn.now());
        }
        if (req.body.contactPolicy) {
          updateSql.update('emergencyContactPolicy', req.body.contactPolicy);
        }

        await updateSql;
        return baseSql
          .select(
            'emergencyNotes AS notes',
            'emergencyNotesLastUpdatedAt AS notesLastUpdatedAt',
            'emergencyContactPolicy AS contactPolicy',
          )
          .first();
      });

      res.json(updatedUser);
    },
  );
};

export default userEmergencyRoutes;
