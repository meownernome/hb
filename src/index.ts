use strict;

import { Client, GatewayIntentBits, Partials, Events } from 'discord.js';
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
      await this.commandHandler.loadCommands();

      logger.info('HARVAL bot initialized successfully');
      logger.info(`Logged in as ${this.client.user?.tag}`);
      logger.info(`Serving ${this.client.guilds.cache.size} guilds`);
    } catch (error) {
      logger.error('Failed to initialize HARVAL bot:', error);
      process.exit(1);
    }
  }
}

new HARVAL();