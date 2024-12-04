const express = require("express");
const router = express.Router();
const queryController = require("../controllers/queryController");

router.get("/export-csv", queryController.exportCsv);

module.exports = router;
