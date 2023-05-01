import { ApplyRoutes } from '../router';

export default function applyRoutes(routeApplicators: ApplyRoutes[]): ApplyRoutes {
  return (...args) => routeApplicators.forEach((routes) => routes(...args));
}
