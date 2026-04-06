/**
 * Escrow Payment Module — Milestone-Based Payment System
 * 
 * Manages escrow payments with milestone-based fund release
 * for secure LCL logistics transactions.
 * 
 * Milestones:
 * 1. Booked (10%) — Booking confirmation fee
 * 2. Picked Up (20%) — Cargo collected from exporter
 * 3. In Transit (20%) — Vehicle on highway
 * 4. At Port (25%) — Arrived at destination port
 * 5. Delivered (25%) — Final delivery confirmed
 * 
 * @module core/escrowPayment
 * @owner Member 1
 */

/**
 * Milestone configuration with sequential order and percentages
 */
const MILESTONES = [
  { name: 'booked', percentage: 10, order: 1, description: 'Booking confirmation' },
  { name: 'picked_up', percentage: 20, order: 2, description: 'Cargo picked up from exporter' },
  { name: 'in_transit', percentage: 20, order: 3, description: 'Vehicle in transit on highway' },
  { name: 'at_port', percentage: 25, order: 4, description: 'Arrived at destination port' },
  { name: 'delivered', percentage: 25, order: 5, description: 'Final delivery confirmed' }
];

/**
 * Valid payment statuses
 */
const PAYMENT_STATUSES = {
  INITIATED: 'initiated',
  IN_ESCROW: 'in_escrow',
  PARTIALLY_RELEASED: 'partially_released',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
  REFUNDED: 'refunded'
};

/**
 * Valid milestone statuses
 */
const MILESTONE_STATUSES = {
  PENDING: 'pending',
  RELEASED: 'released',
  DISPUTED: 'disputed'
};

/**
 * Initializes an escrow payment with all milestones
 * 
 * @param {number} totalAmount - Total payment amount in INR
 * @returns {Object} Initialized payment object with milestones
 * @throws {Error} If totalAmount is invalid
 */
function initializeEscrow(totalAmount) {
  if (!totalAmount || totalAmount <= 0) {
    throw new Error('Total amount must be a positive number');
  }
  
  const milestones = MILESTONES.map(milestone => ({
    name: milestone.name,
    percentage: milestone.percentage,
    amount: Math.round(totalAmount * (milestone.percentage / 100)),
    status: MILESTONE_STATUSES.PENDING,
    releasedAt: null
  }));
  
  // Verify total distribution equals 100%
  const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);
  if (totalPercentage !== 100) {
    throw new Error(`Milestone percentages must total 100%, got ${totalPercentage}%`);
  }
  
  // Adjust rounding differences in the last milestone
  const totalDistributed = milestones.reduce((sum, m) => sum + m.amount, 0);
  if (totalDistributed !== totalAmount) {
    milestones[milestones.length - 1].amount += (totalAmount - totalDistributed);
  }
  
  return {
    totalAmount,
    milestones,
    currentMilestone: null,
    status: PAYMENT_STATUSES.INITIATED
  };
}

/**
 * Gets the order index of a milestone by name
 * 
 * @param {string} milestoneName - Name of the milestone
 * @returns {number} Order index (1-5)
 * @throws {Error} If milestone name is invalid
 */
function getMilestoneOrder(milestoneName) {
  const milestone = MILESTONES.find(m => m.name === milestoneName);
  if (!milestone) {
    throw new Error(`Invalid milestone: '${milestoneName}'. Valid milestones: ${MILESTONES.map(m => m.name).join(', ')}`);
  }
  return milestone.order;
}

/**
 * Validates that a milestone can be released (sequential order check)
 * 
 * @param {Object} payment - Current payment object
 * @param {string} milestoneName - Milestone to release
 * @returns {Object} The milestone to be released
 * @throws {Error} If release is invalid
 */
