import { applyRoutes } from '../../utils';
// import userRoutes from './user';
import sessionRoutes from '../session';
import noteRoutes from './note';
import applyEmergencyInfoRoutes from './emergency-info';

const applyUserRoutes = applyRoutes(
  // userRoutes,
  noteRoutes,
  sessionRoutes,
  applyEmergencyInfoRoutes,
);

export default applyUserRoutes;
