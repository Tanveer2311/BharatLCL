/**
 * Unit Tests — Capacity Engine
 * 
 * Tests for src/core/capacityEngine.js
 */

const {
  calculatePrice,
  calculateCBM,
  validateCapacity,
  buildSearchQuery,
  generateBookingId,
  calculateRelevanceScore,
  PLATFORM_FEES
} = require('../../src/core/capacityEngine');

describe('Capacity Engine', () => {

  describe('calculatePrice', () => {
    it('should calculate correct price with default (aaram) tier', () => {
      const result = calculatePrice(5, 2000, 'aaram');
      expect(result.baseCost).toBe(10000);
      expect(result.platformFee).toBe(500); // 5% of 10000
      expect(result.totalCost).toBe(10500);
    });

    it('should calculate correct price with tez (premium) tier', () => {
      const result = calculatePrice(5, 2000, 'tez');
      expect(result.baseCost).toBe(10000);
      expect(result.platformFee).toBe(300); // 3% of 10000
      expect(result.totalCost).toBe(10300);
    });

    it('should throw error for zero CBM', () => {
      expect(() => calculatePrice(0, 2000)).toThrow('CBM must be greater than 0');
    });

    it('should throw error for negative price', () => {
      expect(() => calculatePrice(5, -500)).toThrow('Price per CBM must be positive');
    });

    it('should default to aaram fee for unknown tier', () => {
      const result = calculatePrice(10, 1000, 'unknown_tier');
      expect(result.platformFee).toBe(500); // Falls back to 5%
    });
  });

  describe('calculateCBM', () => {
    it('should correctly calculate volume', () => {
      expect(calculateCBM({ length: 2, width: 1.5, height: 1.2 })).toBe(3.6);
    });

    it('should throw error for zero dimensions', () => {
      expect(() => calculateCBM({ length: 0, width: 1, height: 1 }))
        .toThrow('All dimensions must be positive numbers');
    });

    it('should throw error for negative dimensions', () => {
      expect(() => calculateCBM({ length: -2, width: 1, height: 1 }))
        .toThrow('All dimensions must be positive numbers');
    });
  });

  describe('validateCapacity', () => {
    const mockContainer = {
      availableCBM: 15,
      status: 'available',
      departureDate: new Date(Date.now() + 86400000 * 7) // 7 days from now
    };

    it('should pass for valid booking', () => {
      expect(() => validateCapacity(mockContainer, 10)).not.toThrow();
    });

    it('should throw for insufficient capacity', () => {
      expect(() => validateCapacity(mockContainer, 20))
        .toThrow('Insufficient capacity');
    });

    it('should throw for null container', () => {
      expect(() => validateCapacity(null, 5)).toThrow('Container not found');
    });

    it('should throw for full container status', () => {
      const fullContainer = { ...mockContainer, status: 'full' };
      expect(() => validateCapacity(fullContainer, 5))
        .toThrow('Container is not available');
    });

    it('should throw for past departure date', () => {
      const pastContainer = {
        ...mockContainer,
        departureDate: new Date('2020-01-01')
      };
      expect(() => validateCapacity(pastContainer, 5))
        .toThrow('departure date has already passed');
    });
  });

  describe('buildSearchQuery', () => {
    it('should build query with origin filter', () => {
      const query = buildSearchQuery({ origin: 'Jaipur' });
      expect(query['origin.city']).toBeDefined();
      expect(query.status.$in).toContain('available');
    });

    it('should build query with cargo type filter', () => {
      const query = buildSearchQuery({ cargoType: 'textile' });
      expect(query.cargoTypes.$in).toContain('textile');
    });

    it('should build query with CBM minimum', () => {
      const query = buildSearchQuery({ requiredCBM: 5 });
      expect(query.availableCBM.$gte).toBe(5);
    });

    it('should build query with empty filters', () => {
      const query = buildSearchQuery({});
      expect(query.status).toBeDefined();
      expect(query.departureDate.$gt).toBeDefined();
    });
  });

  describe('generateBookingId', () => {
    it('should generate ID starting with BL-', () => {
      const id = generateBookingId();
      expect(id.startsWith('BL-')).toBe(true);
    });

    it('should generate 9-character ID (BL- + 6 chars)', () => {
      const id = generateBookingId();
      expect(id.length).toBe(9);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateBookingId());
      }
      // With 36^6 possibilities, 100 IDs should all be unique
      expect(ids.size).toBe(100);
    });
  });

  describe('calculateRelevanceScore', () => {
    it('should return a score between 0 and 100', () => {
      const container = {
        pricePerCBM: 2000,
        departureDate: new Date(Date.now() + 86400000),
        availableCBM: 10,
        transporterVerificationScore: 80
      };
      const criteria = {
        preferredDate: new Date(Date.now() + 86400000),
        requiredCBM: 8
      };

      const score = calculateRelevanceScore(container, criteria);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
