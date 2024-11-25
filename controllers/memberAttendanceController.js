const MemberAttendance = require('../models/memberAttendanceModel');

// Get all members
exports.getAllMembers = async (req, res) => {
    try {
        const members = await MemberAttendance.find();
        res.status(200).json(members);
    } catch (err) {
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
