import type { UserNote } from '@redose/types';
import Joi from 'joi';
import type { ApplyRoutes } from '..';

const userNoteRoutes: ApplyRoutes = (router, { validator, knex }) => {
  const validateUserIdParam = validator.params(Joi.object({
    userId: Joi.string().required(),
  })
    .required());

  router.get('/user/:userId/notes', validateUserIdParam, async (req, res) => {
    const notes = await knex<UserNote>('userNotes')
      .where('userId', req.params.userId)
      .orderBy('createdAt');

    res.json(notes);
  });

  router.post(
    '/user/:userId/note',
    validateUserIdParam,

    validator.body(Joi.object({
      userId: Joi.string().required(),
      content: Joi.string().trim().min(2).required(),
      channelId: Joi.string(),
    })
      .required()),

    async (req, res) => {
      const newUserNote = await knex<UserNote>('userNotes')
        .insert({
          ...req.body,
          createdBy: req.params.userId,
        })
        .returning('*')
        .then(([a]) => a);

      res.status(201).json(newUserNote);
    },
  );
};

export default userNoteRoutes;
