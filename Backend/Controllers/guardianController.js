const GuardianLog = require("../models/GuardianLog");

// Toggle Guardian Mode
exports.toggleGuardianMode = async (req, res) => {
  try {
    const { userId, activate } = req.body;

    let existingLog = await GuardianLog.findOne({ userId });

    if (!existingLog) {
      existingLog = new GuardianLog({ userId });
    }

    if (activate) {
      existingLog.isActive = true;
      existingLog.activatedAt = new Date();
      existingLog.deactivatedAt = null;
    } else {
      existingLog.isActive = false;
      existingLog.deactivatedAt = new Date();
    }

    await existingLog.save();
    res.status(200).json({ message: `Guardian mode ${activate ? 'activated' : 'deactivated'}`, log: existingLog });
  } catch (err) {
    console.error("Guardian toggle error:", err);
    res.status(500).json({ error: "Error toggling Guardian mode" });
  }
};

// Get Guardian Status
exports.getGuardianStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const log = await GuardianLog.findOne({ userId });
    if (!log) {
      return res.status(404).json({ error: "No Guardian data found" });
    }

    res.status(200).json({ isActive: log.isActive, activatedAt: log.activatedAt });
  } catch (err) {
    console.error("Status fetch error:", err);
    res.status(500).json({ error: "Error fetching Guardian status" });
  }
};
