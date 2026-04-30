/**
 * Payment Routes — Escrow Management (Full DB Implementation)
 * @module server/routes/payments
 */
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/payments
 * @desc    Get payment history for current user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'exporter') query.exporterId = req.user.userId;
    else if (req.user.role === 'transporter') query.transporterId = req.user.userId;

    const payments = await Payment.find(query)
      .populate('shipmentId', 'bookingId status origin destination cargo')
      .populate('exporterId', 'name businessName')
      .populate('transporterId', 'name businessName')
      .sort({ createdAt: -1 });

    const totalPaid = payments.reduce((sum, p) => {
      const released = p.milestones.filter(m => m.status === 'released').reduce((s, m) => s + m.amount, 0);
      return sum + released;
    }, 0);

    res.json({ success: true, data: { payments, totalPaid, total: payments.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * @route   GET /api/payments/:id
 * @desc    Get single payment escrow status
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('shipmentId', 'bookingId status')
      .populate('exporterId', 'name')
      .populate('transporterId', 'name businessName');
    if (!payment) return res.status(404).json({ success: false, error: { message: 'Payment record not found' } });
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * @route   GET /api/payments/shipment/:shipmentId
 * @desc    Get payment by shipment ID
 * @access  Private
 */
router.get('/shipment/:shipmentId', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({ shipmentId: req.params.shipmentId });
    if (!payment) return res.status(404).json({ success: false, error: { message: 'No payment found for this shipment' } });
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
