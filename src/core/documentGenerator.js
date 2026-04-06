/**
 * Document Generator — Automated Shipping Documentation
 * 
 * Auto-generates export shipping documents from booking
 * and profile data for MSME exporters.
 * 
 * Supported document types:
 * - Shipping Bill
 * - Packing List
 * - Commercial Invoice
 * 
 * @module core/documentGenerator
 * @owner Member 1
 */

/**
 * Supported document types
 */
const DOCUMENT_TYPES = {
  SHIPPING_BILL: 'shipping_bill',
  PACKING_LIST: 'packing_list',
  COMMERCIAL_INVOICE: 'commercial_invoice'
};

/**
 * Validates that all required data is present for document generation
 * 
 * @param {Object} shipment - Shipment data
 * @param {Object} exporter - Exporter profile data
 * @param {string} documentType - Type of document to generate
 * @throws {Error} If required data is missing
 */
function validateDocumentData(shipment, exporter, documentType) {
  if (!shipment) throw new Error('Shipment data is required');
  if (!exporter) throw new Error('Exporter profile is required');
  
  const requiredExporterFields = ['name', 'businessName', 'gstNumber', 'address'];
  for (const field of requiredExporterFields) {
    if (!exporter[field]) {
      throw new Error(`Exporter ${field} is required for document generation`);
    }
  }
  
  const requiredShipmentFields = ['bookingId', 'cargo', 'origin', 'destination'];
  for (const field of requiredShipmentFields) {
    if (!shipment[field]) {
      throw new Error(`Shipment ${field} is required for document generation`);
    }
  }
  
  if (documentType === DOCUMENT_TYPES.SHIPPING_BILL && !exporter.iecCode) {
    throw new Error('IEC code is required for Shipping Bill generation');
  }
}

/**
 * Generates a Shipping Bill document
 * 
 * @param {Object} shipment - Shipment data
 * @param {Object} exporter - Exporter profile data
 * @returns {Object} Generated shipping bill data
 */
function generateShippingBill(shipment, exporter) {
  validateDocumentData(shipment, exporter, DOCUMENT_TYPES.SHIPPING_BILL);
  
  return {
    documentType: DOCUMENT_TYPES.SHIPPING_BILL,
    documentNumber: `SB-${shipment.bookingId}-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    
    exporterDetails: {
      name: exporter.businessName,
      iecCode: exporter.iecCode,
      gstin: exporter.gstNumber,
      address: formatAddress(exporter.address),
      contactPerson: exporter.name,
      email: exporter.email,
      mobile: exporter.mobileNumber
    },
    
    consignmentDetails: {
      bookingReference: shipment.bookingId,
      portOfLoading: shipment.destination?.port || 'Mundra Port',
      countryOfDestination: 'As per buyer order',
      modeOfTransport: 'Road + Sea',
      containerType: 'LCL (Less than Container Load)'
    },
    
    cargoDetails: {
      description: shipment.cargo.description,
      type: shipment.cargo.type,
      quantity: shipment.cargo.quantity,
      grossWeight: `${shipment.cargo.weight} kg`,
      volume: `${shipment.cargo.cbm} CBM`,
      dimensions: `${shipment.cargo.dimensions.length}m × ${shipment.cargo.dimensions.width}m × ${shipment.cargo.dimensions.height}m`
    },
    
    valueDetails: {
      fobValue: shipment.price.baseCost,
      currency: 'INR',
      exchangeRate: null // To be filled
    },
    
    declarationText: 'I/We hereby declare that the particulars given above are true and correct and that the value(s) declared is/are the contracted price(s) and I/We undertake to abide by the provisions of the Foreign Trade (Development & Regulation) Act, 1992 as amended from time to time.',
    
    status: 'generated'
  };
}

/**
 * Generates a Packing List document
 * 
 * @param {Object} shipment - Shipment data
 * @param {Object} exporter - Exporter profile data
 * @returns {Object} Generated packing list data
 */
function generatePackingList(shipment, exporter) {
  validateDocumentData(shipment, exporter, DOCUMENT_TYPES.PACKING_LIST);
  
  return {
    documentType: DOCUMENT_TYPES.PACKING_LIST,
    documentNumber: `PL-${shipment.bookingId}-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    
    exporterDetails: {
      name: exporter.businessName,
      gstin: exporter.gstNumber,
      address: formatAddress(exporter.address)
    },
    
    shipmentReference: shipment.bookingId,
    
    packages: [
      {
        packageNumber: 1,
        description: shipment.cargo.description,
        quantity: shipment.cargo.quantity,
        unitOfMeasure: 'pcs',
        length: shipment.cargo.dimensions.length,
        width: shipment.cargo.dimensions.width,
        height: shipment.cargo.dimensions.height,
        grossWeight: shipment.cargo.weight,
        netWeight: Math.round(shipment.cargo.weight * 0.95), // Estimate net weight
        volume: shipment.cargo.cbm,
        packagingType: 'Carton / Bale'
      }
    ],
    
    totals: {
      totalPackages: 1,
      totalGrossWeight: `${shipment.cargo.weight} kg`,
      totalNetWeight: `${Math.round(shipment.cargo.weight * 0.95)} kg`,
      totalVolume: `${shipment.cargo.cbm} CBM`
    },
    
    markingsAndNumbers: `${shipment.bookingId} / ${exporter.businessName.substring(0, 10).toUpperCase()}`,
    
    status: 'generated'
  };
}

