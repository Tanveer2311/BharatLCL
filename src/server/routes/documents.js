/**
 * Document Routes
 * @module server/routes/documents
 */
const express = require('express');
const router = express.Router();
const { generateDocument, DOCUMENT_TYPES } = require('../../core/documentGenerator');

router.post('/generate', async (req, res) => {
  try {
    const { shipmentId, documentType } = req.body;
    if (!shipmentId || !documentType) {
      return res.status(400).json({ success: false, error: { message: 'shipmentId and documentType are required' } });
    }
    res.status(201).json({ success: true, data: { shipmentId, documentType, status: 'generated' }, message: 'Document generated' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/shipment/:id', async (req, res) => {
  res.json({ success: true, data: { documents: [], shipmentId: req.params.id } });
});

router.get('/:id/download', async (req, res) => {
  res.json({ success: true, data: { documentId: req.params.id, message: 'Download endpoint ready' } });
});

module.exports = router;
