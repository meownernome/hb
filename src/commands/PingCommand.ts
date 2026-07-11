import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export class PingCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const latency = Date.now() - interaction.createdTimestamp;

    await interaction.reply({
      content: `🏓 Pong! Latency: ${latency}ms`,
      flags: 4194304
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Check bot latency')
      .setDMPermission(false);
  }
}
