const mongoose = require('mongoose');

const MemberAttendanceSchema = new mongoose.Schema({
    amountPaid: String,
    currentAddress: String,
    email: String,
    firstName: String,
    fullName: String,
    gymUniqueId: String,
    id: String,
    joiningPackageDate: Number,
    lastName: String,
    latestPunchDate: Number,
    latestPunchOutTime: Number,
    memberId: String,
    mobileNumber: String,
    modeOfPayment: String,
    package: String,
    packageId: String,
    packagePrice: String,
    paymentDate: Number,
    photo: String,
    remainingAmount: Number,
}, { timestamps: true });

module.exports = mongoose.model('MemberAttendance', MemberAttendanceSchema);
