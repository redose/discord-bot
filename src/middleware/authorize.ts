import type { RequestHandler } from 'express';
import type { Deps } from '..';

type PermissionRoles = 'Admin' | 'Moderator' | 'Responder';

export default function authorize({ discordClient }: Deps, roleIds: string[]): RequestHandler {
  return async (req, res, next) => {
    next();
  };
}
