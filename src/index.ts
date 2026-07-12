import {
  Client, GatewayIntentBits, Partials, Events,
  ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle,
  EmbedBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, PermissionFlagsBits,
} from 'discord.js';
import { CommandHandler } from './handlers/CommandHandler';
import { ServerSetup } from './ServerSetup';
import dotenv from 'dotenv';
import { logger } from './utils/Logger';
import './database';

dotenv.config();

const MODE_EMOJI: Record<string, string> = {
  'Sword': '⚔️', 'Crystal': '💎', 'SMP': '🛡️', 'Netherite Pot': '🌋', 'Diamond Pot': '💠',
  'UHC': '❤️', 'BuildUHC': '🏗️', 'NoDebuff': '🚫', 'Combo': '🥊', 'Gapple': '🍎',
  'OP Duel': '⚡', 'Boxing': '🥊', 'Axe': '🪓', 'Mace': '🔨', 'Anchor': '⚓',
  'Cart PvP': '🛒', 'Bedwars': '🛏️', 'Skywars': '☁️', 'Bridge': '🌉', 'Nodebuff': '🔥',
  'Vanilla': '🌿', 'Crossbow': '🏹', 'Trident': '🔱', 'Shield': '🛡️', 'Elytra Combat': '🦅',
  'Custom Duel': '🎯',
};

const TICKET_STATE = new Map<string, {
  mode: string;
  playerId: string;
  playerDisplay: string;
  claimedBy?: string;
  claimedByName?: string;
}>();

