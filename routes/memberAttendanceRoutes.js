const express = require('express');
const router = express.Router();
const memberAttendanceController = require('../controllers/memberAttendanceController');

router.get('/', memberAttendanceController.getAllMembers);
router.get('/:id', memberAttendanceController.getMemberById);
router.post('/', memberAttendanceController.createMember);
router.put('/:id', memberAttendanceController.updateMember);
router.delete('/:id', memberAttendanceController.deleteMember);
router.get('/export/csv', memberAttendanceController.exportMemberAttendanceToCSV); // Export to CSV


module.exports = router;
