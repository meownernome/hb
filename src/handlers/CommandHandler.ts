import { Client } from 'discord.js';
import { getAllCommands, Command } from '../commands';

export class CommandHandler {
  private readonly client: Client;
  public readonly commands = new Map<string, Command>();

  constructor(client: Client) {
    this.client = client;
  }

  public loadCommands(): void {
    const commands = getAllCommands();

    for (const cmd of commands) {
      if (cmd.command?.name && !this.commands.has(cmd.command.name)) {
        this.commands.set(cmd.command.name, cmd);
        console.log(`Loaded command: ${cmd.command.name}`);
      }
    }

    console.log(`Total commands loaded: ${this.commands.size}`);
  }

  public async registerCommands(): Promise<void> {
    if (!this.client.guilds || this.client.guilds.cache.size === 0) {
      console.warn('No guilds found, skipping command registration');
      return;
    }

    for (const guild of this.client.guilds.cache.values()) {
      const payloads = [];
      for (const cmd of this.commands.values()) {
        payloads.push(cmd.command.toJSON());
      }

      try {
        await this.client.application?.commands.set(payloads, guild.id);
        console.log(`Registered ${payloads.length} commands to guild: ${guild.name}`);
      } catch (error) {
        console.error(`Failed to register commands to guild ${guild.name}:`, error);
      }
    }
  }
}
