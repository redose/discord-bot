import type { EmergencyContact } from '@redose/types';
import type { RequestHandler } from 'express';
import Joi from 'joi';
import type { ApplyRoutes } from '../..';
import { isAuthenticated, meUrlParam } from '../../../middleware';
import { ensureUserExists } from '../../../utils';

const userEmergencyContactRoutes: ApplyRoutes = (router, { validator, knex }) => {
  function authorize(): RequestHandler {
    return async (req, res, next) => {
      const ownerId = await knex<EmergencyContact>('emergencyContacts')
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
      contactId: Joi.string(),
      email: Joi.string().trim().email(),
    })
      .required()),

    meUrlParam(),

    async (req, res) => {
      if (!req.body.contactId && !req.body.email) res.sendStatus(400);
      else {
        const contact = await knex.transaction(async (trx) => {
          if (req.body.contactId) await ensureUserExists(knex, req.body.contactId);
          return trx<EmergencyContact>('emergencyContacts')
            .insert({
              userId: res.locals.userId,
              contactId: req.body.contactId,
              email: req.body.email,
            })
            .returning('*')
            .then(([a]) => a);
        });

        res.status(201).json(contact);
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
        const updateSql = trx<EmergencyContact>('emergencyContacts')
          .where('id', req.params.id);

        if (req.body.contactId) {
          await ensureUserExists(knex, req.body.contactId);
          updateSql.update('contactId', req.body.contactId || null);
        }

        if (req.body.email) updateSql.update('email', req.body.email || null);
        await updateSql;

        return trx<EmergencyContact>('emergencyContacts')
          .where('id', req.params.id)
          .first();
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
      await knex<EmergencyContact>('emergencyContacts')
        .where('id', req.params.contactId)
        .del();

      res.sendStatus(200);
    },
  );
};

export default userEmergencyContactRoutes;
