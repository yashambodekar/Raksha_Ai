const User = require("../models/User");

// ✅ Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-pin -password -fingerprint");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.editProfile = async (req, res) => {
  try {
    const { userId, name, phone, pin, password, fingerprintHash, emergencyContacts } = req.body;

    // Build update object dynamically
    const update = {};
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (pin) update.pin = pin;
    if (password) update.password = password;
    if (fingerprintHash) update.fingerprintHash = fingerprintHash;
    if (emergencyContacts) update.emergencyContacts = emergencyContacts;

    // Ensure at least one of pin, password, or fingerprintHash is present
    if (!update.pin && !update.password && !update.fingerprintHash) {
      return res.status(400).json({ error: "At least one of PIN, Password, or Fingerprint is required." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      update,
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};
