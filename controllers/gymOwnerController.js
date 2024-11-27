const { Parser } = require("json2csv");
const GymOwner = require("../models/gymOwnerModel");

// Helper function for fetching sub-collection
const getSubCollection = async (gymOwnerId, collectionName) => {
  const gymOwner = await GymOwner.findOne({ ownerId: gymOwnerId });
  if (!gymOwner) throw new Error("GymOwner not found1");
  return gymOwner[collectionName];
};

exports.getAllItems = async (req, res) => {
  try {
    console.log("getAllItems");
    const { gymOwnerId, collectionName } = req.params;
    const { limit = 10, offset = 0, sort, ...filters } = req.query; // Extract query params
    const items = await getSubCollection(gymOwnerId, collectionName);

    // Perform filtering
    let filteredItems = items.filter((item) => {
      return Object.keys(filters).every((key) => {
        if (key in item) {
          if (typeof item[key] === "string") {
            return item[key].toLowerCase().includes(filters[key].toLowerCase());
          } else if (typeof item[key] === "number" && filters[key].includes('-')) {
            // Handle range queries (e.g., price=100-500)
            const [min, max] = filters[key].split('-').map(Number);
            return item[key] >= min && item[key] <= max;
          } else {
            return item[key] === Number(filters[key]) || item[key] === filters[key];
          }
        }
        return false;
      });
    });

    // Apply sorting
    if (sort) {
      const [field, order] = sort.split(':'); // Example: "price:asc" or "price:desc"
      filteredItems.sort((a, b) => {
        if (!a[field] || !b[field]) return 0; // Skip if field doesn't exist
        const comparison = a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0;
        return order === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    res.status(200).json({
      total: filteredItems.length, // Total filtered items
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: paginatedItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get a single item
exports.getItem = async (req, res) => {
  try {
    console.log("getItem");
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

// Export CSV for a specific subcollection with optional query filtering
exports.exportToCsv = async (req, res) => {
  try {
    const { gymOwnerId, collectionName } = req.params;
    const queryParams = req.query;
    const items = await getSubCollection(gymOwnerId, collectionName);

    if (!items || items.length === 0) {
      return res.status(404).json({ message: "No data found for the specified subcollection." });
    }

    // Define fields for each subcollection - including all fields
    const fieldsMap = {
      MemberPackageRenewal: [
        "_id", "memberId", "packageId", "joiningPackageDate", "modeOfPayment", "package", "packagePrice"
      ],
      Members: [
        "_id", "aadharCardNo", "actualPackagePrice", "amountPaid", "birthMonthDate", "currentAddress", "currentPackageId",
        "dateOfBirth", "drivingLicence", "dueDate", "email", "firstName", "fullName", "gender", "gstNumber", "joiningPackageDate",
        "lastName", "martialStatus", "memberId", "mobileNumber", "modeOfPayment", "package", "packageDescription", "packageId",
        "packageMonth", "packagePrice", "panNo", "paymentDate", "permanentAddress", "photo", "recentPaidDate", "remainingAmount",
        "remark", "renewalDate", "thumbId", "status"
      ],
      Packages: [
        "_id", "description", "month", "packageName", "price"
      ],
      DietPlans: [
        "_id", "dietName", "pdf", "videoLink"
      ],
      ExercisePlans: [
        "_id", "exerciseName", "pdf", "videoLink"
      ],
      ContactUs: [
        "_id", "email", "enquiry", "fullName"
      ],
      GymStaff: [
        "_id", "address", "email", "firstName", "fullName", "joiningDate", "lastName", "mobileNumber", "password", "photo",
        "salary", "status", "thumbId", "type"
      ],
      Reviews: [
        "_id", "name", "rating", "review", "timestamp"
      ],
    };

    const fields = fieldsMap[collectionName];
    if (!fields) {
      return res.status(400).json({ message: "Invalid subcollection name." });
    }

    // Apply filters based on query parameters
    let filteredItems = items;

    // Always filter by _id if present in the query
    if (queryParams._id) {
      filteredItems = filteredItems.filter(item => item._id.toString() === queryParams._id);
    }

    switch (collectionName) {
      case "MemberPackageRenewal":
        if (queryParams.memberId) {
          filteredItems = filteredItems.filter(item => item.memberId === queryParams.memberId);
        }
        if (queryParams.packageId) {
          filteredItems = filteredItems.filter(item => item.packageId === queryParams.packageId);
        }
        break;
      case "Members":
        if (queryParams.memberId) {
          filteredItems = filteredItems.filter(item => item.memberId === queryParams.memberId);
        }
        if (queryParams.packageId) {
          filteredItems = filteredItems.filter(item => item.packageId === queryParams.packageId);
        }
        if (queryParams.thumbId) {
          filteredItems = filteredItems.filter(item => item.thumbId === queryParams.thumbId);
        }
        break;
      case "Packages":
      case "DietPlans":
      case "ExercisePlans":
      case "ContactUs":
      case "Reviews":
        // No additional filters required for these subcollections
        break;
      case "GymStaff":
        if (queryParams.thumbId) {
          filteredItems = filteredItems.filter(item => item.thumbId === queryParams.thumbId);
        }
        break;
      default:
        return res.status(400).json({ message: "Invalid subcollection name." });
    }

    // Convert data to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(filteredItems);

    // Send CSV as response
    res.setHeader("Content-Disposition", `attachment; filename=${collectionName}.csv`);
    res.setHeader("Content-Type", "text/csv");
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



