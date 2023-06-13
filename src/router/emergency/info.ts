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
      const userEmergencyInfo = await knex.raw(/* sql */`
        SELECT
          u.id AS user_id,
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
        INNER JOIN emergency_contacts AS ec
          ON ec.user_id = u.id
        WHERE u.id = $1
        GROUP BY u.id
        LIMIT 1;
      `, [res.locals.userId]);

      if (!userEmergencyInfo) res.sendStatus(404);
      else if (res.locals.userId !== req.session.userId) res.sendStatus(403);
      else res.json(userEmergencyInfo);
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
        const updateSql = trx<User>('users').where('id', res.locals.userId);
        if (req.body.notes || req.body.notes === null) {
          updateSql
            .update('emergencyNotes', req.body.notes)
            .update('emergencyNotesLastUpdatedAt', knex.fn.now());
        }
        if (req.body.contactPolicy) {
          updateSql.update('emergencyContactPolicy', req.body.contactPolicy);
        }

        await updateSql;
        return trx<User>('users')
          .where('id', res.locals.userId)
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
