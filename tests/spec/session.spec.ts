import type { User, WebSession } from '@redose/types';
import request from 'supertest';
import type { Express } from 'express';
import knex from '../mocks/knex';
import createMail from '../../src/mail';
import { createServer, mockUuid } from '../mocks';

let mail: Awaited<ReturnType<typeof createMail>>;
let server: Express;
let testUser: User;

beforeAll(async () => {
  const testServer = await createServer();
  mail = testServer.mail;
  server = testServer.server;

  testUser = await knex<User>('users')
    .insert({ id: 'firstMockUserId' })
    .returning('*')
    .then(([a]) => a);
});

afterAll(async () => Promise.all([
  mail.close(),
  Promise.all(['users', 'webSessions'].map((tableName) => knex(tableName).del())),
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

  test('returns 403 if user is already logged in', async () => {
    const cookie = await request(server)
      .post(`/api/user/session/${sessionId}`)
      .expect(200)
      .then((res): string => res.headers['set-cookie']);

    return request(server)
      .post(`/api/user/session/${sessionId}`)
      .set('cookie', cookie)
      .expect(403);
  });
});

describe('POST /user/session/:sessionId/logout', () => {
  let sessionId: string;
  const now = new Date('2018-05-05');

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(now);

    sessionId = await knex<WebSession>('webSessions')
      .insert({ userId: testUser.id })
      .returning(['id'])
      .then(([{ id }]) => id);
  });

  test('returns 401 if not logged in', async () => {
    await request(server)
      .post(`/api/user/session/${sessionId}/logout`)
      .expect(401);

    return expect(
      knex<WebSession>('webSessions')
        .where('id', sessionId)
        .select('loggedOutAt')
        .first()
        .then((row) => row?.loggedOutAt),
    )
      .resolves.toBeNull();
  });

  test('returns 200 if user is logged in and update session with date', async () => {
    const cookie = await request(server)
      .post(`/api/user/session/${sessionId}`)
      .expect(200)
      .then((res) => res.headers['set-cookie']);

    await expect(
      knex<WebSession>('webSessions')
        .where('id', sessionId)
        .select('loggedOutAt')
        .first()
        .then((row) => row?.loggedOutAt),
    )
      .resolves.toBeNull();

    await request(server)
      .post(`/api/user/session/${sessionId}/logout`)
      .set('cookie', cookie)
      .expect(200);

    await expect(
      knex<WebSession>('webSessions')
        .where('id', sessionId)
        .select('loggedOutAt')
        .first()
        .then((row) => row?.loggedOutAt),
    )
      .resolves.toEqual(now);

    return request(server)
      .post(`/api/user/session/${sessionId}`)
      .set('cookie', cookie)
      .expect(440);
  });
});
