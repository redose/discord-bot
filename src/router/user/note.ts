import type { UserNote, UserNoteTable } from '@redose/types';
import type { Channel } from 'discord.js';
import Joi from 'joi';
import { meUrlParam, isAuthenticated } from '../../middleware';
import type { ApplyRoutes } from '..';
import { handleDiscordApiResponse } from '../../utils';

const userNoteRoutes: ApplyRoutes = (router, deps) => {
  const { validator, knex, discordClient } = deps;

  const validateUserIdParam = validator.params(Joi.object({
    userId: Joi.string().required(),
  })
    .required());

  router.get(
    '/user/:userId/notes',
    isAuthenticated(),

    validateUserIdParam,

    async (req, res) => {
      const notes = await knex<UserNote>('userNotes')
        .where('userId', req.params.userId)
        .where('deleted', false)
        .orderBy('createdAt');

      res.json({ notes });
    },
  );

  router.post(
    '/user/:userId/note',
    isAuthenticated(),
    validateUserIdParam,
    meUrlParam(),

    validator.body(Joi.object({
      userId: Joi.string().required(),
      content: Joi.string().trim().min(2).required(),
      channelId: Joi.string(),
    })
      .required()),

    async (req, res) => {
      const newNote = await Promise.all([
        knex<UserNoteTable>('userNotes')
          .insert({
            ...req.body,
            createdBy: req.params.userId,
          })
          .returning('*')
          .then(([a]) => a),

        discordClient.channels.fetch(req.body.channelId)
          .then(handleDiscordApiResponse<Channel>('Channel does not exist')),

        discordClient.users.fetch(req.params.userId),
        discordClient.users.fetch(req.body.createdBy),
      ])
        .then(([
          { channelId, userId, ...userNote },
          channel,
          user,
          createdBy,
        ]) => ({
          ...userNote,
          channel,
          user,
          createdBy,
        }));

      res.status(201).json(newNote);
    },
  );

  router.delete(
    '/user/note/:noteId',
    isAuthenticated(),

    validator.params(Joi.object({
      noteId: Joi.string().required(),
    })
      .required()),

    async (req, res) => {
      await knex<UserNote>('userNotes')
        .where('id', req.params.noteId)
        .update('deleted', true);

      res.sendStatus(200);
    },
  );
};

export default userNoteRoutes;
