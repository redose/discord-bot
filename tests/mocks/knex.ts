import createKnex from 'knex';
import knexConfig from '../../knexfile';

const knex = createKnex(knexConfig);

export default knex;
