/**
 * Shipment Routes — Full DB Implementation with Tracking
 * @module server/routes/shipments
 */
const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const Payment = require('../models/Payment');
const Container = require('../models/Container');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/shipments
 * @desc    Get all shipments for the current user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'exporter') query.exporterId = req.user.userId;
    else if (req.user.role === 'transporter') query.transporterId = req.user.userId;

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [shipments, total] = await Promise.all([
      Shipment.find(query)
        .populate('exporterId', 'name businessName')
        .populate('transporterId', 'name businessName mobileNumber')
        .populate('containerId', 'vehicleNumber pricePerCBM')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Shipment.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: { shipments, total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * @route   GET /api/shipments/:id
 * @desc    Get single shipment with full details
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('exporterId', 'name businessName email mobileNumber')
      .populate('transporterId', 'name businessName mobileNumber')
      .populate('containerId', 'vehicleNumber pricePerCBM totalCBM origin destination');

    if (!shipment) return res.status(404).json({ success: false, error: { message: 'Shipment not found' } });

    // Access control
    const userId = req.user.userId.toString();
    if (req.user.role !== 'admin' &&
        shipment.exporterId._id.toString() !== userId &&
        shipment.transporterId._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    const payment = await Payment.findOne({ shipmentId: shipment._id });

    res.json({ success: true, data: { shipment, payment } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * @route   GET /api/shipments/:id/tracking
 * @desc    Get live tracking data for a shipment
 * @access  Private
 */
router.get('/:id/tracking', protect, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id).select('tracking trackingHistory status bookingId');
    if (!shipment) return res.status(404).json({ success: false, error: { message: 'Shipment not found' } });
    res.json({ success: true, data: { tracking: shipment.tracking, history: shipment.trackingHistory, status: shipment.status, bookingId: shipment.bookingId } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * @route   PUT /api/shipments/:id/status
 * @desc    Update shipment status (triggers milestone payment release)
 * @access  Private (Transporter or Admin)
 */
router.put('/:id/status', protect, authorize('transporter', 'admin'), async (req, res) => {
  try {
    const { status, lat, lng, notes } = req.body;
    const validStatuses = ['picked_up', 'in_transit', 'at_port', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` } });
    }

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, error: { message: 'Shipment not found' } });

    // Validate status transition order
    const order = ['booked', 'picked_up', 'in_transit', 'at_port', 'delivered'];
    const currentIdx = order.indexOf(shipment.status);
    const newIdx = order.indexOf(status);
    if (newIdx !== currentIdx + 1) {
      return res.status(400).json({ success: false, error: { message: `Invalid status transition from ${shipment.status} to ${status}` } });
    }

    shipment.status = status;
    if (lat && lng) {
      shipment.tracking = { currentLat: lat, currentLng: lng, lastUpdated: new Date() };
    }
    shipment.trackingHistory.push({ status, timestamp: new Date(), location: { lat, lng }, notes: notes || `Status updated to ${status}` });
    await shipment.save();

    // Release corresponding payment milestone
    const payment = await Payment.findOne({ shipmentId: shipment._id });
    if (payment) {
      const milestone = payment.milestones.find(m => m.name === status);
      if (milestone && milestone.status === 'pending') {
        milestone.status = 'released';
        milestone.releasedAt = new Date();
        payment.currentMilestone = status;
        const allReleased = payment.milestones.every(m => m.status === 'released');
        if (allReleased) payment.status = 'fully_released';
        else payment.status = 'partially_released';
        await payment.save();
      }
    }

    res.json({ success: true, data: { shipment, payment }, message: `Status updated to ${status}. Payment milestone released.` });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
