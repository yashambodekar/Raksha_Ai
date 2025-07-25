const express = require("express");
const router = express.Router();
const multer = require("multer");
const sosController = require("../Controllers/sosController");

// Use multer for file upload (local temp storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // ensure folder exists
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/trigger", upload.single("audio"), sosController.triggerSOS);
router.post("/resend", sosController.resendSOS);
router.post("/fake-detection", sosController.markFalseDetection);
router.post("/classify", upload.single("audio"), sosController.classifyAndTriggerSOS);


module.exports = router;
