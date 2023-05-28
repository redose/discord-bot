import path from 'node:path';
import { config } from 'dotenv';

config({ path: process.env.NODE_ENV !== 'test' ? undefined : '.env.test' });

export const NODE_ENV = process.env.NODE_ENV as 'production' | 'development' | 'test';
export const HTTP_PORT = parseInt(process.env.HTTP_PORT!, 10);
export const LOG_PATH = path.resolve(process.env.LOG_PATH!);
export const SESSION_SECRET = process.env.SESSION_SECRET!;
export const SESSION_START_BASE_URL = process.env.SESSION_START_BASE_URL!;

export const POSTGRES_HOST = process.env.POSTGRES_HOST!;
export const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT!, 10);
export const POSTGRES_USER = process.env.POSTGRES_USER!;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD!;
export const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE!;

export const SMTP_HOST = process.env.SMTP_HOST!;
export const SMTP_PORT = parseInt(process.env.SMTP_PORT!, 10);
export const SMTP_USER = process.env.SMTP_USER!;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD!;
export const SMTP_SECURE = process.env.SMTP_SECURE === 'true';

export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
export const DISCORD_HOME_GUILD_ID = process.env.DISCORD_HOME_GUILD_ID!;
