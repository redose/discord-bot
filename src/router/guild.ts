import type { ApplyRoutes } from '.';
import { isAuthenticated } from '../middleware';
import type { GuildsTable } from '../tables';

const guildRoutes: ApplyRoutes = function guildRoutes(router, { knex, discordClient }) {
  router.get(
    '/guild',
    isAuthenticated(),

    async (req, res) => {
      const guild = await discordClient.guilds.cache
        .find(({ id }) => id === req.session.guildId);
      if (!guild) res.sendStatus(404);
      else {
        const [owner, record] = await Promise.all([
          guild.members.fetch(guild.ownerId).then((ownerRes) => ({
            id: ownerRes.id,
            displayName: ownerRes.displayName,
            nickname: ownerRes.nickname,
            presence: ownerRes.presence,
            avatar: ownerRes.avatar,
            joinedAt: ownerRes.joinedAt && new Date(ownerRes.joinedAt),
          })),
        ]);

        res.json({
          id: guild.id,
          name: guild.name,
          description: guild.description,
          memberCount: guild.memberCount,
          createdAt: new Date(guild.createdAt),
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
