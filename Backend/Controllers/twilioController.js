const SOS = require("../models/SOS");
const User = require("../models/User");

exports.handleWhatsAppResponse = async (req, res) => {
  try {
    const incomingMsg = req.body.Body?.toLowerCase();
    const fromNumber = req.body.From?.replace("whatsapp:+91", "");

    if (!incomingMsg || !fromNumber) return res.sendStatus(200); // Ignore empty

    // ✅ Match common "false" messages
    const falseTriggers = ["false alarm", "ignore", "not real", "no danger", "cancel"];
    if (!falseTriggers.some(trigger => incomingMsg.includes(trigger))) {
      return res.status(200).send("Message received");
    }

    // ✅ Find the most recent SOS matching this number
    const user = await User.findOne({
      emergencyContacts: { $elemMatch: { phone: fromNumber } }
    });

    if (!user) return res.send("User not found for this number");

    const latestSOS = await SOS.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (!latestSOS) return res.send("No recent SOS found");

    if (!latestSOS.falseDetectionVotes.includes(fromNumber)) {
      latestSOS.falseDetectionVotes.push(fromNumber);
    }

    if (latestSOS.falseDetectionVotes.length >= 2) {
      latestSOS.isFalseAlarm = true;
    }

    await latestSOS.save();

    res.status(200).send("False alarm vote recorded");
  } catch (err) {
    console.error("Twilio webhook error:", err.message);
    res.status(500).send("Error processing WhatsApp reply");
  }
};
