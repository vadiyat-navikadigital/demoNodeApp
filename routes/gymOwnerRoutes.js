const express = require("express");
const {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/gymOwnerController");

const router = express.Router();

router.get("/:gymOwnerId/:collectionName", getAllItems);
router.get("/:gymOwnerId/:collectionName/:itemId", getItem);
router.post("/:gymOwnerId/:collectionName", createItem);
router.put("/:gymOwnerId/:collectionName/:itemId", updateItem);
router.delete("/:gymOwnerId/:collectionName/:itemId", deleteItem);

module.exports = router;
