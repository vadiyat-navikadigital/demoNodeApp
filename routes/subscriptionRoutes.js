const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

router.post('/', subscriptionController.createSubscription); // Create a subscription
router.get('/', subscriptionController.getAllSubscriptions); // Get all subscriptions
router.get('/:id', subscriptionController.getSubscriptionById); // Get a subscription by ID
router.put('/:id', subscriptionController.updateSubscription); // Update a subscription by ID
router.delete('/:id', subscriptionController.deleteSubscription); // Delete a subscription by ID
router.get("/export/csv", subscriptionController.exportSubscriptionsToCSV); // Export subscriptions to CSV

module.exports = router;
