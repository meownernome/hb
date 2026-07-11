"use strict";

import mongoose from 'mongoose';

const guildLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  guildName: { type: String, required: true },
  memberCount: { type: Number, required: true },
  description: { type: String, required: true }
});

export const GuildLog = mongoose.model('GuildLog', guildLogSchema);