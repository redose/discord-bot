import type { EmergencyContact } from '@redose/types';
import Joi from 'joi';
import type { ApplyRoutes } from '../..';
import { meUrlParam } from '../../../middleware';

const userEmergencyContactRoutes: ApplyRoutes = (router, { validator, knex }) => {
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

export default userEmergencyContactRoutes;