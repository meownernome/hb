import { Client, GatewayIntentBits, Partials } from 'discord.js';
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
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildMember
      ]
    });

    this.commandHandler = new CommandHandler(this.client);

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.commandHandler.loadCommands();

      this.client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = this.commandHandler.commands.get(interaction.commandName);
        if (!command) return;

        try {
          await command.execute(interaction);
        } catch (error) {
          logger.error(error instanceof Error ? error : new Error(String(error)));
          const reply = { content: 'An error occurred while executing this command.', ephemeral: true };
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(reply).catch(() => undefined);
          } else {
            await interaction.reply(reply).catch(() => undefined);
          }
        }
      });

      await this.client.login(process.env.DISCORD_TOKEN);

      logger.info(`Logged in as ${this.client.user?.tag}`);

      this.client.once('ready' as any, async () => {
        await this.commandHandler.registerCommands();
        logger.info(`Serving ${this.client.guilds.cache.size} guilds`);
      });
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  }
}

new HARVAL();
