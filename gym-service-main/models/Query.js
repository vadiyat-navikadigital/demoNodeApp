const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const querySchema = new mongoose.Schema({
    clientId: { type: String, required: true },
    clientName: { type: String, required: true },
    email: { type: String, required: true },
    queryText: { type: String, required: true },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    comments: [commentSchema],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Query", querySchema);
