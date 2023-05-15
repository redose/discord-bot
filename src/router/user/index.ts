import { applyRoutes } from '../../utils';
import userRoutes from './user';
import sessionRoutes from './session';
import applyEmergencyInfoRoutes from './emergency-info';

const applyUserRoutes = applyRoutes(
  userRoutes,
  sessionRoutes,
  applyEmergencyInfoRoutes,
);

export default applyUserRoutes;
