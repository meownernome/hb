import { join } from 'path';
import { readdir } from 'fs/promises';

export class CommandHandler {
  private readonly client: any;
  private readonly commandsDir: string;

  constructor(client: any) {
    this.client = client;
    this.commandsDir = join(__dirname, '..', 'commands');
    this.client.commands = new Map();
  }

  public async loadCommands(): Promise<void> {
    const commandFiles = await this.getCommandFiles();

    for (const file of commandFiles) {
      try {
        const commandModule = await import(join(this.commandsDir, file));

        for (const Exported of Object.values(commandModule)) {
          if (typeof Exported !== 'function') continue;

          try {
            const instance = new (Exported as new () => any)();
            const cmd = instance?.command;

            if (cmd && cmd.name && !this.client.commands.has(cmd.name)) {
              this.client.commands.set(cmd.name, instance);
              console.log(`Loaded command: ${cmd.name}`);
            }
          } catch (err) {
            console.error(`Failed to instantiate command from ${file}:`, err);
          }
        }
      } catch (error) {
        console.error(`Failed to load command ${file}:`, error);
      }
    }

    await this.registerCommands();
  }

  private async getCommandFiles(): Promise<string[]> {
    let files = await readdir(this.commandsDir);
    return files.filter(file =>
      file.endsWith('.js') &&
      !file.endsWith('.d.ts') &&
      !file.endsWith('.map')
    );
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
