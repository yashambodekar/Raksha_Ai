const express = require("express");
const router = express.Router();
const { handleWhatsAppResponse } = require("../Controllers/twilioController");

// Twilio webhook (POST from Twilio Sandbox)
router.post("/response", handleWhatsAppResponse);

module.exports = router;
