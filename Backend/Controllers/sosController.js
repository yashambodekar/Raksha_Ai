const cloudinary = require("../config/Cloudinary");
const fs = require("fs");
const User = require("../models/User");
const SOS = require("../models/SOS");
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.triggerSOS = async (req, res) => {
  try {
    const { userId, location } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    // Upload to Cloudinary
    const cloudUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video", // Cloudinary treats audio as 'video'
      folder: "raksha-sos",
    });

    // Delete local file
    fs.unlinkSync(audioFile.path);

    const audioUrl = cloudUpload.secure_url;

    // Save to database
    const newSOS = new SOS({ userId, audioUrl, location });
    await newSOS.save();

    // Fetch user & send WhatsApp
    const user = await User.findById(userId);
    if (user && user.emergencyContacts) {
      const message = `🚨 *SOS Alert from ${user.name}* 🚨\n\n📍 *Location:*\nhttps://www.google.com/maps?q=${location.lat},${location.lng}\n\n🔊 *Audio Proof:*\n${audioUrl}\n\n🛡️ _This is an auto-generated WhatsApp alert from Raksha._`;

      for (const contact of user.emergencyContacts) {
        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:+91${contact.phone}`,
          body: message,
        });
      }
    }

    res.status(201).json({ message: "SOS triggered and WhatsApp alerts sent", sos: newSOS });
  } catch (err) {
    console.error("❌ SOS Controller Error:", err.message);
    res.status(500).json({ error: "Failed to send WhatsApp SOS" });
  }
};
