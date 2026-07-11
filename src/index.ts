import { Client, GatewayIntentBits, Partials, Events, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionReplyOptions } from 'discord.js';
import { CommandHandler } from './handlers/CommandHandler';
import dotenv from 'dotenv';
import { logger } from './utils/Logger';
import './database';

dotenv.config();

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

      // ── Command handler ──
      this.client.on('interactionCreate', async (interaction) => {
        // Slash commands
        if (interaction.isChatInputCommand()) {
          const command = this.commandHandler.commands.get(interaction.commandName);
          if (!command) return;
          try {
            await command.execute(interaction);
          } catch (error) {
            logger.error(error instanceof Error ? error : new Error(String(error)));
            const msg = { content: '❌ An error occurred.', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp(msg).catch(() => {});
            } else {
              await interaction.reply(msg).catch(() => {});
            }
          }
          return;
        }

        // Button interactions
        if (interaction.isButton()) {
          await this.handleButton(interaction);
          return;
        }

        // Modal submissions
        if (interaction.isModalSubmit()) {
          await this.handleModal(interaction);
          return;
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
  // Button handler
  // ═══════════════════════════════════════════
  private async handleButton(interaction: any): Promise<void> {
    const id = interaction.customId;

    // ── Verify button → open modal ──
    if (id === 'verify_start') {
      const modal = new ModalBuilder()
        .setCustomId('verify_modal')
        .setTitle('Minecraft Verification');

      const usernameInput = new TextInputBuilder()
        .setCustomId('minecraft_username')
        .setLabel('What is your Minecraft username?')
        .setPlaceholder('e.g. Notch')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMinLength(3)
        .setMaxLength(16);

      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(usernameInput));
      await interaction.showModal(modal);
      return;
    }

    // ── Tier test request buttons ──
    if (id.startsWith('tier_request_')) {
      const mode = id.replace('tier_request_', '').replace(/_/g, ' ');
      const embed = {
        embeds: [{
          title: `⚔️ Tier Test Request — ${mode}`,
          description: `${interaction.user} has requested a tier test for **${mode}**.\n\nA tester will be assigned shortly.`,
          color: 0xF1C40F,
          timestamp: new Date().toISOString(),
          footer: { text: 'HARVAL MC Tier Testing' },
        }],
      };

      // Try to post in tier-results channel
      const resultsChannel = interaction.guild?.channels?.cache?.find((c: any) => c.name === 'tier-results');
      if (resultsChannel?.isTextBased()) {
        await resultsChannel.send(embed).catch(() => {});
      }

      await interaction.reply({ content: `✅ Your **${mode}** tier test request has been submitted! Check <#tier-results> for updates.`, ephemeral: true });
      return;
    }
  }

  // ═══════════════════════════════════════════
  // Modal handler (verify username)
  // ═══════════════════════════════════════════
  private async handleModal(interaction: any): Promise<void> {
    if (interaction.customId === 'verify_modal') {
      const username = interaction.fields.getTextInputValue('minecraft_username');

      try {
        // Change nickname to Minecraft username
        await interaction.member.setNickname(username);

        // Assign Verified role
        const verifiedRole = interaction.guild?.roles?.cache?.find((r: any) => r.name === '✅ Verified' || r.name === 'Verified');
        if (verifiedRole) {
          await interaction.member.roles.add(verifiedRole);
        }

        await interaction.reply({
          content: `✅ **Verification Complete!**\n\nYour Minecraft username has been set to: **${username}**\nYour nickname has been updated and you have been given the Verified role.`,
          ephemeral: true,
        });
      } catch (error) {
        await interaction.reply({
          content: `❌ Verification failed. Please contact staff.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ephemeral: true,
        });
      }
    }
  }
}

new HARVAL();
