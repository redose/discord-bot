import type { RequestHandler } from 'express';
import type { Deps } from '..';

export default function authorize(deps: Deps): RequestHandler {
  const { discordClient } = deps;

  return async (req, res, next) => {
    if (!req.session.userId) {
      throw new Error('authorize middleware should be used after isAuthenticated');
    }
    Object.assign(res.locals, {
      user: await discordClient.users.fetch(req.session.userId),
    });
    next();
  };
}
