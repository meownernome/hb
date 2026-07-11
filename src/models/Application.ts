import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  type: { type: String, required: true },
  channelId: { type: String, required: false },
  enabled: { type: Boolean, default: true },
  applications: [{
    userId: { type: String, required: true },
    username: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedBy: { type: String, required: false },
    reviewedAt: { type: Date, required: false },
    reviewNotes: { type: String, required: false }
  }]
});

export const Application = mongoose.model('Application', applicationSchema);
