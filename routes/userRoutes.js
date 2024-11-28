const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserByUID,
  updateUser,
  deleteUser,
  exportUsersToCSV,
} = require('../controllers/userController');

router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/:uid', getUserByUID);
router.put('/users/:uid', updateUser);
router.delete('/users/:uid', deleteUser);
// Export users to CSV
router.get('/users/export/csv', exportUsersToCSV);

module.exports = router;
