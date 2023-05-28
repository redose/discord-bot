import type { WebSession } from '@redose/types';
import request from 'supertest';
import type { Express } from 'express';
import { knex } from './mocks';

export default async function createSession(server: Express, userId: string) {
  const id = await knex<WebSession>('webSessions')
    .insert({ userId })
    .returning(['id'])
    .then(([a]) => a.id);

  const token = await request(server)
    .post(`/api/user/session/${id}`)
    .expect(200)
    .then((res) => res.headers['set-cookie']);

  return { id, token };
}
