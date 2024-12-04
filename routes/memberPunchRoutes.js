const express = require('express');
const router = express.Router();
const memberPunchController = require('../controllers/memberPunchController');

router.get('/:attendanceId', memberPunchController.getPunchesByAttendanceId);
router.post('/:attendanceId', memberPunchController.createPunch);
router.get('/export/csv', memberPunchController.exportPunchesToCSV); // Export punches to CSV

module.exports = router;
