const mongoose = require('mongoose');

const containerSchema = new mongoose.Schema({
  transporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleNumber: { type: String, trim: true },
  totalCBM: { type: Number, required: true, min: 1 },
  availableCBM: { type: Number, required: true },
  pricePerCBM: { type: Number, required: true, min: 1 },
  origin: { type: String, required: true, trim: true, default: 'Jaipur' },
  destination: { type: String, required: true, trim: true, default: 'Mundra' },
  departureDate: { type: Date, required: true },
  estimatedArrival: { type: Date },
  cargoTypes: [{ type: String }],
  status: {
    type: String,
    enum: ['available', 'partial', 'full', 'departed', 'arrived'],
    default: 'available'
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'verified', 'rejected'],
    default: 'unverified'
  },
  verificationScore: { type: Number, default: 0 }
}, { timestamps: true });

containerSchema.index({ origin: 1, destination: 1, departureDate: 1, status: 1 });

module.exports = mongoose.model('Container', containerSchema);
