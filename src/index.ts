import type { Client } from 'discord.js';
import shortUUID, { Translator } from 'short-uuid';
import type { Logger } from 'winston';
import createKnex, { Knex } from 'knex';
import knexConfig from '../knexfile';
import createLogger from './logger';
import createDiscordClient from './discord-client';
import createServer from './server';
import { HTTP_PORT } from './env';

export interface BaseDeps {
  logger: Logger;
  knex: Knex;
  suuid: Translator;
}

export interface Deps extends BaseDeps {
  discordClient: Client;
}

const baseDeps = {
  logger: createLogger(),
  suuid: shortUUID(),
  knex: createKnex(knexConfig),
};

createDiscordClient(baseDeps)
  .then((discordClient) => {
    const server = createServer({ ...baseDeps, discordClient });

    return new Promise((resolve) => {
      server.listen({ port: HTTP_PORT }, () => {
        baseDeps.logger.info(`Server listening on http://localhost:${HTTP_PORT}/`);
        resolve(server);
      });
    });
  });
