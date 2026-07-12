import { Guild, ChannelType, TextChannel, CategoryChannel, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { logger } from './utils/Logger';
import { ALL_ROLES } from './roles';

const CATEGORIES: { key: string; name: string }[] = [
  { key: 'information', name: '══════════ INFORMATION ══════════' },
  { key: 'community', name: '══════════ COMMUNITY ══════════' },
  { key: 'support', name: '══════════ SUPPORT ══════════' },
  { key: 'tier-testing', name: '══════════ TIER TESTING ══════════' },
  { key: 'tickets', name: '══════════ TICKETS ══════════' },
  { key: 'leaderboards', name: '══════════ LEADERBOARDS ══════════' },
  { key: 'staff', name: '══════════ STAFF ══════════' },
  { key: 'logs', name: '══════════ LOGS ══════════' },
  { key: 'voice', name: '══════════ VOICE ══════════' },
];

const MODE_EMOJI: Record<string, string> = {
  'Sword': '⚔️', 'Crystal': '💎', 'SMP': '🛡️', 'Netherite Pot': '🌋', 'Diamond Pot': '💠',
  'UHC': '❤️', 'BuildUHC': '🏗️', 'NoDebuff': '🚫', 'Combo': '🥊', 'Gapple': '🍎',
  'OP Duel': '⚡', 'Boxing': '🥊', 'Axe': '🪓', 'Mace': '🔨', 'Anchor': '⚓',
  'Cart PvP': '🛒', 'Bedwars': '🛏️', 'Skywars': '☁️', 'Bridge': '🌉', 'Nodebuff': '🔥',
  'Vanilla': '🌿', 'Crossbow': '🏹', 'Trident': '🔱', 'Shield': '🛡️', 'Elytra Combat': '🦅',
  'Custom Duel': '🎯',
};

const CHANNELS: { cat: string; name: string; topic?: string }[] = [
  { cat: 'information', name: 'welcome', topic: '🏰 Welcome to HARVAL MC' },
  { cat: 'information', name: 'rules', topic: '📜 Server rules' },
  { cat: 'information', name: 'faq', topic: '❓ FAQ' },
  { cat: 'information', name: 'server-ip', topic: '🖥️ play.harvalmc.fun' },
  { cat: 'information', name: 'announcements', topic: '📢 Announcements' },
  { cat: 'information', name: 'updates', topic: '🔔 Updates' },
  { cat: 'information', name: 'verify', topic: '✅ Verify' },
  { cat: 'information', name: 'how-tier-testing-works', topic: '📖 Tier guide' },
  { cat: 'information', name: 'staff', topic: '👥 Staff' },
  { cat: 'information', name: 'roles', topic: '🎨 Roles' },
  { cat: 'community', name: 'general', topic: '💬 Chat' },
  { cat: 'community', name: 'minecraft-chat', topic: '⛏️ Minecraft' },
  { cat: 'community', name: 'clips', topic: '🎬 Clips' },
  { cat: 'community', name: 'screenshots', topic: '📸 Screenshots' },
  { cat: 'community', name: 'media', topic: '🎥 Media' },
  { cat: 'community', name: 'polls', topic: '📊 Polls' },
  { cat: 'community', name: 'suggestions', topic: '💡 Suggestions' },
  { cat: 'community', name: 'off-topic', topic: '🎲 Off-topic' },
  { cat: 'support', name: 'create-ticket', topic: '🎫 Open ticket' },
  { cat: 'support', name: 'bug-report', topic: '🐛 Bugs' },
  { cat: 'support', name: 'report-player', topic: '🚨 Reports' },
  { cat: 'support', name: 'appeal', topic: '📩 Appeal' },
  { cat: 'support', name: 'questions', topic: '❓ Questions' },
  { cat: 'tier-testing', name: 'request-tier-test', topic: '⚔️ Request test' },
  { cat: 'tier-testing', name: 'queue', topic: '⏳ Queue' },
  { cat: 'tier-testing', name: 'tier-results', topic: '🏆 Results' },
  { cat: 'tier-testing', name: 'leaderboards', topic: '📊 Leaderboards' },
  { cat: 'tier-testing', name: 'tier-information', topic: '📖 Tier info' },
  { cat: 'tier-testing', name: 'retest-request', topic: '🔄 Retest' },
  { cat: 'staff', name: 'staff-chat', topic: '🔒 Staff' },
  { cat: 'staff', name: 'commands', topic: '⌨️ Commands' },
  { cat: 'staff', name: 'claims', topic: '📌 Claims' },
  { cat: 'staff', name: 'applications', topic: '📝 Applications' },
  { cat: 'staff', name: 'reports', topic: '📋 Reports' },
  { cat: 'staff', name: 'moderation', topic: '🔨 Moderation' },
  { cat: 'logs', name: 'ticket-logs', topic: '🎫 Tickets' },
  { cat: 'logs', name: 'tier-logs', topic: '⚔️ Tier logs' },
  { cat: 'logs', name: 'bot-logs', topic: '🤖 Bot logs' },
  { cat: 'logs', name: 'error-logs', topic: '❌ Errors' },
  { cat: 'logs', name: 'join-leave', topic: '👋 Join/Leave' },
  { cat: 'logs', name: 'role-logs', topic: '🎨 Roles' },
  { cat: 'logs', name: 'verification-logs', topic: '✅ Verification' },
  { cat: 'logs', name: 'command-logs', topic: '⌨️ Commands' },
  { cat: 'voice', name: 'general-1' }, { cat: 'voice', name: 'general-2' },
  { cat: 'voice', name: 'afk' }, { cat: 'voice', name: 'staff-vc' }, { cat: 'voice', name: 'meeting-room' },
];

export class ServerSetup {
  private guild: Guild;

  constructor(client: any, guild: Guild) { this.guild = guild; }

  private sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
  private tc(name: string) { return this.guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildText) as TextChannel | undefined; }
  private findCat(key: string) {
    const cat = CATEGORIES.find(c => c.key === key);
    return this.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === cat?.name) as CategoryChannel | undefined;
  }

  // ═══════════════════════════════════════════
  // /all
  // ═══════════════════════════════════════════

  public async setupAll(): Promise<void> {
    logger.info(`══════════ /all START ══════════`);

    // Categories
    for (const c of CATEGORIES) {
      try {
        if (!this.guild.channels.cache.some(ch => ch.type === ChannelType.GuildCategory && ch.name === c.name)) {
          await this.guild.channels.create({ name: c.name, type: ChannelType.GuildCategory });
          logger.info(`  📁 ${c.name}`);
        }
      } catch (e: any) { logger.error(`  📁 FAIL ${c.key}: ${e.message}`); }
    }

    // Channels
    for (const ch of CHANNELS) {
      try {
        const cat = this.findCat(ch.cat);
        if (!cat || cat.children.cache.some(c => c.name === ch.name)) continue;
        await cat.children.create({ name: ch.name, type: ChannelType.GuildText, topic: ch.topic || undefined } as any);
        logger.info(`  #${ch.name}`);
        await this.sleep(300);
      } catch (e: any) { logger.error(`  #${ch.name} FAIL: ${e.message}`); }
    }

    // Roles — create from explicit flat list
    const start = Date.now();
    let done = 0;
    try { await this.guild.roles.fetch(); } catch {}
    for (let i = 0; i < ALL_ROLES.length; i++) {
      if (Date.now() - start > 600000) break;
      const r = ALL_ROLES[i];
      try {
        if (this.guild.roles.cache.some(x => x.name === r.name)) { done++; continue; }
        await this.guild.roles.create({ name: r.name, color: r.color });
        done++;
        logger.info(`  [${done}/${ALL_ROLES.length}] ${r.name}`);
        await this.sleep(1000);
      } catch (e: any) {
        logger.error(`  FAIL ${r.name}: ${e.message || e}`);
        await this.sleep(1000);
      }
    }

    logger.info(`══════════ /all DONE (${done} items, ${((Date.now()-start)/1000).toFixed(0)}s) ══════════`);
  }

  // ═══════════════════════════════════════════
  // /cleanup
  // ═══════════════════════════════════════════

  public async cleanup(): Promise<{ channels: number; roles: number }> {
    let ch = 0, rl = 0;
    // Delete channels
    for (const cat of [...this.guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).values()]) {
      for (const child of [...(cat as CategoryChannel).children.cache.values()]) {
        await child.delete().catch(() => {}); ch++;
      }
      await cat.delete().catch(() => {}); ch++;
    }
    for (const c of [...this.guild.channels.cache.values()]) {
      if (c.type === ChannelType.GuildCategory) continue;
      await c.delete().catch(() => {}); ch++;
    }
    // Delete roles (skip @everyone and managed)
    for (const r of [...this.guild.roles.cache.values()]) {
      if (r.name === '@everyone' || r.managed) continue;
      await r.delete().catch(() => {}); rl++;
    }
    return { channels: ch, roles: rl };
  }

  // ═══════════════════════════════════════════
  // /setup
  // ═══════════════════════════════════════════

  public async setupContent(): Promise<void> {
    const e = new EmbedBuilder()
      .setTitle('╔══════════════════════════════╗')
      .setDescription('## 🏰 ━━ HARVAL MC\n*PvP Tier Testing Network*\n╚══════════════════════════════╝')
      .setColor(0xFFD700);
    const ch = this.tc('welcome');
    if (ch) await ch.send({ embeds: [e] as any }).catch(() => {});
  }

  // ═══════════════════════════════════════════
  // createTicket
  // ═══════════════════════════════════════════

  public async createTicket(mode: string, player: { id: string; username: string; displayName: string }): Promise<TextChannel | null> {
    const cat = this.findCat('tickets');
    if (!cat) return null;
    const slug = mode.replace(/\s+/g, '-').toLowerCase();
    const name = `ticket-${slug}-${player.displayName}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 100);
    const everyone = this.guild.roles.everyone;
    const overwrites: any[] = [
      { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel], allow: [] },
      { id: player.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory], deny: [] },
    ];
    try {
      const ch = await this.guild.channels.create({ name, type: ChannelType.GuildText, parent: cat, permissionOverwrites: overwrites });
      const emoji = MODE_EMOJI[mode] || '🎮';
      const embed = new EmbedBuilder().setTitle(`${emoji} ${mode} Ticket`).setDescription(`Waiting for tester...`).setColor(0xF1C40F);
      await ch.send({ embeds: [embed] } as any);
      return ch;
    } catch (e: any) { logger.error(`Ticket fail: ${e.message}`); return null; }
  }
}
