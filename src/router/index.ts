import express, { Router } from 'express';
import PromiseRouter from 'express-promise-router';
import { createValidator, ExpressJoiInstance } from 'express-joi-validation';
import userRoutes from './user/user';
import sessionRoutes from './session';
import { joiErrorHandler } from '../middleware';
import type { ServerDeps } from '../server';

interface RouteDeps extends ServerDeps {
  validator: ExpressJoiInstance;
}

export type ApplyRoutes = (router: Router, deps: RouteDeps) => void;

export default function createRouter(serverDeps: ServerDeps) {
  const router = PromiseRouter();
  router.use(express.json());

  const deps = {
    ...serverDeps,
    validator: createValidator({ passError: true }),
  };

  [
    userRoutes,
    sessionRoutes,
  ]
    .forEach((applyRoutes) => applyRoutes(router, deps));

  router.use(joiErrorHandler());
  return router;
}
