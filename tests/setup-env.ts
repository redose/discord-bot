import knex from './mocks/knex';

afterEach(async () => {
  await knex('sessions').del();
});
