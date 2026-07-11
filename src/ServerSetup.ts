import { CategoryChannel, Guild, ChannelType, PermissionsBitField } from 'discord.js';
import { logger } from './utils/Logger';
import { MongoModel } from './database';

const HARVAL_CATEGORIES = [
  '━━ INFORMATION ━━',
  '━━ COMMUNITY ━━',
  '━━ SUPPORT ━━',
  '━━ TIER TESTING ━━',
  '━━ LEADERBOARDS ━━',
  '━━ APPLICATIONS ━━',
  '━━ STAFF ━━',
  '━━ LOGS ━━',
  '━━ VOICE ━━',
];

const HARVAL_CATEGORY_KEYS = [
  'information', 'community', 'support', 'tier-testing',
  'leaderboards', 'applications', 'staff', 'logs', 'voice',
];

export class ServerSetup {
  private readonly client: any;
  private readonly guild: Guild;
  private readonly mongoModel: any;

  constructor(client: any, guild: Guild) {
    this.client = client;
    this.guild = guild;
    this.mongoModel = MongoModel;
  }

  public async setupAll(): Promise<void> {
    logger.info(`Starting server setup for guild: ${this.guild.name} (${this.guild.id}`);

    const steps: [string, () => Promise<void>][] = [
      ['Creating categories', () => this.createCategories()],
      ['Creating roles', () => this.createRoles()],
      ['Creating information channels', () => this.createInformationChannels()],
      ['Creating community channels', () => this.createCommunityChannels()],
      ['Creating support channels', () => this.createSupportChannels()],
      ['Creating tier testing channels', () => this.createTierTestingChannels()],
      ['Creating staff channels', () => this.createStaffChannels()],
      ['Creating log channels', () => this.createLogChannels()],
      ['Creating voice channels', () => this.createVoiceChannels()],
      ['Setting up verification', () => this.setupVerification()],
      ['Setting up ticket system', () => this.setupTicketSystem()],
      ['Setting up leaderboards', () => this.setupLeaderboards()],
      ['Setting up applications', () => this.setupApplications()],
    ];

    for (const [name, fn] of steps) {
      try {
        logger.info(name);
        await fn();
      } catch (error) {
        logger.error(`${name} failed: ${error instanceof Error ? error.message : error}`);
      }
    }

    await this.recordSetup(this.guild.id);
    logger.info('Server setup completed');
  }

