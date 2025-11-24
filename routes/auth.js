const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer();


// Import the User model
const User = require("../models/User");

// ✅ SIGNUP route
router.post("/signup", upload.none(), async (req, res) => {
  try {
    const { name, classSection, password, image} = req.body;

    // check if user already exists
    const existing = await User.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new User({
      name,
      classSection,
      password: hashedPassword,
      profilePic:
        image && image.trim() !== ""
          ? image
          : "https://i.postimg.cc/QN6VbVnJ/default-avatar.png",
    });

    await newUser.save();

    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// ✅ LOGIN route
router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findOne({ name });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ✅ Export router
module.exports = router;

