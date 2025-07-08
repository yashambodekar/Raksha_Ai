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

// ✅ Update Emergency Contacts
exports.updateEmergencyContacts = async (req, res) => {
  try {
    const { userId, emergencyContacts } = req.body;
    if (!userId || !emergencyContacts || emergencyContacts.length !== 3) {
      return res.status(400).json({ error: "3 emergency contacts required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { emergencyContacts },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "Emergency contacts updated", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update contacts" });
  }
};
