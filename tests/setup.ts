import createKnex from 'knex';
import knexConfig from '../knexfile';

export default async function globalSetup() {
  const knex = createKnex(knexConfig);
  await knex.migrate.rollback(undefined, true);
  await knex.migrate.latest();
  // await knex.seed.run();
  await knex.destroy();
}
