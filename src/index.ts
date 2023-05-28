import type { Client } from 'discord.js';
import shortUUID, { Translator } from 'short-uuid';
import type { Logger } from 'winston';
import createKnex, { Knex } from 'knex';
import knexConfig from '../knexfile';
import createLogger from './logger';
import createDiscordClient from './discord-client';
import createMailService from './mail';
import createServer from './server';
import { HTTP_PORT } from './env';

export interface BaseDeps {
  logger: Logger;
  knex: Knex;
  suuid: Translator;
  mail: Awaited<ReturnType<typeof createMailService>>;
}

export interface Deps extends BaseDeps {
  discordClient: Client;
}

async function createRedoseApi() {
  const logger = createLogger();

  function createErrorHandler(message: string) {
    return (ex: Error) => {
      logger.error(`${message}:`, ex);
      process.exit(1);
    };
  }

  const discordClientDeps = {
    logger,
    knex: createKnex(knexConfig),
    suuid: shortUUID(),
    mail: await createMailService(logger)
      .catch(createErrorHandler('Error creating mail service')),
  };

  const serverDeps = {
    ...discordClientDeps,
    discordClient: await createDiscordClient(discordClientDeps)
      .catch(createErrorHandler('Error creating Discord client')),
  };

  return new Promise<void>((resolve) => {
    const server = createServer(serverDeps);
    server.listen({ port: HTTP_PORT }, resolve);
  })
    .catch(createErrorHandler('Error creating HTTP server'));
}

createRedoseApi();
