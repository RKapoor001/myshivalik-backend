const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  classSection: {
    type: String,
    required: true,
  },
  profilePic: {
  type: String,
  default: "https://i.postimg.cc/QN6VbVnJ/default-avatar.png", // fallback avatar
},

  password: {
    type: String,
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

});

module.exports = mongoose.model("User", UserSchema);
