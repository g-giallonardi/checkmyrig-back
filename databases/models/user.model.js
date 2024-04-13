const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    password :String,
    profile: {
      name: String,
      location: String,
      about: String
    }
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;