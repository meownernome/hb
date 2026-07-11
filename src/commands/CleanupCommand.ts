use strict;

import { logger } from '../utils/Logger';
import { ServerSetup } from '../ServerSetup';

export class CleanupCommand {
  constructor(private serverSetup: ServerSetup) {}

  public async execute(interaction: any): Promise<void> {
    if (interaction.user.id !== process.env.BOT_OWNER_ID) {
      await interaction.reply({ content: '❌ Only the bot owner can use this command.', ephemeral: true });
      return;
    }

    const confirmMessage = await interaction.reply({
      content: '⚠️ Are you sure? Type `yes` to confirm or `no` to cancel cleanup. This cannot be undone.',
      fetchReply: true
    });

    const filter = (m: any) => m.author.id === interaction.user.id && (m.content.toLowerCase() === 'yes' || m.content.toLowerCase() === 'no');
    const collector = interaction.channel?.createMessageCollector({ filter, max: 1, time: 30000 });

    collector?.on('collect', async (response) => {
      if (response.content.toLowerCase() === 'yes') {
        await interaction.editReply({ content: '🔄 Cleaning up server...' });
        await this.serverSetup.cleanup(interaction.guild!);
        await interaction.editReply({ content: '✅ Cleanup completed successfully!' });
      } else {
        await interaction.editReply({ content: '❌ Cleanup cancelled.' });
      }
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('cleanup')
      .setDescription('Remove all HARVAL-created channels and roles')
      .setDMPermission(false);
  }
}