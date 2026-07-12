import { CategoryChannel, Guild, ChannelType, PermissionsBitField, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, PermissionFlagsBits, Channel, Role } from 'discord.js';
import { logger } from './utils/Logger';
import { MongoModel } from './database';

const CATEGORIES = [
  '═══ INFORMATION ═══',
  '═══ COMMUNITY ═══',
  '═══ SUPPORT ═══',
  '═══ TIER TESTING ═══',
  '═══ TICKETS ═══',
  '═══ LEADERBOARDS ═══',
  '═══ STAFF ═══',
  '═══ LOGS ═══',
  '═══ VOICE ═══',
];

const CATEGORY_KEYS = ['information', 'community', 'support', 'tier-testing', 'tickets', 'leaderboards', 'staff', 'logs', 'voice'];

const TIER_MODES = [
  'Sword', 'Crystal', 'SMP', 'Netherite Pot', 'Diamond Pot', 'UHC', 'BuildUHC',
  'NoDebuff', 'Combo', 'Gapple', 'OP Duel', 'Boxing', 'Axe', 'Mace',
  'Anchor', 'Cart PvP', 'Bedwars', 'Skywars', 'Bridge', 'Nodebuff', 'Vanilla',
  'Crossbow', 'Trident', 'Shield', 'Elytra Combat', 'Custom Duel'
];

const MODE_EMOJI: Record<string, string> = {
  'Sword': '⚔️', 'Crystal': '💎', 'SMP': '🛡️', 'Netherite Pot': '🌋', 'Diamond Pot': '💠',
  'UHC': '❤️', 'BuildUHC': '🏗️', 'NoDebuff': '🚫', 'Combo': '🥊', 'Gapple': '🍎',
  'OP Duel': '⚡', 'Boxing': '🥊', 'Axe': '🪓', 'Mace': '🔨', 'Anchor': '⚓',
  'Cart PvP': '🛒', 'Bedwars': '🛏️', 'Skywars': '☁️', 'Bridge': '🌉', 'Nodebuff': '🔥',
  'Vanilla': '🌿', 'Crossbow': '🏹', 'Trident': '🔱', 'Shield': '🛡️', 'Elytra Combat': '🦅',
  'Custom Duel': '🎯',
};

