import type { User } from '@redose/types';
import type { Knex } from 'knex';

export default async function ensureUserExists(knex: Knex | Knex.Transaction, userId: string) {
  const record = await knex<User>('users')
    .where('id', userId)
    .first();

  return record ? null : knex<User>('users').insert({ id: userId });
}
