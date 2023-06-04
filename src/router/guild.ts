import Joi from 'joi';
import type { ApplyRoutes } from '.';
import { isAuthenticated } from '../middleware';

const guildRoutes: ApplyRoutes = function guildRoutes(router, { validator, discordClient }) {
  router.get(
    '/guild/:guildId/users',
    isAuthenticated(),

    validator.query(Joi.object({
      username: Joi.string().trim(),
    })
      .required()),

    async (req, res) => {
      const guild = await discordClient.guilds.fetch(req.session.guildId!);
      const members = await guild.members.search({
        query: req.query.username!.toString(),
      });

      res.json({
        guildMembers: members.values(),
      });
    },
  );
};

export default guildRoutes;
