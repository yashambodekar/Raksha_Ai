const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authroutes = require("./routes/authRoutes")
const guardianRoutes = require("./routes/guardianRoutes");
const sosRoutes = require("./routes/sosRoutes");
const userRoutes = require("./routes/userRoutes")
const twilioRoutes = require("./routes/twilioRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/auth",authroutes)
app.use("/twilio", twilioRoutes);
app.use("/guardian", guardianRoutes);
app.use("/sos", sosRoutes);
app.use("/use",userRoutes);


// Test Route
app.get("/", (req, res) => {
  res.send("Raksha App Backend is running ✅");
});

// Connect to DB and Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, '192.168.189.33', () => {
  console.log(`🚀 Server is running on http://192.168.189.33:${PORT}`);
});
});
