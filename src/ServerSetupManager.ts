import { ServerSetup } from './ServerSetup';

export class ServerSetupManager {
  private static instance: ServerSetupManager;
  private serverSetup: ServerSetup | null = null;

  public static getInstance(): ServerSetupManager {
    if (!ServerSetupManager.instance) {
      ServerSetupManager.instance = new ServerSetupManager();
    }
    return ServerSetupManager.instance;
  }

  public initialize(client: any, guild: any): void {
    this.serverSetup = new ServerSetup(client, guild);
  }

  public getServerSetup(): ServerSetup {
    if (!this.serverSetup) {
      throw new Error('ServerSetup not initialized');
    }
    return this.serverSetup;
  }
}

export class ServerSetupCleanup {
  public async cleanup(guild: any): Promise<void> {
    console.log(`Cleaning up server: ${guild.name} (${guild.id})`);
  }
}