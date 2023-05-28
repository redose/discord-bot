import type { User, EmergencyInfo } from '@redose/types';
import request from 'supertest';
import type { Express } from 'express';
import type { Knex } from 'knex';
import { createServer } from '../../../../../tests/mocks';
import createUser from '../../../../../tests/create-user';
import createSession from '../../../../../tests/create-session';

let server: Express;
let knex: Knex;
let defaultTestUser: User;

beforeAll(async () => {
  const testServer = await createServer();
  server = testServer.server;
  knex = testServer.knex;
  defaultTestUser = await createUser();
});

afterEach(async () => knex('webSessions').del()
  .then(() => knex('users').del()));

describe('GET /user/:userId/emergency-info', () => {
  test('requires authentication', async () => request(server)
    .get(`/api/user/${defaultTestUser.id}/emergency-info`)
    .expect(401));

  test('resolves emergency info', async () => {
    const user = await createUser('6e38ca11-a60c-4c64-8d9b-9c6dafc58c93');
    const cookie = await createSession(server, user.id);

    const emergencyInfo = await request(server)
      .get(`/api/user/${user.id}/emergency-info`)
      .set('Cookie', cookie.token)
      .expect(200)
      .then((res) => res.body);

    expect(emergencyInfo).toEqual({
      userId: '6e38ca11-a60c-4c64-8d9b-9c6dafc58c93',
      notes: null,
      notesLastUpdatedAt: null,
      contactPolicy: 'DISABLED',
      contacts: [],
    });
  });

  test('returns 404 if user does not exist', async () => {
    const user = await createUser('6e38ca11-a60c-4c64-8d9b-9c6dafc58c93');
    const cookie = await createSession(server, user.id);

    return request(server)
      .get('/api/user/a0767662-7d67-4398-9a45-5899731991e1/emergency-info')
      .set('Cookie', cookie.token)
      .expect(404);
  });

  test('returns 401 status code if info does not belong to user', async () => {
    const owningUser = await createUser('6e38ca11-a60c-4c64-8d9b-9c6dafc58c93');
    const currentUser = await createUser('6e24afe7-2fd7-4daa-b815-2a328601ba50');
    const cookie = await createSession(server, currentUser.id);

    return request(server)
      .get(`/api/user/${owningUser.id}/emergency-info`)
      .set('Cookie', cookie.token)
      .expect(403);
  });
});
