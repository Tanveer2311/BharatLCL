/**
 * Shipment Routes
 * @module server/routes/shipments
 */
const express = require('express');
const router = express.Router();
const { validateStatusTransition, createTrackingUpdate } = require('../../core/trackingService');

router.get('/', async (req, res) => {
  res.json({ success: true, data: { shipments: [], total: 0 }, message: 'Shipments list' });
});

router.get('/:id', async (req, res) => {
  res.json({ success: true, data: { shipmentId: req.params.id, message: 'Connect DB for shipment details' } });
});

router.get('/:id/tracking', async (req, res) => {
  try {
    const update = createTrackingUpdate(req.params.id, { lat: 25.77, lng: 73.32 }, 'in_transit');
    res.json({ success: true, data: update });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    res.json({ success: true, data: { shipmentId: req.params.id, status }, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
