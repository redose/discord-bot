import type { ApplyRoutes } from '.';
import { isAuthenticated } from '../middleware';

const guildRoutes: ApplyRoutes = function guildRoutes(router, { discordClient }) {
  router.get(
    '/guild',
    isAuthenticated(),

    async (req, res) => {
      const guild = await discordClient.guilds.cache
        .find(({ id }) => id === req.session.guildId);
      if (!guild) res.sendStatus(404);
      else {
        res.json({
          id: guild.id,
          name: guild.name,
          description: guild.description,
          memberCount: guild.memberCount,
          createdAt: new Date(guild.createdAt),
          owner: await guild.members.fetch(guild.ownerId).then((owner) => ({
            id: owner.id,
            displayName: owner.displayName,
            nickname: owner.nickname,
            presence: owner.presence,
            avatar: owner.avatar,
            joinedAt: owner.joinedAt && new Date(owner.joinedAt),
          })),
          roles: guild.roles.cache.map((role) => ({
            id: role.id,
            name: role.name,
            createdAt: new Date(role.createdAt),
          })),
        });
      }
    },
  );
};

export default guildRoutes;
