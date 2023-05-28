import type { RequestHandler } from 'express';

export default function isAuthenticated(inverse: boolean = false): RequestHandler {
  return (req, res, next) => {
    if ((!inverse && req.session?.userId) || (inverse && !req.session?.userId)) next();
    else res.sendStatus(inverse ? 403 : 401);
  };
}
