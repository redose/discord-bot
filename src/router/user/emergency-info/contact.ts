import type { EmergencyContact } from '@redose/types';
import type { RequestHandler } from 'express';
import Joi from 'joi';
import type { ApplyRoutes } from '../..';
import { isAuthenticated, meUrlParam } from '../../../middleware';

const userEmergencyContactRoutes: ApplyRoutes = (router, { validator, knex }) => {
  function authorizeContact(): RequestHandler {
    return async (req, res, next) => {
      const contact = await knex<EmergencyContact>('emergencyContacts')
        .where('id', req.params.contactId)
        .first();

      if (!contact) res.sendStatus(404);
      else if (contact.userId !== res.locals.userId) res.sendStatus(403);
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
      contactId: Joi.string(),
      email: Joi.string().trim().email(),
    })
      .required()),

    meUrlParam(),

    async (req, res) => {
      if (!req.body.contactId && !req.body.email) res.sendStatus(403);
      else {
        const contact = await knex<EmergencyContact>('emergencyContacts')
          .insert({
            userId: res.locals.userId,
            contactId: req.body.contactId,
            email: req.body.email,
          })
          .returning('*')
          .then(([a]) => a);

        res.status(201).json(contact);
      }
    },
  );

  const validateContactParams = validator.params(Joi.object({
    userId: Joi.string().required(),
    contactId: Joi.string().required(),
  })
    .required());

  router.patch(
    '/user/emergency-info/contact/:contactId',
    isAuthenticated(),
    validateContactParams,

    validator.body(Joi.object({
      contactId: Joi.string().valid(null),
      email: Joi.string().trim().email().valid(null),
    })
      .required()),

    meUrlParam(),
    authorizeContact(),

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
        const baseSql = trx<EmergencyContact>('emergencyContacts')
          .where('id', req.params.contactId);

        const updateSql = baseSql.clone();
        if (req.body.contactId) updateSql.update('contactId', req.body.contactId);
        if (req.body.email) updateSql.update('email', req.body.email);
        await updateSql;
        return baseSql.first();
      });

      res.json(emergencyInfo);
    },
  );

  router.delete(
    '/user/emergency-info/contact/:contactId',
    isAuthenticated(),
    validateContactParams,
    meUrlParam(),
    authorizeContact(),

    async (req, res) => {
      const baseSql = knex<EmergencyContact>('emergencyContacts')
        .where('id', req.params.contactId);

      const emergencyContact = await baseSql.clone().select('userId').first();

      if (!emergencyContact) res.sendStatus(404);
      else if (emergencyContact.userId !== res.locals.userId) res.sendStatus(403);
      else {
        await baseSql.del();
        res.sendStatus(200);
      }
    },
  );
};

export default userEmergencyContactRoutes;
