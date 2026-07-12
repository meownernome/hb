import { CategoryChannel, Guild, ChannelType, PermissionsBitField, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, PermissionFlagsBits } from 'discord.js';
import { logger } from './utils/Logger';
import { MongoModel } from './database';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const CATEGORIES = [
  '══════════ INFORMATION ══════════',
  '══════════ COMMUNITY ══════════',
  '══════════ SUPPORT ══════════',
  '══════════ TIER TESTING ══════════',
  '══════════ TICKETS ══════════',
  '══════════ LEADERBOARDS ══════════',
  '══════════ STAFF ══════════',
  '══════════ LOGS ══════════',
  '══════════ VOICE ══════════',
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

const TIERS = [
  { level: 1, prefix: 'LT', hex: 0x7F8C8D, rank: 1 },
  { level: 2, prefix: 'LT', hex: 0x95A5A6, rank: 2 },
  { level: 3, prefix: 'LT', hex: 0x27AE60, rank: 3 },
  { level: 4, prefix: 'LT', hex: 0x2ECC71, rank: 4 },
  { level: 5, prefix: 'LT', hex: 0x3498DB, rank: 5 },
  { level: 5, prefix: 'HT', hex: 0x8E44AD, rank: 6 },
  { level: 4, prefix: 'HT', hex: 0x9B59B6, rank: 7 },
  { level: 3, prefix: 'HT', hex: 0xD4AC0D, rank: 8 },
  { level: 2, prefix: 'HT', hex: 0xF1C40F, rank: 9 },
  { level: 1, prefix: 'HT', hex: 0xFFD700, rank: 10 },
];

const STAFF_ROLES = [
  { name: '👑 ━━ Founder', color: 0xFFD700 },
  { name: '👑 ━━ Co-Founder', color: 0xFFD700 },
  { name: '⚡ ━━ Lead Developer', color: 0x00FF00 },
  { name: '⚡ ━━ Developer', color: 0x00FF00 },
  { name: '🌐 ━━ Network Manager', color: 0x1ABC9C },
  { name: '🛡️ ━━ Head Administrator', color: 0xE74C3C },
  { name: '🛡️ ━━ Administrator', color: 0xE74C3C },
  { name: '🔰 ━━ Senior Moderator', color: 0x3498DB },
  { name: '🔰 ━━ Moderator', color: 0x3498DB },
  { name: '🔰 ━━ Trial Moderator', color: 0x5DADE2 },
  { name: '⚔️ ━━ Head Tier Tester', color: 0xF1C40F },
  { name: '⚔️ ━━ Senior Tier Tester', color: 0xF39C12 },
  { name: '⚔️ ━━ Tier Tester', color: 0xF39C12 },
  { name: '⚔️ ━━ Trial Tier Tester', color: 0xF5B041 },
  { name: '💎 ━━ Support Team', color: 0x1ABC9C },
  { name: '🔨 ━━ Builder', color: 0xE67E22 },
  { name: '🎬 ━━ Media Team', color: 0x9B59B6 },
  { name: '✅ ━━ Verified', color: 0x2ECC71 },
  { name: '👤 ━━ Member', color: 0x95A5A6 },
  { name: '🔇 ━━ Muted', color: 0x7F8C8D },
  { name: '🤖 ━━ Bot', color: 0x2C3E50 },
];

const STAFF_ROLE_PATTERNS = /^(👑|⚡|🌐|🛡️|🔰|⚔️|💎|🔨|🎬)/;

// ═══════════════════════════════════════════════════════════════
// SERVER SETUP CLASS
// ═══════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════

  private findCategory(key: string): CategoryChannel | undefined {
    const idx = CATEGORY_KEYS.indexOf(key);
    const catName = idx >= 0 ? CATEGORIES[idx] : key;
    return this.guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && (c.name === catName || c.name === key)
    ) as CategoryChannel | undefined;
  }

  private tc(name: string): TextChannel | undefined {
    return this.guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildText) as TextChannel | undefined;
  }

  private async createCategory(name: string): Promise<void> {
    if (this.guild.channels.cache.some(c => c.type === ChannelType.GuildCategory && c.name === name)) return;
    try {
      await this.guild.channels.create({ name, type: ChannelType.GuildCategory });
      logger.info(`  📁 Created category: ${name}`);
      await this.sleep(500);
    } catch (e: any) {
      if (e?.httpStatus === 429) {
        await this.handleRateLimit(e, `category ${name}`);
        await this.createCategory(name);
      } else {
        logger.error(`  ❌ Failed to create category ${name}: ${e?.message || e}`);
      }
    }
  }

  private async createChannel(catKey: string, name: string, type: ChannelType, topic?: string): Promise<void> {
    const cat = this.findCategory(catKey);
    if (!cat) { logger.warn(`  ⚠️ Category ${catKey} not found, skipping #${name}`); return; }
    if (cat.children.cache.some(c => c.name === name)) { logger.info(`  ⏭️ #${name} already exists, skipping`); return; }
    const data: any = { name, type, parent: cat };
    if (type === ChannelType.GuildText && topic) data.topic = topic;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await cat.children.create(data);
        logger.info(`  📢 Created channel: #${name}`);
        await this.sleep(500);
        return;
      } catch (e: any) {
        if (e?.httpStatus === 429) {
          await this.handleRateLimit(e, `channel #${name}`);
        } else {
          logger.error(`  ❌ Failed to create #${name}: ${e?.message || e}`);
          return;
        }
      }
    }
  }

  private async createRole(name: string, color?: number): Promise<void> {
    if (this.guild.roles.cache.some(r => r.name === name)) { logger.info(`  ⏭️ ${name} exists`); return; }
    try {
      await this.guild.roles.create({ name });
      logger.info(`  🎨 ${name}`);
      await this.sleep(500);
      return;
    } catch (e2: any) {
      const msg = e2?.message || e2?.code || String(e2);
      if (e2?.code === 50013 || msg.includes('Missing Permissions') || msg.includes('Missing Access') || msg.includes('Forbidden')) {
        logger.error(`  ❌ Bot CANNOT create roles — Manage Roles permission missing. Re-invite the bot.`);
        throw new Error('NO_PERMISSION');
      }
      logger.error(`  ❌ ${name}: ${msg}`);
      await this.sleep(500);
    }
  }

  private async handleRateLimit(e: any, context: string): Promise<void> {
    const wait = e?.retry_after ? e.retry_after * 1000 : 5000;
    logger.warn(`  ⏳ Rate limited on ${context}, waiting ${(wait / 1000).toFixed(1)}s...`);
    await this.sleep(wait);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  private async setChannelPermissions(channel: TextChannel, staffRoleId: string): Promise<void> {
    try {
      await channel.permissionOverwrites.edit(staffRoleId, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        ManageMessages: true,
      });
    } catch { /* role may not exist */ }
  }

  // ═══════════════════════════════════════════════════════════════
  // /all — Full structure + roles
  // ═══════════════════════════════════════════════════════════════

  public async setupAll(): Promise<void> {
    const startTime = Date.now();
    logger.info(`═══════════════════════════════════════════════`);
    logger.info(`[/all] Starting full setup for ${this.guild.name}`);
    logger.info(`═══════════════════════════════════════════════`);

    try {
      // ── PHASE 1: Categories ──
      logger.info(`\n📂 Phase 1/4: Creating categories...`);
      for (const name of CATEGORIES) {
        await this.createCategory(name);
      }
      logger.info(`✅ Phase 1 complete: ${CATEGORIES.length} categories`);

      // ── PHASE 2: Channels ──
      logger.info(`\n📢 Phase 2/4: Creating channels...`);

      // Information
      logger.info(`  ── Information ──`);
      await this.createChannel('information', 'welcome', ChannelType.GuildText, '🏰 Welcome to HARVAL MC — The Ultimate PvP Network');
      await this.createChannel('information', 'rules', ChannelType.GuildText, '📜 Server rules — Read before chatting');
      await this.createChannel('information', 'faq', ChannelType.GuildText, '❓ Frequently asked questions');
      await this.createChannel('information', 'server-ip', ChannelType.GuildText, '🖥️ Server IP ━━ play.harvalmc.fun');
      await this.createChannel('information', 'announcements', ChannelType.GuildText, '📢 Official announcements & news');
      await this.createChannel('information', 'updates', ChannelType.GuildText, '🔔 Patch notes & server updates');
      await this.createChannel('information', 'verify', ChannelType.GuildText, '✅ Click the button to verify your Minecraft account');
      await this.createChannel('information', 'how-tier-testing-works', ChannelType.GuildText, '📖 Guide: How the tier system works');
      await this.createChannel('information', 'staff', ChannelType.GuildText, '👥 Meet the HARVAL MC staff team');
      await this.createChannel('information', 'roles', ChannelType.GuildText, '🎨 Self-assign your roles here');

      // Community
      logger.info(`  ── Community ──`);
      await this.createChannel('community', 'general', ChannelType.GuildText, '💬 General discussion — Be respectful');
      await this.createChannel('community', 'minecraft-chat', ChannelType.GuildText, '⛏️ Minecraft discussion & server talk');
      await this.createChannel('community', 'clips', ChannelType.GuildText, '🎬 Share your best PvP clips');
      await this.createChannel('community', 'screenshots', ChannelType.GuildText, '📸 Share screenshots & builds');
      await this.createChannel('community', 'media', ChannelType.GuildText, '🎥 YouTube/Twitch content & montages');
      await this.createChannel('community', 'polls', ChannelType.GuildText, '📊 Community polls & votes');
      await this.createChannel('community', 'suggestions', ChannelType.GuildText, '💡 Suggest improvements for the server');
      await this.createChannel('community', 'off-topic', ChannelType.GuildText, '🎲 Off-topic chat & fun');

      // Support
      logger.info(`  ── Support ──`);
      await this.createChannel('support', 'create-ticket', ChannelType.GuildText, '🎫 Click below to open a support ticket');
      await this.createChannel('support', 'bug-report', ChannelType.GuildText, '🐛 Found a bug? Report it here');
      await this.createChannel('support', 'report-player', ChannelType.GuildText, '🚨 Report rule-breaking players');
      await this.createChannel('support', 'appeal', ChannelType.GuildText, '📩 Appeal a ban or mute');
      await this.createChannel('support', 'questions', ChannelType.GuildText, '❓ Ask questions — Staff will help');

      // Tier Testing
      logger.info(`  ── Tier Testing ──`);
      await this.createChannel('tier-testing', 'request-tier-test', ChannelType.GuildText, '⚔️ Click a mode button below to start your tier test');
      await this.createChannel('tier-testing', 'queue', ChannelType.GuildText, '⏳ Current test queue — Check your position');
      await this.createChannel('tier-testing', 'tier-results', ChannelType.GuildText, '🏆 Published tier results for all modes');
      await this.createChannel('tier-testing', 'leaderboards', ChannelType.GuildText, '📊 Global leaderboards — Updated in real-time');
      await this.createChannel('tier-testing', 'tier-information', ChannelType.GuildText, '📖 LT & HT tier system explained');
      await this.createChannel('tier-testing', 'retest-request', ChannelType.GuildText, '🔄 Request a retest if you improved');

      // Staff
      logger.info(`  ── Staff ──`);
      await this.createChannel('staff', 'staff-chat', ChannelType.GuildText, '🔒 Staff-only discussion');
      await this.createChannel('staff', 'commands', ChannelType.GuildText, '⌨️ Bot commands for staff use');
      await this.createChannel('staff', 'claims', ChannelType.GuildText, '📌 Claim pending tier tests');
      await this.createChannel('staff', 'applications', ChannelType.GuildText, '📝 Staff application reviews');
      await this.createChannel('staff', 'reports', ChannelType.GuildText, '📋 Player reports for staff review');
      await this.createChannel('staff', 'moderation', ChannelType.GuildText, '🔨 Moderation actions & logs');

      // Logs
      logger.info(`  ── Logs ──`);
      await this.createChannel('logs', 'ticket-logs', ChannelType.GuildText, '🎫 Ticket activity logs');
      await this.createChannel('logs', 'tier-logs', ChannelType.GuildText, '⚔️ Tier assignment logs');
      await this.createChannel('logs', 'bot-logs', ChannelType.GuildText, '🤖 Bot event logs');
      await this.createChannel('logs', 'error-logs', ChannelType.GuildText, '❌ Error & crash logs');
      await this.createChannel('logs', 'join-leave', ChannelType.GuildText, '👋 Member join & leave events');
      await this.createChannel('logs', 'role-logs', ChannelType.GuildText, '🎨 Role change logs');
      await this.createChannel('logs', 'verification-logs', ChannelType.GuildText, '✅ Verification attempt logs');
      await this.createChannel('logs', 'command-logs', ChannelType.GuildText, '⌨️ Slash command usage logs');

      // Voice
      logger.info(`  ── Voice ──`);
      for (const v of ['/general-1', '/general-2', '/afk', '/staff-vc', '/meeting-room']) {
        await this.createChannel('voice', v.slice(1), ChannelType.GuildVoice);
      }

      logger.info(`✅ Phase 2 complete: All channels created`);

      // ── PHASE 3: Tier Roles (LT/HT) ──
      logger.info(`\n🎨 Phase 3/4: Creating tier roles (LT/HT system)...`);

      // Check if bot can create roles
      const botMember = this.guild.members.me;
      const botRoles = botMember?.roles?.cache;
      const botHighestRole = botRoles?.filter(r => r.name !== '@everyone')?.sort((a, b) => b.position - a.position)?.first();
      if (!botHighestRole) {
        logger.warn(`  ⚠️ Bot has NO roles (highest position = @everyone). Role creation might fail!`);
        logger.warn(`  ⚠️ If /cleanup deleted the bot's role, RE-INVITE the bot to fix this.`);
      } else {
        logger.info(`  🤖 Bot's highest role: "${botHighestRole.name}" (position ${botHighestRole.position})`);
      }

      let roleCount = 0;
      const totalRoles = (TIER_MODES.length * 10) + STAFF_ROLES.length;
      let permissionError = false;

      for (let i = 0; i < TIER_MODES.length && !permissionError; i++) {
        const mode = TIER_MODES[i];
        logger.info(`  ── ${mode} ──`);
        for (const tier of TIERS) {
          const roleName = `${mode} ${tier.prefix} ${tier.level}`;
          try {
            await this.createRole(roleName, tier.hex);
            roleCount++;
          } catch (e: any) {
            if (e?.message === 'NO_PERMISSION') { permissionError = true; break; }
          }
        }
        if ((i + 1) % 5 === 0 && !permissionError) {
          logger.info(`  📊 Progress: ${roleCount}/${totalRoles} roles (finished: ${mode})`);
          await this.sleep(3000);
        }
      }

      // ── PHASE 3b: Staff Roles ──
      if (!permissionError) {
        logger.info(`  ── Staff Roles ──`);
        for (let i = 0; i < STAFF_ROLES.length; i++) {
          const sr = STAFF_ROLES[i];
          try {
            await this.createRole(sr.name, sr.color);
            roleCount++;
          } catch (e: any) {
            if (e?.message === 'NO_PERMISSION') { permissionError = true; break; }
          }
          if ((i + 1) % 5 === 0 && !permissionError) {
            logger.info(`  📊 Staff roles: ${i + 1}/${STAFF_ROLES.length}`);
            await this.sleep(2000);
          }
        }
      }

      if (permissionError) {
        logger.error(`[/all] ❌ STOPPED at Phase 3 — Bot cannot create roles.`);
      } else {
        logger.info(`✅ Phase 3 complete: ${roleCount} roles created`);
      }

      // ── PHASE 4: Role Hierarchy ──
      logger.info(`\n📊 Phase 4/4: Setting role hierarchy permissions...`);
      const rolesToEdit = this.guild.roles.cache
        .filter(r => r.name !== '@everyone' && r.editable)
        .sort((a, b) => b.position - a.position)
        .values();
      let edited = 0;
      for (const r of rolesToEdit) {
        await r.setPermissions(PermissionsBitField.Flags.UseApplicationCommands).catch(() => {});
        edited++;
        if (edited % 10 === 0) {
          await this.sleep(1000);
        }
      }
      logger.info(`✅ Phase 4 complete: ${edited} roles hierarchy set`);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      logger.info(`\n═══════════════════════════════════════════════`);
      logger.info(`[/all] ✅ COMPLETE for ${this.guild.name}`);
      logger.info(`[/all] ⏱️ Time: ${elapsed}s | 📢 Channels: ~50 | 🎨 Roles: ${roleCount}`);
      logger.info(`═══════════════════════════════════════════════`);
    } catch (error: any) {
      logger.error(`[/all] CRASHED during setup: ${error?.message || error}`);
      logger.error(`[/all] Stack: ${error?.stack || 'N/A'}`);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // /setup — Content panels + staff permissions
  // ═══════════════════════════════════════════════════════════════

  public async setupContent(): Promise<void> {
    logger.info(`[/setup] Starting content panels for ${this.guild.name}`);
    await this.panelWelcome();
    await this.panelRules();
    await this.panelFAQ();
    await this.panelVerify();
    await this.panelTierTest();
    await this.panelLeaderboard();
    await this.panelIP();
    await this.setupStaffPermissions();
    logger.info(`[/setup] ✅ Done for ${this.guild.name}`);
  }

  private async panelWelcome() {
    const ch = this.tc('welcome');
    if (!ch) return;
    logger.info(`  📨 Posting welcome panel`);
    const e = new EmbedBuilder()
      .setTitle('╔══════════════════════════════╗')
      .setDescription(
        '# 🏰 ━━ Welcome to **HARVAL MC**\n' +
        '### *The Ultimate PvP Tier Testing Network*\n' +
        '╚══════════════════════════════╝\n\n' +
        '**╔══════════ GETTING STARTED ══════════╗**\n' +
        '```\n' +
        '  ┃  1 ┃  📜 Read the rules in #rules\n' +
        '  ┃  2 ┃  ✅ Verify in #verify\n' +
        '  ┃  3 ┃  ⚔️  Request a tier test\n' +
        '  ┃  4 ┃  🏆 Climb the ranks!\n' +
        '```\n' +
        '**╚═══════════════════════════════════╝**\n\n' +
        '**╔══════════ SERVER INFO ══════════╗**\n' +
        '```yaml\n' +
        '  ┃ 🖥️  Server IP  ━━  play.harvalmc.fun\n' +
        '  ┃ 🎮 Game Modes ━━  26+ PvP modes\n' +
        '  ┃ ⚔️  Tier System ━━  LT 1 → HT 5\n' +
        '  ┃ 👥 Staff Ready ━━  24/7 support\n' +
        '```\n' +
        '**╚═══════════════════════════════════╝**'
      )
      .setColor(0xFFD700)
      .setThumbnail(this.guild.iconURL())
      .setFooter({ text: '╠════ HARVAL MC ════╣' })
      .setTimestamp();
    await ch.send({ embeds: [e] }).catch(() => {});
  }

  private async panelRules() {
    const ch = this.tc('rules');
    if (!ch) return;
    logger.info(`  📨 Posting rules panel`);
    await ch.bulkDelete(100).catch(() => {});
    const rules = [
      ['01', '👑', 'Respect All Members', 'No harassment, hate speech, or discrimination'],
      ['02', '🚫', 'No Cheating or Hacking', 'Hacks, cheats, exploits = permanent ban'],
      ['03', '🛡️', 'Follow Staff Instructions', 'Staff decisions are final'],
      ['04', '🔇', 'No Spam or Self-Promotion', 'Keep channels clean'],
      ['05', '📌', 'Use Channels Correctly', 'Right content in right channels'],
      ['06', '🚨', 'Report Issues', 'Use report channels, not public chat'],
      ['07', '⚔️', 'Fair Play', 'No ghosting, stream sniping in tests'],
      ['08', '🔞', 'No NSFW Content', 'Zero tolerance policy'],
      ['09', '💼', 'Be Professional', 'Competitive but respectful'],
      ['10', '🎮', 'Have Fun!', 'Enjoy and improve your PvP'],
    ];
    const e = new EmbedBuilder()
      .setTitle('╔══════════════════════════════╗')
      .setDescription(
        '## 📜 ━━ SERVER RULES\n' +
        '### *By being here, you agree to all rules below.*\n' +
        '╚══════════════════════════════╝'
      )
      .setColor(0xE74C3C);
    for (const [num, emoji, title, desc] of rules) {
      e.addFields({ name: `${emoji} ┃ Rule ${num} ━━ ${title}`, value: `> ${desc}`, inline: false });
    }
    e.addFields(
      { name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━', value: '\u200B', inline: false },
      { name: '⚠️ Enforcement', value: '> Warnings → Mutes → Bans at staff discretion\n> Ignorance of rules is not an excuse', inline: false }
    );
    e.setFooter({ text: '╠════ HARVAL MC RULES ════╣' }).setTimestamp();
    await ch.send({ embeds: [e] }).catch(() => {});
  }

  private async panelFAQ() {
    const ch = this.tc('faq');
    if (!ch) return;
    logger.info(`  📨 Posting FAQ panel`);
    await ch.bulkDelete(100).catch(() => {});
    const faqs = [
      ['🔍 How to Verify?', 'Go to #verify → Click "Verify" → Enter Minecraft username'],
      ['⚔️ How to Tier Test?', 'Go to #request-tier-test → Click your PvP mode button → Join the ticket'],
      ['🔄 How to Retest?', 'Go to #retest-request → Follow the instructions there'],
      ['📩 How to Appeal?', 'Go to #appeal → Submit your appeal with details'],
      ['🖥️ Server IP?', '`play.harvalmc.fun` — Add it in Minecraft and join!'],
      ['📊 Tier System?', '**10 tiers per mode!**\n⬆️ **LT (Low Tier):** LT 1 → LT 5 (climbing up)\n🏆 **HT (High Tier):** HT 5 → HT 1 (elite ranks)\n**HT 1** = Top Tier (best) 👑\n**LT 1** = Starting Tier 🟤'],
    ];
    const e = new EmbedBuilder()
      .setTitle('╔══════════════════════════════╗')
      .setDescription(
        '## ❓ ━━ FREQUENTLY ASKED\n' +
        '### *Quick answers to common questions*\n' +
        '╚══════════════════════════════╝'
      )
      .setColor(0x3498DB);
    for (const [q, a] of faqs) {
      e.addFields({ name: q, value: `> ${a}`, inline: false });
    }
    e.setFooter({ text: '╠════ HARVAL MC FAQ ════╣' }).setTimestamp();
    await ch.send({ embeds: [e] }).catch(() => {});
  }

  private async panelIP() {
    const ch = this.tc('server-ip');
    if (!ch) return;
    logger.info(`  📨 Posting server IP panel`);
    await ch.bulkDelete(100).catch(() => {});
    const e = new EmbedBuilder()
      .setTitle('╔══════════════════════════════╗')
      .setDescription(
        '## 🖥️ ━━ SERVER IP\n' +
        '### *Join now and start your PvP journey!*\n' +
        '╚══════════════════════════════╝\n\n' +
        '**╔══════════ CONNECT ══════════╗**\n' +
        '```\n' +
        '  ┃  IP Address  ━━  play.harvalmc.fun\n' +
        '  ┃  Port        ━━  25565 (default)\n' +
        '  ┃  Version     ━━  1.8.x — 1.21.x\n' +
        '```\n' +
        '**╚═══════════════════════════════════╝**\n\n' +
        '**╔══════════ HOW TO JOIN ══════════╗**\n' +
        '```\n' +
        '  ┃  1 ┃  Open Minecraft\n' +
        '  ┃  2 ┃  Multiplayer → Add Server\n' +
        '  ┃  3 ┃  paste: play.harvalmc.fun\n' +
        '  ┃  4 ┃  Join & have fun!\n' +
        '```\n' +
        '**╚═══════════════════════════════════╝**'
      )
      .setColor(0x2ECC71)
      .setFooter({ text: '╠════ HARVAL MC ════╣' })
      .setTimestamp();
    await ch.send({ embeds: [e] }).catch(() => {});
  }

  private async panelVerify() {
    const ch = this.tc('verify');
    if (!ch) return;
    logger.info(`  📨 Posting verify panel`);
    await ch.bulkDelete(100).catch(() => {});
    const e = new EmbedBuilder()
      .setTitle('╔══════════════════════════════╗')
      .setDescription(
        '## ✅ ━━ MINECRAFT VERIFICATION\n' +
        '### *Link your Minecraft account to Discord*\n' +
        '╚══════════════════════════════╝\n\n' +
        '**╔══════════ WHAT HAPPENS ══════════╗**\n' +
        '```\n' +
        '  ┃  ►  A form opens for your MC username\n' +
        '  ┃  ►  Your Discord name changes to MC name\n' +
        '  ┃  ►  You receive the ✅ Verified role\n' +
        '  ┃  ►  You can now request tier tests!\n' +
        '```\n' +
        '**╚═══════════════════════════════════╝**\n\n' +
        '> Click the button below to begin verification.'
      )
      .setColor(0x2ECC71)
      .setFooter({ text: '╠════ VERIFICATION ════╣' })
      .setTimestamp();
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_start')
        .setLabel('Verify Account')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success)
    );
    await ch.send({ embeds: [e], components: [row] }).catch(() => {});
  }

  private async panelTierTest() {
    const ch = this.tc('request-tier-test');
    if (!ch) return;
    logger.info(`  📨 Posting tier test panel`);
    await ch.bulkDelete(100).catch(() => {});

    const e = new EmbedBuilder()
      .setTitle('╔══════════════════════════════╗')
      .setDescription(
        '## ⚔️ ━━ REQUEST A TIER TEST\n' +
        '### *Select your PvP mode to begin*\n' +
        '╚══════════════════════════════╝\n\n' +
        '**╔══════════ HOW IT WORKS ══════════╗**\n' +
        '```\n' +
        '  ┃  1 ┃  Click your PvP mode button below\n' +
        '  ┃  2 ┃  A private ticket channel opens\n' +
        '  ┃  3 ┃  A tester claims your ticket\n' +
        '  ┃  4 ┃  You play your tier test match\n' +
        '  ┃  5 ┃  Tester assigns your tier result\n' +
        '```\n' +
        '**╚═══════════════════════════════════╝**\n\n' +
          '**╔══════════ TIER SYSTEM ══════════╗**\n' +
          '```\n' +
          '  ┃  🟤  LT 1  ━━  Low-Tier 1 (Start)\n' +
          '  ┃  ⬜  LT 2  ━━  Low-Tier 2\n' +
          '  ┃  🟢  LT 3  ━━  Low-Tier 3\n' +
          '  ┃  🟩  LT 4  ━━  Low-Tier 4\n' +
          '  ┃  🔵  LT 5  ━━  Low-Tier 5 (Best LT)\n' +
          '  ┃  🟣  HT 5  ━━  High-Tier 5\n' +
          '  ┃  🟪  HT 4  ━━  High-Tier 4\n' +
          '  ┃  🟡  HT 3  ━━  High-Tier 3\n' +
          '  ┃  ⭐  HT 2  ━━  High-Tier 2\n' +
          '  ┃  👑  HT 1  ━━  High-Tier 1 (TOP TIER!)\n' +
          '```\n' +
          '**╚═══════════════════════════════════╝**\n\n' +
        '> **Select your mode from the buttons below:**'
      )
      .setColor(0xF1C40F)
      .setFooter({ text: '╠════ TIER TESTING ════╣' })
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
    logger.info(`  📨 Posting leaderboard panel`);
    await ch.bulkDelete(100).catch(() => {});
    const e = new EmbedBuilder()
      .setTitle('╔══════════════════════════════╗')
      .setDescription(
        '## 🏆 ━━ LEADERBOARDS\n' +
        '### *Updated in real-time as tests complete*\n' +
        '╚══════════════════════════════╝'
      )
      .setColor(0xFFD700)
      .addFields(
        { name: '🏅 Most Active Players', value: '```\n  ┃ No data yet\n```', inline: true },
        { name: '⚔️ Most Tests Completed', value: '```\n  ┃ No data yet\n```', inline: true },
        { name: '⭐ Highest Rated Testers', value: '```\n  ┃ No data yet\n```', inline: true },
        { name: '🎯 Highest Ranked Players', value: '```\n  ┃ No data yet\n```', inline: true },
        { name: '🎮 Most Popular Modes', value: '```\n  ┃ No data yet\n```', inline: true },
      )
      .setFooter({ text: '╠════ LEADERBOARDS ════╣' })
      .setTimestamp();
    await ch.send({ embeds: [e] }).catch(() => {});
  }

  // ═══════════════════════════════════════════════════════════════
  // Staff permissions on channels
  // ═══════════════════════════════════════════════════════════════

  private async setupStaffPermissions(): Promise<void> {
    logger.info(`  🔐 Setting up staff channel permissions...`);
    const staffChannelNames = ['staff-chat', 'commands', 'claims', 'applications', 'reports', 'moderation'];
    const logChannelNames = ['ticket-logs', 'tier-logs', 'bot-logs', 'error-logs', 'join-leave', 'role-logs', 'verification-logs', 'command-logs'];

    // Staff channels: only staff can see
    for (const name of staffChannelNames) {
      const ch = this.tc(name);
      if (!ch) continue;
      for (const sr of STAFF_ROLES) {
        const role = this.guild.roles.cache.find(r => r.name === sr.name);
        if (role) await this.setChannelPermissions(ch, role.id);
      }
      // Hide from everyone
      await ch.permissionOverwrites.edit(this.guild.roles.everyone, { ViewChannel: false }).catch(() => {});
      logger.info(`    🔒 Locked #${name} to staff only`);
    }

    // Log channels: only staff can see
    for (const name of logChannelNames) {
      const ch = this.tc(name);
      if (!ch) continue;
      for (const sr of STAFF_ROLES) {
        const role = this.guild.roles.cache.find(r => r.name === sr.name);
        if (role) await this.setChannelPermissions(ch, role.id);
      }
      await ch.permissionOverwrites.edit(this.guild.roles.everyone, { ViewChannel: false }).catch(() => {});
      logger.info(`    🔒 Locked #${name} to staff only`);
    }

    // Voice staff VC: only staff
    const staffVc = this.tc('staff-vc');
    if (staffVc) {
      for (const sr of STAFF_ROLES) {
        const role = this.guild.roles.cache.find(r => r.name === sr.name);
        if (role) await this.setChannelPermissions(staffVc, role.id);
      }
      await staffVc.permissionOverwrites.edit(this.guild.roles.everyone, { ViewChannel: false }).catch(() => {});
      logger.info(`    🔒 Locked #staff-vc to staff only`);
    }

    logger.info(`  ✅ Staff permissions configured`);
  }

  // ═══════════════════════════════════════════════════════════════
  // /cleanup — Nuclear
  // ═══════════════════════════════════════════════════════════════

  public async cleanup(guild?: Guild): Promise<{ channels: number; roles: number }> {
    const g = guild || this.guild;
    let ch = 0, rl = 0;

    // Delete all channel children first
    for (const cat of g.channels.cache.filter(c => c.type === ChannelType.GuildCategory).values()) {
      for (const child of (cat as CategoryChannel).children.cache.values()) {
        await child.delete().catch(() => {}); ch++;
      }
    }
    // Delete categories
    for (const cat of g.channels.cache.filter(c => c.type === ChannelType.GuildCategory).values()) {
      await cat.delete().catch(() => {}); ch++;
    }
    // Delete orphan channels
    for (const c of [...g.channels.cache.values()]) {
      if (c.type === ChannelType.GuildCategory) continue;
      await c.delete().catch(() => {}); ch++;
    }

    // Delete all roles except @everyone and managed (bot) roles
    for (const r of [...g.roles.cache.values()]) {
      if (r.name === '@everyone') continue;
      if (r.managed) continue;
      await r.delete().catch(() => {}); rl++;
      await this.sleep(200);
    }

    logger.info(`[CLEANUP] ${ch} channels, ${rl} roles deleted`);
    return { channels: ch, roles: rl };
  }

  // ═══════════════════════════════════════════════════════════════
  // Ticket creation
  // ═══════════════════════════════════════════════════════════════

  public async createTicket(mode: string, player: { id: string; username: string; displayName: string }): Promise<TextChannel | null> {
    const cat = this.findCategory('tickets');
    if (!cat) { logger.error('Tickets category not found'); return null; }

    const slug = mode.replace(/\s+/g, '-').toLowerCase();
    const channelName = `ticket-${slug}-${player.displayName}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 100);

    const everyone = this.guild.roles.everyone;
    const staffRoles = this.guild.roles.cache.filter(r => STAFF_ROLE_PATTERNS.test(r.name));

    const overwrites = [
      { id: everyone.id, allow: [] as any[], deny: [PermissionFlagsBits.ViewChannel] },
      { id: player.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory], deny: [] as any[] },
    ];

    for (const [, role] of staffRoles) {
      overwrites.push({ id: role.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory], deny: [] as any[] });
    }

    const ticketChannel = await this.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: cat,
      permissionOverwrites: overwrites,
      topic: `🎫 ${MODE_EMOJI[mode] || '🎮'} ${mode} Tier Test ━━ ${player.displayName}`,
    }).catch(e => { logger.error(`Create ticket: ${e}`); return null; });

    if (!ticketChannel) return null;

    const emoji = MODE_EMOJI[mode] || '🎮';

    // ── Message 1: Player-facing embed (no buttons) ──
    const playerEmbed = new EmbedBuilder()
      .setTitle('╔══════════════════════════════╗')
      .setDescription(
        `## ${emoji} ━━ TIER TEST TICKET\n` +
        `### *${mode} — Created by ${player.displayName}*\n` +
        '╚══════════════════════════════╝\n\n' +
        `**╔══════════ TICKET INFO ══════════╗**\n` +
        '```\n' +
        `  ┃  Player   ━━  ${player.displayName}\n` +
        `  ┃  Mode     ━━  ${emoji} ${mode}\n` +
        '  ┃  Status   ━━  ⏳ Waiting for tester...\n' +
        '```\n' +
        '**╚═══════════════════════════════════╝**\n\n' +
        '> A staff member will claim your ticket shortly.\n' +
        '> Please wait patiently in this channel.'
      )
      .setColor(0xF1C40F)
      .setFooter({ text: `╠════ TIER TEST TICKET ════╣` })
      .setTimestamp();

    await ticketChannel.send({ embeds: [playerEmbed] }).catch(() => {});

    // ── Message 2: Staff control panel (buttons) ──
    const staffEmbed = new EmbedBuilder()
      .setTitle('╔══════════════════════════════╗')
      .setDescription(
        '## ⚔️ ━━ STAFF CONTROL PANEL\n' +
        '### *Only staff can use these controls*\n' +
        '╚══════════════════════════════╝\n\n' +
        '**╔══════════ ACTIONS ══════════╗**\n' +
        '```\n' +
        '  ┃  ▶️  Start    ━━  Send IP & instructions\n' +
        '  ┃  🏆  Give Tier ━━  Assign tier result\n' +
        '  ┃  ✅  Finish   ━━  Close the ticket\n' +
        '```\n' +
        '**╚═══════════════════════════════════╝**'
      )
      .setColor(0x3498DB)
      .setFooter({ text: `╠════ STAFF PANEL ════╣ ┃ ${player.displayName}` })
      .setTimestamp();

    const staffRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`ticket_claim_${ticketChannel.id}`).setLabel('Claim').setEmoji('⚔️').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`ticket_start_${ticketChannel.id}`).setLabel('Start').setEmoji('▶️').setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder().setCustomId(`ticket_givetier_${ticketChannel.id}`).setLabel('Give Tier').setEmoji('🏆').setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId(`ticket_finish_${ticketChannel.id}`).setLabel('Finish').setEmoji('✅').setStyle(ButtonStyle.Danger).setDisabled(true),
    );

    await ticketChannel.send({ embeds: [staffEmbed], components: [staffRow] }).catch(() => {});
    logger.info(`[TICKET] Created: ${channelName}`);
    return ticketChannel;
  }

  public static getStaffRoleId(guild: Guild, name: string): string | undefined {
    return guild.roles.cache.find(r => r.name === name)?.id;
  }
}
