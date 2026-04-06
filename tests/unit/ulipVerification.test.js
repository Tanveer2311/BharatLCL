/**
 * Unit Tests — ULIP Verification
 * 
 * Tests for src/core/ulipVerification.js
 */

const {
  verifyTransporter,
  calculateVerificationScore,
  determineStatus,
  VERIFICATION_THRESHOLDS,
  SCORE_COMPONENTS
} = require('../../src/core/ulipVerification');

describe('ULIP Verification', () => {

  describe('calculateVerificationScore', () => {
    it('should return max score when all pass', () => {
      const score = calculateVerificationScore(true, true, 100);
      // 30 + 40 + (100 * 0.30) = 100
      expect(score).toBe(100);
    });

    it('should return 0 when all fail', () => {
      const score = calculateVerificationScore(false, false, 0);
      expect(score).toBe(0);
    });

    it('should return correct score for partial pass', () => {
      const score = calculateVerificationScore(true, false, 60);
      // 30 + 0 + (60 * 0.30) = 48
      expect(score).toBe(48);
    });

    it('should handle null LDB score', () => {
      const score = calculateVerificationScore(true, true, null);
      // 30 + 40 + 0 = 70
      expect(score).toBe(70);
    });
  });

  describe('determineStatus', () => {
    it('should return verified for score >= 70', () => {
      expect(determineStatus(70)).toBe('verified');
      expect(determineStatus(100)).toBe('verified');
    });

    it('should return pending for score 40-69', () => {
      expect(determineStatus(40)).toBe('pending');
      expect(determineStatus(69)).toBe('pending');
    });

    it('should return failed for score < 40', () => {
      expect(determineStatus(39)).toBe('failed');
      expect(determineStatus(0)).toBe('failed');
    });
  });

  describe('verifyTransporter', () => {
    it('should return verification result with all fields', async () => {
      const result = await verifyTransporter('transport123', 'RJ14GA5678');

      expect(result.transporterId).toBe('transport123');
      expect(result.vehicleNumber).toBe('RJ14GA5678');
      expect(result.overallStatus).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.fastagStatus).toBeDefined();
      expect(result.vahanStatus).toBeDefined();
      expect(result.ldbScore).toBeDefined();
      expect(result.fromCache).toBe(false);
    });

    it('should return cached result if cache is valid', async () => {
      const cachedVerification = {
        transporterId: 'transport123',
        overallStatus: 'verified',
        score: 95,
        updatedAt: new Date() // Fresh cache
      };

      const result = await verifyTransporter('transport123', 'RJ14GA5678', cachedVerification);
      expect(result.fromCache).toBe(true);
    });

    it('should make fresh call if cache is expired', async () => {
      const cachedVerification = {
        transporterId: 'transport123',
        overallStatus: 'verified',
        score: 95,
        updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
      };

      const result = await verifyTransporter('transport123', 'RJ14GA5678', cachedVerification);
      expect(result.fromCache).toBe(false);
    });

    it('should return verified status for simulated data', async () => {
      const result = await verifyTransporter('transport123', 'RJ14GA5678');
      expect(result.overallStatus).toBe('verified');
    });
  });
});
