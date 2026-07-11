import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ServerSetup } from '../ServerSetup';
import { MongoModel } from '../database';

export class SetupCommand {
  public async execute(interaction: any): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    try {
      const serverSetup = new ServerSetup(interaction.client, interaction.guild);
      await serverSetup.setupAll();
      await interaction.editReply({ content: '✅ Server setup completed successfully!' });
    } catch (error) {
      await interaction.editReply({ content: '❌ Server setup failed. Please check the logs.' });
    }
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('setup')
      .setDescription('Re-run server setup')
      .setDMPermission(false);
  }
}
