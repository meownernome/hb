"use strict";

import mongoose from 'mongoose';

const channelLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  guildName: { type: String, required: true },
  channelName: { type: String, required: true },
  channelType: { type: String, required: true },
  description: { type: String, required: true }
});

export const ChannelLog = mongoose.model('ChannelLog', channelLogSchema);