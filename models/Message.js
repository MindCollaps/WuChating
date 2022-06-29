const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    autor: { type: mongoose.Schema.Types.ObjectId, require: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, require: true },
    message: {type: String, require: true},
    date: {type: Date, require: true}
});

module.exports = mongoose.model("Message", messageSchema);