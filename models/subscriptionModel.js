const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  cost: { type: Number, required: true },
  plan: { type: String },
  userId: { type: String },
  orders: {
    amount: { type: Number, required: true },
    amount_due: { type: Number, required: true },
    amount_paid: { type: Number, required: true },
    attempts: { type: Number, default: 0 },
    created_at: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    entity: { type: String, default: 'order' },
    id: { type: String, required: true },
    notes: { type: Array, default: [] },
    status: { type: String, default: 'created' },
  },
  paymentSuccess: {
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
