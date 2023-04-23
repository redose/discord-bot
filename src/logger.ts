import path from 'node:path';
import winston from 'winston';
import { LOG_PATH, NODE_ENV } from './env';

export default function createLogger() {
  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.simple(),
    ),
    transports: [
      new winston.transports.File({
        filename: path.join(LOG_PATH, 'error.log'),
        level: 'error',
      }),
      new winston.transports.File({
        filename: path.join(LOG_PATH, 'combined.log'),
      }),
    ],
  });

  if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }

  return logger;
}
