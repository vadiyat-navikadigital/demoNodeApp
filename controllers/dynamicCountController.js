const mongoose = require("mongoose");

exports.getDynamicCount = async (req, res) => {
  try {
    const { collectionName, ownerId, subField } = req.params;

    // Dynamically load the model
    const Model = mongoose.models[collectionName];
    if (!Model) {
      return res.status(404).json({ message: `Collection ${collectionName} not found` });
    }

    let count = 0;

    if (ownerId) {
      // Fetch a specific document using ownerId
      const document = await Model.findOne({ ownerId });

      if (!document) {
        return res.status(404).json({ message: `Document with ownerId ${ownerId} not found` });
      }

      if (subField) {
        // Count items in the specified subField if it exists and is an array
        const subFieldValue = document[subField];
        if (Array.isArray(subFieldValue)) {
          count = subFieldValue.length;
        } else {
          return res.status(400).json({ message: `${subField} is not a valid array field` });
        }
      } else {
        // If ownerId is found but no subField, count is 1
        count = 1;
      }
    } else {
      // Count all documents in the collection
      count = await Model.countDocuments();
    }

    res.json({ collectionName, ownerId, subField, count });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
