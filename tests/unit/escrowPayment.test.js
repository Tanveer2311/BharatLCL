/**
 * Unit Tests — Escrow Payment
 * 
 * Tests for src/core/escrowPayment.js
 */

const {
  initializeEscrow,
  validateMilestoneRelease,
  releaseMilestone,
  calculateRefund,
  getMilestoneProgress,
  MILESTONES,
  PAYMENT_STATUSES,
  MILESTONE_STATUSES
} = require('../../src/core/escrowPayment');

describe('Escrow Payment', () => {

  describe('initializeEscrow', () => {
    it('should create 5 milestones with correct distribution', () => {
      const escrow = initializeEscrow(10000);
      expect(escrow.milestones).toHaveLength(5);
      expect(escrow.milestones[0].amount).toBe(1000);  // 10%
      expect(escrow.milestones[1].amount).toBe(2000);  // 20%
      expect(escrow.milestones[2].amount).toBe(2000);  // 20%
      expect(escrow.milestones[3].amount).toBe(2500);  // 25%
      expect(escrow.milestones[4].amount).toBe(2500);  // 25%
    });

    it('should set initial status to INITIATED', () => {
      const escrow = initializeEscrow(5000);
      expect(escrow.status).toBe(PAYMENT_STATUSES.INITIATED);
    });

    it('should have all milestones as PENDING', () => {
      const escrow = initializeEscrow(5000);
      escrow.milestones.forEach(m => {
        expect(m.status).toBe(MILESTONE_STATUSES.PENDING);
      });
    });

    it('should throw for zero amount', () => {
      expect(() => initializeEscrow(0)).toThrow('Total amount must be a positive number');
    });

    it('should throw for negative amount', () => {
      expect(() => initializeEscrow(-1000)).toThrow('Total amount must be a positive number');
    });

    it('should ensure milestone amounts sum to total', () => {
      const escrow = initializeEscrow(9999); // Odd number to test rounding
      const sum = escrow.milestones.reduce((s, m) => s + m.amount, 0);
      expect(sum).toBe(9999);
    });
  });

  describe('releaseMilestone', () => {
    let payment;

    beforeEach(() => {
      payment = initializeEscrow(10000);
    });

    it('should release first milestone (booked)', () => {
      const result = releaseMilestone(payment, 'booked');
      expect(result.released).toBe(true);
      expect(result.amount).toBe(1000);
      expect(result.isCompleted).toBe(false);
    });

    it('should reject out-of-order release', () => {
      expect(() => releaseMilestone(payment, 'in_transit'))
        .toThrow("previous milestone 'booked' has not been released");
    });

    it('should reject double release', () => {
      releaseMilestone(payment, 'booked');
      expect(() => releaseMilestone(payment, 'booked'))
        .toThrow("already been released");
    });

    it('should mark completed when all milestones released', () => {
      releaseMilestone(payment, 'booked');
      releaseMilestone(payment, 'picked_up');
      releaseMilestone(payment, 'in_transit');
      releaseMilestone(payment, 'at_port');
      const result = releaseMilestone(payment, 'delivered');

      expect(result.isCompleted).toBe(true);
      expect(payment.status).toBe(PAYMENT_STATUSES.COMPLETED);
    });

    it('should update status to PARTIALLY_RELEASED after first release', () => {
      releaseMilestone(payment, 'booked');
      expect(payment.status).toBe(PAYMENT_STATUSES.PARTIALLY_RELEASED);
    });
  });

  describe('calculateRefund', () => {
    it('should calculate full refund when no milestones released', () => {
      const payment = initializeEscrow(10000);
      const refund = calculateRefund(payment);
      expect(refund.refundAmount).toBe(10000);
      expect(refund.refundPercentage).toBe(100);
    });

    it('should calculate partial refund after some releases', () => {
      const payment = initializeEscrow(10000);
      releaseMilestone(payment, 'booked');       // 1000 released
      releaseMilestone(payment, 'picked_up');    // 2000 released

      const refund = calculateRefund(payment);
      expect(refund.releasedAmount).toBe(3000);
      expect(refund.refundAmount).toBe(7000);
      expect(refund.refundPercentage).toBe(70);
    });
  });

  describe('getMilestoneProgress', () => {
    it('should show 0% progress initially', () => {
      const payment = initializeEscrow(10000);
      const progress = getMilestoneProgress(payment);
      expect(progress.progressPercentage).toBe(0);
      expect(progress.releasedCount).toBe(0);
      expect(progress.nextMilestone).toBe('booked');
    });

    it('should show correct progress after releases', () => {
      const payment = initializeEscrow(10000);
      releaseMilestone(payment, 'booked');
      releaseMilestone(payment, 'picked_up');

      const progress = getMilestoneProgress(payment);
      expect(progress.progressPercentage).toBe(40);
      expect(progress.releasedCount).toBe(2);
      expect(progress.nextMilestone).toBe('in_transit');
    });
  });

  describe('MILESTONES configuration', () => {
    it('should have percentages totaling 100', () => {
      const total = MILESTONES.reduce((sum, m) => sum + m.percentage, 0);
      expect(total).toBe(100);
    });

    it('should have 5 milestones', () => {
      expect(MILESTONES).toHaveLength(5);
    });

    it('should have sequential order 1-5', () => {
      MILESTONES.forEach((m, i) => {
        expect(m.order).toBe(i + 1);
      });
    });
  });
});
