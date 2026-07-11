import { join } from 'path';
import { readdir } from 'fs/promises';

export class CommandHandler {
  private readonly client: any;

  constructor(client: any) {
    this.client = client;
    this.client.commands = new Map();
  }

  public async loadCommands(): Promise<void> {
    const commandFiles = await this.getCommandFiles();

    for (const file of commandFiles) {
      try {
        const commandModule = await import(`./commands/${file}`);
        const command = commandModule.default || commandModule;

        if (command?.command?.name) {
          this.client.commands.set(command.command.name, command);
          console.log(`Loaded command: ${command.command.name}`);
        }
      } catch (error) {
        console.error(`Failed to load command ${file}:`, error);
      }
    }

    await this.registerCommands();
  }

  private async getCommandFiles(): Promise<string[]> {
    const dir = join(__dirname, 'commands');
    let files = await readdir(dir);
    return files.filter(file => file.endsWith('.ts') || file === 'index.ts' || file === 'Commands.ts');
  }

  private async registerCommands(): Promise<void> {
    if (!this.client.guilds || this.client.guilds.cache.size === 0) {
      console.warn('No guilds found, skipping command registration');
      return;
    }

    for (const guild of this.client.guilds.cache.values()) {
      const commands = [];
      for (const command of this.client.commands.values()) {
        commands.push(command.command.toJSON());
      }

      try {
        await this.client.application?.commands.set(commands, guild.id);
        console.log(`Registered ${commands.length} commands to guild: ${guild.name}`);
      } catch (error) {
        console.error(`Failed to register commands to guild ${guild.name}:`, error);
      }
    }
  }
}
