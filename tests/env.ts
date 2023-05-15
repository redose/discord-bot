import type { Server } from 'node:http';
import type { Express } from 'express';
import type { Client } from 'discord.js';
import type { Knex } from 'knex';
import type { Logger } from 'winston';
import type { Translator } from 'short-uuid';

export let app: Express;
export let server: Server;
export let knex: Knex;
export let logger: Logger;
export let discordClient: Client;
export let suuid: Translator;
