const express = require("express");
const {
  getAllFeedbacks,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  exportSpecificFeedbacksToCsv,
} = require("../controllers/feedbackController");

const router = express.Router();

router.get("/", getAllFeedbacks); // Get all feedbacks
router.get("/:uniqueId", getFeedbackById); // Get feedback by uniqueId
router.post("/", createFeedback); // Create feedback
router.put("/:uniqueId", updateFeedback); // Update feedback
router.delete("/:uniqueId", deleteFeedback); // Delete feedback
router.get('/export/csv', exportSpecificFeedbacksToCsv);  // Export specific feedbacks as CSV

module.exports = router;
