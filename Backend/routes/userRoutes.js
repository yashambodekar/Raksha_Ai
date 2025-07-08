const express = require("express");
const { updateEmergencyContacts, getUserProfile } = require("../Controllers/userController");
const router = express.Router();

router.get("/profile/:id", getUserProfile);
router.put("/emergency-contacts", updateEmergencyContacts);

module.exports = router;
