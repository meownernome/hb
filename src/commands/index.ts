use strict;

import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionString } from 'discord.js';
import { ServerSetupManager } from './ServerSetupManager';

export class AllCommand {
  private serverSetupManager: ServerSetupManager;

  constructor() {
    this.serverSetupManager = ServerSetupManager.getInstance();
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();n
    try {
      const serverSetup = this.serverSetupManager.getServerSetup(interaction.guild!);
      await serverSetup.setupAll();
      await interaction.editReply({
        content: '✅ Server setup completed successfully!',
        flags: 4194304
      });
    } catch (error) {
      await interaction.editReply({
        content: '❌ Server setup failed. Please check the logs.',
        flags: 4194304
      });
    }
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('all')
      .setDescription('Set up the entire Discord server automatically')
      .setDMPermission(false);
  }
}

export class CleanupCommand {
  private serverSetupManager: ServerSetupManager;

  constructor() {
    this.serverSetupManager = ServerSetupManager.getInstance();
  }

  public async execute(interaction: any): Promise<void> {
    if (interaction.user.id !== process.env.BOT_OWNER_ID) {
      await interaction.reply({ content: '❌ Only the bot owner can use this command.', ephemeral: true });
      return;
    }

    const confirmMessage = await interaction.reply({
      content: '⚠️ Are you sure? Type `yes` to confirm or `no` to cancel cleanup. This cannot be undone.',
      fetchReply: true
    });

    const filter = (m: any) => m.author.id === interaction.user.id && (m.content.toLowerCase() === 'yes' || m.content.toLowerCase() === 'no');
    const collector = interaction.channel?.createMessageCollector({ filter, max: 1, time: 30000 });

    collector?.on('collect', async (response) => {
      if (response.content.toLowerCase() === 'yes') {
        await interaction.editReply({ content: '🔄 Cleaning up server...' });
        const serverSetup = this.serverSetupManager.getServerSetup(interaction.guild!);
        await serverSetup.cleanup(interaction.guild!);
        await interaction.editReply({ content: '✅ Cleanup completed successfully!' });
      } else {
        await interaction.editReply({ content: '❌ Cleanup cancelled.' });
      }
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('cleanup')
      .setDescription('Remove all HARVAL-created channels and roles')
      .setDMPermission(false);
  }
}

export class SetupCommand {
  private serverSetupManager: ServerSetupManager;

  constructor() {
    this.serverSetupManager = ServerSetupManager.getInstance();
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: 4194304 });

    try {
      const serverSetup = this.serverSetupManager.getServerSetup(interaction.guild!);
      await serverSetup.setupAll();
      await interaction.editReply({
        content: '✅ Server setup completed successfully!',
        flags: 4194304
      });
    } catch (error) {
      await interaction.editReply({
        content: '❌ Server setup failed. Please check the logs.',
        flags: 4194304
      });
    }
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('setup')
      .setDescription('Re-run server setup')
      .setDMPermission(false);
  }
}

export class RolesCommand {
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

export class ChannelsCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channels = interaction.guild?.channels.cache
      .filter(channel => channel.type !== ChannelType.GuildCategory)
      .sort((a, b) => {
        if (a.parentId === null && b.parentId !== null) return -1;
        if (a.parentId !== null && b.parentId === null) return 1;
        return a.position - b.position;
      });

    let channelsList = 'Server channels:\n';
    let currentParent = '';
    for (const channel of channels.values()) {
      if (channel.parent?.name !== currentParent) {
        currentParent = channel.parent?.name || '(No category)';
        channelsList += `\n**${currentParent}**:\n`;
      }
      channelsList += `• ${channel.name} (${channel.type})\n`;
    }

    await interaction.reply({
      content: channelsList,
      flags: 4194304
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('channels')
      .setDescription('List all server channels')
      .setDMPermission(false);
  }
}

export class VerificationCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: 4194304 });

    const minecraftUsername = interaction.options.getString('minecraft-username');
    if (!minecraftUsername) {
      await interaction.editReply({
        content: '❌ Please provide your Minecraft username.'
      });
      return;
    }

    await interaction.editReply({
      content: `✅ Verification requested for Minecraft username: ${minecraftUsername}\nPlease check the verification channel for instructions.`
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('verify')
      .setDescription('Verify your Minecraft username')
      .addStringOption(option =>
        option.setName('minecraft-username')
          .setDescription('Your Minecraft username')
          .setRequired(true)
      )
      .setDMPermission(false);
  }
}

