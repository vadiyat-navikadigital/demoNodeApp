const express = require('express');
const router = express.Router();
const memberPunchController = require('../controllers/memberPunchController');

router.get('/:attendanceId', memberPunchController.getPunchesByAttendanceId);
router.post('/:attendanceId', memberPunchController.createPunch);

module.exports = router;
