import createKnex from 'knex';
import knexConfig from '../knexfile';

export default async function globalTeardown() {
  const knex = createKnex(knexConfig);
  await knex.migrate.rollback(undefined, true);
  await knex.destroy();
}
