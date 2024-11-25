const MemberPunch = require('../models/memberPunchModel');

// Get all punches for a specific memberAttendanceId
exports.getPunchesByAttendanceId = async (req, res) => {
    try {
        const punches = await MemberPunch.find({ memberAttendanceId: req.params.attendanceId });
        res.status(200).json(punches);
    } catch (err) {
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
