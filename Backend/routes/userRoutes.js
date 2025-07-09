const express = require("express");
const userController = require("../Controllers/userController");
const router = express.Router();

router.get("/profile/:id", userController.getUserProfile);
router.put("/edit-profile", userController.editProfile);

module.exports = router;