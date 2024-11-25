const express = require('express');
const bmiController = require('../controllers/bmiController');

const router = express.Router();

// Create BMI Record
router.post('/bmi-records', bmiController.createBmiRecord);

// Get All BMI Records
router.get('/bmi-records', bmiController.getAllBmiRecords);

// Get BMI Record by Member ID
router.get('/bmi-records/:memberId', bmiController.getBmiRecordById);

// Update BMI Record History
router.put('/bmi-records/:memberId', bmiController.updateBmiRecord);

// Delete BMI Record by Member ID
router.delete('/bmi-records/:memberId', bmiController.deleteBmiRecord);

module.exports = router;
