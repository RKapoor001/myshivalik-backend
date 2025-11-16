const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Send Friend Request
router.post("/:id/send-request", async (req, res) => {
  try {
    const { senderId } = req.body;     // the user who sends
    const receiverId = req.params.id;  // the user who receives

    if (senderId === receiverId) return res.status(400).json({ error: "You can’t send a request to yourself." });

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) return res.status(404).json({ error: "User not found." });
    if (sender.friends.includes(receiverId)) return res.status(400).json({ error: "Already friends." });
    if (receiver.friendRequests.includes(senderId)) return res.status(400).json({ error: "Request already sent." });

    receiver.friendRequests.push(senderId);
    await receiver.save();

    res.json({ message: "Friend request sent!" });
  } catch (err) {
    res.status(500).json({ error: "Error sending request." });
  }
});

// ✅ Accept Friend Request
router.post("/:id/accept-request", async (req, res) => {
  try {
    const senderId = req.params.id; // who originally sent
    const { receiverId } = req.body; // who is accepting

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver)
      return res.status(404).json({ error: "User not found" });

    // Check if request exists
    if (!receiver.friendRequests.includes(senderId))
      return res.status(400).json({ error: "No such request found" });

    // Remove from pending requests
    receiver.friendRequests.pull(senderId);

    // Add to both friends lists
    receiver.friends.push(senderId);
    sender.friends.push(receiverId);

    await receiver.save();
    await sender.save();

    res.json({ message: "Friend request accepted!" });
  } catch (err) {
    console.error("Accept request error:", err);
    res.status(500).json({ error: "Error accepting request" });
  }
});



// ✅ Reject or Cancel Friend Request
router.post("/:id/cancel-request", async (req, res) => {
  try {
    const { userId } = req.body;
    const otherId = req.params.id;

    const user = await User.findById(userId);
    const other = await User.findById(otherId);

    if (!user || !other) return res.status(404).json({ error: "User not found." });

    // remove if exists
    user.friendRequests.pull(otherId);
    other.friendRequests.pull(userId);

    await user.save();
    await other.save();

    res.json({ message: "Friend request removed." });
  } catch (err) {
    res.status(500).json({ error: "Error cancelling request." });
  }
});


// ✅ Get Friends List
router.get("/:id/friends", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("friends", "name classSection profilePic");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user.friends);
  } catch (err) {
    console.error("Friends fetch error:", err);
    res.status(500).json({ error: "Error fetching friends list." });
  }
});


// ✅ Search students by name, class, or section
router.get("/search", async (req, res) => {
  try {
    const { name, classSection } = req.query;
    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" }; // case-insensitive
    }
    if (classSection) {
      filter.classSection = { $regex: classSection, $options: "i" };
    }

    // ✅ Include only safe public fields like name, classSection, and profilePic
    const results = await User.find(filter).select("name classSection profilePic");

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Error searching users" });
  }
});


// ✅ Get all users (for testing)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // hide passwords
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching users" });
  }
});

// ✅ Get single user by ID
// ✅ Get a single user's full info (with friend names)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("friends", "name classSection")
      .populate("friendRequests", "name classSection"); // <-- important
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Error fetching user" });
  }
});

// ✅ Upload or update profile picture
const { upload } = require("../config/cloudinary");

// ✅ Upload profile picture to Cloudinary
router.post("/:id/upload-pic", upload.single("image"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // req.file.path contains the Cloudinary URL
    user.profilePic = req.file.path;
    await user.save();

    res.json({
      message: "✅ Profile picture uploaded successfully!",
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ error: "Error uploading profile picture" });
  }
});


module.exports = router;

