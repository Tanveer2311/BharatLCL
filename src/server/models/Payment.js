const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['booked', 'picked_up', 'in_transit', 'at_port', 'delivered'],
    required: true
  },
  percentage: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'locked', 'released'],
    default: 'pending'
  },
  releasedAt: Date,
  triggerCondition: String
});

const paymentSchema = new mongoose.Schema({
  shipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    required: true,
    unique: true
  },
  exporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  milestones: [milestoneSchema],
  currentMilestone: {
    type: String,
    enum: ['booked', 'picked_up', 'in_transit', 'at_port', 'delivered'],
    default: 'booked'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: {
    type: String,
    enum: ['initiated', 'partially_released', 'fully_released', 'refunded'],
    default: 'initiated'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
