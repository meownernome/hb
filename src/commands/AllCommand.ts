import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ServerSetup } from '../ServerSetup';
import { logger } from '../utils/Logger';

export class AllCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const serverSetup = new ServerSetup(interaction.client, interaction.guild!);
      await serverSetup.setupAll();

      await interaction.editReply({
        content: '✅ **Full server structure created!**\n\n' +
          '> 📂 All categories & channels created\n' +
          '> 🎨 All tier roles + staff roles created\n' +
          '> 📊 Role hierarchy configured\n\n' +
          '▶️ **Next step:** Run `/setup` to post content panels, buttons, and set staff permissions.'
      });
    } catch (error: any) {
      logger.error(`[/all] CRASHED: ${error?.message || error}`);
      await interaction.editReply({
        content: '❌ **Server setup crashed!**\n\n' +
          `> Error: \`${error?.message || 'Unknown error'}\`\n\n` +
          '> Check the bot logs for details.\n' +
          '> Try running `/all` again.'
      }).catch(() => {});
    }
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('all')
      .setDescription('Create all categories, channels, and roles')
      .setDMPermission(false);
  }
}
