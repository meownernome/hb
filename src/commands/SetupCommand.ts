import { ServerSetup } from '../ServerSetup';
import { MongoModel } from '../database';

export class SetupCommand {
  constructor(private serverSetup: ServerSetup) {}

  public async execute(interaction: any): Promise<void> {
    await interaction.deferReply({ flags: 4194304 });

    try {
      await this.serverSetup.setupAll();
      await interaction.editReply({
        content: '✅ Server setup completed successfully!',
        flags: 4194304
      });
    } catch (error) {
      await interaction.editReply({
        content: '❌ Server setup failed. Please check the logs.',
        flags: 4194304
      });
    }
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('setup')
      .setDescription('Re-run server setup')
      .setDMPermission(false);
  }
}
