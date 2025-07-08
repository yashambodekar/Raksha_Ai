const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  location: {
    lat: String,
    lng: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SOS", sosSchema);
