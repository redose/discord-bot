import type { WebSession, User } from '@redose/types';
import request from 'supertest';
import { suuid, knex, app } from './env';

beforeAll(async () => knex<User>('users').insert({ id: 'testUserId' }));
afterAll(async () => knex<User>('users').where('id', 'testUserId').del());

describe('POST /session/:id', () => {
  test('Returns 404 if ID does not exist', async () => request(app)
    .post('/session/ayyo')
    .expect(404));

  test('Returns 440 if session has expired', async () => {
    const sessionId = await knex<WebSession>('webSessions')
      .insert({
        userId: 'testUserId',
        createdAt: new Date('1990-01-01'),
      })
      .returning('id')
      .then(([{ id }]) => id);

    return request(app)
      .post(`/session/${suuid.fromUUID(sessionId)}`)
      .expect(440);
  });
});
