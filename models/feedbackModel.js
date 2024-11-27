const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    email: { type: String, required: true },
    memberId: { type: String, required: true },
    name: { type: String, required: true },
    uniqueId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
