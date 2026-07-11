use strict;

import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType } from 'discord.js';

export class ChannelsCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channels = interaction.guild?.channels.cache
      .filter(channel => channel.type !== ChannelType.GuildCategory)
      .sort((a, b) => {
        if (a.parentId === null && b.parentId !== null) return -1;
        if (a.parentId !== null && b.parentId === null) return 1;
        return a.position - b.position;
      });

    let channelsList = 'Server channels:\n';
    let currentParent = '';
    for (const channel of channels.values()) {
      if (channel.parent?.name !== currentParent) {
        currentParent = channel.parent?.name || '(No category)';
        channelsList += `\n**${currentParent}**:\n`;
      }
      channelsList += `• ${channel.name} (${channel.type})\n`;
    }

    await interaction.reply({
      content: channelsList,
      flags: 4194304
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('channels')
      .setDescription('List all server channels')
      .setDMPermission(false);
  }
}