export class ProfileCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const minecraftUsername = await this.getMinecraftUsernameFromUser(interaction.user.id);
    const currentTiers = await this.getCurrentTiers(interaction.user.id);
    const tierHistory = await this.getTierHistory(interaction.user.id);

    let profileContent = `**Profile for ${interaction.user.username}**\n\n`;

    if (minecraftUsername) {
      profileContent += `**Minecraft Username:** ${minecraftUsername}\n`;
      profileContent += `**Verified:** ✅\n\n`;
    } else {
      profileContent += `**Minecraft Username:** Not verified\n\n`;
    }

    profileContent += `**Current Tiers:**\n`;
    for (const mode in currentTiers) {
      profileContent += `  • ${mode}: ${currentTiers[mode] || 'None'}\n`;
    }

    profileContent += `\n**Tier History:**\n`;
    for (const test of tierHistory) {
      profileContent += `  • ${test.pvpMode} - ${test.tier} (${new Date(test.timestamp).toLocaleDateString()})\n`;
    }

    profileContent += `\n**Tests Completed:** ${tierHistory.length}\n`;
    profileContent += `**Member Since:** ${new Date(interaction.user.createdTimestamp).toLocaleDateString()}\n`;

    await interaction.reply({
      content: profileContent,
      flags: 4194304
    });
  }

  private async getMinecraftUsernameFromUser(discordUserId: string): Promise<string | null> {
    return null;
  }

  private async getCurrentTiers(discordUserId: string): Promise<Record<string, string>> {
    return {};
  }

  private async getTierHistory(discordUserId: string): Promise<any[]> {
    return [];
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('profile')
      .setDescription('View your profile and tier information')
      .setDMPermission(false);
  }
}

export class IPCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = {
      title: '🎮 HARVAL MC Server IP',
      description: '**Server IP:** `play.harvalmc.fun`',
      color: 0x00FF00,
      fields: [
        { name: 'Status', value: '🟢 Online', inline: true },
        { name: 'Type', value: 'PvP Tier Testing', inline: true },
        { name: 'Modes', value: '15+ PvP modes available', inline: true }
      ],
      footer: { text: 'Join us for PvP tier testing!' },
      timestamp: new Date().toISOString()
    };

    await interaction.reply({
      content: JSON.stringify(embed),
      flags: 4194304
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('ip')
      .setDescription('Get the server IP address')
      .setDMPermission(false);
  }
}

export class RulesCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const rules = [
      '1. Be respectful and follow the Discord Code of Conduct.',
      '2. No cheating, hacking, or exploiting.',
      '3. Respect all staff members and their decisions.',
      '4. No excessive spam or self-promotion.',
      '5. Use appropriate channel names and topics.',
      '6. Report any issues to staff immediately.',
      '7. Follow Minecraft game rules during tests.',
      '8. No harassment or discrimination.',
      '9. Keep channels clean and professional.',
      '10. Obey all Discord and Minecraft server rules.',
      '11. Use provided PvP arenas only.',
      '12. Complete tests fairly and honestly.',
      '13. No NSFW or inappropriate content.',
      '14. Respect server timing and schedule.',
      '15. Have fun and enjoy PvP testing!',
    ];

    let rulesContent = '**Server Rules:**\n\n';
    for (const rule of rules) {
      rulesContent += `${rule}\n`;
    }

    await interaction.reply({
      content: rulesContent,
      flags: 4194304
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('rules')
      .setDescription('View server rules')
      .setDMPermission(false);
  }
}

