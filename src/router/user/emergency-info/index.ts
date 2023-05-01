import { applyRoutes } from '../../../utils';
import emergencyInfoRoutes from './emergency-info';
import contactRoutes from './contact';

const applyEmergencyInfoRoutes = applyRoutes([
  emergencyInfoRoutes,
  contactRoutes,
]);

export default applyEmergencyInfoRoutes;
