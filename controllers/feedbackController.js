const { Parser } = require("json2csv");
const Feedback = require("../models/feedbackModel");

// Get All feedback or get specific feedback by search query fields
exports.getAllFeedbacks = async (req, res) => {
  try {
    const { description, email, memberId, name, uniqueId,
      limit = 10, // Default limit
      offset = 0, // Default offset
      sort = "createdAt:desc", // Default sort
    } = req.query;

    // Build the search query
    const query = {};

    if (description) query.description = new RegExp(description.trim().replace(/\s+/g, " "), "i");
    if (email) query.email = email;
    if (memberId) query.memberId = memberId;
    if (name) query.name = new RegExp(name.trim().replace(/\s+/g, " "), "i");
    if (uniqueId) query.uniqueId = uniqueId;

    // Parse sorting
    const [sortField, sortOrder] = sort.split(":");
    const sortObj = { [sortField]: sortOrder === "desc" ? -1 : 1 };

    // Fetch records with pagination and sorting
    const feedbacks = await Feedback.find(query)
      .sort(sortObj)
      .skip(Number(offset))
      .limit(Number(limit));

    // Get total count for pagination meta
    const totalRecords = await Feedback.countDocuments(query);

    res.status(200).json({
      total: totalRecords,
      limit: Number(limit),
      offset: Number(offset),
      sort: sortObj,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Error retrieving feedbacks:", error);
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

// Export all or specific feedbacks as CSV
exports.exportSpecificFeedbacksToCsv = async (req, res) => {
  try {
    const { _id, memberId, uniqueId } = req.query;

    // Build dynamic filter criteria based on query parameters
    const filter = {};
    if (_id) filter._id = _id;
    if (memberId) filter.memberId = memberId;
    if (uniqueId) filter.uniqueId = uniqueId;

    // Find feedback records matching the filter
    const feedbacks = await Feedback.find(filter);
    if (!feedbacks || feedbacks.length === 0) {
      return res.status(404).json({ message: "No feedback records found for the specified criteria" });
    }

    // Define fields for the CSV
    const fields = ["uniqueId", "name", "email", "memberId", "description", "createdAt", "updatedAt"];
    const opts = { fields };

    // Convert to CSV
    const parser = new Parser(opts);
    const csv = parser.parse(feedbacks);

    // Send the CSV file
    res.header("Content-Type", "text/csv");
    res.attachment("specific_feedback_records.csv");
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


