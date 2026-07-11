import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';

export class HelpCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const helpText = `**HARVAL MC Bot Commands**\n\n**Administrative Commands:**\n• \`/all\` - Set up entire Discord server\n• \`/cleanup\` - Remove HARVAL content (owner only)\n• \`/setup\` - Re-run server setup\n• \`/roles\` - List all roles\n• \`/channels\` - List all channels\n• \`/rules\` - View server rules\n• \`/faq\` - View FAQ\n• \`/logs\` - Check bot logs\n• \`/rebuild\` - Rebuild server structure\n\n**Verification Commands:**\n• \`/verify\` - Verify Minecraft username\n• \`/profile\` - View your profile\n• \`/mytiers\` - View your PvP tiers\n\n**Utility Commands:**\n• \`/ip\` - Get server IP\n• \`/leaderboard\` - View leaderboards\n• \`/ping\` - Check bot latency\n\n**Note:** PvP testing commands and moderator commands are implemented in additional modules.\n\n**Special Features:**\n• Complete automated server setup with ONE command\n• PvP tier testing system with tickets\n• Minecraft account verification\n• 15+ PvP modes with tier system\n• Professional staff hierarchy\n• Full audit logs and statistics\n• Modern interface with buttons and modals`;

    await interaction.reply({ content: helpText, ephemeral: true });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('help')
      .setDescription('Show help and available commands')
      .setDMPermission(false);
  }
}
