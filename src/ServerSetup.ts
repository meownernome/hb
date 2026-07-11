"use strict";

import { TextChannel, VoiceChannel, CategoryChannel, Role, Guild, PermissionsBitField, ChannelType, Collection } from 'discord.js';
import { logger } from './utils/Logger';
import { MongoModel } from './database';

interface ChannelInfo {
  id: string;
  type: ChannelType;
}

interface RoleInfo {
  id: string;
  name: string;
  color?: number;
}

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
    try {
      logger.info(`Starting server setup for guild: ${this.guild.name} (${this.guild.id})`);

      await this.createCategories();
      await this.createRoles();
      await this.createInformationChannels();
      await this.createCommunityChannels();
      await this.createSupportChannels();
      await this.createTierTestingChannels();
      await this.createStaffChannels();
      await this.createLogChannels();
      await this.createVoiceChannels();

      await this.setupVerification();
      await this.setupTicketSystem();
      await this.setupLeaderboards();
      await this.setupApplications();
      await this.generateFAQ();
      await this.generateRules();

      await this.recordSetup(this.guild.id);
      logger.info('Server setup completed successfully');
    } catch (error) {
      logger.error('Server setup failed:', error);
      throw error;
    }
  }

  private async createCategories(): Promise<void> {
    const categories = [
      'INFORMATION',
      'VERIFICATION',
      'TIER TESTING',
      'COMMUNITY',
      'SUPPORT',
      'LEADERBOARDS',
      'APPLICATIONS',
      'STAFF',
      'LOGS',
      'VOICE'
    ];

    for (const categoryName of categories) {
      const existing = this.guild.channels.cache.find(
        channel => channel.type === ChannelType.GuildCategory && channel.name === categoryName.toLowerCase()
      );

      if (existing) {
        logger.info(`Category ${categoryName} already exists`);
      } else {
        await this.guild.channels.create({
          name: categoryName.toLowerCase(),
          type: ChannelType.GuildCategory
        });
        logger.info(`Created category: ${categoryName}`);
      }
    }
  }

  private async createRoles(): Promise<void> {
    const tierModes = [
      'Sword', 'Crystal', 'SMP', 'Netherite Pot', 'Diamond Pot', 'UHC', 'BuildUHC',
      'NoDebuff', 'Combo', 'Gapple', 'OP Duel', 'Boxing', 'Axe', 'Mace',
      'Anchor', 'Cart PvP', 'Bedwars', 'Skywars', 'Bridge', 'Nodebuff', 'Vanilla',
      'Crossbow', 'Trident', 'Shield', 'Elytra Combat', 'Custom Duel'
    ];

    const staffRoles = [
      'Founder', 'Co-Founder', 'Lead Developer', 'Developer', 'Network Manager',
      'Head Administrator', 'Administrator', 'Senior Moderator', 'Moderator',
      'Trial Moderator', 'Head Tier Tester', 'Senior Tier Tester', 'Tier Tester',
      'Trial Tier Tester', 'Support Team', 'Builder', 'Media Team', 'Verified', 'Member', 'Muted', 'Bot'
    ];

    for (const tierMode of tierModes) {
      for (const tier of [1, 2, 3, 4, 5]) {
        const roleName = `${tierMode} LT${tier}`;
        await this.createRole(roleName, 0xFF0000);
      }
      for (const tier of [1, 2, 3, 4, 5]) {
        const roleName = `${tierMode} HT${tier}`;
        await this.createRole(roleName, 0x0000FF);
      }
    }

    for (const roleName of staffRoles) {
      await this.createRole(roleName);
    }

    await this.setupRoleHierarchy();
  }

  private async createRole(name: string, color?: number): Promise<Role> {
    const existing = this.guild.roles.cache.find(role => role.name === name);
    if (existing) {
      return existing;
    }

    const roleData: any = { name };
    if (color) {
      roleData.color = color;
    }

    const role = await this.guild.roles.create(roleData);
    logger.info(`Created role: ${name}`);
    return role;
  }

  private async setupRoleHierarchy(): Promise<void> {
    const botRole = this.guild.me?.roles.highest;
    if (!botRole) return;

    const sortedRoles = this.guild.roles.cache
      .filter(role => role.name !== '@everyone')
      .sort((a, b) => b.position - a.position);

    for (const role of sortedRoles.values()) {
      await role.setPermissions(PermissionsBitField.Flags.UseApplicationCommands);
    }

    logger.info('Role hierarchy setup completed');
  }

  private async createInformationChannels(): Promise<void> {
    const channels = [
      'welcome', 'rules', 'faq', 'server-ip', 'announcements', 'updates', 'verify',
      'how-tier-testing-works', 'staff', 'roles'
    ];

    for (const channelName of channels) {
      await this.createChannelInCategory('information', channelName, ChannelType.GuildText);
    }
  }

  private async createCommunityChannels(): Promise<void> {
    const channels = [
      'general', 'minecraft-chat', 'clips', 'screenshots', 'media', 'polls',
      'suggestions', 'off-topic'
    ];

    for (const channelName of channels) {
      await this.createChannelInCategory('community', channelName, ChannelType.GuildText);
    }
  }

  private async createSupportChannels(): Promise<void> {
    const channels = [
      'create-ticket', 'bug-report', 'report-player', 'appeal', 'questions'
    ];

    for (const channelName of channels) {
      await this.createChannelInCategory('support', channelName, ChannelType.GuildText);
    }
  }

  private async createTierTestingChannels(): Promise<void> {
    const channels = [
      'request-tier-test', 'queue', 'tier-results', 'leaderboards',
      'tier-information', 'retest-request'
    ];

    for (const channelName of channels) {
      await this.createChannelInCategory('tier-testing', channelName, ChannelType.GuildText);
    }
  }

  private async createStaffChannels(): Promise<void> {
    const channels = [
      'staff-chat', 'commands', 'claims', 'applications', 'reports',
      'moderation'
    ];

    for (const channelName of channels) {
      await this.createChannelInCategory('staff', channelName, ChannelType.GuildText);
    }
  }

  private async createLogChannels(): Promise<void> {
    const channels = [
      'ticket-logs', 'tier-logs', 'bot-logs', 'error-logs', 'join-leave',
      'role-logs', 'verification-logs', 'command-logs'
    ];

    for (const channelName of channels) {
      await this.createChannelInCategory('logs', channelName, ChannelType.GuildText);
    }
  }

  private async createVoiceChannels(): Promise<void> {
    const channels = [
      'general-1', 'general-2', 'afk', 'staff-vc', 'meeting-room'
    ];

    for (const channelName of channels) {
      await this.createChannelInCategory('voice', channelName, ChannelType.GuildVoice);
    }
  }

  private async createChannelInCategory(category: string, channelName: string, type: ChannelType): Promise<void> {
    const categoryChannel = this.guild.channels.cache.find(
      channel => channel.type === ChannelType.GuildCategory && channel.name === category
    );

    if (!categoryChannel) {
      logger.warn(`Category ${category} not found, skipping channel creation: ${channelName}`);
      return;
    }

    const existing = categoryChannel.children.cache.find(child => child.name === channelName);
    if (existing) {
      return;
    }

    const channelData: any = {
      name: channelName,
      type: type,
      parent: categoryChannel
    };

    if (type === ChannelType.GuildText) {
      channelData.topic = `Automated channel created for ${channelName}`;
    }

    await categoryChannel.children.create(channelData);
    logger.info(`Created channel: ${channelName} in ${category}`);
  }

  private async setupVerification(): Promise<void> {
    const verifiedRole = this.guild.roles.cache.find(role => role.name === 'Verified');
    if (!verifiedRole) {
      logger.warn('Verified role not found, skipping verification setup');
      return;
    }

    const verifyChannel = this.guild.channels.cache.find(
      channel => channel.name === 'verify' && channel.type === ChannelType.GuildText
    ) as TextChannel | undefined;

    if (!verifyChannel) {
      logger.warn('Verify channel not found, skipping verification setup');
      return;
    }

    const verification = this.mongoModel.Verification;
    let guildSettings = await verification.findOne({ guildId: this.guild.id });

    if (!guildSettings) {
      guildSettings = await verification.create({
        guildId: this.guild.id,
        enabled: true,
        channelId: verifyChannel.id
      });
    }

    logger.info(`Verification system setup for guild: ${this.guild.id}`);
  }

  private async setupTicketSystem(): Promise<void> {
    const system = this.mongoModel.TicketSystem;
    await system.create({
      guildId: this.guild.id,
      enabled: true,
      categoryId: this.guild.channels.cache.find(
        channel => channel.type === ChannelType.GuildCategory && channel.name === 'support'
      )?.id,
      roles: {
        tester: this.guild.roles.cache.find(role => role.name === 'Tier Tester')?.id,
        admin: this.guild.roles.cache.find(role => role.name === 'Administrator')?.id
      }
    });

    logger.info(`Ticket system setup for guild: ${this.guild.id}`);
  }

  private async setupApplications(): Promise<void> {
    const applications = [
      'Moderator', 'Tier Tester', 'Builder', 'Media Team', 'Support Team'
    ];

    for (const applicationType of applications) {
      await this.createApplicationPanel(applicationType);
    }
  }

  private async createApplicationPanel(applicationType: string): Promise<void> {
    await this.mongoModel.Application.create({
      guildId: this.guild.id,
      type: applicationType.toLowerCase(),
      channelId: this.guild.channels.cache.find(
        channel => channel.name === `applications-${applicationType.toLowerCase()}`
      )?.id,
      enabled: true
    });

    logger.info(`Created application panel for: ${applicationType}`);
  }

  private async generateFAQ(): Promise<void> {
    const faqFilePath = './data/faq.md';
    const questions = [
      'How to verify',
      'How to request testing',
      'Retesting',
      'Appeals',
      'Rules',
      'Server IP',
      'Staff Information'
    ];

    let faqContent = '# FAQ\n\n';
    for (const question of questions) {
      faqContent += `## ${question}\n\n`;
      faqContent += `Answer for ${question}.\n\n`;
    }

    await Bun.write(faqFilePath, faqContent);
    logger.info(`Generated FAQ for guild: ${this.guild.id}`);
  }

  private async generateRules(): Promise<void> {
    const rulesFilePath = './data/rules.txt';
    const ruleCount = 15;
    let rulesContent = '# Server Rules\n\n';

    for (let i = 1; i <= ruleCount; i++) {
      rulesContent += `**Rule ${i}:** Please be respectful and follow the code of conduct.\n\n`;
    }

    await Bun.write(rulesFilePath, rulesContent);
    logger.info(`Generated rules for guild: ${this.guild.id}`);
  }

  private async recordSetup(guildId: string): Promise<void> {
    await this.mongoModel.ServerSetup.create({
      guildId: guildId,
      timestamp: new Date()
    });
  }

  public async setupLeaderboards(): Promise<void> {
    const system = this.mongoModel.Leaderboards;
    await system.create({
      guildId: this.guild.id,
      enabled: true,
      statistics: {
        mostActivePlayers: [],
        mostTestsCompleted: [],
        highestRatedTesters: [],
        highestRankedPlayers: [],
        mostRequestedPvPModes: []
      }
    });

    logger.info(`Leaderboards setup for guild: ${this.guild.id}`);
  }
}