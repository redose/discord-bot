import { REST, Routes } from 'discord.js';
import commands from './src/discord-client/commands';
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_HOME_GUILD_ID } from './src/env';

const discordApi = new REST({ version: '10' }).setToken(DISCORD_CLIENT_SECRET);

Promise.all([
  discordApi.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_HOME_GUILD_ID), {
    body: Object.values(commands)
      .filter((command) => command.isGuildExclusive)
      .map((command) => command.meta.toJSON()),
  }),

  discordApi.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
    body: Object.values(commands)
      .filter((command) => !command.isGuildExclusive)
      .map((command) => command.meta.toJSON()),
  }),
])
  .then((res) => {
    console.log('Successfully registered commands:', res);
  });
