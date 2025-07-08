// guardianRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { toggleGuardianMode, getGuardianStatus } = require("../Controllers/guardianController");
const { classifyAndTriggerSOS } = require("../Controllers/sosController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/toggle", toggleGuardianMode);
router.get("/status/:userId", getGuardianStatus);

// 🔥 This is the one triggered automatically when Guardian Mode is ON
router.post("/classify", upload.single("audio"), classifyAndTriggerSOS);

module.exports = router;