/**
 * Generates a Commercial Invoice document
 * 
 * @param {Object} shipment - Shipment data
 * @param {Object} exporter - Exporter profile data
 * @returns {Object} Generated commercial invoice data
 */
function generateCommercialInvoice(shipment, exporter) {
  validateDocumentData(shipment, exporter, DOCUMENT_TYPES.COMMERCIAL_INVOICE);
  
  return {
    documentType: DOCUMENT_TYPES.COMMERCIAL_INVOICE,
    documentNumber: `CI-${shipment.bookingId}-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    invoiceDate: new Date().toISOString().split('T')[0],
    
    exporterDetails: {
      name: exporter.businessName,
      gstin: exporter.gstNumber,
      iecCode: exporter.iecCode || 'N/A',
      address: formatAddress(exporter.address)
    },
    
    buyerDetails: {
      name: 'As per purchase order',
      address: 'As per purchase order',
      country: 'As per purchase order'
    },
    
    shipmentDetails: {
      bookingReference: shipment.bookingId,
      portOfLoading: shipment.destination?.port || 'Mundra Port',
      termsOfDelivery: 'FOB Mundra Port'
    },
    
    lineItems: [
      {
        slNo: 1,
        description: shipment.cargo.description,
        hsCode: getHSCode(shipment.cargo.type),
        quantity: shipment.cargo.quantity,
        unitPrice: Math.round(shipment.price.baseCost / shipment.cargo.quantity),
        totalPrice: shipment.price.baseCost,
        currency: 'INR'
      }
    ],
    
    summary: {
      subtotal: shipment.price.baseCost,
      freightCharges: shipment.price.totalCost - shipment.price.baseCost,
      totalInvoiceValue: shipment.price.totalCost,
      currency: 'INR',
      amountInWords: numberToWords(shipment.price.totalCost)
    },
    
    status: 'generated'
  };
}

/**
 * Helper: Format address object to string
 * 
 * @param {Object} address - Address object
 * @returns {string} Formatted address string
 */
function formatAddress(address) {
  if (typeof address === 'string') return address;
  return [address.street, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(', ');
}

/**
 * Helper: Get HS Code based on cargo type
 * 
 * @param {string} cargoType - Type of cargo
 * @returns {string} HS Code
 */
function getHSCode(cargoType) {
  const hsCodes = {
    textile: '5208.11',
    handicraft: '4602.19',
    stone: '6802.93',
    general: '9999.99'
  };
  return hsCodes[cargoType] || hsCodes.general;
}

/**
 * Helper: Convert number to words (simplified)
 * 
 * @param {number} num - Number to convert
 * @returns {string} Number in words
 */
function numberToWords(num) {
  if (num === 0) return 'Zero Rupees Only';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const numStr = Math.floor(num).toString();
  
  if (num < 20) return `${ones[num]} Rupees Only`;
  if (num < 100) return `${tens[Math.floor(num / 10)]} ${ones[num % 10]} Rupees Only`.trim();
  
  return `INR ${num.toLocaleString('en-IN')} (Rupees ${numStr.length > 4 ? 'Amount' : ones[Math.floor(num / 1000)] + ' Thousand'} Only)`;
}

/**
 * Master document generation function
 * 
 * @param {string} documentType - Type of document to generate
 * @param {Object} shipment - Shipment data
 * @param {Object} exporter - Exporter profile data
 * @returns {Object} Generated document
 */
function generateDocument(documentType, shipment, exporter) {
  switch (documentType) {
    case DOCUMENT_TYPES.SHIPPING_BILL:
      return generateShippingBill(shipment, exporter);
    case DOCUMENT_TYPES.PACKING_LIST:
      return generatePackingList(shipment, exporter);
    case DOCUMENT_TYPES.COMMERCIAL_INVOICE:
      return generateCommercialInvoice(shipment, exporter);
    default:
      throw new Error(`Unsupported document type: '${documentType}'`);
  }
}

module.exports = {
  generateDocument,
  generateShippingBill,
  generatePackingList,
  generateCommercialInvoice,
  validateDocumentData,
  formatAddress,
  getHSCode,
  DOCUMENT_TYPES
};
