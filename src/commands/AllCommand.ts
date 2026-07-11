import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ServerSetup } from '../ServerSetup';

export class AllCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

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
      .setName('all')
      .setDescription('Set up the entire Discord server automatically')
      .setDMPermission(false);
  }
}
