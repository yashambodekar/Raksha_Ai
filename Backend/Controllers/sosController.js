const cloudinary = require("../config/Cloudinary");
const fs = require("fs");
const path = require("path"); // ✅ FIXED
const User = require("../models/User");
const SOS = require("../models/SOS");
const GuardianLog = require("../models/GuardianLog");
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

exports.resendSOS = async (req, res) => {
  try {
    const { sosId } = req.body;
    const sos = await SOS.findById(sosId).populate("userId");

    if (!sos) return res.status(404).json({ error: "SOS not found" });

    const user = sos.userId;
    const messageBody = `⏰ *Repeated SOS Alert from ${user.name}*\n\n📍 *Location:*\nhttps://www.google.com/maps?q=${sos.location.lat},${sos.location.lng}\n🔊 *Audio:*\n${sos.audioUrl}\n\n⚠️ Please respond if this is real.`;

    for (const contact of user.emergencyContacts) {
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:+91${contact.phone}`,
        body: messageBody,
      });
    }

    res.status(200).json({ message: "Repeated SOS sent successfully" });
  } catch (err) {
    console.error("Resend SOS Error:", err.message);
    res.status(500).json({ error: "Failed to resend SOS" });
  }
};

exports.classifyAndTriggerSOS = async (req, res) => {
  try {
    const { userId, location } = req.body;
    const audioFile = req.file;

    if (!audioFile) return res.status(400).json({ error: "Audio file required" });

    // ✅ 1. Check Guardian Mode
    const guardian = await GuardianLog.findOne({ userId });
    if (!guardian || !guardian.isActive) {
      fs.unlinkSync(audioFile.path);
      return res.status(403).json({ error: "Guardian Mode is not active" });
    }

    // ✅ 2. Run Python model first
    const { spawn } = require("child_process");
    const python = spawn("python", [
      path.join(__dirname, "../Python/classify_audio.py"),
      audioFile.path,
    ]);

    let output = "";
    python.stdout.on("data", (data) => (output += data.toString()));
    python.stderr.on("data", (err) => console.error("Python Error:", err.toString()));

    python.on("close", async () => {
      const [label, confidenceStr] = output.trim().split(",");
      const confidence = parseFloat(confidenceStr);

      // ✅ 3. Upload to Cloudinary (only if detection passed)
      const cloudUpload = await cloudinary.uploader.upload(audioFile.path, {
        resource_type: "video",
        folder: "raksha-classified",
      });

      // ✅ Delete local audio
      fs.unlinkSync(audioFile.path);
      const audioUrl = cloudUpload.secure_url;

      // ✅ 4. Trigger SOS only if relevant sound detected
      if (["scream", "crying", "violence", "abuse"].includes(label.toLowerCase()) && confidence > 0.3) {
        const newSOS = new SOS({ userId, audioUrl, location, detectedLabel: label, confidence });
        await newSOS.save();

        const user = await User.findById(userId);
        const message = `🚨 *SOS Alert from ${user.name}* 🚨\n\n📍 *Location:*\nhttps://www.google.com/maps?q=${location.lat},${location.lng}\n🔊 *Audio:* ${audioUrl}\n\n🛡️ Detected: ${label} (${(confidence * 100).toFixed(2)}%)`;

        for (const contact of user.emergencyContacts) {
          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:+91${contact.phone}`,
            body: message,
          });
        }

        return res.status(200).json({ message: "SOS triggered", label, confidence });
      } else {
        return res.status(200).json({ message: "No threat detected", label, confidence });
      }
    });
  } catch (err) {
    console.error("❌ Classify SOS Error:", err);
    res.status(500).json({ error: "Error classifying audio" });
  }
};

exports.markFalseDetection = async (req, res) => {
  try {
    const { sosId, contactPhone } = req.body;

    const sos = await SOS.findById(sosId);
    if (!sos) return res.status(404).json({ error: "SOS not found" });

    if (sos.isFalseAlarm) {
      return res.status(200).json({ message: "Already marked as false alarm" });
    }

    if (!sos.falseDetectionVotes.includes(contactPhone)) {
      sos.falseDetectionVotes.push(contactPhone);
    }

    if (sos.falseDetectionVotes.length >= 2) {
      sos.isFalseAlarm = true;
    }

    await sos.save();

    res.status(200).json({
      message: sos.isFalseAlarm
        ? "SOS marked as false alarm"
        : "False vote recorded. Waiting for more.",
    });
  } catch (err) {
    console.error("False Detection Error:", err.message);
    res.status(500).json({ error: "Failed to mark false detection" });
  }
};
