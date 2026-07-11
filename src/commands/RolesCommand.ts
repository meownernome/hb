import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export class RolesCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.memberPermissions?.has('ManageRoles')) {
      await interaction.reply({ content: '❌ You need the Manage Roles permission.', ephemeral: true });
      return;
    }

    const roles = interaction.guild?.roles.cache
      .filter(r => r.name !== '@everyone' && !r.managed)
      .sort((a, b) => b.position - a.position);

    if (!roles || roles.size === 0) {
      await interaction.reply({ content: 'No roles found.', ephemeral: true });
      return;
    }

    const staffRoles = roles.filter(r => /^(👑|⚡|🌐|🛡️|🔰|⚔️|💎|🔨|🎬)/.test(r.name));
    const tierRoles = roles.filter(r => /T[1-5]$/.test(r.name));
    const otherRoles = roles.filter(r => !/^(👑|⚡|🌐|🛡️|🔰|⚔️|💎|🔨|🎬)/.test(r.name) && !/T[1-5]$/.test(r.name));

    const embed = new EmbedBuilder()
      .setTitle('🎨 Server Roles')
      .setColor(0x3498DB)
      .setTimestamp();

    if (staffRoles.size > 0) {
      embed.addFields({ name: '🛡️ Staff Roles', value: staffRoles.map(r => `${r.name} (${r.members.size} members)`).join('\n'), inline: false });
    }
    if (tierRoles.size > 0) {
      embed.addFields({ name: '⚔️ Tier Roles', value: tierRoles.map(r => `${r.name} (${r.members.size} members)`).join('\n'), inline: false });
    }
    if (otherRoles.size > 0) {
      embed.addFields({ name: '📌 Other Roles', value: otherRoles.map(r => `${r.name} (${r.members.size} members)`).join('\n'), inline: false });
    }

    embed.setFooter({ text: `Total: ${roles.size} roles` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('roles')
      .setDescription('View all server roles (Admin only)')
      .setDMPermission(false);
  }
}
