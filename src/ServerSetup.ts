import { CategoryChannel, Guild, ChannelType, PermissionsBitField, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { logger } from './utils/Logger';
import { MongoModel } from './database';

const CATEGORIES = [
  '━━━ INFORMATION ━━━',
  '━━━ COMMUNITY ━━━',
  '━━━ SUPPORT ━━━',
  '━━━ TIER TESTING ━━━',
  '━━━ LEADERBOARDS ━━━',
  '━━━ STAFF ━━━',
  '━━━ LOGS ━━━',
  '━━━ VOICE ━━━',
];

const CATEGORY_KEYS = ['information', 'community', 'support', 'tier-testing', 'leaderboards', 'staff', 'logs', 'voice'];

const TIER_MODES = [
  'Sword', 'Crystal', 'SMP', 'Netherite Pot', 'Diamond Pot', 'UHC', 'BuildUHC',
  'NoDebuff', 'Combo', 'Gapple', 'OP Duel', 'Boxing', 'Axe', 'Mace',
  'Anchor', 'Cart PvP', 'Bedwars', 'Skywars', 'Bridge', 'Nodebuff', 'Vanilla',
  'Crossbow', 'Trident', 'Shield', 'Elytra Combat', 'Custom Duel'
];

const TIER_COLORS: Record<number, number> = { 1: 0x95A5A6, 2: 0x2ECC71, 3: 0x3498DB, 4: 0x9B59B6, 5: 0xF1C40F };

const STAFF_ROLES = [
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

export class ServerSetup {
  private readonly client: any;
  private readonly guild: Guild;
  private readonly mongoModel: any;

  constructor(client: any, guild: Guild) {
    this.client = client;
    this.guild = guild;
    this.mongoModel = MongoModel;
  }

  private findCategory(key: string): CategoryChannel | undefined {
    const idx = CATEGORY_KEYS.indexOf(key);
    const catName = idx >= 0 ? CATEGORIES[idx] : key;
    return this.guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && (c.name === catName || c.name === key)
    ) as CategoryChannel | undefined;
  }

  private async createChannel(catKey: string, name: string, type: ChannelType, topic?: string): Promise<void> {
    const cat = this.findCategory(catKey);
    if (!cat) { logger.warn(`Category ${catKey} not found, skipping #${name}`); return; }
    if (cat.children.cache.some(c => c.name === name)) return;
    const data: any = { name, type, parent: cat };
    if (type === ChannelType.GuildText && topic) data.topic = topic;
    await cat.children.create(data).catch(e => logger.error(`Failed to create #${name}: ${e}`));
  }

  private async createRole(name: string, color?: number): Promise<void> {
    if (this.guild.roles.cache.some(r => r.name === name)) return;
    await this.guild.roles.create({ name, color }).catch(e => logger.error(`Failed to create role ${name}: ${e}`));
  }

  // ═══════════════════════════════════════════════════════
  // /all — Creates the entire server structure
  // ═══════════════════════════════════════════════════════
  public async setupAll(): Promise<void> {
    logger.info(`[ALL] Starting structure setup for ${this.guild.name}`);

    // Categories
    for (const name of CATEGORIES) {
      if (this.guild.channels.cache.some(c => c.type === ChannelType.GuildCategory && c.name === name)) continue;
      await this.guild.channels.create({ name, type: ChannelType.GuildCategory }).catch(e => logger.error(`Category ${name}: ${e}`));
    }

    // Information channels
    const info = this.findCategory('information');
    if (info) {
      for (const [name, topic] of [
        ['welcome', '🏰 Welcome to HARVAL MC — Read the rules and verify to play!'],
        ['rules', '📜 Server rules and guidelines'],
        ['faq', '❓ Frequently asked questions'],
        ['server-ip', '🖥️ Server IP: play.harvalmc.fun'],
        ['announcements', '📢 Official announcements and news'],
        ['updates', '🔔 Server updates and patch notes'],
        ['verify', '✅ Click the button below to verify your Minecraft account'],
        ['how-tier-testing-works', '📖 Learn how the tier testing system works'],
        ['staff', '👥 Meet our staff team'],
        ['roles', '🎨 Self-assign your roles here'],
      ] as [string, string][]) {
        await this.createChannel('information', name, ChannelType.GuildText, topic);
      }
    }

    // Community channels
    for (const [name, topic] of [
      ['general', '💬 General discussion'],
      ['minecraft-chat', '⛏️ Minecraft discussion'],
      ['clips', '🎬 Share your best PvP clips'],
      ['screenshots', '📸 Share screenshots'],
      ['media', '🎥 Media content and videos'],
      ['polls', '📊 Community polls'],
      ['suggestions', '💡 Suggest improvements'],
      ['off-topic', '🎲 Off-topic chat'],
    ] as [string, string][]) {
      await this.createChannel('community', name, ChannelType.GuildText, topic);
    }

    // Support channels
    for (const [name, topic] of [
      ['create-ticket', '🎫 Create a support ticket'],
      ['bug-report', '🐛 Report a bug'],
      ['report-player', '🚨 Report a player'],
      ['appeal', '📩 Submit a ban/mute appeal'],
      ['questions', '❓ Ask questions here'],
    ] as [string, string][]) {
      await this.createChannel('support', name, ChannelType.GuildText, topic);
    }

    // Tier testing channels
    for (const [name, topic] of [
      ['request-tier-test', '📋 Click a button below to request a tier test'],
      ['queue', '⏳ Current test queue'],
      ['tier-results', '🏆 Tier test results and rankings'],
      ['leaderboards', '📊 Server leaderboards'],
      ['tier-information', '📖 Tier system information'],
      ['retest-request', '🔄 Request a retest'],
    ] as [string, string][]) {
      await this.createChannel('tier-testing', name, ChannelType.GuildText, topic);
    }

    // Staff channels
    for (const [name, topic] of [
      ['staff-chat', '🔒 Staff only discussion'],
      ['commands', '⌨️ Bot commands for staff'],
      ['claims', '📌 Claim tier tests here'],
      ['applications', '📝 Staff applications'],
      ['reports', '📋 Player reports'],
      ['moderation', '🔨 Moderation tools'],
    ] as [string, string][]) {
      await this.createChannel('staff', name, ChannelType.GuildText, topic);
    }

    // Log channels
    for (const [name, topic] of [
      ['ticket-logs', '🎫 Ticket system logs'],
      ['tier-logs', '⚔️ Tier test logs'],
      ['bot-logs', '🤖 Bot activity logs'],
      ['error-logs', '❌ Error logs'],
      ['join-leave', '👋 Member join/leave logs'],
      ['role-logs', '🎨 Role change logs'],
      ['verification-logs', '✅ Verification logs'],
      ['command-logs', '⌨️ Command usage logs'],
    ] as [string, string][]) {
      await this.createChannel('logs', name, ChannelType.GuildText, topic);
    }

    // Voice channels
    for (const name of ['general-1', 'general-2', 'afk', 'staff-vc', 'meeting-room']) {
      await this.createChannel('voice', name, ChannelType.GuildVoice);
    }

    // Roles — tier roles with colors
    for (const mode of TIER_MODES) {
      for (const level of [1, 2, 3, 4, 5]) {
        const prefix = level >= 4 ? '★'.repeat(level - 2) + ' ' : '';
        await this.createRole(`${prefix}${mode} T${level}`, TIER_COLORS[level]);
      }
    }

    // Staff roles
    for (const role of STAFF_ROLES) {
      await this.createRole(role.name, role.color);
    }

    // Role hierarchy
    const botRole = this.guild.members.me?.roles.highest;
    if (botRole) {
      for (const role of this.guild.roles.cache.filter(r => r.name !== '@everyone' && r.editable).sort((a, b) => b.position - a.position).values()) {
        await role.setPermissions(PermissionsBitField.Flags.UseApplicationCommands).catch(() => {});
      }
    }

    logger.info(`[ALL] Structure setup complete for ${this.guild.name}`);
  }

  // ═══════════════════════════════════════════════════════
  // /setup — Posts content panels with buttons
  // ═══════════════════════════════════════════════════════
  public async setupContent(): Promise<void> {
    logger.info(`[SETUP] Starting content setup for ${this.guild.name}`);

    await this.postWelcomePanel();
    await this.postRulesPanel();
    await this.postFAQPanel();
    await this.postVerifyPanel();
    await this.postTierTestPanel();
    await this.postLeaderboardPanel();

    logger.info(`[SETUP] Content setup complete for ${this.guild.name}`);
  }

  private findChannel(name: string): TextChannel | undefined {
    return this.guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildText) as TextChannel | undefined;
  }

  private async postWelcomePanel(): Promise<void> {
    const ch = this.findChannel('welcome');
    if (!ch) return;
    const embed = new EmbedBuilder()
      .setTitle('🏰 Welcome to HARVAL MC')
      .setDescription('**The Ultimate PvP Tier Testing Network**\n\nWe are a professional Minecraft PvP community with 25+ tier-tested game modes.')
      .setColor(0xFFD700)
      .addFields(
        { name: '━━━━━━━━━━━━━━━━━━', value: '\u200B', inline: false },
        { name: '📋 Getting Started', value: '1. Read the rules in <#rules>\n2. Verify your Minecraft account in <#verify>\n3. Request a tier test in <#request-tier-test>', inline: false },
        { name: '🖥️ Server IP', value: '`play.harvalmc.fun`', inline: true },
        { name: '🎮 Game Modes', value: '25+ PvP modes', inline: true },
        { name: '⚔️ Tier System', value: 'T1 — T5', inline: true },
      )
      .setFooter({ text: 'HARVAL MC — Professional PvP Tier Testing' })
      .setTimestamp();
    await ch.send({ embeds: [embed] }).catch(() => {});
  }

  private async postRulesPanel(): Promise<void> {
    const ch = this.findChannel('rules');
    if (!ch) return;
    await ch.bulkDelete(100).catch(() => {});
    const embed = new EmbedBuilder()
      .setTitle('📜 Server Rules')
      .setDescription('By being in this server, you agree to follow all rules below.')
      .setColor(0xE74C3C)
      .addFields(
        { name: '━━━━━━━━━━━━━━━━━━', value: '\u200B', inline: false },
        { name: '1. Respect All Members', value: 'No harassment, hate speech, or discrimination of any kind.', inline: false },
        { name: '2. No Cheating or Hacking', value: 'Any use of hacks, cheats, or exploits will result in a permanent ban.', inline: false },
        { name: '3. Follow Staff Instructions', value: 'Staff decisions are final. Do not argue in public channels.', inline: false },
        { name: '4. No Spam or Self-Promotion', value: 'Keep chat clean. No unsolicited ads or links.', inline: false },
        { name: '5. Use Channels Correctly', value: 'Post in the appropriate channels only.', inline: false },
        { name: '6. Report Issues to Staff', value: 'Use the report channels instead of taking action yourself.', inline: false },
        { name: '7. Fair Play in Tier Tests', value: 'No stream sniping, ghosting, or unfair advantages during tests.', inline: false },
        { name: '8. No NSFW Content', value: 'Zero tolerance for inappropriate content.', inline: false },
        { name: '9. Keep It Professional', value: 'This is a competitive community. Maintain a respectful tone.', inline: false },
        { name: '10. Have Fun!', value: 'Enjoy your time and improve your PvP skills!', inline: false },
        { name: '━━━━━━━━━━━━━━━━━━', value: '\u200B', inline: false },
        { name: '⚠️ Violations', value: 'Violations result in warnings, mutes, or bans at staff discretion.', inline: false },
      )
      .setFooter({ text: 'HARVAL MC Rules — Last Updated: ' + new Date().toLocaleDateString() })
      .setTimestamp();
    await ch.send({ embeds: [embed] }).catch(() => {});
  }

  private async postFAQPanel(): Promise<void> {
    const ch = this.findChannel('faq');
    if (!ch) return;
    await ch.bulkDelete(100).catch(() => {});
    const embed = new EmbedBuilder()
      .setTitle('❓ Frequently Asked Questions')
      .setColor(0x3498DB)
      .addFields(
        { name: '━━━━━━━━━━━━━━━━━━', value: '\u200B', inline: false },
        { name: '🔍 How do I verify?', value: 'Go to <#verify> and click the Verify button. Enter your Minecraft username.', inline: false },
        { name: '⚔️ How do I request a tier test?', value: 'Go to <#request-tier-test> and click the button for your PvP mode.', inline: false },
        { name: '🔄 How do I request a retest?', value: 'Go to <#retest-request> and follow the instructions.', inline: false },
        { name: '📩 How do I appeal?', value: 'Go to <#appeal> and submit your appeal with details.', inline: false },
        { name: '🖥️ What is the server IP?', value: '`play.harvalmc.fun`', inline: false },
        { name: '📊 How does the tier system work?', value: 'Each PvP mode has tiers T1 (lowest) to T5 (highest). Tests are conducted by verified testers.', inline: false },
        { name: '👥 Who are the staff?', value: 'Check the <#staff> channel for our team.', inline: false },
      )
      .setFooter({ text: 'HARVAL MC FAQ' })
      .setTimestamp();
    await ch.send({ embeds: [embed] }).catch(() => {});
  }

  private async postVerifyPanel(): Promise<void> {
    const ch = this.findChannel('verify');
    if (!ch) return;
    await ch.bulkDelete(100).catch(() => {});
    const embed = new EmbedBuilder()
      .setTitle('✅ Minecraft Verification')
      .setDescription('Click the button below to verify your Minecraft account.\n\nAfter verification, your Discord nickname will be changed to your Minecraft username.')
      .setColor(0x2ECC71)
      .setFooter({ text: 'HARVAL MC Verification' })
      .setTimestamp();
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('verify_start').setLabel('Verify Account').setEmoji('✅').setStyle(ButtonStyle.Success)
    );
    await ch.send({ embeds: [embed], components: [row] }).catch(() => {});
  }

  private async postTierTestPanel(): Promise<void> {
    const ch = this.findChannel('request-tier-test');
    if (!ch) return;
    await ch.bulkDelete(100).catch(() => {});

    const embed = new EmbedBuilder()
      .setTitle('⚔️ Request a Tier Test')
      .setDescription('Click the button for your PvP mode to request a tier test.\n\nA tester will be assigned to your request shortly.')
      .setColor(0xF1C40F)
      .setFooter({ text: 'HARVAL MC Tier Testing' })
      .setTimestamp();
    await ch.send({ embeds: [embed] }).catch(() => {});

    const modeGroups = [
      ['Sword', 'Crystal', 'SMP', 'Netherite Pot', 'Diamond Pot'],
      ['UHC', 'BuildUHC', 'NoDebuff', 'Combo', 'Gapple'],
      ['OP Duel', 'Boxing', 'Axe', 'Mace', 'Anchor'],
      ['Cart PvP', 'Bedwars', 'Skywars', 'Bridge', 'Nodebuff'],
      ['Vanilla', 'Crossbow', 'Trident', 'Shield', 'Elytra Combat'],
      ['Custom Duel'],
    ];

    const emojis: Record<string, string> = {
      'Sword': '⚔️', 'Crystal': '💎', 'SMP': '🛡️', 'Netherite Pot': '🌋', 'Diamond Pot': '💠',
      'UHC': '❤️', 'BuildUHC': '🏗️', 'NoDebuff': '🚫', 'Combo': '🥊', 'Gapple': '🍎',
      'OP Duel': '⚡', 'Boxing': '🥊', 'Axe': '🪓', 'Mace': '🔨', 'Anchor': '⚓',
      'Cart PvP': '🛒', 'Bedwars': '🛏️', 'Skywars': '☁️', 'Bridge': '🌉', 'Nodebuff': '🔥',
      'Vanilla': '🌿', 'Crossbow': '🏹', 'Trident': '🔱', 'Shield': '🛡️', 'Elytra Combat': '🦅',
      'Custom Duel': '🎯',
    };

    for (const group of modeGroups) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (const mode of group) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`tier_request_${mode.replace(/\s+/g, '_').toLowerCase()}`)
            .setLabel(mode)
            .setEmoji(emojis[mode] || '🎮')
            .setStyle(ButtonStyle.Primary)
        );
      }
      await ch.send({ components: [row] }).catch(() => {});
    }
  }

  private async postLeaderboardPanel(): Promise<void> {
    const ch = this.findChannel('leaderboards');
    if (!ch) return;
    await ch.bulkDelete(100).catch(() => {});
    const embed = new EmbedBuilder()
      .setTitle('🏆 HARVAL MC Leaderboards')
      .setDescription('Leaderboards are updated in real-time as tier tests are completed.')
      .setColor(0xFFD700)
      .addFields(
        { name: '━━━━━━━━━━━━━━━━━━', value: '\u200B', inline: false },
        { name: '🏅 Most Active Players', value: 'No data yet', inline: true },
        { name: '⚔️ Most Tests Completed', value: 'No data yet', inline: true },
        { name: '⭐ Highest Rated Testers', value: 'No data yet', inline: true },
        { name: '🎯 Highest Ranked Players', value: 'No data yet', inline: true },
        { name: '🎮 Most Popular PvP Modes', value: 'No data yet', inline: true },
      )
      .setFooter({ text: 'HARVAL MC Leaderboards — Updated automatically' })
      .setTimestamp();
    await ch.send({ embeds: [embed] }).catch(() => {});
  }

  // ═══════════════════════════════════════════════════════
  // /cleanup — NUCLEAR: delete ALL channels and ALL roles
  // ═══════════════════════════════════════════════════════
  public async cleanup(guild?: Guild): Promise<{ channels: number; roles: number }> {
    const g = guild || this.guild;
    let channelsDeleted = 0;
    let rolesDeleted = 0;

    // Delete ALL channels (in ALL categories)
    for (const category of g.channels.cache.filter(c => c.type === ChannelType.GuildCategory).values()) {
      for (const child of (category as CategoryChannel).children.cache.values()) {
        await child.delete().catch(() => {});
        channelsDeleted++;
      }
      await category.delete().catch(() => {});
      channelsDeleted++;
    }

    // Delete remaining uncategorized channels
    for (const ch of g.channels.cache.values()) {
      if (!ch.isTextBased() && !ch.isVoiceBased()) continue;
      await ch.delete().catch(() => {});
      channelsDeleted++;
    }

    // Delete ALL roles except @everyone
    for (const role of g.roles.cache.values()) {
      if (role.name === '@everyone') continue;
      await role.delete().catch(() => {});
      rolesDeleted++;
    }

    logger.info(`[CLEANUP] Deleted ${channelsDeleted} channels and ${rolesDeleted} roles`);
    return { channels: channelsDeleted, roles: rolesDeleted };
  }
}
