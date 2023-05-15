import type { ApplyRoutes } from '../router';

export default function applyRoutes(...applicators: ApplyRoutes[]): ApplyRoutes {
  return (...args) => applicators.forEach((routes) => routes(...args));
}
