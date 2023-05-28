import type { RequestHandler } from 'express';

interface Options {
  key?: string;
  match?: string;
}

export default function meUrlParam(options?: Options): RequestHandler {
  return (req, res, next) => {
    const value = req.params[options?.key || 'userId'];
    Object.assign(res.locals, {
      userId: value === (options?.match || 'me') ? req.session.userId : value,
    });
    next();
  };
}
