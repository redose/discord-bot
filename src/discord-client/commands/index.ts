import type { Client, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { BaseDeps } from '../..';
import session from './session';

interface CommandDeps extends BaseDeps {
  client: Client;
}

export interface Command {
  isGuildExclusive?: boolean;
  meta: SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction, deps: CommandDeps): Promise<void>;
}

const commands: { [name: string]: Command } = {
  session,
};

export default commands;
