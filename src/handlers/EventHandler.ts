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
  }

  private async handleGuildDelete(guild: any): Promise<void> {
    logger.info(`Left guild: ${guild.name} (ID: ${guild.id})`);
  }

  private async handleMemberAdd(member: any): Promise<void> {
    logger.info(`Member joined: ${member.user.tag} in guild: ${member.guild.name}`);
  }

  private async handleInteractionCreate(interaction: any): Promise<void> {
    if (interaction.isCommand()) {
      await this.handleCommand(interaction);
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

  private async handleMessageCreate(message: any): Promise<void> {
    if (message.author.bot) return;
    logger.info(`Message: ${message.content} by ${message.author.tag}`);
  }

  public async loadEvents(): Promise<void> {
    console.log('Event handler initialized');
  }
}
