import type { ApplyRoutes } from '..';
import userRoutes from './user';
import applyEmergencyInfoRoutes from './emergency-info';

const applyUserRoutes: ApplyRoutes = (router, deps) => {
  [
    userRoutes,
    applyEmergencyInfoRoutes,
  ]
    .forEach((applyRoutes) => applyRoutes(router, deps));
};

export default applyUserRoutes;
