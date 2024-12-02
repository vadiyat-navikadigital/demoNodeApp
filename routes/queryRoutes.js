const express = require("express");
const router = express.Router();
const queryController = require("../controllers/queryController");

// Routes
router.post("/", queryController.createQuery); // Create a new query
router.get("/", queryController.getAllQueries); // Get all queries
router.get("/client", queryController.getQueriesByStatusORClientId); // Get queries based on clientId or status
router.get("/:id", queryController.getQueryById); // Get a specific query by ID
router.delete("/:id", queryController.deleteQuery);
router.post("/:id/comments", queryController.addComment); // Add a comment to a query
router.patch("/:id/status", queryController.updateStatus); // Update query status

module.exports = router;
