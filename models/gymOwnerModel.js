const mongoose = require("mongoose");

// MemberPackageRenewal Schema
const memberPackageRenewalSchema = new mongoose.Schema({
  joiningPackageDate: Number,
  memberId: String,
  modeOfPayment: String,
  package: String,
  packageId: String,
  packagePrice: String,
});

// Member Schema
const memberSchema = new mongoose.Schema({
  aadharCardNo: String,
  actualPackagePrice: Number,
  amountPaid: String,
  birthMonthDate: Number,
  currentAddress: String,
  currentPackageId: String,
  dateOfBirth: Number,
  drivingLicence: String,
  dueDate: String,
  email: String,
  firstName: String,
  fullName: String,
  gender: String,
  gstNumber: String,
  joiningPackageDate: Number,
  lastName: String,
  martialStatus: String,
  memberId: String,
  mobileNumber: String,
  modeOfPayment: String,
  package: String,
  packageDescription: String,
  packageId: String,
  packageMonth: String,
  packagePrice: String,
  panNo: String,
  paymentDate: Number,
  permanentAddress: String,
  photo: String,
  recentPaidDate: Number,
  remainingAmount: Number,
  remark: String,
  renewalDate: String,
  thumbId: String,
  status: Boolean,
});

// Package Schema
const packageSchema = new mongoose.Schema({
  description: String,
  month: String,
  packageName: String,
  price: String,
});

// DietPlans Schema
const dietPlanSchema = new mongoose.Schema({
  dietName: String,
  pdf: String,
  videoLink: String,
});

// ExercisePlans Schema
const exercisePlanSchema = new mongoose.Schema({
  exerciseName: String,
  pdf: String,
  videoLink: String,
});

// ContactUs Schema
const contactUsSchema = new mongoose.Schema({
  email: String,
  enquiry: String,
  fullName: String,
});

// GymStaff Schema
const gymStaffSchema = new mongoose.Schema({
  address: String,
  email: String,
  firstName: String,
  fullName: String,
  joiningDate: String,
  lastName: String,
  mobileNumber: String,
  password: String,
  photo: String,
  salary: String,
  status: String,
  thumbId: String,
  type: String,
});

// Reviews Schema
const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  review: String,
  timestamp: Date,
});

// Main GymOwner Schema
const gymOwnerSchema = new mongoose.Schema({
  ownerId: { type: String, required: true },
  MemberPackageRenewal: [memberPackageRenewalSchema],
  Members: [memberSchema],
  Packages: [packageSchema],
  DietPlans: [dietPlanSchema],
  ExercisePlans: [exercisePlanSchema],
  ContactUs: [contactUsSchema],
  GymStaff: [gymStaffSchema],
  Reviews: [reviewSchema],
});

const GymOwner = mongoose.model("GymOwner", gymOwnerSchema);

module.exports = GymOwner;
