import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ServerSetup } from '../ServerSetup';

export class VerifyCommand {
  constructor(private serverSetup: ServerSetup) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: 4194304 });

    const minecraftUsername = interaction.options.getString('minecraft-username');
    if (!minecraftUsername) {
      await interaction.editReply({
        content: '❌ Please provide your Minecraft username.'
      });
      return;
    }

    await interaction.editReply({
      content: `✅ Verification requested for Minecraft username: ${minecraftUsername}\nPlease check the verification channel for instructions.`
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('verify')
      .setDescription('Verify your Minecraft username')
      .addStringOption(option =>
        option.setName('minecraft-username')
          .setDescription('Your Minecraft username')
          .setRequired(true)
      )
      .setDMPermission(false);
  }
}
