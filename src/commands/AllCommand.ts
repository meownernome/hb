use strict;

import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ServerSetup } from '../ServerSetup';

export class AllCommand {
  constructor(private serverSetup: ServerSetup) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

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
      .setName('all')
      .setDescription('Set up the entire Discord server automatically')
      .setDMPermission(false);
  }
}