const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  pendingStep: {
    type: [String],
    default: [],
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  photoURL: {
    type: String,
    default: '',
  },
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);
