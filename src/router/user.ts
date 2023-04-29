import type { EmergencyContact, User } from '@redose/types';
import Joi from 'joi';
import type { ApplyRoutes } from '.';
import { meUrlParam } from '../middleware';

const userRoutes: ApplyRoutes = (router, { validator, knex }) => {
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

  router.post(
    '/user/:userId/emergency-info/contact',

    validator.params(Joi.object({
      userId: Joi.string().required(),
    })
      .required()),

    validator.body(Joi.object({
      contactId: Joi.string().required(),
      contactEmail: Joi.string().trim().email(),
    })
      .required()),

    meUrlParam(),

    async (req, res) => {
      const emergencyContact = await knex<EmergencyContact>('emergencyContacts')
        .insert({
          userId: res.locals.userId,
          contactId: req.body.contactId,
          contactEmail: req.body.contactEmail,
        })
        .returning('*')
        .then(([a]) => a);

      res.status(201).json({ emergencyContact });
    },
  );
};

export default userRoutes;
