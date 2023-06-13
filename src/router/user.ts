import type { WebSession } from '@redose/types';
import Joi from 'joi';
import { DateTime } from 'luxon';
import type { ApplyRoutes } from '.';

const userRoutes: ApplyRoutes = (router, { validator, knex, suuid }) => {
  router.post(
    '/user/:userId/session/:sessionId',

    validator.params(Joi.object({
      userId: Joi.string().required(),
      sessionId: Joi.string().required(),
    })
      .required()),

    async (req, res) => {
      const session = await knex<WebSession>('webSessions')
        .where('userId', req.params.userId)
        .where('id', suuid.toUUID(req.params.id))
        .where('createdAt', '>=', DateTime.now().plus({ days: 3 }).toJSDate())
        .orderBy('createdAt', 'DESC')
        .first();

      if (!session) res.sendStatus(404);
      else if (session.loggedOutAt) res.sendStatus(440);
      else res.json({ session });
    },
  );
};

export default userRoutes;
