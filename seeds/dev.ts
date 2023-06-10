import type { User } from '@pharm-aware/types';
import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('emergencyContacts').del();
  await knex('users').del();

  const USER_IDS = {
    SevenCats: '572659868930932737',
    RTChris: '931311002702737418',
  };

  await knex<User>('users').insert([
    {
      id: USER_IDS.SevenCats,
      emergencyNotes: 'Blow gently on an opal after whispering sweet nothings into its ears',
      emergencyNotesLastUpdatedAt: new Date('2023-05-05'),
      emergencyContactPolicy: 'WHITELIST_ONLY',
    },
    {
      id: USER_IDS.RTChris,
    },
  ]);

  await knex('emergencyContacts').insert([
    {
      userId: USER_IDS.SevenCats,
      contactId: USER_IDS.RTChris,
    },
  ]);
}