  private async createCategories(): Promise<void> {
    for (let i = 0; i < HARVAL_CATEGORIES.length; i++) {
      const name = HARVAL_CATEGORIES[i];
      const key = HARVAL_CATEGORY_KEYS[i];
      const existing = this.guild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && (c.name === name || c.name === key)
      );
      if (existing) continue;

      await this.guild.channels.create({ name, type: ChannelType.GuildCategory });
      logger.info(`Created category: ${name}`);
    }
  }

  private async createRoles(): Promise<void> {
    const tierModes = [
      { name: 'Sword', color: 0xE74C3C },
      { name: 'Crystal', color: 0x9B59B6 },
      { name: 'SMP', color: 0x2ECC71 },
      { name: 'Netherite Pot', color: 0x1ABC9C },
      { name: 'Diamond Pot', color: 0x3498DB },
      { name: 'UHC', color: 0xE67E22 },
      { name: 'BuildUHC', color: 0xF1C40F },
      { name: 'NoDebuff', color: 0xE74C3C },
      { name: 'Combo', color: 0x1ABC9C },
      { name: 'Gapple', color: 0xF39C12 },
      { name: 'OP Duel', color: 0xC0392B },
      { name: 'Boxing', color: 0x27AE60 },
      { name: 'Axe', color: 0xD35400 },
      { name: 'Mace', color: 0x7F8C8D },
      { name: 'Anchor', color: 0x2C3E50 },
      { name: 'Cart PvP', color: 0x16A085 },
      { name: 'Bedwars', color: 0x8E44AD },
      { name: 'Skywars', color: 0x2980B9 },
      { name: 'Bridge', color: 0x27AE60 },
      { name: 'Nodebuff', color: 0xC0392B },
      { name: 'Vanilla', color: 0xBDC3C7 },
      { name: 'Crossbow', color: 0x95A5A6 },
      { name: 'Trident', color: 0x2980B9 },
      { name: 'Shield', color: 0xF1C40F },
      { name: 'Elytra Combat', color: 0x1ABC9C },
      { name: 'Custom Duel', color: 0xE74C3C },
    ];

    const tierColors: Record<number, number> = {
      1: 0x95A5A6,
      2: 0x2ECC71,
      3: 0x3498DB,
      4: 0x9B59B6,
      5: 0xF1C40F,
    };

    const staffRoles = [
      { name: '👑 Founder', color: 0xFFD700 },
      { name: '👑 Co-Founder', color: 0xFFD700 },
      { name: '⚡ Lead Developer', color: 0x00FF00 },
      { name: '⚡ Developer', color: 0x00FF00 },
      { name: '🌐 Network Manager', color: 0x1ABC9C },
      { name: '🛡️ Head Administrator', color: 0xE74C3C },
      { name: '🛡️ Administrator', color: 0xE74C3C },
      { name: '🔰 Senior Moderator', color: 0x3498DB },
      { name: '🔰 Moderator', color: 0x3498DB },
      { name: '🔰 Trial Moderator', color: 0x5DADE2 },
      { name: '⚔️ Head Tier Tester', color: 0xF1C40F },
      { name: '⚔️ Senior Tier Tester', color: 0xF39C12 },
      { name: '⚔️ Tier Tester', color: 0xF39C12 },
      { name: '⚔️ Trial Tier Tester', color: 0xF5B041 },
      { name: '💎 Support Team', color: 0x1ABC9C },
      { name: '🔨 Builder', color: 0xE67E22 },
      { name: '🎬 Media Team', color: 0x9B59B6 },
      { name: '✅ Verified', color: 0x2ECC71 },
      { name: '👤 Member', color: 0x95A5A6 },
      { name: '🔇 Muted', color: 0x7F8C8D },
      { name: '🤖 Bot', color: 0x2C3E50 },
    ];

    for (const tier of tierModes) {
      for (const level of [1, 2, 3, 4, 5]) {
        const prefix = level >= 4 ? '★'.repeat(level - 2) + ' ' : '';
        const roleName = `${prefix}${tier.name} T${level}`;
        await this.createRole(roleName, tierColors[level] || tier.color);
      }
    }

    for (const role of staffRoles) {
      await this.createRole(role.name, role.color);
    }

    await this.setupRoleHierarchy();
  }

  private async createRole(name: string, color?: number): Promise<void> {
    const existing = this.guild.roles.cache.find(r => r.name === name);
    if (existing) return;

    const data: any = { name };
    if (color) data.color = color;
    await this.guild.roles.create(data);
    logger.info(`Created role: ${name}`);
  }

  private async setupRoleHierarchy(): Promise<void> {
    const botRole = this.guild.members.me?.roles.highest;
    if (!botRole) return;

    const sortedRoles = this.guild.roles.cache
      .filter(r => r.name !== '@everyone' && r.editable)
      .sort((a, b) => b.position - a.position);

    for (const role of sortedRoles.values()) {
      await role.setPermissions(PermissionsBitField.Flags.UseApplicationCommands).catch(() => undefined);
    }
    logger.info('Role hierarchy setup completed');
  }

  private findCategory(key: string) {
    return this.guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && (
        c.name === HARVAL_CATEGORIES[HARVAL_CATEGORY_KEYS.indexOf(key)] ||
        c.name === key
      )
    ) as CategoryChannel | undefined;
  }

  private async createChannelInCategory(categoryKey: string, channelName: string, type: ChannelType, topic?: string): Promise<void> {
    const category = this.findCategory(categoryKey);
    if (!category) {
      logger.warn(`Category ${categoryKey} not found, skipping: ${channelName}`);
      return;
    }

    const existing = category.children.cache.find(c => c.name === channelName);
    if (existing) return;

    const data: any = { name: channelName, type, parent: category };
    if (type === ChannelType.GuildText && topic) data.topic = topic;

    await category.children.create(data);
    logger.info(`Created channel: #${channelName}`);
  }

  private async createInformationChannels(): Promise<void> {
    const cat = 'information';
    const t = (ch: string) => `├─ ${ch} ─ Type /help for info`;
    await this.createChannelInCategory(cat, 'welcome', ChannelType.GuildText, 'Welcome to HARVAL MC! Read the rules and verify to get started.');
    await this.createChannelInCategory(cat, 'rules', ChannelType.GuildText, t('rules'));
    await this.createChannelInCategory(cat, 'faq', ChannelType.GuildText, t('faq'));
    await this.createChannelInCategory(cat, 'server-ip', ChannelType.GuildText, 'play.harvalmc.fun');
    await this.createChannelInCategory(cat, 'announcements', ChannelType.GuildText, '📢 Official announcements and news');
    await this.createChannelInCategory(cat, 'updates', ChannelType.GuildText, '🔔 Server updates and patch notes');
    await this.createChannelInCategory(cat, 'verify', ChannelType.GuildText, '✅ Use /verify <minecraft_username> to link your account');
    await this.createChannelInCategory(cat, 'how-tier-testing-works', ChannelType.GuildText, '📖 Learn how the tier testing system works');
    await this.createChannelInCategory(cat, 'staff', ChannelType.GuildText, '👥 Meet our staff team');
    await this.createChannelInCategory(cat, 'roles', ChannelType.GuildText, '🎨 Self-assign your roles here');
  }

  private async createCommunityChannels(): Promise<void> {
    const cat = 'community';
    await this.createChannelInCategory(cat, 'general', ChannelType.GuildText, '💬 General discussion');
    await this.createChannelInCategory(cat, 'minecraft-chat', ChannelType.GuildText, '⛏️ Minecraft discussion');
    await this.createChannelInCategory(cat, 'clips', ChannelType.GuildText, '🎬 Share your best PvP clips');
    await this.createChannelInCategory(cat, 'screenshots', ChannelType.GuildText, '📸 Share screenshots');
    await this.createChannelInCategory(cat, 'media', ChannelType.GuildText, '🎥 Media content and videos');
    await this.createChannelInCategory(cat, 'polls', ChannelType.GuildText, '📊 Community polls');
    await this.createChannelInCategory(cat, 'suggestions', ChannelType.GuildText, '💡 Suggest improvements');
    await this.createChannelInCategory(cat, 'off-topic', ChannelType.GuildText, '🎲 Off-topic chat');
  }

  private async createSupportChannels(): Promise<void> {
    const cat = 'support';
    await this.createChannelInCategory(cat, 'create-ticket', ChannelType.GuildText, '🎫 Create a support ticket');
    await this.createChannelInCategory(cat, 'bug-report', ChannelType.GuildText, '🐛 Report a bug');
    await this.createChannelInCategory(cat, 'report-player', ChannelType.GuildText, '🚨 Report a player');
    await this.createChannelInCategory(cat, 'appeal', ChannelType.GuildText, '📩 Submit a ban/mute appeal');
    await this.createChannelInCategory(cat, 'questions', ChannelType.GuildText, '❓ Ask questions here');
  }

  private async createTierTestingChannels(): Promise<void> {
    const cat = 'tier-testing';
    await this.createChannelInCategory(cat, 'request-tier-test', ChannelType.GuildText, '📋 Request a tier test');
    await this.createChannelInCategory(cat, 'queue', ChannelType.GuildText, '⏳ Current test queue');
    await this.createChannelInCategory(cat, 'tier-results', ChannelType.GuildText, '🏆 Tier test results');
    await this.createChannelInCategory(cat, 'leaderboards', ChannelType.GuildText, '📊 Leaderboards and rankings');
    await this.createChannelInCategory(cat, 'tier-information', ChannelType.GuildText, '📖 Tier system information');
    await this.createChannelInCategory(cat, 'retest-request', ChannelType.GuildText, '🔄 Request a retest');
  }

  private async createStaffChannels(): Promise<void> {
    const cat = 'staff';
    await this.createChannelInCategory(cat, 'staff-chat', ChannelType.GuildText, '🔒 Staff only discussion');
    await this.createChannelInCategory(cat, 'commands', ChannelType.GuildText, '⌨️ Bot commands for staff');
    await this.createChannelInCategory(cat, 'claims', ChannelType.GuildText, '📌 Claim tier tests here');
    await this.createChannelInCategory(cat, 'applications', ChannelType.GuildText, '📝 Staff applications');
    await this.createChannelInCategory(cat, 'reports', ChannelType.GuildText, '📋 Player reports');
    await this.createChannelInCategory(cat, 'moderation', ChannelType.GuildText, '🔨 Moderation tools');
  }

  private async createLogChannels(): Promise<void> {
    const cat = 'logs';
    await this.createChannelInCategory(cat, 'ticket-logs', ChannelType.GuildText, '🎫 Ticket system logs');
    await this.createChannelInCategory(cat, 'tier-logs', ChannelType.GuildText, '⚔️ Tier test logs');
    await this.createChannelInCategory(cat, 'bot-logs', ChannelType.GuildText, '🤖 Bot activity logs');
    await this.createChannelInCategory(cat, 'error-logs', ChannelType.GuildText, '❌ Error logs');
    await this.createChannelInCategory(cat, 'join-leave', ChannelType.GuildText, '👋 Member join/leave logs');
    await this.createChannelInCategory(cat, 'role-logs', ChannelType.GuildText, '🎨 Role change logs');
    await this.createChannelInCategory(cat, 'verification-logs', ChannelType.GuildText, '✅ Verification logs');
    await this.createChannelInCategory(cat, 'command-logs', ChannelType.GuildText, '⌨️ Command usage logs');
  }

  private async createVoiceChannels(): Promise<void> {
    const cat = 'voice';
    await this.createChannelInCategory(cat, 'general-1', ChannelType.GuildVoice);
    await this.createChannelInCategory(cat, 'general-2', ChannelType.GuildVoice);
    await this.createChannelInCategory(cat, 'afk', ChannelType.GuildVoice);
    await this.createChannelInCategory(cat, 'staff-vc', ChannelType.GuildVoice);
    await this.createChannelInCategory(cat, 'meeting-room', ChannelType.GuildVoice);
  }

  private async setupVerification(): Promise<void> {
    try {
      const verification = this.mongoModel.Verification;
      const existing = await verification.findOne({ guildId: this.guild.id });
      if (!existing) {
        await verification.create({ guildId: this.guild.id, enabled: true });
      }
      logger.info('Verification system setup complete');
    } catch (error) {
      logger.error(`Verification setup failed: ${error}`);
    }
  }

  private async setupTicketSystem(): Promise<void> {
    try {
      const system = this.mongoModel.TicketSystem;
      const existing = await system.findOne({ guildId: this.guild.id });
      if (!existing) {
        await system.create({ guildId: this.guild.id, enabled: true });
      }
      logger.info('Ticket system setup complete');
    } catch (error) {
      logger.error(`Ticket system setup failed: ${error}`);
    }
  }

  private async setupApplications(): Promise<void> {
    try {
      const app = this.mongoModel.Application;
      const types = ['moderator', 'tier-tester', 'builder', 'media-team', 'support-team'];
      for (const type of types) {
        const existing = await app.findOne({ guildId: this.guild.id, type });
        if (!existing) {
          await app.create({ guildId: this.guild.id, type, enabled: true });
        }
      }
      logger.info('Applications setup complete');
    } catch (error) {
      logger.error(`Applications setup failed: ${error}`);
    }
  }

  private async setupLeaderboards(): Promise<void> {
    try {
      const lb = this.mongoModel.Leaderboards;
      const existing = await lb.findOne({ guildId: this.guild.id });
      if (!existing) {
        await lb.create({
          guildId: this.guild.id,
          enabled: true,
          statistics: { mostActivePlayers: [], mostTestsCompleted: [], highestRatedTesters: [], highestRankedPlayers: [], mostRequestedPvPModes: [] }
        });
      }
      logger.info('Leaderboards setup complete');
    } catch (error) {
      logger.error(`Leaderboards setup failed: ${error}`);
    }
  }

  private async recordSetup(guildId: string): Promise<void> {
    try {
      await this.mongoModel.ServerSetup.create({ guildId, timestamp: new Date() });
    } catch (error) {
      logger.error(`Failed to record setup: ${error}`);
    }
  }

  public async cleanup(guild?: Guild): Promise<void> {
    const targetGuild = guild || this.guild;
    let deletedChannels = 0;
    let deletedRoles = 0;

    for (const key of HARVAL_CATEGORY_KEYS) {
      const category = targetGuild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && (
          c.name === HARVAL_CATEGORIES[HARVAL_CATEGORY_KEYS.indexOf(key)] ||
          c.name === key
        )
      ) as CategoryChannel | undefined;

      if (!category) continue;

      for (const child of category.children.cache.values()) {
        await child.delete().catch(() => undefined);
        deletedChannels++;
      }
      await category.delete().catch(() => undefined);
      deletedChannels++;
    }

    const tierRolePattern = /^(★*\s?)?.*\sT[1-5]$/;
    const staffRolePattern = /^(👑|⚡|🌐|🛡️|🔰|⚔️|💎|🔨|🎬|✅|👤|🔇|🤖)\s/;
    const staffRoleNames = [
      'Founder', 'Co-Founder', 'Lead Developer', 'Developer', 'Network Manager',
      'Head Administrator', 'Administrator', 'Senior Moderator', 'Moderator',
      'Trial Moderator', 'Head Tier Tester', 'Senior Tier Tester', 'Tier Tester',
      'Trial Tier Tester', 'Support Team', 'Builder', 'Media Team', 'Verified', 'Member', 'Muted', 'Bot'
    ];

    for (const role of targetGuild.roles.cache.values()) {
      if (role.name === '@everyone') continue;
      const isTier = tierRolePattern.test(role.name);
      const isStaff = staffRolePattern.test(role.name) || staffRoleNames.some(s => role.name.includes(s));
      if (isTier || isStaff) {
        await role.delete().catch(() => undefined);
        deletedRoles++;
      }
    }

    logger.info(`Cleanup complete: deleted ${deletedChannels} channels and ${deletedRoles} roles`);
  }
}
