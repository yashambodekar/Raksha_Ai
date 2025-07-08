const User = require("../models/User");

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, phone, pin, password, fingerprintHash, emergencyContacts } = req.body;

    if (!pin && !password && !fingerprintHash) {
      return res.status(400).json({ error: "At least one of PIN, password, or fingerprint must be provided." });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this phone number." });
    }

    const newUser = new User({
      name,
      phone,
      pin,
      password,
      fingerprintHash,
      emergencyContacts,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { phone, pin, password, fingerprintHash } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    if (!pin && !password && !fingerprintHash) {
      return res.status(400).json({ error: "Provide at least one credential (PIN, password, or fingerprint)" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check any one credential
    const isPinValid = pin && user.pin === pin;
    const isPasswordValid = password && user.password === password;
    const isFingerprintValid = fingerprintHash && user.fingerprintHash === fingerprintHash;

    if (isPinValid || isPasswordValid || isFingerprintValid) {
      return res.status(200).json({ message: "Login successful", user });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};
