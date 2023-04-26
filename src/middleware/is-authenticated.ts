import type { RequestHandler } from 'express';

export default function isAuthenticated(inverse: boolean = false): RequestHandler {
  return (req, res, next) => {
    if ((!inverse && req.session?.user) || (inverse && !req.session?.user)) next();
    else res.sendStatus(401);
  };
}
