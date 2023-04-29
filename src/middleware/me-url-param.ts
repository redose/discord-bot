import type { RequestHandler } from 'express';

export default function meUrlParam(paramKey: string = 'userId'): RequestHandler {
  return (req, res, next) => {
    if (!req.session.userId) res.sendStatus(401);
    else {
      const paramValue = req.params[paramKey];
      Object.assign(res.locals, {
        userId: paramValue === 'me' ? req.session.userId : paramValue,
      });
      next();
    }
  };
}
