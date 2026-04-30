const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  exporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  containerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Container',
    required: true
  },
  bookingId: {
    type: String,
    unique: true,
    default: () => 'BL' + Date.now().toString(36).toUpperCase()
  },
  cargo: {
    description: { type: String, required: true },
    type: { type: String, default: 'general' },
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    cbm: { type: Number, required: true },
    quantity: { type: Number, default: 1 }
  },
  status: {
    type: String,
    enum: ['booked', 'picked_up', 'in_transit', 'at_port', 'delivered', 'cancelled'],
    default: 'booked'
  },
  tracking: {
    currentLat: Number,
    currentLng: Number,
    lastUpdated: Date,
    eta: Date
  },
  trackingHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: { lat: Number, lng: Number },
    notes: String
  }],
  origin: { type: String, default: 'Jaipur' },
  destination: { type: String, default: 'Mundra' },
  departureDate: Date,
  estimatedDelivery: Date
}, { timestamps: true });

shipmentSchema.index({ exporterId: 1, status: 1 });
shipmentSchema.index({ transporterId: 1, status: 1 });

module.exports = mongoose.model('Shipment', shipmentSchema);
