const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");

// ✅ Create a new post
router.post("/", async (req, res) => {
  try {
    const { authorId, content } = req.body;

    // Check if author exists
    const user = await User.findById(authorId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newPost = new Post({ author: authorId, content });
    await newPost.save();

    res.json({ message: "Post created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating post" });
  }
});

// ✅ Get all posts (feed)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name classSection profilePic")
      .sort({ createdAt: -1 }); // latest first
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching posts" });
  }
});

// ✅ Like / Unlike a post
router.post("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: "Error toggling like" });
  }
});

// ✅ Add a comment
router.post("/:id/comment", async (req, res) => {
  try {
    const { userId, text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({ user: userId, text });
    await post.save();

    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ error: "Error adding comment" });
  }
});

module.exports = router;
// ✅ Get posts by a specific user
router.get("/user/:id", async (req, res) => {
  try {
    const userPosts = await Post.find({ author: req.params.id })
      .populate("author", "name classSection")
      .sort({ createdAt: -1 });
    res.json(userPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user's posts" });
  }
});

