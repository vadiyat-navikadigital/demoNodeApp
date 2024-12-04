const mongoose = require('mongoose');

const MemberPunchSchema = new mongoose.Schema({
    punchInDate: Number,
    punchOutTime: Number,
    memberAttendanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MemberAttendance',
    },
}, { timestamps: true });

module.exports = mongoose.model('MemberPunch', MemberPunchSchema);
