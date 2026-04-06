/**
 * Tracking Service — Real-Time Shipment Tracking
 * 
 * Provides GPS-based shipment tracking with milestone
 * notifications and ETA calculations.
 * 
 * @module core/trackingService
 * @owner Member 2
 */

/**
 * Shipment status transitions (valid state machine)
 */
const STATUS_TRANSITIONS = {
  booked: ['picked_up', 'cancelled'],
  picked_up: ['in_transit', 'cancelled'],
  in_transit: ['at_port', 'cancelled'],
  at_port: ['delivered'],
  delivered: [],       // Terminal state
  cancelled: []        // Terminal state
};

/**
 * Route waypoints for Jaipur-Mundra corridor
 * Used for ETA calculation and progress tracking
 */
const JAIPUR_MUNDRA_ROUTE = {
  totalDistanceKm: 680,
  estimatedHours: 14,
  waypoints: [
    { name: 'Jaipur ICD', km: 0, lat: 26.9124, lng: 75.7873 },
    { name: 'Ajmer Bypass', km: 135, lat: 26.4499, lng: 74.6399 },
    { name: 'Pali Junction', km: 240, lat: 25.7711, lng: 73.3234 },
    { name: 'Barmer Toll', km: 400, lat: 25.7521, lng: 71.3967 },
    { name: 'Bhuj Checkpoint', km: 560, lat: 23.2420, lng: 69.6669 },
    { name: 'Mundra Port Gate', km: 650, lat: 22.8394, lng: 69.7253 },
    { name: 'Mundra Port Terminal', km: 680, lat: 22.7396, lng: 69.7196 }
  ]
};

/**
 * Validates that a status transition is allowed
 * 
 * @param {string} currentStatus - Current shipment status
 * @param {string} newStatus - Proposed new status
 * @returns {boolean} Whether the transition is valid
 * @throws {Error} If the transition is invalid
 */
function validateStatusTransition(currentStatus, newStatus) {
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
  
  if (!allowedTransitions) {
    throw new Error(`Unknown current status: '${currentStatus}'`);
  }
  
  if (allowedTransitions.length === 0) {
    throw new Error(`Shipment is in terminal state '${currentStatus}' — no further transitions allowed`);
  }
  
  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Invalid transition: '${currentStatus}' → '${newStatus}'. Allowed: ${allowedTransitions.join(', ')}`
    );
  }
  
  return true;
}

/**
 * Calculates ETA based on current location and route data
 * 
 * @param {Object} currentLocation - { lat, lng }
 * @param {string} destination - Destination identifier
 * @returns {Object} ETA details
 */
function calculateETA(currentLocation, destination = 'Mundra Port Terminal') {
  if (!currentLocation || !currentLocation.lat || !currentLocation.lng) {
    return { eta: null, confidence: 'low', message: 'Location data unavailable' };
  }
  
  // Find nearest waypoint to current location
  let nearestWaypoint = JAIPUR_MUNDRA_ROUTE.waypoints[0];
  let minDistance = Infinity;
  
  for (const waypoint of JAIPUR_MUNDRA_ROUTE.waypoints) {
    const distance = haversineDistance(
      currentLocation.lat, currentLocation.lng,
      waypoint.lat, waypoint.lng
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestWaypoint = waypoint;
    }
  }
  
  // Calculate remaining distance
  const remainingKm = JAIPUR_MUNDRA_ROUTE.totalDistanceKm - nearestWaypoint.km;
  
  // Average speed assumptions
  const averageSpeedKmh = 50; // Indian highway average for trucks
  const remainingHours = remainingKm / averageSpeedKmh;
  
  // Calculate ETA
  const eta = new Date(Date.now() + remainingHours * 60 * 60 * 1000);
  
  // Confidence based on distance from nearest waypoint
  let confidence = 'high';
  if (minDistance > 50) confidence = 'medium';
  if (minDistance > 100) confidence = 'low';
  
  return {
    eta: eta.toISOString(),
    remainingKm: Math.round(remainingKm),
    remainingHours: parseFloat(remainingHours.toFixed(1)),
    nearestWaypoint: nearestWaypoint.name,
    progressPercentage: Math.round((nearestWaypoint.km / JAIPUR_MUNDRA_ROUTE.totalDistanceKm) * 100),
    confidence
  };
}

/**
 * Calculates the Haversine distance between two GPS coordinates
 * 
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts degrees to radians
 * 
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Generates a tracking update event
 * 
 * @param {string} shipmentId - Shipment identifier
 * @param {Object} location - { lat, lng }
 * @param {string} status - Current status
 * @returns {Object} Tracking update event
 */
function createTrackingUpdate(shipmentId, location, status) {
  const eta = calculateETA(location);
  
  return {
    shipmentId,
    location: {
      lat: location.lat,
      lng: location.lng,
      timestamp: new Date().toISOString()
    },
    status,
    eta: eta.eta,
    progressPercentage: eta.progressPercentage,
    nearestWaypoint: eta.nearestWaypoint,
    remainingKm: eta.remainingKm,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Determines milestone notification message
 * 
 * @param {string} milestone - Milestone name
 * @param {string} bookingId - Booking ID for reference
 * @returns {Object} Notification content
 */
function getMilestoneNotification(milestone, bookingId) {
  const notifications = {
    booked: {
      title: 'Booking Confirmed',
      message: `Your shipment ${bookingId} has been booked successfully. Your cargo will be picked up as per schedule.`,
      smsText: `BharatLCL: Booking ${bookingId} confirmed. Pickup scheduled soon.`
    },
    picked_up: {
      title: 'Cargo Picked Up',
      message: `Your cargo for shipment ${bookingId} has been picked up and is being loaded for transport.`,
      smsText: `BharatLCL: Cargo picked up for ${bookingId}. In-transit updates coming soon.`
    },
    in_transit: {
      title: 'Shipment In Transit',
      message: `Shipment ${bookingId} is now in transit on the Jaipur-Mundra corridor. Track live on your dashboard.`,
      smsText: `BharatLCL: ${bookingId} is now in transit. Track at bharatlcl.vercel.app`
    },
    at_port: {
      title: 'Arrived at Port',
      message: `Great news! Shipment ${bookingId} has arrived at Mundra Port. Customs processing will begin shortly.`,
      smsText: `BharatLCL: ${bookingId} arrived at Mundra Port. Delivery update coming soon.`
    },
    delivered: {
      title: 'Delivery Complete',
      message: `Shipment ${bookingId} has been successfully delivered. Payment has been finalized. Thank you for using BharatLCL!`,
      smsText: `BharatLCL: ${bookingId} delivered! Payment finalized. Thank you!`
    }
  };
  
  return notifications[milestone] || {
    title: 'Shipment Update',
    message: `Status update for shipment ${bookingId}: ${milestone}`,
    smsText: `BharatLCL: ${bookingId} status: ${milestone}`
  };
}

module.exports = {
  validateStatusTransition,
  calculateETA,
  haversineDistance,
  createTrackingUpdate,
  getMilestoneNotification,
  STATUS_TRANSITIONS,
  JAIPUR_MUNDRA_ROUTE
};
