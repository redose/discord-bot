import type { Express } from 'express';
import createKnex from 'knex';
import shortUUID from 'short-uuid';
import knexConfig from '../knexfile';
import createLogger from '../src/logger';
import createMailService from '../src/mail';
import createDiscordClient from '../src/discord-client';
import createServer from '../src/server';

jest.mock('../src/discord-client');

async function createTestServer() {
  const logger = createLogger();

  const discordClientDeps = {
    logger,
    knex: createKnex(knexConfig),
    suuid: shortUUID(),
    mail: await createMailService(logger),
  };

  const deps = {
    ...discordClientDeps,
    discordClient: await createDiscordClient(discordClientDeps),
  };

  const server = createServer(deps);

  return {
    ...deps,
    server,
    async destroy() {
      await deps.knex.destroy();
      deps.logger.close();
    },
  };
}

export type TestServer = Awaited<ReturnType<typeof createTestServer>>;
