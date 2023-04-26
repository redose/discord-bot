import {
  Client,
  GatewayIntentBits,
  Events,
  ChatInputCommandInteraction,
} from 'discord.js';
import type { BaseDeps } from '..';
import commands from './commands';
import { DISCORD_CLIENT_SECRET } from '../env';

export default async function createDiscordClient(deps: BaseDeps) {
  const { logger } = deps;

  logger.info('Initializing Discord client...');
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
    ],
  });

  client.once(Events.ClientReady, () => {
    logger.info('Discord client ready...');
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isCommand()) {
      const command = Object.values(commands)
        .find(({ meta }) => meta.name === interaction.commandName);

      if (!command) {
        logger.error('Invalid command:', interaction);
        interaction.reply({
          ephemeral: true,
          content: `Invalid command: ${interaction.commandName}`,
        });
      } else {
        await command.execute(interaction as ChatInputCommandInteraction, { ...deps, client })
          .catch((ex) => {
            logger.error(`Error during command execution ${interaction.commandName}:`, ex);
            return interaction.reply({
              ephemeral: true,
              content: `**Unknown Error:** _${ex.message}_`,
            });
          });
      }
    }
  });

  logger.info('Discord client logging in...');
  await client.login(DISCORD_CLIENT_SECRET);
  return client;
}
