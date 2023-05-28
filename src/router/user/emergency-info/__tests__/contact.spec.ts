import type { User, EmergencyContact } from '@redose/types';
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

afterEach(async () => Promise.all([
  knex('webSessions').del(),
  knex('emergencyContacts').del(),
])
  .then(() => knex('users').del()));

describe('POST /user/:userId/emergency-info/contact', () => {
  test('user must be authenticated', async () => {
    await createUser('7d6db3ee-d985-462a-9f4a-c2eeea55311b');
    return request(server)
      .post('/api/user/7d6db3ee-d985-462a-9f4a-c2eeea55311b/emergency-info/contact')
      .expect(401);
  });

  test('throws 400 if neither email or contactId are provided', async () => {
    const [user] = await Promise.all([
      createUser('c11f9c4a-0268-4e81-bba8-912bde2a9a6a'),
      createUser('d5655f97-654f-429c-abeb-0a5a2ddc071f'),
    ]);
    const cookie = await createSession(server, user.id);

    return request(server)
      .post(`/api/user/${user.id}/emergency-info/contact`)
      .set('Cookie', cookie.token)
      .expect(400);
  });

  test('creates emergency contact', async () => {
    const [user, contactUser] = await Promise.all([
      createUser('03e0441a-cbdc-4373-8b98-c4cdc8520912'),
      createUser('1c8b1099-dbb4-4f74-9980-901fdeab7734'),
    ]);
    const cookie = await createSession(server, user.id);

    const contact: EmergencyContact = await request(server)
      .post(`/api/user/${user.id}/emergency-info/contact`)
      .set('Cookie', cookie.token)
      .send({
        contactId: contactUser.id,
        email: 'radman@coolpeople.net',
      })
      .expect(201)
      .then((res) => res.body);

    expect(contact).toEqual({
      id: expect.stringContaining('-'),
      userId: user.id,
      contactId: contactUser.id,
      email: 'radman@coolpeople.net',
      createdAt: expect.anything(),
    });

    return expect(
      knex<EmergencyContact>('emergencyContacts')
        .where('id', contact.id)
        .first(),
    )
      .resolves.toEqual({
        id: expect.stringContaining('-'),
        userId: user.id,
        contactId: contactUser.id,
        email: 'radman@coolpeople.net',
        createdAt: expect.anything(),
      });
  });

  test('me param', async () => {
    const [user, contactUser] = await Promise.all([
      createUser('03e0441a-cbdc-4373-8b98-c4cdc8520912'),
      createUser('1c8b1099-dbb4-4f74-9980-901fdeab7734'),
    ]);
    const cookie = await createSession(server, user.id);

    return request(server)
      .post('/api/user/me/emergency-info/contact')
      .set('Cookie', cookie.token)
      .send({
        contactId: contactUser.id,
        email: 'radman@coolpeople.net',
      })
      .expect(201);
  });
});

describe('PATCH /user/emergency-info/contact/:contactId', () => {
  let user: User;
  let contactUser: User;
  let sessionToken: string;
  let contact: EmergencyContact;

  beforeEach(async () => {
    user = await createUser('efecfe6e-5a7d-4e1a-94e4-4ebb531194f5');
    contactUser = await createUser('6c8da202-a2e2-41e0-a918-ce707c276c92');
    sessionToken = await createSession(server, user.id).then(({ token }) => token);
    contact = await request(server)
      .post(`/api/user/${user.id}/emergency-info/contact`)
      .set('Cookie', sessionToken)
      .send({
        contactId: contactUser.id,
        email: 'radman@coolpeople.net',
      })
      .expect(201)
      .then((res) => res.body);
  });

  test('user must be authenticated', async () => request(server)
    .patch(`/api/user/emergency-info/contact/${contact.id}`)
    .expect(401));

  test('updates contact', async () => {
    await expect(
      request(server)
        .patch(`/api/user/emergency-info/contact/${contact.id}`)
        .set('Cookie', sessionToken)
        .send({ email: 'notcool@aol.com' })
        .expect(200)
        .then((res) => res.body),
    )
      .resolves.toEqual({
        id: expect.stringContaining('-'),
        userId: user.id,
        contactId: contactUser.id,
        email: 'notcool@aol.com',
        createdAt: expect.anything(),
      });

    return expect(
      knex<EmergencyContact>('emergencyContacts')
        .where('id', contact.id)
        .first(),
    )
      .resolves.toEqual({
        id: expect.stringContaining('-'),
        userId: user.id,
        contactId: contactUser.id,
        email: 'notcool@aol.com',
        createdAt: expect.anything(),
      });
  });
});
