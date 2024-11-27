const { Parser } = require('json2csv'); // JSON to CSV parser
const Subscription = require('../models/subscriptionModel');

// Create a new subscription
exports.createSubscription = async (req, res) => {
  try {
    const { cost, orders, paymentSuccess, plan, userId } = req.body;

    const newSubscription = new Subscription({
      cost,
      orders,
      paymentSuccess,
      plan,
      userId
    });

    await newSubscription.save();
    res.status(201).json(newSubscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const { userId, plan, paymentStatus, orderId, cost, razorpay_order_id, razorpay_payment_id, razorpay_signature, limit = 10, offset = 0,
      sort = "createdAt:desc",
    } = req.query;

    // Build the search query
    const query = {};

    if (userId) query.userId = userId;
    if (plan) query.plan = new RegExp(plan.trim().replace(/\s+/g, ' '), 'i');
    if (paymentStatus) query['orders.status'] = paymentStatus; // Order payment status
    if (orderId) query['orders.id'] = orderId; // Order ID
    if (cost) query.cost = Number(cost);
    if (razorpay_order_id) query['paymentSuccess.razorpay_order_id'] = razorpay_order_id;
    if (razorpay_payment_id) query['paymentSuccess.razorpay_payment_id'] = razorpay_payment_id;
    if (razorpay_signature) query['paymentSuccess.razorpay_signature'] = razorpay_signature;

    // Parse sorting parameter
    const [sortField, sortOrder] = sort.split(":");
    const sortObj = { [sortField]: sortOrder === "desc" ? -1 : 1 };

    // Fetch subscriptions with pagination and sorting
    const subscriptions = await Subscription.find(query)
      .sort(sortObj)
      .skip(Number(offset))
      .limit(Number(limit));

    // Get total count for pagination metadata
    const totalRecords = await Subscription.countDocuments(query);

    // Respond with data and pagination metadata
    res.status(200).json({
      total: totalRecords,
      limit: Number(limit),
      offset: Number(offset),
      sort: sortObj,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Error retrieving subscriptions:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get a single subscription by ID
exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a subscription by ID
exports.updateSubscription = async (req, res) => {
  try {
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedSubscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json(updatedSubscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a subscription by ID
exports.deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json({ message: 'Subscription deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export subscriptions to CSV
exports.exportSubscriptionsToCSV = async (req, res) => {
  try {
    const { userId, _id } = req.query;

    // Build the query
    const query = {};
    if (userId) query.userId = userId;
    if (_id) query._id = _id;

    // Fetch subscriptions based on the query
    const subscriptions = await Subscription.find(query);

    if (!subscriptions.length) {
      return res.status(404).json({ message: "No subscriptions found for the given criteria." });
    }

    // Use Object.keys to dynamically get all fields
    const sampleRecord = subscriptions[0].toObject();
    const fields = Object.keys(sampleRecord);

    // Convert nested fields (e.g., orders and paymentSuccess) to a flat format
    const flatFields = fields.flatMap((field) => {
      const value = sampleRecord[field];
      return typeof value === 'object' && !Array.isArray(value)
        ? Object.keys(value).map((subField) => `${field}.${subField}`)
        : field;
    });

    // Generate CSV data
    const opts = { fields: flatFields };
    const parser = new Parser(opts);
    const csv = parser.parse(subscriptions.map((record) => record.toObject()));

    // Set headers and send the file
    res.header("Content-Type", "text/csv");
    res.attachment("subscriptions.csv");
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting subscriptions to CSV:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

