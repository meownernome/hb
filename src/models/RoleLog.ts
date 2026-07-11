import mongoose from 'mongoose';

const roleLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  guildName: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  roleName: { type: String, required: true },
  action: { type: String, required: true },
  description: { type: String, required: true }
});

export const RoleLog = mongoose.model('RoleLog', roleLogSchema);
