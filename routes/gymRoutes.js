const express = require("express");
const multer = require("multer");
const {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
  exportGymsToCsv,
} = require("../controllers/gymController");

const router = express.Router();

// File upload setup
const upload = multer({ dest: "uploads/" });

router.get("/", getAllGyms); // Get all gyms
router.get("/:uniqueId", getGymById); // Get gym by uniqueId
router.post("/", upload.single("photo"), createGym); // Create gym with optional photo
router.put("/:uniqueId", updateGym); // Update gym
router.delete("/:uniqueId", deleteGym); // Delete gym
router.get("/export/csv", exportGymsToCsv); // Export gyms as CSV

module.exports = router;
