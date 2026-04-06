/**
 * Capacity Engine — Real-Time LCL Slot Matching Algorithm
 * 
 * Core business logic for matching exporter cargo requirements
 * with available container capacity on the Jaipur-Mundra corridor.
 * 
 * @module core/capacityEngine
 * @owner Member 2
 */

/**
 * Relevance score weights for slot ranking
 */
const SCORE_WEIGHTS = {
  price: 0.35,
  date: 0.30,
  capacity: 0.20,
  verification: 0.15
};

/**
 * Platform fee percentage (3-5% based on subscription tier)
 */
const PLATFORM_FEES = {
  aaram: 0.05,  // 5% for free tier
  tez: 0.03     // 3% for premium tier
};

/**
 * Maximum date flexibility in days
 */
const DATE_RANGE_DAYS = 3;

/**
 * Maximum results per page
 */
const MAX_RESULTS_PER_PAGE = 20;

/**
 * Calculates the relevance score for a container match
 * 
 * @param {Object} container - Available container data
 * @param {Object} criteria - Search criteria from exporter
 * @returns {number} Score between 0-100
 */
function calculateRelevanceScore(container, criteria) {
  // Price score: lower price = higher score
  const maxPrice = 5000; // INR per CBM baseline
  const priceScore = Math.max(0, (1 - container.pricePerCBM / maxPrice)) * 100;
  
  // Date proximity score
  const preferredDate = new Date(criteria.preferredDate);
  const departureDate = new Date(container.departureDate);
  const daysDiff = Math.abs((departureDate - preferredDate) / (1000 * 60 * 60 * 24));
  const dateScore = Math.max(0, (1 - daysDiff / DATE_RANGE_DAYS)) * 100;
  
  // Capacity fit score: closer to exact fit = higher score (avoid waste)
  const capacityRatio = criteria.requiredCBM / container.availableCBM;
  const capacityScore = capacityRatio <= 1 ? capacityRatio * 100 : 0;
  
  // Verification score (from transporter's ULIP verification)
  const verificationScore = container.transporterVerificationScore || 50;
  
  return (
    SCORE_WEIGHTS.price * priceScore +
    SCORE_WEIGHTS.date * dateScore +
    SCORE_WEIGHTS.capacity * capacityScore +
    SCORE_WEIGHTS.verification * verificationScore
  );
}

/**
 * Calculates the total price for a booking
 * 
 * @param {number} requiredCBM - Cargo volume in cubic meters
 * @param {number} pricePerCBM - Price per CBM in INR
 * @param {string} subscriptionTier - User's subscription tier ('aaram' or 'tez')
 * @returns {Object} Price breakdown { baseCost, platformFee, totalCost }
 */
function calculatePrice(requiredCBM, pricePerCBM, subscriptionTier = 'aaram') {
  if (requiredCBM <= 0) {
    throw new Error('CBM must be greater than 0');
  }
  if (pricePerCBM <= 0) {
    throw new Error('Price per CBM must be positive');
  }
  
  const baseCost = requiredCBM * pricePerCBM;
  const feeRate = PLATFORM_FEES[subscriptionTier] || PLATFORM_FEES.aaram;
  const platformFee = Math.round(baseCost * feeRate);
  const totalCost = baseCost + platformFee;
  
  return { baseCost, platformFee, totalCost };
}

/**
 * Calculates cargo volume in CBM from dimensions
 * 
 * @param {Object} dimensions - { length, width, height } in meters
 * @returns {number} Volume in cubic meters
 */
function calculateCBM(dimensions) {
  const { length, width, height } = dimensions;
  
  if (length <= 0 || width <= 0 || height <= 0) {
    throw new Error('All dimensions must be positive numbers');
  }
  
  return parseFloat((length * width * height).toFixed(2));
}

/**
 * Validates that a container has sufficient capacity for booking
 * 
 * @param {Object} container - Container document
 * @param {number} requiredCBM - Required cargo volume
 * @throws {Error} If insufficient capacity
 */
function validateCapacity(container, requiredCBM) {
  if (!container) {
    throw new Error('Container not found');
  }
  
  if (container.status === 'full' || container.status === 'in_transit' || container.status === 'completed') {
    throw new Error(`Container is not available (status: ${container.status})`);
  }
  
  if (container.availableCBM < requiredCBM) {
    throw new Error(
      `Insufficient capacity: requested ${requiredCBM} CBM but only ${container.availableCBM} CBM available`
    );
  }
  
  const departureDate = new Date(container.departureDate);
  if (departureDate <= new Date()) {
    throw new Error('Container departure date has already passed');
  }
}

/**
 * Builds MongoDB query filter from search criteria
 * 
 * @param {Object} filters - Search filters
 * @returns {Object} MongoDB query object
 */
function buildSearchQuery(filters) {
  const query = {};
  
  // Status filter: only available or partially booked
  query.status = { $in: ['available', 'partially_booked'] };
  
  // Future departures only
  query.departureDate = { $gt: new Date() };
  
  // Origin filter
  if (filters.origin) {
    query['origin.city'] = { $regex: new RegExp(filters.origin, 'i') };
  }
  
  // Destination filter
  if (filters.destination) {
    query['destination.port'] = { $regex: new RegExp(filters.destination, 'i') };
  }
  
  // Minimum available CBM
  if (filters.requiredCBM) {
    query.availableCBM = { $gte: filters.requiredCBM };
  }
  
  // Cargo type filter
  if (filters.cargoType) {
    query.cargoTypes = { $in: [filters.cargoType] };
  }
  
  // Date range filter (±3 days of preferred date)
  if (filters.preferredDate) {
    const preferred = new Date(filters.preferredDate);
    const startDate = new Date(preferred);
    startDate.setDate(startDate.getDate() - DATE_RANGE_DAYS);
    const endDate = new Date(preferred);
    endDate.setDate(endDate.getDate() + DATE_RANGE_DAYS);
    
    query.departureDate = {
      ...query.departureDate,
      $gte: startDate,
      $lte: endDate
    };
  }
  
  // Price range filter
  if (filters.minPrice) {
    query.pricePerCBM = { ...query.pricePerCBM, $gte: filters.minPrice };
  }
  if (filters.maxPrice) {
    query.pricePerCBM = { ...query.pricePerCBM, $lte: filters.maxPrice };
  }
  
  return query;
}

/**
 * Generates a unique booking ID
 * 
 * @returns {string} Booking ID in format 'BL-XXXXXX'
 */
function generateBookingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BL-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  calculateRelevanceScore,
  calculatePrice,
  calculateCBM,
  validateCapacity,
  buildSearchQuery,
  generateBookingId,
  SCORE_WEIGHTS,
  PLATFORM_FEES,
  DATE_RANGE_DAYS,
  MAX_RESULTS_PER_PAGE
};
