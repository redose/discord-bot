import type { ApplyRoutes } from '..';

const userRoutes: ApplyRoutes = (router, { validator, knex }) => {
 console.log(knex, validator);
};

export default userRoutes;
