import createKnex from 'knex';
import knexConfig from '../knexfile';
import createLogger from './logger';
import createServer from './server';
import { HTTP_PORT } from './env';

const logger = createLogger();

const server = createServer({
  logger,
  knex: createKnex(knexConfig),
});

server.listen({ port: HTTP_PORT }, () => {
  logger.info(`redose API started on port ${HTTP_PORT}`);
});
