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
      if (!req.body.contactId && !req.body.email) res.sendStatus(400);
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

  router.patch(
    '/user/emergency-info/contact/:id',
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
          .where('id', req.params.id);

        const updateSql = baseSql.clone();
        if (req.body.contactId) updateSql.update('contactId', req.body.contactId || null);
        if (req.body.email) updateSql.update('email', req.body.email || null);
        await updateSql;
        return baseSql.first();
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
    authorizeContact(),

    async (req, res) => {
      const baseSql = knex<EmergencyContact>('emergencyContacts')
        .where('id', req.params.contactId);

      const contact = await baseSql.clone().select('userId').first();

      if (!contact) res.sendStatus(404);
      else if (contact.userId !== res.locals.userId) res.sendStatus(403);
      else {
        await baseSql.del();
        res.sendStatus(200);
      }
    },
  );
};

export default userEmergencyContactRoutes;
