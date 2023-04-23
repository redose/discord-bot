import path from 'node:path';
import { config } from 'dotenv';

config();

export const NODE_ENV = process.env.NODE_ENV as 'production' | 'development' | 'test';
export const HTTP_PORT = parseInt(process.env.HTTP_PORT!, 10);
export const LOG_PATH = path.resolve(process.env.LOG_PATH!);

export const POSTGRES_HOST = process.env.POSTGRES_HOST!;
export const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT!, 10);
export const POSTGRES_USER = process.env.POSTGRES_USER!;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD!;
export const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE!;

export const EMAIL_FROM = process.env.EMAIL_FROM!;
export const SMTP_HOST = process.env.SMTP_HOST!;
export const SMTP_PORT = parseInt(process.env.SMTP_PORT!, 10);
export const SMTP_USER = process.env.SMTP_USER!;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD!;
