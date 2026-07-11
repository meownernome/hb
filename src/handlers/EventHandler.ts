use strict;

import { Client, Events } from 'discord.js';
import { logger } from '../utils/Logger';

export class EventHandler {
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.client.once(Events.ClientReady, this.handleClientReady.bind(this));
    this.client.on(Events.GuildCreate, this.handleGuildCreate.bind(this));
    this.client.on(Events.GuildDelete, this.handleGuildDelete.bind(this));
    this.client.on(Events.GuildMemberAdd, this.handleMemberAdd.bind(this));
    this.client.on(Events.InteractionCreate, this.handleInteractionCreate.bind(this));
    this.client.on(Events.MessageCreate, this.handleMessageCreate.bind(this));
  }

  private async handleClientReady(): Promise<void> {
    logger.info(`Client is ready! Logged in as ${this.client.user?.tag}`);
  }

  private async handleGuildCreate(guild: any): Promise<void> {
    logger.info(`Joined guild: ${guild.name} (ID: ${guild.id})`);
    await this.logGuildJoin(guild);
  }

  private async handleGuildDelete(guild: any): Promise<void> {
    logger.info(`Left guild: ${guild.name} (ID: ${guild.id})`);
    await this.logGuildLeave(guild);
  }

  private async handleMemberAdd(member: any): Promise<void> {
    logger.info(`Member joined: ${member.user.tag} in guild: ${member.guild.name}`);
    await this.logMemberJoin(member);
  }

  private async handleInteractionCreate(interaction: any): Promise<void> {
    if (interaction.isCommand()) {
      await this.handleCommand(interaction);
    } else if (interaction.isButton()) {
      await this.handleButton(interaction);
    }
  }

  private async handleCommand(interaction: any): Promise<void> {
    const commandName = interaction.commandName;
    logger.info(`Command executed: ${commandName} by ${interaction.user.tag}`);

    const command = this.client.commands.get(commandName);
    if (command) {
      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error(`Error executing command ${commandName}:`, error);
        if (!interaction.replied) {
          await interaction.reply({ content: '❌ An error occurred while executing this command.', ephemeral: true });
        }
      }
    } else {
      logger.warn(`Unknown command: ${commandName}`);
    }
  }

  private async handleButton(interaction: any): Promise<void> {
    const customId = interaction.customId;
    logger.info(`Button clicked: ${customId} by ${interaction.user.tag}`);
  }

  private async handleMessageCreate(message: any): Promise<void> {
    if (message.author.bot) return;
    logger.info(`Message: ${message.content} by ${message.author.tag}`);
  }

  private async logGuildJoin(guild: any): Promise<void> {
    logger.info(`Guild join log: ${guild.name} (${guild.id})`);
  }

  private async logGuildLeave(guild: any): Promise<void> {
    logger.info(`Guild leave log: ${guild.name} (${guild.id})`);
  }

  private async logMemberJoin(member: any): Promise<void> {
    logger.info(`Member join log: ${member.user.tag} in ${member.guild.name}`);
  }

  private async logMemberLeave(member: any): Promise<void> {
    logger.info(`Member leave log: ${member.user.tag} in ${member.guild.name}`);
  }

  public async loadEvents(): Promise<void> {
    console.log('Event handler initialized');
  }
}