const { Parser } = require("json2csv");
const BMI = require('../models/bmiModel');

// Create a new BMI record
exports.createBmiRecord = async (req, res) => {
  try {
    const { memberId, memberName, memberUserId, history } = req.body;

    const newBmiRecord = new BMI({
      memberId,
      memberName,
      memberUserId,
      history,
    });

    await newBmiRecord.save();
    res.status(201).json({ message: 'BMI Record Created', data: newBmiRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all BMI records or get specific BMI records by search query fields
exports.getAllBmiRecords = async (req, res) => {
  try {
    const { memberId, memberName, memberUserId, age, bmi, category, gender, height, weight,
      limit = 10, // Default limit
      offset = 0, // Default offset
      sort = "createdAt:desc", // Default sort
    } = req.query;

    // Build the search query
    const query = {};

    if (memberId) query.memberId = memberId;
    if (memberName) query.memberName = new RegExp(memberName.trim().replace(/\s+/g, " "), "i");
    if (memberUserId) query.memberUserId = memberUserId;

    // Search fields within the BMI history array
    const historyQuery = {};
    if (age) historyQuery["history.age"] = age;
    if (bmi) historyQuery["history.bmi"] = bmi;
    if (category) historyQuery["history.category"] = new RegExp(category.trim().replace(/\s+/g, " "), "i");
    if (gender) historyQuery["history.gender"] = gender;
    if (height) historyQuery["history.height"] = height;
    if (weight) historyQuery["history.weight"] = weight;

    // Combine both queries
    const combinedQuery = { ...query, ...historyQuery };

    // Parse sorting
    const [sortField, sortOrder] = sort.split(":");
    const sortObj = { [sortField]: sortOrder === "desc" ? -1 : 1 };

    // Fetch records with pagination and sorting
    const bmiRecords = await BMI.find(combinedQuery)
      .sort(sortObj)
      .skip(Number(offset))
      .limit(Number(limit));

    // Get total count for pagination meta
    const totalRecords = await BMI.countDocuments(combinedQuery);

    res.status(200).json({
      total: totalRecords,
      limit: Number(limit),
      offset: Number(offset),
      sort: sortObj,
      data: bmiRecords,
    });
  } catch (error) {
    console.error("Error retrieving BMI records:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Get BMI record by member ID
exports.getBmiRecordById = async (req, res) => {
  try {
    const bmiRecord = await BMI.findOne({ memberId: req.params.memberId });
    if (!bmiRecord) {
      return res.status(404).json({ message: 'BMI Record Not Found' });
    }
    res.status(200).json(bmiRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update BMI record history for a member
exports.updateBmiRecord = async (req, res) => {
  try {
    const updatedBmiRecord = await BMI.findOneAndUpdate(
      { memberId: req.params.memberId },
      { $push: { history: req.body.history } },
      { new: true }
    );
    if (!updatedBmiRecord) {
      return res.status(404).json({ message: 'BMI Record Not Found' });
    }
    res.status(200).json({ message: 'BMI Record Updated', data: updatedBmiRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete BMI record by member ID
exports.deleteBmiRecord = async (req, res) => {
  try {
    const deletedBmiRecord = await BMI.findOneAndDelete({ memberId: req.params.memberId });
    if (!deletedBmiRecord) {
      return res.status(404).json({ message: 'BMI Record Not Found' });
    }
    res.status(200).json({ message: 'BMI Record Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Export specific BMI records as CSV
exports.exportSpecificBmiRecordsToCsv = async (req, res) => {
  try {
    const { _id, memberId, memberUserId } = req.query;

    // Build dynamic filter criteria based on query parameters
    const filter = {};
    if (_id) filter._id = _id;
    if (memberId) filter.memberId = memberId;
    if (memberUserId) filter.memberUserId = memberUserId;

    // Find BMI records matching the filter
    const bmiRecords = await BMI.find(filter);
    if (!bmiRecords || bmiRecords.length === 0) {
      return res.status(404).json({ message: "No BMI records found for the specified criteria" });
    }

    // Flatten the BMI records to handle the `history` array
    const flattenedRecords = [];
    bmiRecords.forEach((record) => {
      record.history.forEach((entry) => {
        flattenedRecords.push({
          memberId: record.memberId,
          memberName: record.memberName,
          memberUserId: record.memberUserId,
          age: entry.age,
          bmi: entry.bmi,
          category: entry.category,
          dateCreated: entry.dateCreated,
          gender: entry.gender,
          height: entry.height,
          lowerRange: entry.lowerRange,
          upperRange: entry.upperRange,
          weight: entry.weight,
        });
      });
    });

    // Define fields for the CSV
    const fields = [
      "memberId",
      "memberName",
      "memberUserId",
      "age",
      "bmi",
      "category",
      "dateCreated",
      "gender",
      "height",
      "lowerRange",
      "upperRange",
      "weight",
    ];
    const opts = { fields };

    // Convert to CSV
    const parser = new Parser(opts);
    const csv = parser.parse(flattenedRecords);

    // Send the CSV file
    res.header("Content-Type", "text/csv");
    res.attachment("specific_bmi_records.csv");
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



