const express = require("express");
const { getDynamicCount } = require("../controllers/dynamicCountController");

const router = express.Router();

// Dynamic count route for all collections
router.get("/count/:collectionName/:ownerId?/:subField?", getDynamicCount);

module.exports = router;
