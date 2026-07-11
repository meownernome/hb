"use strict";

import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  channelId: { type: String, required: false },
  users: [{
    discordId: { type: String, required: true },
    minecraftUsername: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
});

export const Verification = mongoose.model('Verification', verificationSchema);