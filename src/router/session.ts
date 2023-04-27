import type { WebSession } from '@redose/types';
import Joi from 'joi';
import type { ApplyRoutes } from '.';

const sessionRoutes: ApplyRoutes = (router, { validator, knex, suuid }) => {
  router.post(
    '/session/:id',

    validator.params(Joi.object({
      id: Joi.string().required(),
    })
      .required()),

    async (req, res) => {
      const session = await knex<WebSession>('webSessions')
        .select('userId', 'loggedOutAt', 'createdAt')
        .where('id', suuid.toUUID(req.params.id))
        .orderBy('createdAt', 'DESC')
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
