import type { EmergencyContact } from '@redose/types';
import Joi from 'joi';
import type { ApplyRoutes } from '../..';
import { isAuthenticated, meUrlParam } from '../../../middleware';

const userEmergencyContactRoutes: ApplyRoutes = (router, { validator, knex }) => {
  router.post(
    '/user/:userId/emergency-info/contact',

    isAuthenticated(),

    validator.params(Joi.object({
      userId: Joi.string().required(),
    })
      .required()),

    validator.body(Joi.object({
      contactId: Joi.string(),
      email: Joi.string().trim().email(),
    })
      .required()),

    meUrlParam(),

    async (req, res) => {
      if (!req.body.contactId && !req.body.email) res.sendStatus(403);
      else {
        const emergencyContact = await knex<EmergencyContact>('emergencyContacts')
          .insert({
            userId: res.locals.userId,
            contactId: req.body.contactId,
            email: req.body.email,
          })
          .returning('*')
          .then(([a]) => a);

        res.status(201).json({ emergencyContact });
      }
    },
  );

  router.delete(
    '/user/:userId/emergency-info/contact/:contactId',

    isAuthenticated(),

    validator.params(Joi.object({
      userId: Joi.string().required(),
      contactId: Joi.string().required(),
    })
      .required()),

    meUrlParam(),

    async (req, res) => {
      const emergencyContact = await knex<EmergencyContact>('emergencyContacts');
    },
  );
};

export default userEmergencyContactRoutes;
