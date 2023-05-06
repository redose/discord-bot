import type { WebSession } from '@redose/types';
import Joi from 'joi';
import type { ApplyRoutes } from '.';

const sessionRoutes: ApplyRoutes = (router, { validator, knex, suuid }) => {
  router.post(
    '/session/:sessionId',

    validator.params(Joi.object({
      sessionId: Joi.string().required(),
    })
      .required()),

    async (req, res) => {
      const session = await knex<WebSession>('webSessions')
        .select('userId', 'loggedOutAt', 'createdAt')
        .where('id', suuid.toUUID(req.params.sessionId))
        .first();

      if (!session) res.sendStatus(404);
      else if (session.loggedOutAt) res.sendStatus(440);
      else {
        const { loggedOutAt, ...xs } = session;
        Object.assign(req.session, xs);
        res.sendStatus(200);
      }
    },
  );
};

export default sessionRoutes;
