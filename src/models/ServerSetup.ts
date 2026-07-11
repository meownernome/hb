"use strict";

import mongoose from 'mongoose';

const serverSetupSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  setupCompleted: { type: Boolean, default: false },
  setupDetails: {
    categoriesCreated: { type: Number, default: 0 },
    channelsCreated: { type: Number, default: 0 },
    rolesCreated: { type: Number, default: 0 }
  }
});

export const ServerSetup = mongoose.model('ServerSetup', serverSetupSchema);