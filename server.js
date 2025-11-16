// Import required packages
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
console.log("✅ authRoutes loaded");   // <— add this line
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");



// Initialize app

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);




// Simple test route
app.get("/", (req, res) => {
  res.send("✅ MyShivalik backend is running successfully!");
});
app.post("/test", (req, res) => {
  res.json({ message: "POST route works" });
});

// Connect to MongoDB (we’ll set the link soon)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ Database connection error:", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
