import type { User } from '@redose/types';
import { knex, mockUuid } from './mocks';

export default async function createUser(userId = mockUuid) {
  return knex<User>('users')
    .insert({ id: userId })
    .returning('*')
    .then(([a]) => a);
}
