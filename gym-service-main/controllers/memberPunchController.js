const { Parser } = require('json2csv'); // Library for JSON to CSV conversion
const MemberPunch = require('../models/memberPunchModel');
const moment = require('moment'); // For date and time conversion

// Get all punches for a specific memberAttendanceId
exports.getPunchesByAttendanceId = async (req, res) => {
  try {
    const { punchInDate, punchOutTime, limit = 10, offset = 0, sort = "punchInDate:desc" } = req.query;

    // Build the base query
    const query = { memberAttendanceId: req.params.attendanceId };

    // Convert punchInDate ("YYYY-MM-DD") to numeric format ("YYYYMMDD")
    if (punchInDate) {
      const formattedDate = moment(punchInDate, 'YYYY-MM-DD').format('YYYYMMDD');
      if (!moment(punchInDate, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Invalid punchInDate format. Use YYYY-MM-DD.' });
      }
      query.punchInDate = Number(formattedDate); // Convert to number
    }

    // Convert punchOutTime ("HH:mm") to numeric format (seconds since midnight)
    if (punchOutTime) {
      const time = moment(punchOutTime, 'HH:mm');
      if (!time.isValid()) {
        return res.status(400).json({ message: 'Invalid punchOutTime format. Use HH:mm.' });
      }
      query.punchOutTime = time.hours() * 3600 + time.minutes() * 60;
    }

    // Parse sorting parameter
    const [sortField, sortOrder] = sort.split(":");
    const sortObj = { [sortField]: sortOrder === "desc" ? -1 : 1 };

    // Fetch punches with pagination and sorting
    const punches = await MemberPunch.find(query)
      .sort(sortObj)
      .skip(Number(offset))
      .limit(Number(limit));

    // Get total count for pagination metadata
    const totalRecords = await MemberPunch.countDocuments(query);

    // Respond with data and pagination metadata
    res.status(200).json({
      total: totalRecords,
      limit: Number(limit),
      offset: Number(offset),
      sort: sortObj,
      data: punches,
    });
  } catch (err) {
    console.error("Error retrieving punches:", err.message);
    res.status(500).json({ error: err.message });
  }
};



// Get a specific punch by its ID
exports.getPunchById = async (req, res) => {
    try {
        const punch = await MemberPunch.findById(req.params.punchId);
        if (!punch) return res.status(404).json({ message: 'Punch not found' });
        res.status(200).json(punch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new punch for a specific memberAttendanceId
exports.createPunch = async (req, res) => {
    try {
        const newPunch = new MemberPunch({
            ...req.body,
            memberAttendanceId: req.params.attendanceId,
        });
        await newPunch.save();
        res.status(201).json(newPunch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a specific punch by its ID
exports.updatePunchById = async (req, res) => {
    try {
        const updatedPunch = await MemberPunch.findByIdAndUpdate(
            req.params.punchId,
            req.body,
            { new: true }
        );
        if (!updatedPunch) return res.status(404).json({ message: 'Punch not found' });
        res.status(200).json(updatedPunch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a specific punch by its ID
exports.deletePunchById = async (req, res) => {
    try {
        const deletedPunch = await MemberPunch.findByIdAndDelete(req.params.punchId);
        if (!deletedPunch) return res.status(404).json({ message: 'Punch not found' });
        res.status(200).json({ message: 'Punch deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Export member punches to CSV
exports.exportPunchesToCSV = async (req, res) => {
  try {
    const { memberAttendanceId, _id } = req.query;

    // Build the query based on query parameters
    const query = {};
    if (memberAttendanceId) query.memberAttendanceId = memberAttendanceId;
    if (_id) query._id = _id;

    // Fetch member punch data based on the query
    const punchRecords = await MemberPunch.find(query).populate('memberAttendanceId');

    if (!punchRecords.length) {
      return res.status(404).json({ message: "No punch records found for the given criteria." });
    }

    // Dynamically generate fields from the schema
    const fields = Object.keys(punchRecords[0].toObject());
    
    // Convert punch data to CSV
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(punchRecords.map(record => record.toObject()));

    // Send the CSV file as a response
    res.header("Content-Type", "text/csv");
    res.attachment("punch_records.csv");
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting punches to CSV:", error.message);
    res.status(500).json({ error: error.message });
  }
};


