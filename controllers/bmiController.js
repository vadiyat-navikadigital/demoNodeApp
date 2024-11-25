const BMI = require('../models/bmiModel');

// Create a new BMI record
exports.createBmiRecord = async (req, res) => {
  try {
    const { memberId, memberName, memberUserId, history } = req.body;

    const newBmiRecord = new BMI({
      memberId,
      memberName,
      memberUserId,
      history,
    });

    await newBmiRecord.save();
    res.status(201).json({ message: 'BMI Record Created', data: newBmiRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all BMI records
exports.getAllBmiRecords = async (req, res) => {
  try {
    const bmiRecords = await BMI.find();
    res.status(200).json(bmiRecords);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get BMI record by member ID
exports.getBmiRecordById = async (req, res) => {
  try {
    const bmiRecord = await BMI.findOne({ memberId: req.params.memberId });
    if (!bmiRecord) {
      return res.status(404).json({ message: 'BMI Record Not Found' });
    }
    res.status(200).json(bmiRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update BMI record history for a member
exports.updateBmiRecord = async (req, res) => {
  try {
    const updatedBmiRecord = await BMI.findOneAndUpdate(
      { memberId: req.params.memberId },
      { $push: { history: req.body.history } },
      { new: true }
    );
    if (!updatedBmiRecord) {
      return res.status(404).json({ message: 'BMI Record Not Found' });
    }
    res.status(200).json({ message: 'BMI Record Updated', data: updatedBmiRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete BMI record by member ID
exports.deleteBmiRecord = async (req, res) => {
  try {
    const deletedBmiRecord = await BMI.findOneAndDelete({ memberId: req.params.memberId });
    if (!deletedBmiRecord) {
      return res.status(404).json({ message: 'BMI Record Not Found' });
    }
    res.status(200).json({ message: 'BMI Record Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
