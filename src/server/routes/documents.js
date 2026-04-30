/**
 * Document Routes — Auto-generation of Shipping Bills, Packing Lists, Invoices
 * @module server/routes/documents
 */
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Shipment = require('../models/Shipment');

/**
 * @route   POST /api/documents/generate
 * @desc    Generate a shipping document for a given shipment
 * @access  Private (Exporter / Admin)
 */
router.post('/generate', protect, authorize('exporter', 'admin'), async (req, res) => {
  try {
    const { shipmentId, type } = req.body;
    const validTypes = ['shipping_bill', 'packing_list', 'commercial_invoice'];
    if (!shipmentId || !type) {
      return res.status(400).json({ success: false, error: { message: 'shipmentId and type are required' } });
    }
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: { message: `Invalid type. Must be one of: ${validTypes.join(', ')}` } });
    }

    const shipment = await Shipment.findById(shipmentId)
      .populate('exporterId', 'name businessName gstNumber mobileNumber email')
      .populate('transporterId', 'name businessName mobileNumber')
      .populate('containerId', 'vehicleNumber pricePerCBM');

    if (!shipment) return res.status(404).json({ success: false, error: { message: 'Shipment not found' } });

    // Access control
    if (req.user.role !== 'admin' && shipment.exporterId._id.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    // Build document content (in production this would generate a PDF via pdfmake/puppeteer)
    const docContent = {
      type,
      generatedAt: new Date().toISOString(),
      shipmentId: shipment._id,
      bookingId: shipment.bookingId,
      exporter: { name: shipment.exporterId?.name, business: shipment.exporterId?.businessName, gst: shipment.exporterId?.gstNumber },
      transporter: { name: shipment.transporterId?.name, business: shipment.transporterId?.businessName },
      cargo: shipment.cargo,
      route: { origin: shipment.origin, destination: shipment.destination, departureDate: shipment.departureDate },
      vehicle: shipment.containerId?.vehicleNumber,
    };

    if (type === 'commercial_invoice') {
      docContent.invoiceDetails = {
        amount: shipment.cargo.cbm * (shipment.containerId?.pricePerCBM || 2000),
        currency: 'INR',
        terms: 'FOB Mundra Port, India'
      };
    }

    res.json({
      success: true,
      data: { document: docContent, message: `${type.replace('_', ' ')} generated successfully` },
      message: 'Document generated. In production, this returns a PDF download URL.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

/**
 * @route   GET /api/documents
 * @desc    List generated documents for the user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    // In production, this would query a Document model
    // For now, return linked shipments
    res.json({ success: true, data: { documents: [] }, message: 'Document list endpoint ready' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
