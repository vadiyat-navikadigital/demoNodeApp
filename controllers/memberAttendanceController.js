const { Parser } = require('json2csv'); // Library for JSON to CSV conversion
const MemberAttendance = require('../models/memberAttendanceModel');

// Get all members or filter by search queries
exports.getAllMembers = async (req, res) => {
    try {
      const { memberId, email, mobileNumber, fullName, gymUniqueId, firstName, lastName, modeOfPayment, package, packageId,
        limit = 10, // Default limit
        offset = 0, // Default offset
        sort = "createdAt:desc", // Default sorting
      } = req.query;
  
      // Build the search query
      const query = {};
  
      if (memberId) query.memberId = memberId;
      if (email) query.email = email;
      if (mobileNumber) query.mobileNumber = mobileNumber;
      if (fullName) query.fullName = new RegExp(fullName.trim().replace(/\s+/g, " "), "i");
      if (gymUniqueId) query.gymUniqueId = gymUniqueId;
      if (firstName) query.firstName = new RegExp(firstName.trim().replace(/\s+/g, " "), "i");
      if (lastName) query.lastName = new RegExp(lastName.trim().replace(/\s+/g, " "), "i");
      if (modeOfPayment) query.modeOfPayment = modeOfPayment;
      if (package) query.package = new RegExp(package.trim().replace(/\s+/g, " "), "i");
      if (packageId) query.packageId = packageId;
  
      // Parse sorting
      const [sortField, sortOrder] = sort.split(":");
      const sortObj = { [sortField]: sortOrder === "desc" ? -1 : 1 };
  
      // Fetch records with pagination and sorting
      const members = await MemberAttendance.find(query)
        .sort(sortObj)
        .skip(Number(offset))
        .limit(Number(limit));
  
      // Get total count for pagination metadata
      const totalRecords = await MemberAttendance.countDocuments(query);
  
      res.status(200).json({
        total: totalRecords,
        limit: Number(limit),
        offset: Number(offset),
        sort: sortObj,
        data: members,
      });
    } catch (err) {
      console.error("Error retrieving members:", err.message);
      res.status(500).json({ error: err.message });
    }
  };
  

// Get a single member by ID
exports.getMemberById = async (req, res) => {
    try {
        const member = await MemberAttendance.findById(req.params.id);
        if (!member) return res.status(404).json({ message: 'Member not found' });
        res.status(200).json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new member
exports.createMember = async (req, res) => {
    try {
        const newMember = new MemberAttendance(req.body);
        await newMember.save();
        res.status(201).json(newMember);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a member by ID
exports.updateMember = async (req, res) => {
    try {
        const updatedMember = await MemberAttendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMember) return res.status(404).json({ message: 'Member not found' });
        res.status(200).json(updatedMember);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a member by ID
exports.deleteMember = async (req, res) => {
    try {
        const deletedMember = await MemberAttendance.findByIdAndDelete(req.params.id);
        if (!deletedMember) return res.status(404).json({ message: 'Member not found' });
        res.status(200).json({ message: 'Member deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Export member attendance data to CSV
exports.exportMemberAttendanceToCSV = async (req, res) => {
  try {
    const { gymUniqueId, memberId, packageId, id, _id } = req.query;

    // Build the query
    const query = {};
    if (gymUniqueId) query.gymUniqueId = gymUniqueId;
    if (memberId) query.memberId = memberId;
    if (packageId) query.packageId = packageId;
    if (id) query.id = id;
    if (_id) query._id = _id;

    // Fetch member attendance records
    const attendanceRecords = await MemberAttendance.find(query);

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance records found for the given criteria.' });
    }

    // Extract fields dynamically from the first document
    const fields = Object.keys(attendanceRecords[0].toObject());

    // Convert attendance records to CSV
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(attendanceRecords.map((record) => record.toObject()));

    // Set response headers and send the CSV file
    res.header('Content-Type', 'text/csv');
    res.attachment('member_attendance.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting member attendance to CSV:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
