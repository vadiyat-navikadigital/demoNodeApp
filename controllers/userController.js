const User = require('../models/userModel');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { displayName, email, phoneNumber, uid, userName } = req.body;
    const newUser = new User({
      displayName,
      email,
      phoneNumber,
      uid,
      userName,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', newUser });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err });
  }
};

// Get a user by UID
exports.getUserByUID = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err });
  }
};

// Update a user by UID
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { uid: req.params.uid },
      req.body,
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully', updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err });
  }
};

// Delete a user by UID
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ uid: req.params.uid });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err });
  }
};
