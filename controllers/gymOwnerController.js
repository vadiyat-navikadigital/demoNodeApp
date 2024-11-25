const GymOwner = require("../models/gymOwnerModel");

// Helper function for fetching sub-collection
const getSubCollection = async (gymOwnerId, collectionName) => {
  const gymOwner = await GymOwner.findOne({ ownerId: gymOwnerId });
  if (!gymOwner) throw new Error("GymOwner not found1");
  return gymOwner[collectionName];
};

// Get all items from a sub-collection
exports.getAllItems = async (req, res) => {
  try {
    const { gymOwnerId, collectionName } = req.params;
    const items = await getSubCollection(gymOwnerId, collectionName);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single item
exports.getItem = async (req, res) => {
  try {
    const { gymOwnerId, collectionName, itemId } = req.params;
    const items = await getSubCollection(gymOwnerId, collectionName);
    const item = items.find((i) => i._id.toString() === itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new item
exports.createItem = async (req, res) => {
  try {
    const { gymOwnerId, collectionName } = req.params;
    const newItem = req.body;
    const gymOwner = await GymOwner.findOne({ ownerId: gymOwnerId });
    if (!gymOwner) return res.status(404).json({ message: "GymOwner not found" });
    gymOwner[collectionName].push(newItem);
    await gymOwner.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  try {
    const { gymOwnerId, collectionName, itemId } = req.params;
    const updatedData = req.body;
    const gymOwner = await GymOwner.findOne({ ownerId: gymOwnerId });
    if (!gymOwner) return res.status(404).json({ message: "GymOwner not found" });

    const item = gymOwner[collectionName].find((i) => i._id.toString() === itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    Object.assign(item, updatedData);
    await gymOwner.save();
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const { gymOwnerId, collectionName, itemId } = req.params;
    const gymOwner = await GymOwner.findOne({ ownerId: gymOwnerId });
    if (!gymOwner) return res.status(404).json({ message: "GymOwner not found" });

    gymOwner[collectionName] = gymOwner[collectionName].filter(
      (i) => i._id.toString() !== itemId
    );
    await gymOwner.save();
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
