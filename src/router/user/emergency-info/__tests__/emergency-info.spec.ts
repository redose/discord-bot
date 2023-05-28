import type { User, EmergencyInfo } from '@redose/types';
import request from 'supertest';
import type { Express } from 'express';
import type { Knex } from 'knex';
import { createServer } from '../../../../../tests/mocks';
import createUser from '../../../../../tests/create-user';
import createSession from '../../../../../tests/create-session';

let server: Express;
let knex: Knex;

beforeAll(async () => {
  const testServer = await createServer();
  server = testServer.server;
  knex = testServer.knex;
});

afterEach(async () => knex('webSessions').del()
  .then(() => knex('users').del()));

describe('GET /user/:userId/emergency-info', () => {
  test('requires authentication', async () => {
    await createUser('5903bdb4-6483-4a18-ac77-4c183e7f7c51');
    return request(server)
      .get('/api/user/5903bdb4-6483-4a18-ac77-4c183e7f7c51/emergency-info')
      .expect(401);
  });

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

describe('PATCH /user/:userId/emergency-info', () => {
  test('requires authentication', async () => {
    const user = await createUser('879428a4-3901-4db1-8b95-236096859580');
    return request(server)
      .patch(`/api/user/${user.id}/emergency-info`)
      .expect(401);
  });

  test('updates emergency info', async () => {
    const user = await createUser('6c165a12-7757-4b6b-87ad-fe6b473b6fcc');

    await expect(
      knex<User>('users')
        .where('id', user.id)
        .select('id', 'emergencyNotes', 'emergencyNotesLastUpdatedAt', 'emergencyContactPolicy')
        .first(),
    )
      .resolves.toEqual({
        id: user.id,
        emergencyNotes: null,
        emergencyNotesLastUpdatedAt: null,
        emergencyContactPolicy: 'DISABLED',
      });

    const cookie = await createSession(server, user.id);
    const emergencyInfo: EmergencyInfo = await request(server)
      .patch(`/api/user/${user.id}/emergency-info`)
      .set('Cookie', cookie.token)
      .send({
        notes: 'AYYO CALL MUM',
        contactPolicy: 'WHITELIST_ONLY',
      })
      .expect(200)
      .then((res) => res.body);

    expect(emergencyInfo).toEqual({
      notes: 'AYYO CALL MUM',
      notesLastUpdatedAt: expect.anything(),
      contactPolicy: 'WHITELIST_ONLY',
    });

    await expect(
      knex<User>('users')
        .where('id', user.id)
        .select('id', 'emergencyNotes', 'emergencyNotesLastUpdatedAt', 'emergencyContactPolicy')
        .first(),
    )
      .resolves.toEqual({
        id: user.id,
        emergencyNotes: 'AYYO CALL MUM',
        emergencyNotesLastUpdatedAt: expect.anything(),
        emergencyContactPolicy: 'WHITELIST_ONLY',
      });
  });

  test('works with "me" param', async () => {
    const user = await createUser('f111bf06-dca7-4575-a4ad-84d5eb58c536');
    const cookie = await createSession(server, user.id);

    const emergencyInfo: EmergencyInfo = await request(server)
      .patch('/api/user/me/emergency-info')
      .set('Cookie', cookie.token)
      .send({
        notes: 'CLEAR CACHE AND TRY AGAIN',
        contactPolicy: 'WHITELIST_AND_STAFF',
      })
      .expect(200)
      .then((res) => res.body);

    expect(emergencyInfo).toEqual({
      notes: 'CLEAR CACHE AND TRY AGAIN',
      notesLastUpdatedAt: expect.anything(),
      contactPolicy: 'WHITELIST_AND_STAFF',
    });

    const lastUpdated = new Date(emergencyInfo.notesLastUpdatedAt!).getTime();
    expect(!Number.isNaN(lastUpdated)).toBe(true);
    expect(lastUpdated).toBeGreaterThan(Date.now() - 100);
  });
});
