# Test Data Suite — BharatLCL

**Document Version:** 1.0  
**Date:** April 2026  
**Testing Framework:** Jest + Supertest

---

## Table of Contents

1. [Test Strategy Overview](#1-test-strategy-overview)
2. [Unit Test Cases](#2-unit-test-cases)
3. [Integration Test Cases](#3-integration-test-cases)
4. [API Test Cases](#4-api-test-cases)
5. [Test Data Sets](#5-test-data-sets)
6. [Test Coverage Matrix](#6-test-coverage-matrix)

---

## 1. Test Strategy Overview

### Testing Levels

| Level | Scope | Tools | Coverage Target |
|-------|-------|-------|----------------|
| **Unit Tests** | Individual functions & modules | Jest | Core business logic (capacityEngine, escrowPayment, ulipVerification, documentGenerator) |
| **Integration Tests** | API endpoints with database | Jest + Supertest + MongoDB Memory Server | All REST API endpoints |
| **Component Tests** | React UI components | React Testing Library | Key user-facing components |

### Test Naming Convention

```
describe('[ModuleName]', () => {
  describe('[functionName]', () => {
    it('should [expected behavior] when [condition]', () => { ... });
  });
});
```

### Test Execution Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage report
npm run test:coverage
```

---

## 2. Unit Test Cases

### 2.1 Capacity Engine (`src/core/capacityEngine.js`)

| Test ID | Test Case | Input | Expected Output | Priority |
|---------|-----------|-------|-----------------|----------|
| **UT-CE-001** | Should match available slot when exact CBM is available | `{ origin: 'Jaipur', dest: 'Mundra', requiredCBM: 5, cargoType: 'textile' }` | Returns array with matching container(s) | P1 |
| **UT-CE-002** | Should return empty array when no slots match criteria | `{ origin: 'Jaipur', dest: 'Chennai', requiredCBM: 5 }` (no Chennai route) | `[]` | P1 |
| **UT-CE-003** | Should reject booking when requiredCBM exceeds availableCBM | `{ requiredCBM: 25 }` (container has 10 CBM available) | Throws `InsufficientCapacityError` | P1 |
| **UT-CE-004** | Should correctly calculate price (CBM × pricePerCBM + platformFee) | `{ requiredCBM: 5, pricePerCBM: 2000 }` | `{ baseCost: 10000, platformFee: 400, total: 10400 }` (4% fee) | P1 |
| **UT-CE-005** | Should filter by cargo type correctly | `{ cargoType: 'stone' }` | Only containers accepting 'stone' cargo | P2 |
| **UT-CE-006** | Should sort results by relevance score (price weight: 0.35) | Multiple containers with varying prices | Cheapest containers ranked higher | P2 |
| **UT-CE-007** | Should filter by date range (±3 days of preferred date) | `{ preferredDate: '2026-04-15' }` | Containers departing April 12-18 only | P2 |
| **UT-CE-008** | Should reduce container availableCBM after booking | Container with 20 CBM, book 8 CBM | Container.availableCBM = 12 | P1 |
| **UT-CE-009** | Should handle concurrent booking race condition | Two bookings for same container, total > available | First succeeds, second fails with error | P1 |
| **UT-CE-010** | Should paginate results (max 20 per page) | 50 matching containers | Returns first 20 with `hasMore: true` | P3 |

### 2.2 Escrow Payment (`src/core/escrowPayment.js`)

| Test ID | Test Case | Input | Expected Output | Priority |
|---------|-----------|-------|-----------------|----------|
| **UT-EP-001** | Should initialize escrow with correct milestone distribution | `{ totalAmount: 10000 }` | 5 milestones: [1000, 2000, 2000, 2500, 2500] | P1 |
| **UT-EP-002** | Should release 'booked' milestone (10%) on booking confirmation | `{ paymentId, milestone: 'booked' }` | `{ released: true, amount: 1000 }` | P1 |
| **UT-EP-003** | Should reject out-of-order milestone release | Attempt to release 'at_port' before 'in_transit' | Throws `InvalidMilestoneSequenceError` | P1 |
| **UT-EP-004** | Should mark payment as 'completed' when all milestones released | Release all 5 milestones sequentially | `payment.status === 'completed'` | P1 |
| **UT-EP-005** | Should prevent double-release of same milestone | Release 'picked_up' twice | Second call throws `MilestoneAlreadyReleasedError` | P1 |
| **UT-EP-006** | Should handle dispute creation correctly | `{ paymentId, milestone: 'in_transit', reason: 'Cargo damaged' }` | `{ disputeId, status: 'open' }` | P2 |
| **UT-EP-007** | Should calculate refund amount on cancellation | Cancel after 'picked_up' (30% released) | Refund: 70% of totalAmount | P2 |
| **UT-EP-008** | Should enforce milestone percentage totals to 100% | Sum all milestone percentages | Exactly 100 | P1 |

### 2.3 ULIP Verification (`src/core/ulipVerification.js`)

| Test ID | Test Case | Input | Expected Output | Priority |
|---------|-----------|-------|-----------------|----------|
| **UT-UV-001** | Should return 'verified' when all APIs return positive | FASTag: valid, VAHAN: valid, LDB: 85/100 | `{ overallStatus: 'verified', score: 95.5 }` | P1 |
| **UT-UV-002** | Should return 'failed' when VAHAN registration is invalid | VAHAN: invalid registration | `{ overallStatus: 'failed' }` | P1 |
| **UT-UV-003** | Should return cached result within 24h window | Previous verification exists, < 24h old | Returns cached data without API calls | P1 |
| **UT-UV-004** | Should make fresh API calls when cache expired | Cached verification > 24h old | Makes new API calls | P2 |
| **UT-UV-005** | Should handle ULIP API timeout gracefully | API response time > 10s | Returns `{ status: 'pending', error: 'API timeout' }` | P1 |
| **UT-UV-006** | Should calculate score correctly (FASTag: 30, VAHAN: 40, LDB: 30%) | FASTag: valid, VAHAN: valid, LDB: 60/100 | Score: 30 + 40 + (60 × 0.3) = 88 | P1 |
| **UT-UV-007** | Should return 'pending' for score between 40-69 | Partial verification success | `{ overallStatus: 'pending' }` | P2 |

### 2.4 Document Generator (`src/core/documentGenerator.js`)

| Test ID | Test Case | Input | Expected Output | Priority |
|---------|-----------|-------|-----------------|----------|
| **UT-DG-001** | Should generate shipping bill with correct exporter details | Shipment with exporter profile | PDF contains IEC code, GSTIN, business name | P1 |
| **UT-DG-002** | Should generate packing list with cargo dimensions | Shipment with cargo: 5 CBM textile | PDF contains L×W×H, weight, quantity | P1 |
| **UT-DG-003** | Should generate commercial invoice with FOB values | Shipment with price details | PDF contains item descriptions, FOB value, total | P2 |
| **UT-DG-004** | Should throw error for shipment with missing data | Shipment without exporter profile | Throws `IncompleteDataError` | P1 |
| **UT-DG-005** | Should store generated document URL in database | Generate shipping bill | Document record created with fileUrl | P2 |

### 2.5 Authentication (`src/server/middleware/auth.js`)

| Test ID | Test Case | Input | Expected Output | Priority |
|---------|-----------|-------|-----------------|----------|
| **UT-AU-001** | Should hash password with bcrypt (10+ salt rounds) | `password: 'Test@1234'` | Hash starts with `$2b$10$` or `$2b$12$` | P1 |
| **UT-AU-002** | Should generate valid JWT with userId and role | `{ userId: '123', role: 'exporter' }` | Valid JWT decodable with correct payload | P1 |
| **UT-AU-003** | Should reject expired JWT token | Token with expiry in the past | `{ valid: false, error: 'Token expired' }` | P1 |
| **UT-AU-004** | Should reject tampered JWT token | Modified token payload | `{ valid: false, error: 'Invalid signature' }` | P1 |
| **UT-AU-005** | Should enforce role-based access (exporter cannot add capacity) | Exporter token on transporter-only route | Returns 403 Forbidden | P1 |

---

## 3. Integration Test Cases

### 3.1 Booking Flow (End-to-End)

| Test ID | Test Case | Steps | Expected Result | Priority |
|---------|-----------|-------|-----------------|----------|
| **IT-BF-001** | Complete booking flow from search to confirmation | 1. Search capacity 2. Select slot 3. Submit booking 4. Verify shipment created 5. Verify payment initiated | Shipment status: 'booked', Payment status: 'in_escrow' | P1 |
| **IT-BF-002** | Booking should fail when slot becomes unavailable | 1. Search capacity 2. Another user books the slot 3. Submit booking | Returns 409 Conflict with clear message | P1 |
| **IT-BF-003** | Cancellation should restore container capacity | 1. Book 5 CBM 2. Cancel booking | Container.availableCBM increases by 5 | P1 |

### 3.2 Payment Flow

| Test ID | Test Case | Steps | Expected Result | Priority |
|---------|-----------|-------|-----------------|----------|
| **IT-PF-001** | Full milestone release cycle | 1. Initiate payment 2. Release each milestone in order | Payment status transitions: initiated → in_escrow → completed | P1 |
| **IT-PF-002** | Dispute pauses milestone releases | 1. Release 2 milestones 2. Raise dispute on milestone 3 | Payment status: 'disputed', no further releases | P2 |

### 3.3 Authentication Flow

| Test ID | Test Case | Steps | Expected Result | Priority |
|---------|-----------|-------|-----------------|----------|
| **IT-AF-001** | Register and login flow | 1. Register with valid data 2. Login with credentials | JWT token returned, profile accessible | P1 |
| **IT-AF-002** | Duplicate email registration | 1. Register user 2. Register same email | Returns 409 with 'Email already exists' | P1 |
| **IT-AF-003** | Access protected route without token | 1. GET /api/capacity/slots without Authorization header | Returns 401 Unauthorized | P1 |

---

## 4. API Test Cases

### 4.1 Capacity API

| Test ID | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority |
|---------|--------|----------|-------------|-----------------|-------------------|----------|
| **AT-CA-001** | GET | `/api/capacity/slots` | — | 200 | Array of available slots | P1 |
| **AT-CA-002** | GET | `/api/capacity/slots?origin=Jaipur&dest=Mundra` | — | 200 | Filtered slots | P1 |
| **AT-CA-003** | POST | `/api/capacity/book` | `{ containerId, cargoDimensions, cargoWeight }` | 201 | `{ shipment, payment }` | P1 |
| **AT-CA-004** | POST | `/api/capacity/book` | Missing containerId | 400 | Validation error | P1 |
| **AT-CA-005** | POST | `/api/capacity/slots` | `{ totalCBM, pricePerCBM, departureDate }` (transporter) | 201 | Created container | P1 |
| **AT-CA-006** | POST | `/api/capacity/slots` | Request from exporter role | 403 | Forbidden (transporter only) | P2 |

### 4.2 Auth API

| Test ID | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority |
|---------|--------|----------|-------------|-----------------|-------------------|----------|
| **AT-AU-001** | POST | `/api/auth/register` | `{ name, email, password, role, mobile }` | 201 | `{ user, token }` | P1 |
| **AT-AU-002** | POST | `/api/auth/register` | Missing email field | 400 | Validation error | P1 |
| **AT-AU-003** | POST | `/api/auth/login` | `{ email, password }` (valid) | 200 | `{ user, token }` | P1 |
| **AT-AU-004** | POST | `/api/auth/login` | Wrong password | 401 | 'Invalid credentials' | P1 |
| **AT-AU-005** | GET | `/api/auth/profile` | — (with valid JWT) | 200 | User profile data | P1 |

---

## 5. Test Data Sets

### 5.1 Sample Users

```json
[
  {
    "name": "Rajesh Kumar Textiles",
    "email": "rajesh@kumarexports.com",
    "password": "Test@1234",
    "role": "exporter",
    "mobileNumber": "+919876543210",
    "businessName": "Kumar Textile Exports",
    "gstNumber": "08AABCU9603R1ZX",
    "iecCode": "0803004032",
    "address": {
      "street": "123 Textile Market, Sanganer",
      "city": "Jaipur",
      "state": "Rajasthan",
      "pincode": "302029"
    },
    "subscriptionTier": "tez"
  },
  {
    "name": "Priya Handicraft House",
    "email": "priya@handicrafthouse.in",
    "password": "Test@5678",
    "role": "exporter",
    "mobileNumber": "+919876543211",
    "businessName": "Priya Handicraft House",
    "gstNumber": "08AABCU9603R2ZY",
    "iecCode": "0803004033",
    "address": {
      "street": "456 Johari Bazaar",
      "city": "Jaipur",
      "state": "Rajasthan",
      "pincode": "302003"
    },
    "subscriptionTier": "aaram"
  },
  {
    "name": "Gujarat Freight Movers",
    "email": "ops@gfmovers.com",
    "password": "Test@9012",
    "role": "transporter",
    "mobileNumber": "+919876543212",
    "businessName": "Gujarat Freight Movers Pvt Ltd",
    "gstNumber": "24AABCU9603R3ZZ",
    "address": {
      "street": "789 Transport Nagar, Adalaj",
      "city": "Ahmedabad",
      "state": "Gujarat",
      "pincode": "382421"
    }
  }
]
```

### 5.2 Sample Containers

```json
[
  {
    "containerNumber": "MSKU7654321",
    "origin": { "city": "Jaipur", "facility": "Jaipur ICD Sanganer" },
    "destination": { "city": "Mundra", "port": "Adani Mundra Port" },
    "totalCBM": 30,
    "availableCBM": 18,
    "pricePerCBM": 2200,
    "departureDate": "2026-04-15",
    "cargoTypes": ["textile", "handicraft"],
    "vehicleNumber": "RJ14GA5678",
    "status": "partially_booked"
  },
  {
    "containerNumber": "TCLU8765432",
    "origin": { "city": "Jaipur", "facility": "Jaipur ICD Kanakpura" },
    "destination": { "city": "Mundra", "port": "Adani Mundra Port" },
    "totalCBM": 25,
    "availableCBM": 25,
    "pricePerCBM": 1800,
    "departureDate": "2026-04-18",
    "cargoTypes": ["textile", "stone", "general"],
    "vehicleNumber": "GJ01AB1234",
    "status": "available"
  }
]
```

### 5.3 Sample Shipment

```json
{
  "bookingId": "BL-240601",
  "cargo": {
    "type": "textile",
    "description": "Block-printed cotton fabric rolls",
    "dimensions": { "length": 2.0, "width": 1.5, "height": 1.2 },
    "weight": 450,
    "cbm": 3.6,
    "quantity": 12
  },
  "origin": { "city": "Jaipur", "pickupAddress": "123 Textile Market, Sanganer" },
  "destination": { "city": "Mundra", "port": "Adani Mundra Port" },
  "status": "booked",
  "price": {
    "baseCost": 7920,
    "platformFee": 317,
    "totalCost": 8237
  }
}
```

### 5.4 Edge Case Test Data

| Scenario | Data | Expected Behavior |
|----------|------|-------------------|
| **Zero CBM booking** | `requiredCBM: 0` | Validation error: 'CBM must be > 0' |
| **Negative price** | `pricePerCBM: -500` | Validation error: 'Price must be positive' |
| **Past departure date** | `departureDate: '2020-01-01'` | Validation error: 'Departure must be future' |
| **XSS in business name** | `businessName: '<script>alert(1)</script>'` | Sanitized to plain text |
| **SQL injection in email** | `email: "'; DROP TABLE users;--"` | Validation error: 'Invalid email format' |
| **Very long text fields** | `description: 'A'.repeat(10000)` | Truncated or validation error at 500 chars |
| **Unicode characters** | `name: 'राजेश कुमार'` | Accepted and stored correctly |
| **Concurrent bookings** | Two users booking last 5 CBM simultaneously | Only one succeeds; other gets 409 |

---

## 6. Test Coverage Matrix

### Requirements Traceability

| Requirement | Unit Tests | Integration Tests | API Tests |
|-------------|-----------|-------------------|-----------|
| **FR1** — Capacity Discovery | UT-CE-001 to UT-CE-010 | IT-BF-001 | AT-CA-001 to AT-CA-006 |
| **FR2** — ULIP Verification | UT-UV-001 to UT-UV-007 | — | — |
| **FR3** — Escrow Payments | UT-EP-001 to UT-EP-008 | IT-PF-001, IT-PF-002 | — |
| **FR4** — Documentation | UT-DG-001 to UT-DG-005 | — | — |
| **FR5** — Shipment Tracking | — | — | — |
| **FR6** — Authentication | UT-AU-001 to UT-AU-005 | IT-AF-001 to IT-AF-003 | AT-AU-001 to AT-AU-005 |

### Coverage Targets

| Module | Current | Target |
|--------|---------|--------|
| `src/core/capacityEngine.js` | — | 85% |
| `src/core/escrowPayment.js` | — | 80% |
| `src/core/ulipVerification.js` | — | 75% |
| `src/core/documentGenerator.js` | — | 70% |
| `src/server/middleware/auth.js` | — | 90% |
| `src/server/routes/*` | — | 75% |
| **Overall** | — | **80%** |

---

*Last Updated: April 2026*
