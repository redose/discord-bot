import express from 'express';
import type { Logger } from 'winston';
import type { Knex } from 'knex';

export interface ServerDeps {
  logger: Logger;
  knex: Knex;
}

export default function createServer(deps: ServerDeps) {
  const server = express();
  return server;
}
