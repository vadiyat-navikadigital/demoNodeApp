const mongoose = require('mongoose');

const bmiHistorySchema = new mongoose.Schema({
  age: { type: String, required: true },
  bmi: { type: String, required: true },
  category: { type: String, required: true },
  dateCreated: { type: String, required: true },
  gender: { type: String, required: true },
  height: { type: String, required: true },
  lowerRange: { type: String, required: true },
  upperRange: { type: String, required: true },
  weight: { type: String, required: true },
});

const bmiSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  memberName: { type: String, required: true },
  memberUserId: { type: String, required: true },
  history: [bmiHistorySchema],
});

const BMI = mongoose.model('BMI', bmiSchema);

module.exports = BMI;
