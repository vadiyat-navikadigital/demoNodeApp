const Feedback = require("../models/feedbackModel");

// Get all feedbacks
exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get feedback by uniqueId
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ uniqueId: req.params.uniqueId });
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create a new feedback
exports.createFeedback = async (req, res) => {
  try {
    const { description, email, memberId, name, uniqueId } = req.body;

    if (!description || !email || !memberId || !name || !uniqueId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newFeedback = new Feedback({ description, email, memberId, name, uniqueId });
    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update feedback
exports.updateFeedback = async (req, res) => {
  try {
    const updatedFeedback = await Feedback.findOneAndUpdate(
      { uniqueId: req.params.uniqueId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) return res.status(404).json({ message: "Feedback not found" });
    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOneAndDelete({ uniqueId: req.params.uniqueId });

    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