function validateMilestoneRelease(payment, milestoneName) {
  // Check payment is not in terminal state
  if (payment.status === PAYMENT_STATUSES.COMPLETED) {
    throw new Error('Payment is already completed');
  }
  if (payment.status === PAYMENT_STATUSES.REFUNDED) {
    throw new Error('Payment has been refunded');
  }
  if (payment.status === PAYMENT_STATUSES.DISPUTED) {
    throw new Error('Payment is under dispute — cannot release milestones');
  }
  
  // Find the milestone
  const milestoneIndex = payment.milestones.findIndex(m => m.name === milestoneName);
  if (milestoneIndex === -1) {
    throw new Error(`Milestone '${milestoneName}' not found`);
  }
  
  const milestone = payment.milestones[milestoneIndex];
  
  // Check for double-release
  if (milestone.status === MILESTONE_STATUSES.RELEASED) {
    throw new Error(`Milestone '${milestoneName}' has already been released`);
  }
  
  // Check sequential order: all previous milestones must be released
  for (let i = 0; i < milestoneIndex; i++) {
    if (payment.milestones[i].status !== MILESTONE_STATUSES.RELEASED) {
      throw new Error(
        `Cannot release '${milestoneName}' — previous milestone '${payment.milestones[i].name}' has not been released yet`
      );
    }
  }
  
  return milestone;
}

/**
 * Releases a milestone payment
 * 
 * @param {Object} payment - Current payment object
 * @param {string} milestoneName - Milestone to release
 * @returns {Object} Updated payment with release info
 */
function releaseMilestone(payment, milestoneName) {
  const milestone = validateMilestoneRelease(payment, milestoneName);
  
  // Release the milestone
  milestone.status = MILESTONE_STATUSES.RELEASED;
  milestone.releasedAt = new Date();
  
  // Update current milestone
  payment.currentMilestone = milestoneName;
  
  // Check if all milestones are released
  const allReleased = payment.milestones.every(m => m.status === MILESTONE_STATUSES.RELEASED);
  
  if (allReleased) {
    payment.status = PAYMENT_STATUSES.COMPLETED;
  } else {
    payment.status = PAYMENT_STATUSES.PARTIALLY_RELEASED;
  }
  
  return {
    payment,
    released: true,
    amount: milestone.amount,
    milestoneName: milestone.name,
    isCompleted: allReleased
  };
}

/**
 * Calculates refund amount on cancellation
 * 
 * @param {Object} payment - Current payment object
 * @returns {Object} Refund details
 */
function calculateRefund(payment) {
  const releasedAmount = payment.milestones
    .filter(m => m.status === MILESTONE_STATUSES.RELEASED)
    .reduce((sum, m) => sum + m.amount, 0);
  
  const refundAmount = payment.totalAmount - releasedAmount;
  
  return {
    totalAmount: payment.totalAmount,
    releasedAmount,
    refundAmount,
    refundPercentage: Math.round((refundAmount / payment.totalAmount) * 100)
  };
}

/**
 * Gets summary of payment milestone progress
 * 
 * @param {Object} payment - Payment object
 * @returns {Object} Progress summary
 */
function getMilestoneProgress(payment) {
  const released = payment.milestones.filter(m => m.status === MILESTONE_STATUSES.RELEASED);
  const pending = payment.milestones.filter(m => m.status === MILESTONE_STATUSES.PENDING);
  
  const releasedAmount = released.reduce((sum, m) => sum + m.amount, 0);
  const pendingAmount = pending.reduce((sum, m) => sum + m.amount, 0);
  
  return {
    totalMilestones: payment.milestones.length,
    releasedCount: released.length,
    pendingCount: pending.length,
    releasedAmount,
    pendingAmount,
    progressPercentage: Math.round((released.length / payment.milestones.length) * 100),
    currentMilestone: payment.currentMilestone,
    nextMilestone: pending.length > 0 ? pending[0].name : null
  };
}

module.exports = {
  initializeEscrow,
  validateMilestoneRelease,
  releaseMilestone,
  calculateRefund,
  getMilestoneProgress,
  getMilestoneOrder,
  MILESTONES,
  PAYMENT_STATUSES,
  MILESTONE_STATUSES
};
