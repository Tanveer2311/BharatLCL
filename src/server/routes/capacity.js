/**
 * Capacity Routes — LCL Slot Discovery & Booking
 * @module server/routes/capacity
 */
const express = require('express');
const router = express.Router();
const { buildSearchQuery, calculatePrice, validateCapacity, generateBookingId } = require('../../core/capacityEngine');

/**
 * @route   GET /api/capacity/slots
 * @desc    Get available LCL slots with optional filters
 * @access  Private
 */
router.get('/slots', async (req, res) => {
  try {
    const filters = {
      origin: req.query.origin,
      destination: req.query.destination,
      cargoType: req.query.cargoType,
      requiredCBM: req.query.minCBM ? parseFloat(req.query.minCBM) : undefined,
      preferredDate: req.query.date,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined
    };

    const query = buildSearchQuery(filters);

    // const containers = await Container.find(query).populate('transporterId', 'businessName').sort({ departureDate: 1 });
    
    // Sample response for demonstration
    res.json({
      success: true,
      data: {
        slots: [],
        total: 0,
        page: 1,
        hasMore: false,
        filters: query
      },
      message: 'Available capacity slots retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

/**
 * @route   POST /api/capacity/book
 * @desc    Book an LCL slot
 * @access  Private (Exporter only)
 */
router.post('/book', async (req, res) => {
  try {
    const { containerId, cargoDimensions, cargoWeight, cargoType, cargoDescription, quantity } = req.body;

    if (!containerId || !cargoDimensions || !cargoWeight) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'containerId, cargoDimensions, and cargoWeight are required' }
      });
    }

    const bookingId = generateBookingId();
    const price = calculatePrice(cargoDimensions.length * cargoDimensions.width * cargoDimensions.height, 2000);

    res.status(201).json({
      success: true,
      data: {
        shipment: { bookingId, status: 'booked', price },
        payment: { status: 'initiated', totalAmount: price.totalCost }
      },
      message: 'Booking confirmed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

/**
 * @route   POST /api/capacity/slots
 * @desc    Add new container capacity (Transporter only)
 * @access  Private (Transporter)
 */
router.post('/slots', async (req, res) => {
  try {
    const { totalCBM, pricePerCBM, departureDate, origin, destination, cargoTypes, vehicleNumber } = req.body;

    if (!totalCBM || !pricePerCBM || !departureDate) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'totalCBM, pricePerCBM, and departureDate are required' }
      });
    }

    res.status(201).json({
      success: true,
      data: { totalCBM, availableCBM: totalCBM, pricePerCBM, departureDate, status: 'available' },
      message: 'Capacity listed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

module.exports = router;
