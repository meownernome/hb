import mongoose from 'mongoose';

const commandLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  guildName: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  commandName: { type: String, required: true },
  description: { type: String, required: true }
});

export const CommandLog = mongoose.model('CommandLog', commandLogSchema);
