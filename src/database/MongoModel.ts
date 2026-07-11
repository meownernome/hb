import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  minecraftUsername: { type: String, required: false },
  verified: { type: Boolean, default: false },
  currentTiers: {
    Sword: { type: String, default: null },
    Crystal: { type: String, default: null },
    SMP: { type: String, default: null },
    "Netherite Pot": { type: String, default: null },
    "Diamond Pot": { type: String, default: null },
    UHC: { type: String, default: null },
    BuildUHC: { type: String, default: null },
    NoDebuff: { type: String, default: null },
    Combo: { type: String, default: null },
    Gapple: { type: String, default: null },
    "OP Duel": { type: String, default: null },
    Boxing: { type: String, default: null },
    Axe: { type: String, default: null },
    Mace: { type: String, default: null },
    Anchor: { type: String, default: null },
    "Cart PvP": { type: String, default: null },
    Bedwars: { type: String, default: null },
    Skywars: { type: String, default: null },
    Bridge: { type: String, default: null },
    Nodebuff: { type: String, default: null },
    Vanilla: { type: String, default: null },
    Crossbow: { type: String, default: null },
    Trident: { type: String, default: null },
    Shield: { type: String, default: null },
    "Elytra Combat": { type: String, default: null },
    "Custom Duel": { type: String, default: null }
  },
  tierHistory: [{
    pvpMode: { type: String, required: true },
    tier: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  testsCompleted: { type: Number, default: 0 },
  dateJoined: { type: Date, default: Date.now }
});

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

const ticketSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  ticketId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  minecraftUsername: { type: String, required: false },
  status: { type: String, enum: ['open', 'claimed', 'in_progress', 'completed', 'cancelled', 'closed'], default: 'open' },
  testerId: { type: String, required: false },
  testerUsername: { type: String, required: false },
  claimedAt: { type: Date, required: false },
  startedAt: { type: Date, required: false },
  completedAt: { type: Date, required: false },
  cancelledBy: { type: String, required: false },
  cancelledAt: { type: Date, required: false },
  closedBy: { type: String, required: false },
  closedAt: { type: Date, required: false },
  pvpMode: { type: String, required: false },
  tier: { type: String, required: false },
  reason: { type: String, required: false },
  notes: { type: String, required: false },
  duration: { type: Number, required: false },
  transcript: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

const ticketSystemSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  categoryId: { type: String, required: false },
  roles: {
    tester: { type: String, required: false },
    admin: { type: String, required: false }
  }
});

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

const serverSetupSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  setupCompleted: { type: Boolean, default: false }
});

const guildLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  guildName: { type: String, required: true },
  memberCount: { type: Number, required: true },
  description: { type: String, required: true }
});

const memberLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  guildName: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  description: { type: String, required: true }
});

const channelLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  guildName: { type: String, required: true },
  channelName: { type: String, required: true },
  channelType: { type: String, required: true },
  description: { type: String, required: true }
});

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

export class MongoModel {
  static User = mongoose.models.User || mongoose.model('User', userSchema);
  static Verification = mongoose.models.Verification || mongoose.model('Verification', verificationSchema);
  static Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
  static TicketSystem = mongoose.models.TicketSystem || mongoose.model('TicketSystem', ticketSystemSchema);
  static Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
  static Leaderboards = mongoose.models.Leaderboards || mongoose.model('Leaderboards', leaderboardsSchema);
  static ServerSetup = mongoose.models.ServerSetup || mongoose.model('ServerSetup', serverSetupSchema);
  static GuildLog = mongoose.models.GuildLog || mongoose.model('GuildLog', guildLogSchema);
  static MemberLog = mongoose.models.MemberLog || mongoose.model('MemberLog', memberLogSchema);
  static ChannelLog = mongoose.models.ChannelLog || mongoose.model('ChannelLog', channelLogSchema);
  static RoleLog = mongoose.models.RoleLog || mongoose.model('RoleLog', roleLogSchema);
  static VerificationLog = mongoose.models.VerificationLog || mongoose.model('VerificationLog', verificationLogSchema);
  static CommandLog = mongoose.models.CommandLog || mongoose.model('CommandLog', commandLogSchema);
}