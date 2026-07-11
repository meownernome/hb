use strict;

import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ServerSetup } from '../ServerSetup';

export class RolesCommand {
  constructor(private serverSetup: ServerSetup) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const roles = interaction.guild?.roles.cache
      .filter(role => role.name !== '@everyone' && !role.name.startsWith('@'))
      .sort((a, b) => b.position - a.position);

    let rolesList = 'Server roles:\n';
    for (const role of roles.values()) {
      rolesList += `${role.name} (Position: ${role.position})\n`;
    }

    await interaction.reply({
      content: rolesList,
      flags: 4194304
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('roles')
      .setDescription('List all server roles')
      .setDMPermission(false);
  }
}