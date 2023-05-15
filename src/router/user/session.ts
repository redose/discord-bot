import type { WebSession } from '@redose/types';
import Joi from 'joi';
import type { ApplyRoutes } from '..';

const sessionRoutes: ApplyRoutes = (router, {
  logger,
  validator,
  knex,
  suuid,
}) => {
  router.post(
    '/user/session/:sessionId',

    validator.params(Joi.object({
      sessionId: Joi.string().required(),
    })
      .required()),

    async (req, res) => {
      const session = await knex<WebSession>('webSessions')
        .select('userId', 'loggedOutAt', 'createdAt')
        .where('id', suuid.toUUID(req.params.sessionId))
        .orderBy('createdAt', 'DESC')
        .first();

      if (!session) res.sendStatus(404);
      else if (req.session.userId !== session.userId) res.sendStatus(403);
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
};

export default sessionRoutes;
