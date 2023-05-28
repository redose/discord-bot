import type { Express } from 'express';
import type { Client } from 'discord.js';
import type { Logger } from 'winston';
import type { Knex } from 'knex';
import shortUUID, { Translator } from 'short-uuid';
import knex from './knex';
import createLogger from '../../src/logger';
import createMail from '../../src/mail';
import createDiscordClient from '../../src/discord-client';
import createServer from '../../src/server';

jest.mock('../../src/logger');
jest.mock('../../src/discord-client');

interface MockOverrides {
  logger: Logger;
  suuid: Translator;
  mail: Awaited<ReturnType<typeof createMail>>;
  discordClient: Client;
  server: Express;
}

export default async function createMockServer({
  discordClient: discordClientOverride,
  server: serverOverride,
  ...baseDepsOverrides
}: Partial<MockOverrides> = {}) {
  const logger = createLogger();

  const baseDeps = {
    logger,
    knex,
    suuid: shortUUID(),
    mail: await createMail(logger),
    ...baseDepsOverrides,
  };

  const discordClient = discordClientOverride || await createDiscordClient(baseDeps);

  const server = serverOverride || createServer({
    ...baseDeps,
    discordClient,
  });

  return {
    ...baseDeps,
    discordClient,
    server,
  };
}
