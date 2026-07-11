import mongoose from 'mongoose';

const leaderboardsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  statistics: {
    mostActivePlayers: [{ type: String }],
    mostTestsCompleted: [{ type: String }],
    highestRatedTesters: [{ type: String }],
    highestRankedPlayers: [{ type: String }],
    mostRequestedPvPModes: [{ type: String }]
  },
  lastUpdated: { type: Date, default: Date.now }
});

export const Leaderboards = mongoose.model('Leaderboards', leaderboardsSchema);
