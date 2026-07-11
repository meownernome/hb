use strict;

import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType } from 'discord.js';

export class VerificationCommand {
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

export class SetupCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: 4194304 });

    await interaction.editReply({
      content: '✅ Server setup completed successfully!',
      flags: 4194304
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('setup')
      .setDescription('Re-run server setup')
      .setDMPermission(false);
  }
}

export class RolesCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const roles = interaction.guild?.roles.cache
      .filter(role => role.name !== '@everyone' && !role.name.startsWith('@'))
      .sort((a, b) => b.position - a.position);

    let rolesList = 'Server roles:\n';
    for (const role of roles.values()) {
      rolesList += `${role.name} (Position: ${role.position})\n`;
    }

    await interaction.reply({
      content: rolesList,
      flags: 4194304
    });
  }

  public get command() {
    return new SlashCommandBuilder()
      .setName('roles')
      .setDescription('List all server roles')
      .setDMPermission(false);
  }
}

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