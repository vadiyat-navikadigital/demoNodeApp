const express = require("express");
const {
  exportToCsv
} = require("../controllers/gymOwnerController");

const router = express.Router();

router.get("/:gymOwnerId/:collectionName", exportToCsv);

module.exports = router;
