const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, require: true },
    userID: { type: String, require: true },
    online: {type: Boolean, default: false},
    password: {type: String}
});

module.exports = mongoose.model("User", userSchema);