const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser
} = require("../Controllers/authController");


router.post("/register", registerUser); // register user
router.post("/login", loginUser); // login user

module.exports = router;