const TIER_COLORS: Record<number, string> = { 1: '⬛', 2: '🟩', 3: '🟦', 4: '🟪', 5: '🟨' };
const TIER_HEX: Record<number, number> = { 1: 0x95A5A6, 2: 0x2ECC71, 3: 0x3498DB, 4: 0x9B59B6, 5: 0xF1C40F };

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

  public getGuild(): Guild { return this.guild; }

  private findCategory(key: string): CategoryChannel | undefined {
    const idx = CATEGORY_KEYS.indexOf(key);
    const catName = idx >= 0 ? CATEGORIES[idx] : key;
    return this.guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && (c.name === catName || c.name === key)
    ) as CategoryChannel | undefined;
  }

  private async ch(catKey: string, name: string, type: ChannelType, topic?: string): Promise<void> {
    const cat = this.findCategory(catKey);
    if (!cat) { logger.warn(`Category ${catKey} not found, skipping #${name}`); return; }
    if (cat.children.cache.some(c => c.name === name)) return;
    const data: any = { name, type, parent: cat };
    if (type === ChannelType.GuildText && topic) data.topic = topic;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await cat.children.create(data);
        await new Promise(r => setTimeout(r, 500));
        return;
      } catch (e: any) {
        if (e?.httpStatus === 429) {
          const wait = e?.retry_after ? e.retry_after * 1000 : (attempt + 1) * 3000;
          logger.warn(`Rate limited creating #${name}, waiting ${wait}ms`);
          await new Promise(r => setTimeout(r, wait));
        } else {
          logger.error(`Create #${name}: ${e}`);
          return;
        }
      }
    }
  }

  private async role(name: string, color?: number): Promise<void> {
    if (this.guild.roles.cache.some(r => r.name === name)) return;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await this.guild.roles.create({ name, colors: { primaryColor: color || 0 } });
        await new Promise(r => setTimeout(r, 1000));
        return;
      } catch (e: any) {
        if (e?.code === 50013 || e?.httpStatus === 429) {
          const wait = e?.retry_after ? e.retry_after * 1000 : (attempt + 1) * 3000;
          logger.warn(`Rate limited creating role ${name}, waiting ${wait}ms (attempt ${attempt + 1}/5)`);
          await new Promise(r => setTimeout(r, wait));
        } else {
          logger.error(`Create role ${name}: ${e}`);
          return;
        }
      }
    }
    logger.error(`Failed to create role ${name} after 5 attempts`);
  }

  // ═══════════════════════════════════════════════════════
  // /all — Structure only
  // ═══════════════════════════════════════════════════════
  public async setupAll(): Promise<void> {
    logger.info(`[ALL] Starting for ${this.guild.name}`);

    // Categories
    for (const name of CATEGORIES) {
      if (this.guild.channels.cache.some(c => c.type === ChannelType.GuildCategory && c.name === name)) continue;
      await this.guild.channels.create({ name, type: ChannelType.GuildCategory }).catch(e => logger.error(`Cat ${name}: ${e}`));
    }

    // ── Information ──
    await this.ch('information', 'welcome', ChannelType.GuildText, '🏰 Welcome to HARVAL MC');
    await this.ch('information', 'rules', ChannelType.GuildText, '📜 Server rules and guidelines');
    await this.ch('information', 'faq', ChannelType.GuildText, '❓ Frequently asked questions');
    await this.ch('information', 'server-ip', ChannelType.GuildText, '🖥️ Server IP: play.harvalmc.fun');
    await this.ch('information', 'announcements', ChannelType.GuildText, '📢 Official announcements');
    await this.ch('information', 'updates', ChannelType.GuildText, '🔔 Server updates');
    await this.ch('information', 'verify', ChannelType.GuildText, '✅ Verify your Minecraft account');
    await this.ch('information', 'how-tier-testing-works', ChannelType.GuildText, '📖 Tier testing guide');
    await this.ch('information', 'staff', ChannelType.GuildText, '👥 Staff team');
    await this.ch('information', 'roles', ChannelType.GuildText, '🎨 Self-assign roles');

    // ── Community ──
    await this.ch('community', 'general', ChannelType.GuildText, '💬 General discussion');
    await this.ch('community', 'minecraft-chat', ChannelType.GuildText, '⛏️ Minecraft chat');
    await this.ch('community', 'clips', ChannelType.GuildText, '🎬 Share PvP clips');
    await this.ch('community', 'screenshots', ChannelType.GuildText, '📸 Screenshots');
    await this.ch('community', 'media', ChannelType.GuildText, '🎥 Media content');
    await this.ch('community', 'polls', ChannelType.GuildText, '📊 Polls');
    await this.ch('community', 'suggestions', ChannelType.GuildText, '💡 Suggestions');
    await this.ch('community', 'off-topic', ChannelType.GuildText, '🎲 Off-topic');

    // ── Support ──
    await this.ch('support', 'create-ticket', ChannelType.GuildText, '🎫 Create a support ticket');
    await this.ch('support', 'bug-report', ChannelType.GuildText, '🐛 Report a bug');
    await this.ch('support', 'report-player', ChannelType.GuildText, '🚨 Report a player');
    await this.ch('support', 'appeal', ChannelType.GuildText, '📩 Ban/mute appeal');
    await this.ch('support', 'questions', ChannelType.GuildText, '❓ Questions');

    // ── Tier Testing ──
    await this.ch('tier-testing', 'request-tier-test', ChannelType.GuildText, '📋 Click a button to request a tier test');
    await this.ch('tier-testing', 'queue', ChannelType.GuildText, '⏳ Current test queue');
    await this.ch('tier-testing', 'tier-results', ChannelType.GuildText, '🏆 Tier test results');
    await this.ch('tier-testing', 'leaderboards', ChannelType.GuildText, '📊 Leaderboards');
    await this.ch('tier-testing', 'tier-information', ChannelType.GuildText, '📖 Tier system info');
    await this.ch('tier-testing', 'retest-request', ChannelType.GuildText, '🔄 Request a retest');

    // ── Staff ──
    await this.ch('staff', 'staff-chat', ChannelType.GuildText, '🔒 Staff only');
    await this.ch('staff', 'commands', ChannelType.GuildText, '⌨️ Staff bot commands');
    await this.ch('staff', 'claims', ChannelType.GuildText, '📌 Claim tests');
    await this.ch('staff', 'applications', ChannelType.GuildText, '📝 Applications');
    await this.ch('staff', 'reports', ChannelType.GuildText, '📋 Reports');
    await this.ch('staff', 'moderation', ChannelType.GuildText, '🔨 Moderation');

    // ── Logs ──
    await this.ch('logs', 'ticket-logs', ChannelType.GuildText, '🎫 Ticket logs');
    await this.ch('logs', 'tier-logs', ChannelType.GuildText, '⚔️ Tier logs');
    await this.ch('logs', 'bot-logs', ChannelType.GuildText, '🤖 Bot logs');
    await this.ch('logs', 'error-logs', ChannelType.GuildText, '❌ Errors');
    await this.ch('logs', 'join-leave', ChannelType.GuildText, '👋 Join/leave');
    await this.ch('logs', 'role-logs', ChannelType.GuildText, '🎨 Role changes');
    await this.ch('logs', 'verification-logs', ChannelType.GuildText, '✅ Verification');
    await this.ch('logs', 'command-logs', ChannelType.GuildText, '⌨️ Commands');

    // ── Voice ──
    for (const v of ['general-1', 'general-2', 'afk', 'staff-vc', 'meeting-room']) {
      await this.ch('voice', v, ChannelType.GuildVoice);
    }

    // ── Roles ──
    let roleCount = 0;
    for (let i = 0; i < TIER_MODES.length; i++) {
      const mode = TIER_MODES[i];
      for (const level of [1, 2, 3, 4, 5]) {
        const stars = level >= 4 ? '★'.repeat(level - 2) + ' ' : '';
        await this.role(`${stars}${mode} T${level}`, TIER_HEX[level]);
        roleCount++;
      }
      // Batch pause every 5 modes
      if ((i + 1) % 5 === 0) {
        logger.info(`[ALL] Roles: ${roleCount}/${(TIER_MODES.length * 5) + STAFF_ROLES.length} created (${mode})`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
    for (let i = 0; i < STAFF_ROLES.length; i++) {
      const sr = STAFF_ROLES[i];
      await this.role(sr.name, sr.color);
      roleCount++;
      if ((i + 1) % 5 === 0) {
        logger.info(`[ALL] Staff roles: ${i + 1}/${STAFF_ROLES.length}`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    // Role hierarchy
    const rolesToEdit = this.guild.roles.cache
      .filter(r => r.name !== '@everyone' && r.editable)
      .sort((a, b) => b.position - a.position)
      .values();
    let edited = 0;
    for (const r of rolesToEdit) {
      await r.setPermissions(PermissionsBitField.Flags.UseApplicationCommands).catch(() => {});
      edited++;
      if (edited % 10 === 0) await new Promise(r => setTimeout(r, 1000));
    }

    logger.info(`[ALL] Total roles created: ${roleCount}`);

    logger.info(`[ALL] Done for ${this.guild.name}`);
  }

  // ═══════════════════════════════════════════════════════
  // /setup — Content panels
  // ═══════════════════════════════════════════════════════
  public async setupContent(): Promise<void> {
    logger.info(`[SETUP] Starting for ${this.guild.name}`);
    await this.panelWelcome();
    await this.panelRules();
    await this.panelFAQ();
    await this.panelVerify();
    await this.panelTierTest();
    await this.panelLeaderboard();
    logger.info(`[SETUP] Done for ${this.guild.name}`);
  }

  private tc(name: string): TextChannel | undefined {
    return this.guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildText) as TextChannel | undefined;
  }

  private async panelWelcome() {
    const ch = this.tc('welcome');
    if (!ch) return;
    const e = new EmbedBuilder()
      .setTitle('══════════════════════════')
      .setDescription(
        '# 🏰 Welcome to **HARVAL MC**\n' +
        '*The Ultimate PvP Tier Testing Network*\n' +
        '══════════════════════════\n\n' +
        '**━━━━━━ HOW TO START ━━━━━━**\n' +
        '```\n' +
        '  1. 📜 Read the rules in #rules\n' +
        '  2. ✅ Verify in #verify\n' +
        '  3. ⚔️ Request a tier test\n' +
        '```\n\n' +
        '**━━━━━━ QUICK INFO ━━━━━━**\n' +
        '```fix\n' +
        '  🖥️ Server IP  :  play.harvalmc.fun\n' +
        '  🎮 Game Modes :  25+ PvP modes\n' +
        '  ⚔️ Tier System :  T1 → T5\n' +
        '  👥 Staff Ready :  24/7 support\n' +
        '```'
      )
      .setColor(0xFFD700)
      .setFooter({ text: '══════ HARVAL MC ══════' })
      .setTimestamp();
    await ch.send({ embeds: [e] }).catch(() => {});
  }

  private async panelRules() {
    const ch = this.tc('rules');
    if (!ch) return;
    await ch.bulkDelete(100).catch(() => {});
    const rules = [
      ['01', '👑', 'Respect All Members', 'No harassment, hate speech, or discrimination'],
      ['02', '🚫', 'No Cheating or Hacking', 'Hacks, cheats, exploits = permanent ban'],
      ['03', '🛡️', 'Follow Staff Instructions', 'Staff decisions are final'],
      ['04', '🔇', 'No Spam or Self-Promotion', 'Keep channels clean'],
      ['05', '📌', 'Use Channels Correctly', 'Right content in right channels'],
      ['06', '🚨', 'Report Issues', 'Use report channels, not public chat'],
      ['07', '⚔️', 'Fair Play', 'No ghosting, stream sniping in tests'],
      ['08', '🔞', 'No NSFW', 'Zero tolerance'],
      ['09', '💼', 'Be Professional', 'Competitive but respectful'],
      ['10', '🎮', 'Have Fun!', 'Enjoy and improve your PvP'],
    ];
    const e = new EmbedBuilder()
      .setTitle('📜 ═══ SERVER RULES ═══')
      .setDescription('By being here, you agree to all rules below.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      .setColor(0xE74C3C);
    for (const [num, emoji, title, desc] of rules) {
      e.addFields({ name: `${emoji} Rule ${num}: ${title}`, value: desc, inline: false });
    }
    e.addFields(
      { name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━', value: '\u200B', inline: false },
      { name: '⚠️ Violations', value: 'Warnings → Mutes → Bans at staff discretion', inline: false }
    );
    e.setFooter({ text: '══════ HARVAL MC RULES ══════' }).setTimestamp();
    await ch.send({ embeds: [e] }).catch(() => {});
  }

  private async panelFAQ() {
    const ch = this.tc('faq');
    if (!ch) return;
    await ch.bulkDelete(100).catch(() => {});
    const faqs = [
      ['🔍 Verify', 'Go to #verify → click Verify → enter Minecraft username'],
      ['⚔️ Tier Test', 'Go to #request-tier-test → click your PvP mode button'],
      ['🔄 Retest', 'Go to #retest-request and follow instructions'],
      ['📩 Appeal', 'Go to #appeal and submit with details'],
      ['🖥️ Server IP', '`play.harvalmc.fun`'],
      ['📊 Tiers', 'T1 (lowest) → T5 (highest). Tested by verified testers.'],
    ];
    const e = new EmbedBuilder()
      .setTitle('❓ ═══ FREQUENTLY ASKED ═══')
      .setDescription('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      .setColor(0x3498DB);
    for (const [q, a] of faqs) {
      e.addFields({ name: q, value: a, inline: false });
    }
    e.setFooter({ text: '══════ HARVAL MC FAQ ══════' }).setTimestamp();
    await ch.send({ embeds: [e] }).catch(() => {});
  }

  private async panelVerify() {
    const ch = this.tc('verify');
    if (!ch) return;
    await ch.bulkDelete(100).catch(() => {});
    const e = new EmbedBuilder()
      .setTitle('✅ ═══ MINECRAFT VERIFICATION ═══')
      .setDescription(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**Click the button below** to verify your Minecraft account.\n\n' +
        '```fix\n' +
        '  What happens:\n' +
        '  → A form opens for your Minecraft username\n' +
        '  → Your Discord name changes to your MC name\n' +
        '  → You receive the ✅ Verified role\n' +
        '  → You can now request tier tests\n' +
        '```\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
      )
      .setColor(0x2ECC71)
      .setFooter({ text: '══════ VERIFICATION ══════' })
      .setTimestamp();
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('verify_start').setLabel('Verify Account').setEmoji('✅').setStyle(ButtonStyle.Success)
    );
    await ch.send({ embeds: [e], components: [row] }).catch(() => {});
  }

  private async panelTierTest() {
    const ch = this.tc('request-tier-test');
    if (!ch) return;
    await ch.bulkDelete(100).catch(() => {});
    const e = new EmbedBuilder()
      .setTitle('⚔️ ═══ REQUEST TIER TEST ═══')
      .setDescription(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**Click your PvP mode** to open a tier test ticket.\n\n' +
        '```fix\n' +
        '  How it works:\n' +
        '  1. Click your PvP mode button below\n' +
        '  2. A private ticket channel is created\n' +
        '  3. A tester claims your ticket\n' +
        '  4. You play your tier test match\n' +
        '  5. Tester gives you your tier result\n' +
        '```\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
      )
      .setColor(0xF1C40F)
      .setFooter({ text: '══════ TIER TESTING ══════' })
      .setTimestamp();
    await ch.send({ embeds: [e] }).catch(() => {});

    const groups = [
      ['Sword', 'Crystal', 'SMP', 'Netherite Pot', 'Diamond Pot'],
      ['UHC', 'BuildUHC', 'NoDebuff', 'Combo', 'Gapple'],
      ['OP Duel', 'Boxing', 'Axe', 'Mace', 'Anchor'],
      ['Cart PvP', 'Bedwars', 'Skywars', 'Bridge', 'Nodebuff'],
      ['Vanilla', 'Crossbow', 'Trident', 'Shield', 'Elytra Combat'],
      ['Custom Duel'],
    ];
    for (const g of groups) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (const mode of g) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`tier_request_${mode.replace(/\s+/g, '_').toLowerCase()}`)
            .setLabel(mode)
            .setEmoji(MODE_EMOJI[mode] || '🎮')
            .setStyle(ButtonStyle.Primary)
        );
      }
      await ch.send({ components: [row] }).catch(() => {});
    }
  }

  private async panelLeaderboard() {
    const ch = this.tc('leaderboards');
    if (!ch) return;
    await ch.bulkDelete(100).catch(() => {});
    const e = new EmbedBuilder()
      .setTitle('🏆 ═══ LEADERBOARDS ═══')
      .setDescription('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n*Updated in real-time as tests complete*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      .setColor(0xFFD700)
      .addFields(
        { name: '🏅 Most Active Players', value: '```No data yet```', inline: true },
        { name: '⚔️ Most Tests Completed', value: '```No data yet```', inline: true },
        { name: '⭐ Highest Rated Testers', value: '```No data yet```', inline: true },
        { name: '🎯 Highest Ranked Players', value: '```No data yet```', inline: true },
        { name: '🎮 Most Popular Modes', value: '```No data yet```', inline: true },
      )
      .setFooter({ text: '══════ LEADERBOARDS ══════' })
      .setTimestamp();
    await ch.send({ embeds: [e] }).catch(() => {});
  }

  // ═══════════════════════════════════════════════════════
  // /cleanup — Nuclear
  // ═══════════════════════════════════════════════════════
  public async cleanup(guild?: Guild): Promise<{ channels: number; roles: number }> {
    const g = guild || this.guild;
    let ch = 0, rl = 0;

    for (const cat of g.channels.cache.filter(c => c.type === ChannelType.GuildCategory).values()) {
      for (const child of (cat as CategoryChannel).children.cache.values()) {
        await child.delete().catch(() => {}); ch++;
      }
      await cat.delete().catch(() => {}); ch++;
    }

    for (const c of [...g.channels.cache.values()]) {
      if (c.type === ChannelType.GuildCategory) continue;
      await c.delete().catch(() => {}); ch++;
    }

    for (const r of [...g.roles.cache.values()]) {
      if (r.name === '@everyone') continue;
      await r.delete().catch(() => {}); rl++;
    }

    logger.info(`[CLEANUP] ${ch} channels, ${rl} roles deleted`);
    return { channels: ch, roles: rl };
  }

  // ═══════════════════════════════════════════════════════
  // Ticket creation
  // ═══════════════════════════════════════════════════════
  public async createTicket(mode: string, player: { id: string; username: string; displayName: string }): Promise<TextChannel | null> {
    const cat = this.findCategory('tickets');
    if (!cat) {
      logger.error('Tickets category not found');
      return null;
    }

    const slug = mode.replace(/\s+/g, '-').toLowerCase();
    const channelName = `ticket-${slug}-${player.displayName}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 100);

    const everyone = this.guild.roles.everyone;
    const staffRoles = this.guild.roles.cache.filter(r =>
      /^(👑|⚡|🌐|🛡️|🔰|⚔️|💎|🔨|🎬)/.test(r.name)
    );

    const overwrites = [
      { id: everyone.id, allow: [], deny: [PermissionFlagsBits.ViewChannel] },
      { id: player.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory], deny: [] },
    ];

    for (const [, role] of staffRoles) {
      overwrites.push({ id: role.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory], deny: [] });
    }

    const ticketChannel = await this.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: cat,
      permissionOverwrites: overwrites,
      topic: `🎫 ${MODE_EMOJI[mode] || '🎮'} ${mode} Tier Test — ${player.displayName}`,
    }).catch(e => { logger.error(`Create ticket: ${e}`); return null; });

    if (!ticketChannel) return null;

    const emoji = MODE_EMOJI[mode] || '🎮';
    const embed = new EmbedBuilder()
      .setTitle(`${emoji} ═══ TIER TEST TICKET ═══`)
      .setDescription(
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `**Player:** ${player.displayName} (<@${player.id}>)\n` +
        `**Mode:** ${emoji} ${mode}\n` +
        `**Status:** ⏳ Waiting for tester...\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `**How this works:**\n` +
        '```\n' +
        '  1. ⚔️ Claim    — Tester claims this ticket\n' +
        '  2. ▶️ Start    — Send IP & instructions to player\n' +
        '  3. 🏆 Give Tier — Assign tier result to player\n' +
        '  4. ✅ Finish   — Close the ticket\n' +
        '```\n\n' +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      )
      .setColor(0xF1C40F)
      .setFooter({ text: `Ticket: ${mode} — ${player.displayName}` })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`ticket_claim_${ticketChannel.id}`).setLabel('Claim').setEmoji('⚔️').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`ticket_start_${ticketChannel.id}`).setLabel('Start').setEmoji('▶️').setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder().setCustomId(`ticket_givetier_${ticketChannel.id}`).setLabel('Give Tier').setEmoji('🏆').setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId(`ticket_finish_${ticketChannel.id}`).setLabel('Finish').setEmoji('✅').setStyle(ButtonStyle.Danger).setDisabled(true),
    );

    await ticketChannel.send({ embeds: [embed], components: [row] }).catch(() => {});
    logger.info(`[TICKET] Created: ${channelName}`);
    return ticketChannel;
  }

  public static getStaffRoleId(guild: Guild, name: string): string | undefined {
    return guild.roles.cache.find(r => r.name === name)?.id;
  }
}