export class HARVAL {
  public readonly client: Client;
  public readonly commandHandler: CommandHandler;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
    });
    this.commandHandler = new CommandHandler(this.client);
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.commandHandler.loadCommands();

      this.client.on('interactionCreate', async (interaction) => {
        try {
          if (interaction.isChatInputCommand()) {
            const command = this.commandHandler.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
            return;
          }

          if (interaction.isButton()) {
            await this.handleButton(interaction);
            return;
          }

          if (interaction.isModalSubmit()) {
            await this.handleModal(interaction);
            return;
          }

          if (interaction.isStringSelectMenu()) {
            await this.handleSelectMenu(interaction);
            return;
          }
        } catch (error) {
          logger.error(error instanceof Error ? error : new Error(String(error)));
          const msg = { content: '❌ An error occurred.', ephemeral: true };
          if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
            await interaction.reply(msg).catch(() => {});
          }
        }
      });

      await this.client.login(process.env.DISCORD_TOKEN);
      logger.info(`Logged in as ${this.client.user?.tag}`);

      this.client.once(Events.ClientReady, async () => {
        await this.commandHandler.registerCommands();
        logger.info(`Serving ${this.client.guilds.cache.size} guilds`);
      });
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  }

  // ═══════════════════════════════════════════
  // BUTTON HANDLER
  // ═══════════════════════════════════════════
  private async handleButton(interaction: any): Promise<void> {
    const id = interaction.customId;

    // ── Verify → Show modal ──
    if (id === 'verify_start') {
      const modal = new ModalBuilder()
        .setCustomId('verify_modal')
        .setTitle('Minecraft Verification');
      const input = new TextInputBuilder()
        .setCustomId('minecraft_username')
        .setLabel('What is your Minecraft username?')
        .setPlaceholder('e.g. Notch')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMinLength(3)
        .setMaxLength(16);
      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
      await interaction.showModal(modal);
      return;
    }

    // ── Tier request → Create ticket ──
    if (id.startsWith('tier_request_')) {
      const modeSlug = id.replace('tier_request_', '');
      const mode = modeSlug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const emoji = MODE_EMOJI[mode] || '🎮';

      await interaction.deferReply({ ephemeral: true });

      const setup = new ServerSetup(interaction.client, interaction.guild);
      const ticketChannel = await setup.createTicket(mode, {
        id: interaction.user.id,
        username: interaction.user.username,
        displayName: interaction.member.displayName || interaction.user.username,
      });

      if (!ticketChannel) {
        await interaction.editReply({ content: '❌ Failed to create ticket. Please contact staff.' });
        return;
      }

      TICKET_STATE.set(ticketChannel.id, {
        mode,
        playerId: interaction.user.id,
        playerDisplay: interaction.member.displayName || interaction.user.username,
      });

      await interaction.editReply({ content: `✅ Ticket created! ${emoji} <#${ticketChannel.id}>` });
      return;
    }

    // ── Ticket: Claim ──
    if (id.startsWith('ticket_claim_')) {
      const channelId = id.replace('ticket_claim_', '');
      const state = TICKET_STATE.get(channelId);
      if (!state) { await interaction.reply({ content: '❌ Ticket state expired.', ephemeral: true }); return; }

      if (state.claimedBy) {
        await interaction.reply({ content: `❌ Already claimed by ${state.claimedByName}.`, ephemeral: true });
        return;
      }

      state.claimedBy = interaction.user.id;
      state.claimedByName = interaction.member.displayName || interaction.user.username;

      const emoji = MODE_EMOJI[state.mode] || '🎮';
      const embed = new EmbedBuilder()
        .setTitle(`${emoji} ═══ TIER TEST TICKET ═══`)
        .setDescription(
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `**Player:** ${state.playerDisplay} (<@${state.playerId}>)\n` +
          `**Mode:** ${emoji} ${state.mode}\n` +
          `**Tester:** ⚔️ ${state.claimedByName} (<@${state.claimedBy}>)\n` +
          `**Status:** 🟢 In Progress\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `**Next steps:**\n` +
          '```\n' +
          '  ▶️ Start    — Send IP & instructions\n' +
          '  🏆 Give Tier — Assign tier result\n' +
          '  ✅ Finish   — Close the ticket\n' +
          '```\n\n' +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
        .setColor(0x2ECC71)
        .setFooter({ text: `Claimed by ${state.claimedByName}` })
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`ticket_claim_${channelId}`).setLabel('Claimed').setEmoji('✅').setStyle(ButtonStyle.Success).setDisabled(true),
        new ButtonBuilder().setCustomId(`ticket_start_${channelId}`).setLabel('Start').setEmoji('▶️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`ticket_givetier_${channelId}`).setLabel('Give Tier').setEmoji('🏆').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`ticket_finish_${channelId}`).setLabel('Finish').setEmoji('✅').setStyle(ButtonStyle.Danger),
      );

      await interaction.update({ embeds: [embed], components: [row] });

      await interaction.followUp({
        content: `⚔️ **${state.claimedByName}** has claimed this ticket. <@${state.playerId}> please wait while the tester prepares.`,
      });
      return;
    }

    // ── Ticket: Start (send IP & instructions) ──
    if (id.startsWith('ticket_start_')) {
      const channelId = id.replace('ticket_start_', '');
      const state = TICKET_STATE.get(channelId);
      if (!state) return;

      const emoji = MODE_EMOJI[state.mode] || '🎮';
      const embed = new EmbedBuilder()
        .setTitle(`${emoji} ═══ TIER TEST START ═══`)
        .setDescription(
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `<@${state.playerId}> your **${state.mode}** tier test is starting!\n\n` +
          '**━━━━━━ INSTRUCTIONS ━━━━━━**\n' +
          '```\n' +
          '  🖥️ Server IP :  play.harvalmc.fun\n' +
          `  ⚔️ Mode      :  ${state.mode}\n` +
          '  📋 Rules     :  Fight fairly, no cheats\n' +
          '  ⏱️ Time      :  Until a winner is clear\n' +
          '```\n\n' +
          '**━━━━━━ HOW TO JOIN ━━━━━━**\n' +
          '```\n' +
          '  1. Open Minecraft\n' +
          '  2. Add server: play.harvalmc.fun\n' +
          '  3. Join and wait in the lobby\n' +
          '  4. The tester will invite you\n' +
          '```\n\n' +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
        .setColor(0x3498DB)
        .setFooter({ text: 'Started by ' + (state.claimedByName || 'Tester') })
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Instructions sent.', ephemeral: true });
      return;
    }

    // ── Ticket: Give Tier (show select menu) ──
    if (id.startsWith('ticket_givetier_')) {
      const channelId = id.replace('ticket_givetier_', '');
      const state = TICKET_STATE.get(channelId);
      if (!state) return;

      const options = [1, 2, 3, 4, 5].map(level => {
        const stars = level >= 4 ? '★'.repeat(level - 2) + ' ' : '';
        return {
          label: `${stars}${state.mode} T${level}`,
          value: `${state.mode.replace(/\s+/g, '_')}_T${level}`,
          emoji: MODE_EMOJI[state.mode] || '🎮',
          description: `Tier ${level} — ${'⬛🟩🟦🟪🟨'[level - 1]}`,
        };
      });

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`tier_select_${channelId}`)
          .setPlaceholder(`Select tier for ${state.mode}...`)
          .addOptions(options)
      );

      await interaction.reply({ components: [row], ephemeral: true });
      return;
    }

    // ── Ticket: Finish (close) ──
    if (id.startsWith('ticket_finish_')) {
      const channelId = id.replace('ticket_finish_', '');
      const state = TICKET_STATE.get(channelId);
      if (!state) return;

      const emoji = MODE_EMOJI[state.mode] || '🎮';
      const embed = new EmbedBuilder()
        .setTitle(`${emoji} ═══ TICKET CLOSED ═══`)
        .setDescription(
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `**Player:** ${state.playerDisplay}\n` +
          `**Mode:** ${emoji} ${state.mode}\n` +
          `**Tester:** ${state.claimedByName || 'N/A'}\n` +
          `**Status:** ✅ Completed\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `*This ticket will be deleted in 10 seconds.*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
        .setColor(0x2ECC71)
        .setTimestamp();

      await interaction.update({ embeds: [embed], components: [] });
      TICKET_STATE.delete(channelId);

      setTimeout(async () => {
        await interaction.channel?.delete().catch(() => {});
      }, 10_000);
      return;
    }
  }

  // ═══════════════════════════════════════════
  // SELECT MENU HANDLER (tier selection)
  // ═══════════════════════════════════════════
  private async handleSelectMenu(interaction: any): Promise<void> {
    if (interaction.customId.startsWith('tier_select_')) {
      const channelId = interaction.customId.replace('tier_select_', '');
      const state = TICKET_STATE.get(channelId);
      if (!state) return;

      const selected = interaction.values[0];
      const tierParts = selected.split('_T');
      const tierLevel = tierParts[tierParts.length - 1];
      const modeName = state.mode;
      const stars = parseInt(tierLevel) >= 4 ? '★'.repeat(parseInt(tierLevel) - 2) + ' ' : '';
      const fullTier = `${stars}${modeName} T${tierLevel}`;
      const emoji = MODE_EMOJI[modeName] || '🎮';

      const embed = new EmbedBuilder()
        .setTitle(`${emoji} ═══ TIER ASSIGNED ═══`)
        .setDescription(
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `<@${state.playerId}> has been assigned:\n\n` +
          `# ${emoji} ${fullTier}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
        .setColor(0xF1C40F)
        .setFooter({ text: `Given by ${interaction.member.displayName}` })
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({ content: `✅ Tier **${fullTier}** assigned to ${state.playerDisplay}.`, ephemeral: true });

      // Try to assign role
      const roleName = fullTier;
      const role = interaction.guild?.roles?.cache?.find((r: any) => r.name === roleName);
      if (role) {
        const member = interaction.guild?.members?.cache?.get(state.playerId);
        if (member) {
          await member.roles.add(role).catch(() => {});
        }
      }
    }
  }

  // ═══════════════════════════════════════════
  // MODAL HANDLER (verify)
  // ═══════════════════════════════════════════
  private async handleModal(interaction: any): Promise<void> {
    if (interaction.customId === 'verify_modal') {
      const username = interaction.fields.getTextInputValue('minecraft_username');
      try {
        await interaction.member.setNickname(username);
        const verifiedRole = interaction.guild?.roles?.cache?.find((r: any) => r.name === '✅ Verified' || r.name === 'Verified');
        if (verifiedRole) await interaction.member.roles.add(verifiedRole);
        await interaction.reply({
          content: `✅ **Verification Complete!**\n\nMinecraft Username: **${username}**\nNickname updated and ✅ Verified role assigned.`,
          ephemeral: true,
        });
      } catch (error) {
        await interaction.reply({
          content: `❌ Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ephemeral: true,
        });
      }
    }
  }
}

new HARVAL();
