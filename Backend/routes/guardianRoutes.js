const express = require("express");
const router = express.Router();
const { toggleGuardianMode, getGuardianStatus } = require("../Controllers/guardianController");

router.post("/toggle", toggleGuardianMode);
router.get("/status/:userId", getGuardianStatus);

module.exports = router;
