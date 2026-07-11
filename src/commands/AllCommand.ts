import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ServerSetup } from '../ServerSetup';

export class AllCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const serverSetup = new ServerSetup(interaction.client, interaction.guild!);
    await serverSetup.setupAll();

    await interaction.editReply({ content: '✅ Server structure created! All categories, channels, and roles have been set up.\n\nRun `/setup` next to post content panels.' });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('all')
      .setDescription('Create all categories, channels, and roles')
      .setDMPermission(false);
  }
}
