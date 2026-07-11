"use strict";

import mongoose from 'mongoose';

const verificationLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  guildName: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  minecraftUsername: { type: String, required: true },
  description: { type: String, required: true }
});

export const VerificationLog = mongoose.model('VerificationLog', verificationLogSchema);