import type { User, WebSession } from '@redose/types';
import request from 'supertest';
import type { Express } from 'express';
import type { Client } from 'discord.js';
import type { Logger } from 'winston';
import shortUUID, { Translator } from 'short-uuid';
import createKnex, { Knex } from 'knex';
import createMail from '../../src/mail';
import knexConfig from '../../knexfile';
import createLogger from '../../src/logger';
import createDiscordClient from '../../src/discord-client';
import createServer from '../../src/server';
import { mockUuid } from '../utils';

jest.mock('../../src/discord-client');

let logger: Logger;
let suuid: Translator;
let mail: Awaited<ReturnType<typeof createMail>>;
let knex: Knex;
let discordClient: Client;
let server: Express;
let testUser: User;

beforeAll(async () => {
  logger = createLogger();
  suuid = shortUUID();
  knex = createKnex(knexConfig);
  mail = await createMail(logger);

  discordClient = await createDiscordClient({
    logger,
    suuid,
    knex,
    mail,
  });

  server = createServer({
    logger,
    suuid,
    knex,
    mail,
    discordClient,
  });

  testUser = await knex<User>('users')
    .insert({ id: 'firstMockUserId' })
    .returning('*')
    .then(([a]) => a);
});

afterAll(async () => Promise.all([
  mail.close(),
  Promise.all(['users', 'webSessions'].map((tableName) => knex(tableName).del()))
    .then(() => knex.destroy()),
]));

describe('POST /user/session/:sessionId', () => {
  let sessionId: string;

  test('returns 404 if using session that does not exist', async () => request(server)
    .post(`/api/user/session/${mockUuid}`)
    .expect(404));

  test('succesfully authenticates a session', async () => {
    sessionId = await knex<WebSession>('webSessions')
      .insert({ userId: testUser.id })
      .returning(['id'])
      .then(([{ id }]) => id);

    return request(server)
      .post(`/api/user/session/${sessionId}`)
      .expect(200);
  });

  test('return 440 when using an expired session', async () => {
    await knex<WebSession>('webSessions')
      .where('id', sessionId)
      .update('loggedOutAt', new Date());

    return request(server)
      .post(`/api/user/session/${sessionId}`)
      .expect(440);
  });
});
