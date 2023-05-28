import type { WebSession } from '@redose/types';
import Joi from 'joi';
import type { ApplyRoutes } from '..';
import { isAuthenticated } from '../../middleware';

const sessionRoutes: ApplyRoutes = (router, {
  logger,
  validator,
  knex,
}) => {
  const sessionParamValidator = validator.params(Joi.object({
    sessionId: Joi.string().required(),
  })
    .required());

  router.post(
    '/user/session/:sessionId',
    sessionParamValidator,
    isAuthenticated(true),

    async (req, res) => {
      const session = await knex<WebSession>('webSessions')
        .where('id', req.params.sessionId)
        .select('userId', 'loggedOutAt', 'createdAt')
        .orderBy('createdAt', 'DESC')
        .first();

      if (!session) res.sendStatus(404);
      else if (session.loggedOutAt) res.sendStatus(440);
      else {
        const { loggedOutAt, ...xs } = session;
        Object.assign(req.session, xs);
        req.session.save((ex) => {
          if (ex) {
            logger.error('Could not save session:', ex);
            res.status(500).json({ message: 'Could not save session' });
          } else res.sendStatus(200);
        });
      }
    },
  );

  router.post(
    '/user/session/:sessionId/logout',
    sessionParamValidator,
    isAuthenticated(),

    async (req, res) => {
      await knex.transaction(async (trx) => Promise.all([
        trx<WebSession>('webSessions')
          .where('id', req.params.sessionId)
          .update('loggedOutAt', new Date()),

        new Promise<void>((resolve, reject) => {
          req.session.destroy((ex: Error) => {
            if (ex) reject(ex);
            else resolve();
          });
        }),
      ]));

      res.sendStatus(200);
    },
  );
};

export default sessionRoutes;
