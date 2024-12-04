const { Parser } = require('json2csv'); // JSON to CSV parser
const User = require('../models/userModel');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { displayName, email, phoneNumber, uid, userName } = req.body;

    // Validate required fields
    if (!displayName || !email || !phoneNumber || !uid || !userName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

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
    if (err.code === 11000) {
      // Handle duplicate key error for other fields
      const duplicateField = Object.keys(err.keyValue)[0];
      res.status(400).json({
        message: `Duplicate value for field: ${duplicateField}`,
        error: err.keyValue,
      });
    } else {
      res.status(500).json({ message: 'Error creating user', error: err });
    }
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

// Export users to CSV
exports.exportUsersToCSV = async (req, res) => {
  try {
    const { uid, _id } = req.query;

    // Build the query
    const query = {};
    if (uid) query.uid = uid;
    if (_id) query._id = _id;

    // Fetch users based on the query
    const users = await User.find(query);

    if (!users.length) {
      return res.status(404).json({ message: 'No users found for the given criteria.' });
    }

    // Use Object.keys to dynamically get all fields
    const sampleRecord = users[0].toObject();
    const fields = Object.keys(sampleRecord);

    // Generate CSV data
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(users.map((user) => user.toObject()));

    // Set headers and send the file
    res.header('Content-Type', 'text/csv');
    res.attachment('users.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting users to CSV:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
