import type { ErrorRequestHandler } from 'express';

export default function joiErrorHandler(): ErrorRequestHandler {
  return (ex, req, res, next) => {
    if (!ex?.error?.isJoi) next(ex);
    else {
      res.status(400).json({
        type: ex.type,
        message: ex.error.toString(),
      });
    }
  };
}
