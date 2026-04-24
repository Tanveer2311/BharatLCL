/**
 * Capacity Routes — LCL Slot Discovery & Booking (Full DB Implementation)
 * @module server/routes/capacity
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Container = require('../models/Container');
const Shipment = require('../models/Shipment');
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/capacity/slots
 * @desc    Get available LCL slots with filters
 * @access  Private
 */
router.get('/slots', protect, async (req, res) => {
  try {
    const { origin, destination, date, minCBM, maxPrice, cargoType } = req.query;

    const query = { status: { $in: ['available', 'partial'] } };
    if (origin) query.origin = new RegExp(origin, 'i');
    if (destination) query.destination = new RegExp(destination, 'i');
    if (minCBM) query.availableCBM = { $gte: parseFloat(minCBM) };
    if (maxPrice) query.pricePerCBM = { $lte: parseFloat(maxPrice) };
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(next.getDate() + 7);
      query.departureDate = { $gte: d, $lte: next };
    }
    if (cargoType) query.cargoTypes = { $in: [cargoType] };

    const slots = await Container.find(query)
      .populate('transporterId', 'name businessName mobileNumber')
      .sort({ departureDate: 1 })
      .limit(50);

    res.json({
      success: true,
      data: { slots, total: slots.length },
      message: 'Available capacity slots retrieved'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

/**
 * @route   POST /api/capacity/slots
 * @desc    Add new container capacity (Transporter only)
 * @access  Private (Transporter)
 */
router.post('/slots', protect, authorize('transporter', 'admin'), async (req, res) => {
  try {
    const {
      totalCBM, pricePerCBM, departureDate, estimatedArrival,
      origin, destination, cargoTypes, vehicleNumber
    } = req.body;

    if (!totalCBM || !pricePerCBM || !departureDate) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'totalCBM, pricePerCBM, and departureDate are required' }
      });
    }

    const container = await Container.create({
      transporterId: req.user.userId,
      totalCBM,
      availableCBM: totalCBM,
      pricePerCBM,
      departureDate,
      estimatedArrival,
      origin: origin || 'Jaipur',
      destination: destination || 'Mundra',
      cargoTypes: cargoTypes || ['general'],
      vehicleNumber
    });

    res.status(201).json({
      success: true,
      data: container,
      message: 'Capacity listed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

/**
 * @route   POST /api/capacity/book
 * @desc    Book an LCL slot (creates Shipment + initiates Payment escrow)
 * @access  Private (Exporter only)
 */
router.post('/book', protect, authorize('exporter', 'admin'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { containerId, cargo } = req.body;
    const { description, type, length, width, height, weight, quantity } = cargo || {};

    if (!containerId || !description || !length || !width || !height || !weight) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'containerId and full cargo details are required' }
      });
    }

    const cbm = (length * width * height) / 1000000; // Convert cm³ → m³

    const container = await Container.findById(containerId).session(session);
    if (!container) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, error: { message: 'Container slot not found' } });
    }
    if (container.availableCBM < cbm) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: { message: `Insufficient space. Available: ${container.availableCBM} CBM, Requested: ${cbm.toFixed(2)} CBM` } });
    }

    // Reserve space
    container.availableCBM -= cbm;
    container.status = container.availableCBM <= 0 ? 'full' : 'partial';
    await container.save({ session });

    const totalAmount = cbm * container.pricePerCBM;

    // Create Shipment
    const [shipment] = await Shipment.create([{
      exporterId: req.user.userId,
      transporterId: container.transporterId,
      containerId: container._id,
      cargo: { description, type: type || 'general', length, width, height, weight, cbm: parseFloat(cbm.toFixed(4)), quantity: quantity || 1 },
      origin: container.origin,
      destination: container.destination,
      departureDate: container.departureDate,
      estimatedDelivery: container.estimatedArrival,
      trackingHistory: [{ status: 'booked', notes: 'Booking confirmed' }]
    }], { session });

    // Initialize Escrow Payment with 5 milestones
    const milestones = [
      { name: 'booked', percentage: 10, amount: totalAmount * 0.10, status: 'released', releasedAt: new Date(), triggerCondition: 'Booking confirmation' },
      { name: 'picked_up', percentage: 20, amount: totalAmount * 0.20, status: 'pending', triggerCondition: 'GPS lock at exporter address' },
      { name: 'in_transit', percentage: 20, amount: totalAmount * 0.20, status: 'pending', triggerCondition: 'FASTag toll checkpoint hit' },
      { name: 'at_port', percentage: 25, amount: totalAmount * 0.25, status: 'pending', triggerCondition: 'Destination GPS lock' },
      { name: 'delivered', percentage: 25, amount: totalAmount * 0.25, status: 'pending', triggerCondition: 'Recipient proof of delivery' }
    ];

    const [payment] = await Payment.create([{
      shipmentId: shipment._id,
      exporterId: req.user.userId,
      transporterId: container.transporterId,
      totalAmount,
      milestones,
      currentMilestone: 'booked'
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: { shipment, payment: { id: payment._id, totalAmount, milestones, status: payment.status } },
      message: `Booking confirmed! ${cbm.toFixed(2)} CBM reserved on ${container.departureDate.toDateString()}`
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  } finally {
    session.endSession();
  }
});

/**
 * @route   GET /api/capacity/my-listings
 * @desc    Get transporter's own container listings
 * @access  Private (Transporter)
 */
router.get('/my-listings', protect, authorize('transporter', 'admin'), async (req, res) => {
  try {
    const containers = await Container.find({ transporterId: req.user.userId }).sort({ departureDate: -1 });
    res.json({ success: true, data: { containers, total: containers.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

module.exports = router;
