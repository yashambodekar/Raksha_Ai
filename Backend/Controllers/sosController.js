const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { spawn } = require("child_process");
const cloudinary = require("../config/cloudinary");
const GuardianLog = require("../models/GuardianLog");
const SOS = require("../models/SOS");
const User = require("../models/User");
const client = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// 🚨 TRIGGER SOS DIRECTLY
exports.triggerSOS = async (req, res) => {
  console.log("✅ /sos/trigger called");
  try {
    const { userId, location } = req.body;
    const audioFile = req.file;

    console.log("📥 Received:", { userId, location });
    console.log("🎧 Audio Path:", audioFile?.path);

    if (!audioFile) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    const cloudUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
      folder: "raksha-sos",
    });

    fs.unlinkSync(audioFile.path);
    const audioUrl = cloudUpload.secure_url;

    const newSOS = new SOS({ userId, audioUrl, location });
    await newSOS.save();

    const user = await User.findById(userId);
    console.log("👤 User:", user?.name);

    if (user && user.emergencyContacts) {
      const message = `🚨 *SOS Alert from ${user.name}* 🚨\n\n📍 *Location:*\nhttps://www.google.com/maps?q=${location.lat},${location.lng}\n\n🔊 *Audio Proof:*\n${audioUrl}\n\n🛡️ _This is an auto-generated WhatsApp alert from Raksha._`;

      for (const contact of user.emergencyContacts) {
        console.log("📤 Sending message to:", contact.phone);
        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:+91${contact.phone}`,
          body: message,
        });
      }
    }

    console.log("✅ SOS Triggered & WhatsApp sent");
    res.status(201).json({ message: "SOS triggered and WhatsApp alerts sent", sos: newSOS });
  } catch (err) {
    console.error("❌ triggerSOS Error:", err.message);
    res.status(500).json({ error: "Failed to send WhatsApp SOS" });
  }
};

// 📢 RESEND SOS
exports.resendSOS = async (req, res) => {
  try {
    const { sosId } = req.body;
    console.log("🔁 /sos/resend called for SOS ID:", sosId);

    const sos = await SOS.findById(sosId).populate("userId");
    if (!sos) return res.status(404).json({ error: "SOS not found" });

    const user = sos.userId;
    const messageBody = `⏰ *Repeated SOS Alert from ${user.name}*\n\n📍 *Location:*\nhttps://www.google.com/maps?q=${sos.location.lat},${sos.location.lng}\n🔊 *Audio:*\n${sos.audioUrl}\n\n⚠️ Please respond if this is real.`;

    for (const contact of user.emergencyContacts) {
      console.log("📤 Resending to:", contact.phone);
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:+91${contact.phone}`,
        body: messageBody,
      });
    }

    res.status(200).json({ message: "Repeated SOS sent successfully" });
  } catch (err) {
    console.error("❌ resendSOS Error:", err.message);
    res.status(500).json({ error: "Failed to resend SOS" });
  }
};

// 🎧 CLASSIFY & TRIGGER IF DANGEROUS
exports.classifyAndTriggerSOS = async (req, res) => {
  console.log("✅ /sos/classify called");

  try {
    const { userId, location } = req.body;
    const audioFile = req.file;

    console.log("📥 Received:", { userId, location });
    console.log("🎧 Audio Path:", audioFile?.path);

    if (!audioFile) return res.status(400).json({ error: "Audio file required" });

    const guardian = await GuardianLog.findOne({ userId });
    console.log("🛡️ Guardian Mode:", guardian?.isActive);

    if (!guardian || !guardian.isActive) {
      if (fs.existsSync(audioFile.path)) fs.unlinkSync(audioFile.path);
      return res.status(403).json({ error: "Guardian Mode is not active" });
    }

    const ext = path.extname(audioFile.path).toLowerCase();
    let wavPath = audioFile.path.replace(/\.[^/.]+$/, ".wav");

    if (ext !== ".wav") {
      console.log("🔄 Converting audio to WAV...");
      await new Promise((resolve, reject) => {
        ffmpeg(audioFile.path)
          .audioCodec("pcm_s16le")
          .toFormat("wav")
          .save(wavPath)
          .on("end", () => {
            console.log("✅ Conversion done");
            resolve();
          })
          .on("error", reject);
      });
    } else {
      wavPath = audioFile.path;
    }

    let output = "";
    const python = spawn("python", [path.join(__dirname, "../Python/classify_audio.py"), wavPath]);

    python.stdout.on("data", (data) => (output += data.toString()));
    python.stderr.on("data", (err) => console.error("🐍 Python stderr:", err.toString()));
    python.on("error", (err) => console.error("🐍 Python spawn error:", err.toString()));

    python.on("close", async () => {
      console.log("📊 Python Output:", output);

      if (!output.includes(",")) {
        fs.existsSync(audioFile.path) && fs.unlinkSync(audioFile.path);
        fs.existsSync(wavPath) && wavPath !== audioFile.path && fs.unlinkSync(wavPath);
        return res.status(500).json({ error: "Invalid output from Python model", raw: output });
      }

      const [label, confidenceStr] = output.trim().split(",");
      const confidence = parseFloat(confidenceStr);
      const normalizedLabel = label.toLowerCase().trim();

      console.log("🔍 Detected:", normalizedLabel, "Confidence:", confidence);

      const cloudUpload = await cloudinary.uploader.upload(audioFile.path, {
        resource_type: "video",
        folder: "raksha-classified",
      });
      const audioUrl = cloudUpload.secure_url;

      // Clean up
      fs.existsSync(audioFile.path) && fs.unlinkSync(audioFile.path);
      wavPath !== audioFile.path && fs.existsSync(wavPath) && fs.unlinkSync(wavPath);

      if (["screaming", "crying"].includes(normalizedLabel) && confidence > 0.3) {
        console.log("🚨 Threat Detected. Triggering SOS...");

        const newSOS = new SOS({ userId, audioUrl, location, detectedLabel: label, confidence });
        await newSOS.save();

        const user = await User.findById(userId);
        const message = `🚨 *SOS Alert from ${user.name}* 🚨\n\n📍 *Location:*\nhttps://www.google.com/maps?q=${location.lat},${location.lng}\n🔊 *Audio:* ${audioUrl}\n\n🛡️ Detected: ${label} (${(confidence * 100).toFixed(2)}%)`;

        for (const contact of user.emergencyContacts) {
          console.log("📤 Notifying:", contact.phone);
          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:+91${contact.phone}`,
            body: message,
          });
        }

        return res.status(200).json({ message: "SOS triggered", label, confidence });
      } else {
        console.log("🟢 No threat detected.");
        return res.status(200).json({ message: "No threat detected", label, confidence });
      }
    });
  } catch (err) {
    console.error("❌ classifyAndTriggerSOS Error:", err);
    res.status(500).json({ error: "Error classifying audio" });
  }
};

// ❌ MARK FALSE DETECTION
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
    console.error("❌ markFalseDetection Error:", err.message);
    res.status(500).json({ error: "Failed to mark false detection" });
  }
};
