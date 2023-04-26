import express, { ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import session from 'express-session';
import createConnectSession from 'connect-session-knex';
import type { Client } from 'discord.js';
import type { BaseDeps } from '.';
import createRouter from './router';
import { NODE_ENV, SESSION_SECRET } from './env';

export interface ServerDeps extends BaseDeps {
  discordClient: Client;
}

export default function createServer(deps: ServerDeps) {
  const { logger, knex } = deps;

  const server = express();
  server.use(helmet());

  const ConnectSession = createConnectSession(session);
  server.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new ConnectSession({ knex }),
    cookie: {
      maxAge: 1200000, // 20mins
      httpOnly: true,
      secure: NODE_ENV === 'production',
    },
  }));

  server.use('/api', createRouter(deps));

  // Default error handler
  server.use(((ex, req, res, next) => {
    logger.error('Unhandled error:', ex);
    if (res.headersSent) next(ex);
    else if (NODE_ENV === 'production') res.sendStatus(500);
    else res.status(500).json({ error: ex });
  }) as ErrorRequestHandler);

  return server;
}
