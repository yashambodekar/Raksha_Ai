const mongoose = require("mongoose");

const guardianLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  activatedAt: Date,
  deactivatedAt: Date
}, {
  timestamps: true,
});

module.exports = mongoose.model("GuardianLog", guardianLogSchema);
