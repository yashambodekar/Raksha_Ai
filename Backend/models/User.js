const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema({
  name: String,
  phone: String,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },

  pin: { type: String },
  password: { type: String },
  fingerprintHash: { type: String },

  emergencyContacts: [emergencyContactSchema],
}, {
  timestamps: true
});

userSchema.pre("save", function (next) {
  if (!this.pin && !this.password && !this.fingerprintHash) {
    return next(new Error("At least one of PIN, Password, or Fingerprint is required."));
  }
  next();
});
// minimum one of them should be selected 

module.exports = mongoose.model("User", userSchema);
