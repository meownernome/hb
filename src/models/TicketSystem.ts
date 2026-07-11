"use strict";

import mongoose from 'mongoose';

const ticketSystemSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  categoryId: { type: String, required: false },
  channels: {
    createTicket: { type: String, required: false },
    claimTest: { type: String, required: false },
    startTest: { type: String, required: false },
    finishTest: { type: String, required: false },
    cancelTest: { type: String, required: false },
    closeTicket: { type: String, required: false }
  },
  roles: {
    tester: { type: String, required: false },
    admin: { type: String, required: false }
  }
});

export const TicketSystem = mongoose.model('TicketSystem', ticketSystemSchema);