export class FAQCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const faqs = [
      {
        question: 'How to verify your Minecraft account',
        answer: 'Use `/verify <minecraft_username>` to link your Discord account to your Minecraft account.'
      },
      {
        question: 'How to request a tier test',
        answer: 'Visit the #create-ticket channel and provide your requested PvP mode.'
      },
      {
        question: 'Retesting requests',
        answer: 'Request retesting using the #retest-request channel or ask your tester.'
      },
      {
        question: 'Appeals process',
        answer: 'Submit appeals in the #appeal channel with all relevant details.'
      },
      {
        question: 'Server IP',
        answer: 'The server IP is `play.harvalmc.fun`'
      },
      {
        question: 'Staff information',
        answer: 'Staff roles are displayed in the #staff channel. Important staff can be found on the staff list.'
      }
    ];

    let faqContent = '**Frequently Asked Questions:**\n\n';
    for (const faq of faqs) {
      faqContent += `**${faq.question}**\n${faq.answer}\n\n`;
    }

    await interaction.reply({
      content: faqContent,
      flags: 4194304
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('faq')
      .setDescription('View frequently asked questions')
      .setDMPermission(false);
  }
}

export class LeaderboardCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = {
      title: '🏆 HARVAL MC Leaderboards',
      description: 'Top players and testers',
      color: 0xFFD700,
      fields: [
        { name: 'Most Active Players', value: '📊 Coming soon...', inline: true },
        { name: 'Most Tests Completed', value: '🏅 Coming soon...', inline: true },
        { name: 'Highest Rated Testers', value: '⭐ Coming soon...', inline: true },
        { name: 'Highest Ranked Players', value: '🎯 Coming soon...', inline: true },
        { name: 'Most Requested PvP Modes', value: '🎮 Coming soon...', inline: true }
      ],
      footer: { text: 'Leaderboards are updated regularly' },
      timestamp: new Date().toISOString()
    };

    await interaction.reply({
      content: JSON.stringify(embed),
      flags: 4194304
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('View server leaderboards')
      .setDMPermission(false);
  }
}

export class PingCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const latency = Date.now() - interaction.createdTimestamp;

    await interaction.reply({
      content: `🏓 Pong! Latency: ${latency}ms`,
      flags: 4194304
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Check bot latency')
      .setDMPermission(false);
  }
}

export class HelpCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const helpText = `**HARVAL MC Bot Commands**\n\n**Administrative Commands:**\n• \`/all\` - Set up entire Discord server\n• \`/cleanup\` - Remove HARVAL content (owner only)\n• \`/setup\` - Re-run server setup\n• \`/roles\` - List all roles\n• \`/channels\` - List all channels\n• \`/panels\` - List application panels\n• \`/rules\` - View server rules\n• \`/faq\` - View FAQ\n• \`/logs\` - Check bot logs\n• \`/rebuild\` - Rebuild server structure\n\n**Verification Commands:**\n• \`/verify\` - Verify Minecraft username\n• \`/profile\` - View your profile\n• \`/mytiers\` - View your PvP tiers\n\n**Utility Commands:**\n• \`/ip\` - Get server IP\n• \`/leaderboard\` - View leaderboards\n• \`/ping\` - Check bot latency\n\n**PvP Testing Commands (Tier Testers only):**\n• \`/claim\` - Claim a test ticket\n• \`/start\` - Start testing\n• \`/finish\` - Complete test\n• \`/cancel\` - Cancel test\n• \`/retest\` - Request retest\n• \`/history\` - View testing history\n\n**Moderator Commands:**\n• \`/warn\` - Warn a user\n• \`/mute\` - Mute a user\n• \`/kick\` - Kick a user\n• \`/ban\` - Ban a user\n• \`/unban\` - Unban a user\n• \`/purge\` - Purge messages\n\nFor more information on a specific command, use \`/help [command]\`.\n\n**Special Features:**\n• Complete automated server setup with ONE command\n• PvP tier testing system with tickets\n• Minecraft account verification\n• 15+ PvP modes with tier system\n• Professional staff hierarchy\n• Full audit logs and statistics\n• Modern interface with buttons and modals\n\nNote: Some commands are restricted based on role permissions.\n`;

    await interaction.reply({
      content: helpText,
      flags: 4194304
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('help')
      .setDescription('Show help and available commands')
      .setDMPermission(false);
  }
}