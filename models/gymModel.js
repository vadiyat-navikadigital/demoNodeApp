const mongoose = require("mongoose");

const gymSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    contact: { type: String, required: true },
    emailAddress: { type: String, required: true },
    gymName: { type: String, required: true },
    expiresAt: { type: Number, default: 0 },
    photo: { type: String, default: "" },
    plan: { type: String, default: "" },
    subscription: { type: String, default: "" },
    uniqueId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    website: { type: String, default: "" },
    isExpiredSoon: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gym", gymSchema);
