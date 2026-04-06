/**
 * Verification Routes — ULIP Integration
 * @module server/routes/verification
 */
const express = require('express');
const router = express.Router();
const { verifyTransporter } = require('../../core/ulipVerification');

router.post('/vehicle', async (req, res) => {
  try {
    const { transporterId, vehicleNumber } = req.body;
    if (!transporterId || !vehicleNumber) {
      return res.status(400).json({ success: false, error: { message: 'transporterId and vehicleNumber required' } });
    }
    const result = await verifyTransporter(transporterId, vehicleNumber);
    res.json({ success: true, data: result, message: 'Verification complete' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/transporter/:id', async (req, res) => {
  res.json({ success: true, data: { transporterId: req.params.id, message: 'Connect DB for cached verification' } });
});

module.exports = router;
