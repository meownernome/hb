import { MessageFlags,  SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export class RolesCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const roles = interaction.guild?.roles.cache
      .filter(role => role.name !== '@everyone' && !role.name.startsWith('@'))
      .sort((a, b) => b.position - a.position);

    let rolesList = 'Server roles:\n';
    for (const role of roles.values()) {
      rolesList += `${role.name} (Position: ${role.position})\n`;
    }

    await interaction.reply({ content: rolesList, ephemeral: true });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('roles')
      .setDescription('List all server roles')
      .setDMPermission(false);
  }
}