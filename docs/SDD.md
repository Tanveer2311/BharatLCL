# Software Design Description (SDD)

## BharatLCL — Digital Logistics Marketplace for Indian MSMEs

**Document Version:** 1.0  
**Date:** April 2026  
**Standard:** IEEE 1016-2009 (IEEE Standard for Information Technology — Software Design Descriptions)

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Purpose](#11-purpose)
   - 1.2 [Scope](#12-scope)
   - 1.3 [Definitions and Abbreviations](#13-definitions-and-abbreviations)
   - 1.4 [References](#14-references)
2. [System Overview](#2-system-overview)
3. [System Architecture](#3-system-architecture)
   - 3.1 [Architecture Design](#31-architecture-design)
   - 3.2 [Component Diagram](#32-component-diagram)
4. [Data Design](#4-data-design)
   - 4.1 [Database Schema](#41-database-schema)
   - 4.2 [Data Flow](#42-data-flow)
5. [Component Design](#5-component-design)
   - 5.1 [Frontend Components](#51-frontend-components)
   - 5.2 [Backend Services](#52-backend-services)
   - 5.3 [Core Business Logic](#53-core-business-logic)
6. [Interface Design](#6-interface-design)
   - 6.1 [API Endpoints](#61-api-endpoints)
   - 6.2 [External API Integrations](#62-external-api-integrations)
7. [Detailed Design](#7-detailed-design)
   - 7.1 [Sequence Diagrams](#71-sequence-diagrams)
   - 7.2 [State Charts](#72-state-charts)
   - 7.3 [Class Diagram](#73-class-diagram)
8. [Design Decisions and Rationale](#8-design-decisions-and-rationale)

---

## 1. Introduction

### 1.1 Purpose

This Software Design Description (SDD) document describes the architectural and detailed design of the BharatLCL platform. It translates the requirements specified in the SRS (Software Requirements Specification) into a technical blueprint for development. The target audience includes developers, technical reviewers, and academic evaluators.

### 1.2 Scope

This SDD covers the complete design of the BharatLCL web application, including:
- 3-tier system architecture
- Frontend component hierarchy (React)
- Backend service layer design (Express/Node.js)
- Database schema design (MongoDB)
- Core business logic modules
- RESTful API design
- External integration design (ULIP APIs)
- UML design artifacts (Class, Sequence, State diagrams)

### 1.3 Definitions and Abbreviations

| Term | Definition |
|------|-----------|
| **API** | Application Programming Interface |
| **REST** | Representational State Transfer |
| **SPA** | Single Page Application |
| **MVC** | Model-View-Controller |
| **ODM** | Object Document Mapper (Mongoose) |
| **RBAC** | Role-Based Access Control |
| **DTO** | Data Transfer Object |

*For domain-specific terms (LCL, ULIP, etc.), refer to SRS Section 1.3.*

### 1.4 References

1. IEEE 1016-2009: IEEE Standard for Software Design Descriptions
2. BharatLCL SRS Document v1.0 (see [`docs/SRS.md`](SRS.md))
3. React Documentation — https://react.dev
4. Express.js Guide — https://expressjs.com/en/guide
5. Mongoose Documentation — https://mongoosejs.com/docs
6. Vercel Deployment Docs — https://vercel.com/docs

---

## 2. System Overview

BharatLCL is designed as a **3-tier monolithic web application** with modular internal structure, enabling clear separation of concerns while maintaining deployment simplicity suitable for a 2-person team.

**High-Level Data Flow:**

```
User (Browser)
     │
     ▼
[React SPA — Presentation Tier]
     │ HTTP/HTTPS (REST API calls)
     ▼
[Express.js Server — Application Tier]
     │     │
     │     ├── Core Business Logic (src/core/)
     │     ├── ULIP API Integration (external)
     │     └── Payment Gateway (external)
     │
     ▼
[MongoDB Atlas — Data Tier]
```

**Key Design Principles:**
- **Separation of Concerns**: Each tier has a distinct responsibility
- **Modular Core Logic**: Business rules isolated in `src/core/` for testability
- **API-First Design**: Frontend and backend communicate exclusively via REST APIs
- **Configuration over Code**: Environment-based configuration for different deployment stages

---

## 3. System Architecture

### 3.1 Architecture Design

**Architecture Pattern:** 3-Tier Monolithic with Modular Services

| Tier | Technology | Responsibility |
|------|-----------|---------------|
| **Presentation** | React 18 + Vite | UI rendering, user interaction, client-side routing, state management |
| **Application** | Node.js + Express.js | Request handling, business logic orchestration, API gateway, authentication |
| **Data** | MongoDB Atlas + Mongoose | Data persistence, schema enforcement, indexing, aggregation |

**Cross-Cutting Concerns:**
- **Authentication**: JWT middleware applied across all protected routes
- **Error Handling**: Centralized error middleware with structured error responses
- **Logging**: Morgan for HTTP request logging, custom logger for application events
- **Validation**: express-validator for input validation on all API endpoints

### 3.2 Component Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  React Application                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │  Auth    │ │Dashboard │ │ Booking  │ │Tracking│  │  │
│  │  │  Pages   │ │  Page    │ │  Page    │ │ Page   │  │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘  │  │
│  │       └─────────────┼───────────┼────────────┘       │  │
│  │                     ▼           ▼                     │  │
│  │              ┌────────────────────────┐               │  │
│  │              │   React Context API    │               │  │
│  │              │   (AuthContext, etc.)   │               │  │
│  │              └───────────┬────────────┘               │  │
│  └──────────────────────────┼────────────────────────────┘  │
│                             │ Axios HTTP Requests            │
└─────────────────────────────┼────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVER (Node.js)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Express Application                  │   │
│  │                                                       │   │
│  │  ┌─────────┐  ┌─────────────┐  ┌──────────────────┐  │   │
│  │  │  Auth   │  │   CORS /    │  │  Error Handling  │  │   │
│  │  │Middleware│  │  Helmet     │  │   Middleware     │  │   │
│  │  └────┬────┘  └──────┬──────┘  └────────┬─────────┘  │   │
│  │       └──────────────┼──────────────────┘             │   │
│  │                      ▼                                │   │
│  │  ┌──────────────────────────────────────────┐         │   │
│  │  │              ROUTES LAYER                 │         │   │
│  │  │  /api/auth  /api/capacity  /api/payments │         │   │
│  │  │  /api/shipments  /api/documents          │         │   │
│  │  └────────────────────┬─────────────────────┘         │   │
│  │                       ▼                               │   │
│  │  ┌──────────────────────────────────────────┐         │   │
│  │  │           SERVICES LAYER                  │         │   │
│  │  │  AuthService  CapacityService  PaymentSvc │         │   │
│  │  └────────────────────┬─────────────────────┘         │   │
│  │                       ▼                               │   │
│  │  ┌──────────────────────────────────────────┐         │   │
│  │  │         CORE BUSINESS LOGIC               │         │   │
│  │  │  capacityEngine  escrowPayment            │         │   │
│  │  │  ulipVerification  documentGenerator      │         │   │
│  │  │  trackingService                          │         │   │
│  │  └────────────────────┬─────────────────────┘         │   │
│  │                       ▼                               │   │
│  │  ┌──────────────────────────────────────────┐         │   │
│  │  │           MODELS LAYER (Mongoose)         │         │   │
│  │  │  User  Shipment  Container  Payment  Doc  │         │   │
│  │  └────────────────────┬─────────────────────┘         │   │
│  └───────────────────────┼───────────────────────────────┘   │
│                          ▼                                   │
│              ┌───────────────────────┐                       │
│              │    MongoDB Atlas      │                       │
│              │  (Cloud Database)     │                       │
│              └───────────────────────┘                       │
│                                                              │
│  ┌─────────────────────────────────────────┐                │
│  │         EXTERNAL INTEGRATIONS            │                │
│  │  ┌─────────┐ ┌────────┐ ┌────────────┐  │                │
│  │  │  ULIP   │ │Razorpay│ │ Nodemailer │  │                │
│  │  │  APIs   │ │Gateway │ │   (SMTP)   │  │                │
│  │  └─────────┘ └────────┘ └────────────┘  │                │
│  └─────────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Data Design

### 4.1 Database Schema

#### User Collection

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, indexed),
  passwordHash: String (required),
  role: String (enum: ['exporter', 'transporter', 'admin']),
  mobileNumber: String (required),
  businessName: String,
  gstNumber: String,
  iecCode: String,         // For exporters
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  subscriptionTier: String (enum: ['aaram', 'tez'], default: 'aaram'),
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { email: 1 }, { role: 1 }, { gstNumber: 1 }
```

#### Container Collection

```javascript
{
  _id: ObjectId,
  transporterId: ObjectId (ref: 'User', indexed),
  containerNumber: String (unique),
  origin: {
    city: String,
    facility: String (ICD/CFS name),
    coordinates: { lat: Number, lng: Number }
  },
  destination: {
    city: String,
    port: String,
    coordinates: { lat: Number, lng: Number }
  },
  totalCBM: Number (required),
  availableCBM: Number (required),
  pricePerCBM: Number (required, in INR),
  departureDate: Date (required, indexed),
  cargoTypes: [String] (enum: ['textile', 'handicraft', 'stone', 'general']),
  vehicleNumber: String,
  status: String (enum: ['available', 'partially_booked', 'full', 'in_transit', 'completed']),
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { status: 1, departureDate: 1 }, { transporterId: 1 }
```

#### Shipment Collection

```javascript
{
  _id: ObjectId,
  bookingId: String (unique, auto-generated: 'BL-XXXXXX'),
  exporterId: ObjectId (ref: 'User', indexed),
  transporterId: ObjectId (ref: 'User'),
  containerId: ObjectId (ref: 'Container'),
  cargo: {
    type: String,
    description: String,
    dimensions: { length: Number, width: Number, height: Number },
    weight: Number (kg),
    cbm: Number (calculated),
    quantity: Number
  },
  origin: { city: String, pickupAddress: String },
  destination: { city: String, port: String },
  status: String (enum: ['booked', 'picked_up', 'in_transit', 'at_port', 'delivered', 'cancelled']),
  price: {
    baseCost: Number,
    platformFee: Number (3-5%),
    totalCost: Number
  },
  tracking: {
    currentLocation: { lat: Number, lng: Number },
    eta: Date,
    lastUpdated: Date
  },
  documents: [ObjectId] (ref: 'Document'),
  bookedAt: Date,
  deliveredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { exporterId: 1 }, { status: 1 }, { bookingId: 1 }
```

#### Payment Collection

```javascript
{
  _id: ObjectId,
  shipmentId: ObjectId (ref: 'Shipment', indexed),
  exporterId: ObjectId (ref: 'User'),
  transporterId: ObjectId (ref: 'User'),
  totalAmount: Number (INR),
  milestones: [
    {
      name: String (enum: ['booked', 'picked_up', 'in_transit', 'at_port', 'delivered']),
      percentage: Number,
      amount: Number,
      status: String (enum: ['pending', 'released', 'disputed']),
      releasedAt: Date
    }
  ],
  currentMilestone: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: String (enum: ['initiated', 'in_escrow', 'partially_released', 'completed', 'refunded']),
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { shipmentId: 1 }, { status: 1 }
```

#### Document Collection

```javascript
{
  _id: ObjectId,
  shipmentId: ObjectId (ref: 'Shipment', indexed),
  type: String (enum: ['shipping_bill', 'packing_list', 'commercial_invoice']),
  fileName: String,
  fileUrl: String,
  generatedData: Object (JSON snapshot of data used to generate),
  generatedAt: Date,
  createdAt: Date
}
```

#### Verification Collection

```javascript
{
  _id: ObjectId,
  transporterId: ObjectId (ref: 'User', indexed),
  vehicleNumber: String (indexed),
  fastagStatus: {
    verified: Boolean,
    data: Object,
    checkedAt: Date
  },
  vahanStatus: {
    verified: Boolean,
    registrationData: Object,
    checkedAt: Date
  },
  ldbScore: {
    score: Number (0-100),
    shipmentHistory: Number,
    checkedAt: Date
  },
  overallStatus: String (enum: ['verified', 'unverified', 'pending', 'failed']),
  expiresAt: Date (24h TTL for cache),
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { transporterId: 1 }, { vehicleNumber: 1 }
```

### 4.2 Data Flow

**Booking Flow Data Path:**

```
Exporter (Browser)
    │ POST /api/capacity/book { containerId, cargoDimensions }
    ▼
Auth Middleware → validates JWT, extracts userId
    │
    ▼
Capacity Route → validates input → calls CapacityService
    │
    ▼
CapacityService → calls capacityEngine.matchSlot()
    │ → checks Container.availableCBM >= requested CBM
    │ → calculates price (CBM × pricePerCBM + platformFee)
    │
    ▼
Creates Shipment document (status: 'booked')
Updates Container document (reduces availableCBM)
Creates Payment document (escrow initiated)
    │
    ▼
Returns { shipment, payment } → Exporter sees booking confirmation
```

---

## 5. Component Design

### 5.1 Frontend Components

#### Component Hierarchy

```
App.jsx
├── AuthContext.Provider
│   ├── PublicRoutes
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   │
│   └── ProtectedRoutes (auth required)
│       ├── Layout.jsx (Sidebar + TopNav + Content)
│       │   ├── Sidebar.jsx
│       │   ├── TopNav.jsx
│       │   └── <Outlet /> (page content)
│       │
│       ├── Dashboard.jsx (role-based)
│       │   ├── ExporterDashboard.jsx
│       │   │   ├── StatsCards.jsx
│       │   │   ├── RecentShipments.jsx
│       │   │   └── CostSavingsChart.jsx
│       │   └── TransporterDashboard.jsx
│       │       ├── CapacityOverview.jsx
│       │       ├── ActiveBookings.jsx
│       │       └── EarningsChart.jsx
│       │
│       ├── CapacityDiscovery.jsx
│       │   ├── FilterPanel.jsx
│       │   ├── SlotCard.jsx
│       │   └── BookingModal.jsx
│       │
│       ├── ShipmentTracking.jsx
│       │   ├── TrackingMap.jsx
│       │   ├── MilestoneTimeline.jsx
│       │   └── ShipmentDetails.jsx
│       │
│       ├── Payments.jsx
│       │   ├── EscrowStatus.jsx
│       │   ├── MilestoneProgress.jsx
│       │   └── PaymentHistory.jsx
│       │
│       ├── Documents.jsx
│       │   ├── DocumentList.jsx
│       │   ├── DocumentPreview.jsx
│       │   └── GenerateDocModal.jsx
│       │
│       └── Profile.jsx
│           ├── ProfileForm.jsx
│           ├── SubscriptionCard.jsx
│           └── VerificationBadge.jsx
│
└── Shared Components
    ├── Button.jsx
    ├── Input.jsx
    ├── Modal.jsx
    ├── Table.jsx
    ├── StatusBadge.jsx
    ├── LoadingSpinner.jsx
    └── Toast.jsx
```

#### Key Component Specifications

| Component | Props | State | Responsibilities |
|-----------|-------|-------|-----------------|
| `CapacityDiscovery` | — | `slots[]`, `filters`, `loading` | Fetch & display available LCL slots, handle filtering |
| `BookingModal` | `slot`, `onClose` | `cargoDetails`, `submitting` | Collect cargo info, submit booking request |
| `EscrowStatus` | `paymentId` | `milestones[]`, `currentStatus` | Display escrow progress, milestone releases |
| `TrackingMap` | `shipmentId` | `location`, `route`, `eta` | Render live map with shipment location |
| `DocumentList` | `shipmentId` | `documents[]` | List generated docs, trigger generation |

### 5.2 Backend Services

#### Service Layer Architecture

```
Routes (HTTP handling)
  │
  ▼
Services (Business logic orchestration)
  │
  ▼
Core Modules (Domain-specific algorithms)
  │
  ▼
Models (Data access via Mongoose)
```

#### Service Definitions

**AuthService** (`src/server/services/authService.js`)
```
- register(userData) → { user, token }
- login(email, password) → { user, token }
- verifyToken(token) → { userId, role }
- resetPassword(email) → { success }
- updateProfile(userId, data) → { user }
```

**CapacityService** (`src/server/services/capacityService.js`)
```
- getAvailableSlots(filters) → [Container]
- getSlotDetails(containerId) → Container
- bookSlot(exporterId, containerId, cargoDetails) → { shipment, payment }
- cancelBooking(shipmentId, reason) → { refundStatus }
- listTransporterCapacity(transporterId) → [Container]
- addCapacity(transporterId, containerData) → Container
```

**PaymentService** (`src/server/services/paymentService.js`)
```
- initiateEscrow(shipmentId, amount) → { paymentId, razorpayOrder }
- releaseMilestone(paymentId, milestoneName) → { released, amount }
- getPaymentStatus(paymentId) → { milestones, currentStatus }
- handleDispute(paymentId, milestoneName, reason) → { disputeId }
- getPaymentHistory(userId) → [Payment]
```

**DocumentService** (`src/server/services/documentService.js`)
```
- generateShippingBill(shipmentId) → { documentUrl }
- generatePackingList(shipmentId) → { documentUrl }
- generateInvoice(shipmentId) → { documentUrl }
- getDocuments(shipmentId) → [Document]
- downloadDocument(documentId) → { fileStream }
```

**TrackingService** (`src/server/services/trackingService.js`)
```
- getShipmentLocation(shipmentId) → { lat, lng, lastUpdated }
- updateLocation(shipmentId, location) → { updated }
- getMilestoneStatus(shipmentId) → [Milestone]
- calculateETA(shipmentId) → { eta, confidence }
```

### 5.3 Core Business Logic

#### Capacity Engine (`src/core/capacityEngine.js`)

**Purpose:** Matches exporter cargo requirements with available container capacity.

**Algorithm: Slot Matching**
```
Input: { origin, destination, cargoType, requiredCBM, preferredDate }
Output: [MatchedSlot] sorted by relevance score

1. Query containers WHERE:
   - status IN ('available', 'partially_booked')
   - origin.city = requested origin
   - destination.port = requested destination
   - availableCBM >= requiredCBM
   - departureDate within ±3 days of preferredDate
   - cargoTypes INCLUDES requested cargoType

2. Calculate relevance score for each match:
   score = (priceWeight × normalizedPrice) +
           (dateWeight × dateProximity) +
           (capacityWeight × capacityFit) +
           (verificationWeight × transporterVerificationScore)
   
   Weights: price=0.35, date=0.30, capacity=0.20, verification=0.15

3. Sort by descending score
4. Return top 20 matches with pagination
```

#### ULIP Verification (`src/core/ulipVerification.js`)

**Purpose:** Verifies logistics partners using government APIs.

**Process Flow:**
```
1. Receive verification request (transporterId, vehicleNumber)
2. Check cache (Verification collection, < 24h old)
   - If cached and valid → return cached result
3. Parallel API calls:
   a. FASTag API: GET /fastag/vehicle/{vehicleNumber}
      → Extract: tag_status, recent_tolls, route_compliance
   b. VAHAN API: GET /vahan/rc/{vehicleNumber}
      → Extract: registration_valid, fitness_valid, insurance_valid
   c. LDB API: GET /ldb/transporter/{transporterId}
      → Extract: total_shipments, on_time_delivery_rate, credibility_score
4. Calculate overall verification score (0-100):
   score = (fastagValid ? 30 : 0) + (vahanValid ? 40 : 0) + (ldbScore × 0.3)
5. Determine status: score >= 70 → 'verified', score >= 40 → 'pending', else → 'failed'
6. Cache result with 24h TTL
7. Return { overallStatus, fastagStatus, vahanStatus, ldbScore }
```

#### Escrow Payment (`src/core/escrowPayment.js`)

**Milestone Distribution:**
```
Milestone 1: 'booked'     → 10% released to platform (booking confirmation fee)
Milestone 2: 'picked_up'  → 20% released to transporter
Milestone 3: 'in_transit'  → 20% released to transporter
Milestone 4: 'at_port'    → 25% released to transporter
Milestone 5: 'delivered'  → 25% released to transporter (final settlement)
```

**Release Logic:**
```
1. Receive milestone completion event (shipmentId, milestoneName)
2. Validate: currentMilestone can transition to milestoneName (sequential)
3. Verify milestone evidence:
   - 'picked_up': GPS confirms vehicle at pickup location
   - 'in_transit': FASTag toll record confirms highway entry
   - 'at_port': GPS confirms arrival at destination port
   - 'delivered': Exporter confirmation + POD upload
4. Update payment.milestones[milestoneName].status = 'released'
5. Trigger payment release via Razorpay Transfer API
6. Send notification to both parties
7. If all milestones released → payment.status = 'completed'
```

---

## 6. Interface Design

### 6.1 API Endpoints

#### Authentication APIs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/reset-password` | Request password reset | No |

#### Capacity APIs

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/capacity/slots` | List available LCL slots | Yes | Any |
| GET | `/api/capacity/slots/:id` | Get slot details | Yes | Any |
| POST | `/api/capacity/slots` | Add new capacity | Yes | Transporter |
| PUT | `/api/capacity/slots/:id` | Update capacity | Yes | Transporter |
| POST | `/api/capacity/book` | Book an LCL slot | Yes | Exporter |
| DELETE | `/api/capacity/book/:id` | Cancel booking | Yes | Exporter |

#### Payment APIs

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/payments/initiate` | Initiate escrow payment | Yes | Exporter |
| GET | `/api/payments/:id/status` | Get escrow status | Yes | Any |
| POST | `/api/payments/:id/release` | Release milestone | Yes | System/Admin |
| POST | `/api/payments/:id/dispute` | Raise payment dispute | Yes | Any |
| GET | `/api/payments/history` | Payment history | Yes | Any |

#### Shipment APIs

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/shipments` | List user shipments | Yes | Any |
| GET | `/api/shipments/:id` | Shipment details | Yes | Any |
| GET | `/api/shipments/:id/tracking` | Live tracking data | Yes | Any |
| PUT | `/api/shipments/:id/status` | Update shipment status | Yes | Transporter |

#### Document APIs

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/documents/generate` | Generate document | Yes | Exporter |
| GET | `/api/documents/shipment/:id` | List shipment docs | Yes | Any |
| GET | `/api/documents/:id/download` | Download document | Yes | Any |

#### Verification APIs

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/verify/vehicle` | Verify vehicle via ULIP | Yes | Admin |
| GET | `/api/verify/transporter/:id` | Get transporter verification | Yes | Any |

#### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-04-06T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid cargo dimensions",
    "details": [
      { "field": "dimensions.length", "message": "Must be a positive number" }
    ]
  },
  "timestamp": "2026-04-06T10:30:00.000Z"
}
```

### 6.2 External API Integrations

#### ULIP Integration Architecture

```
┌──────────────────────────────────────────────┐
│           ULIP Integration Layer              │
│           (src/core/ulipVerification.js)       │
│                                               │
│  ┌─────────────────┐                         │
│  │  ULIPClient      │ ← Axios instance       │
│  │  - baseURL       │    with retry logic     │
│  │  - apiKey        │    and timeout          │
│  │  - timeout: 10s  │                         │
│  └────────┬────────┘                         │
│           │                                   │
│  ┌────────┴────────────────────────────────┐ │
│  │                                          │ │
│  ▼              ▼              ▼            │ │
│ FASTag        VAHAN          LDB           │ │
│ Adapter       Adapter        Adapter       │ │
│ - getTolls()  - getRC()     - getScore()  │ │
│ - verify()    - verify()    - history()   │ │
│                                            │ │
│  └────────────────────────────────────────┘ │
│                                               │
│  ┌────────────────────────┐                  │
│  │  Cache Layer            │                  │
│  │  (MongoDB TTL index)   │                  │
│  │  - 24h expiry          │                  │
│  │  - per-vehicle cache   │                  │
│  └────────────────────────┘                  │
└──────────────────────────────────────────────┘
```

---

## 7. Detailed Design

### 7.1 Sequence Diagrams

#### Booking Flow Sequence

```
Exporter          React App          Express Server       Capacity Engine      MongoDB           Payment Service
   │                  │                    │                    │                  │                    │
   │  Click "Book"    │                    │                    │                  │                    │
   │─────────────────>│                    │                    │                  │                    │
   │                  │  POST /capacity/   │                    │                  │                    │
   │                  │  book              │                    │                  │                    │
   │                  │───────────────────>│                    │                  │                    │
   │                  │                    │  matchSlot()       │                  │                    │
   │                  │                    │───────────────────>│                  │                    │
   │                  │                    │                    │  find Container  │                    │
   │                  │                    │                    │─────────────────>│                    │
   │                  │                    │                    │  Container data  │                    │
   │                  │                    │                    │<─────────────────│                    │
   │                  │                    │  slotMatch result  │                  │                    │
   │                  │                    │<───────────────────│                  │                    │
   │                  │                    │                    │                  │                    │
   │                  │                    │  Create Shipment   │                  │                    │
   │                  │                    │──────────────────────────────────────>│                    │
   │                  │                    │  Shipment created  │                  │                    │
   │                  │                    │<──────────────────────────────────────│                    │
   │                  │                    │                    │                  │                    │
   │                  │                    │  initiateEscrow()  │                  │                    │
   │                  │                    │─────────────────────────────────────────────────────────>│
   │                  │                    │  Escrow initiated + Razorpay order   │                    │
   │                  │                    │<─────────────────────────────────────────────────────────│
   │                  │                    │                    │                  │                    │
   │                  │  { shipment,       │                    │                  │                    │
   │                  │    payment,        │                    │                  │                    │
   │                  │    razorpayOrder } │                    │                  │                    │
   │                  │<───────────────────│                    │                  │                    │
   │  Booking         │                    │                    │                  │                    │
   │  Confirmation    │                    │                    │                  │                    │
   │<─────────────────│                    │                    │                  │                    │
```

#### ULIP Verification Sequence

```
Admin/System      Express Server      ULIP Verification     FASTag API    VAHAN API     LDB API      MongoDB
    │                  │                    │                    │            │             │             │
    │  POST /verify/   │                    │                    │            │             │             │
    │  vehicle         │                    │                    │            │             │             │
    │─────────────────>│                    │                    │            │             │             │
    │                  │  verifyVehicle()   │                    │            │             │             │
    │                  │───────────────────>│                    │            │             │             │
    │                  │                    │  Check cache       │            │             │             │
    │                  │                    │────────────────────────────────────────────────────────────>│
    │                  │                    │  Cache miss        │            │             │             │
    │                  │                    │<────────────────────────────────────────────────────────────│
    │                  │                    │                    │            │             │             │
    │                  │                    │  ┌─── Parallel ───┐│            │             │             │
    │                  │                    │  │GET /fastag/... ││            │             │             │
    │                  │                    │──┤────────────────>│            │             │             │
    │                  │                    │  │GET /vahan/...  ││            │             │             │
    │                  │                    │──┤─────────────────────────────>│             │             │
    │                  │                    │  │GET /ldb/...    ││            │             │             │
    │                  │                    │──┤──────────────────────────────────────────>│             │
    │                  │                    │  └────────────────┘│            │             │             │
    │                  │                    │  FASTag Response   │            │             │             │
    │                  │                    │<───────────────────│            │             │             │
    │                  │                    │  VAHAN Response    │            │             │             │
    │                  │                    │<──────────────────────────────-│             │             │
    │                  │                    │  LDB Response      │            │             │             │
    │                  │                    │<─────────────────────────────────────────────│             │
    │                  │                    │                    │            │             │             │
    │                  │                    │  Calculate Score   │            │             │             │
    │                  │                    │  Cache result (24h)│            │             │             │
    │                  │                    │────────────────────────────────────────────────────────────>│
    │                  │                    │                    │            │             │             │
    │                  │  { overallStatus,  │                    │            │             │             │
    │                  │    score, details }│                    │            │             │             │
    │                  │<───────────────────│                    │            │             │             │
    │  Verification    │                    │                    │            │             │             │
    │  Result          │                    │                    │            │             │             │
    │<─────────────────│                    │                    │            │             │             │
```

### 7.2 State Charts

#### Shipment Status State Machine

```
                    ┌──────────┐
                    │  BOOKED  │
                    └────┬─────┘
                         │ Transporter confirms pickup
                         ▼
                    ┌──────────┐
          ┌─────── │PICKED_UP │
          │        └────┬─────┘
          │             │ Vehicle on highway (FASTag)
          │             ▼
          │        ┌──────────┐
          │        │IN_TRANSIT│
          │        └────┬─────┘
          │             │ GPS: arrived at port
          │             ▼
          │        ┌──────────┐
          │        │ AT_PORT  │
          │        └────┬─────┘
          │             │ Delivery confirmed + POD
          │             ▼
          │        ┌──────────┐
          │        │DELIVERED │ (terminal)
          │        └──────────┘
          │
          │ Cancel request (at any stage before DELIVERED)
          ▼
     ┌──────────┐
     │CANCELLED │ (terminal)
     └──────────┘
```

#### Payment Escrow State Machine

```
     ┌───────────┐
     │ INITIATED │ ── Exporter pays full amount
     └─────┬─────┘
           │
           ▼
     ┌───────────┐         ┌──────────────┐
     │ IN_ESCROW │────────>│ MILESTONE    │
     └───────────┘         │ RELEASED     │
           │               │ (partial)    │
           │               └──────┬───────┘
           │                      │ (repeat for each milestone)
           │                      │
           │               ┌──────▼───────┐
           │               │  COMPLETED   │ (all milestones released)
           │               └──────────────┘
           │
           │ Dispute raised
           ▼
     ┌───────────┐
     │ DISPUTED  │──── Resolution ──→ Resume releases OR Refund
     └───────────┘
           │
           ▼
     ┌───────────┐
     │ REFUNDED  │ (terminal, if dispute favors exporter)
     └───────────┘
```

### 7.3 Class Diagram

```
┌──────────────────────────────┐
│           User               │
├──────────────────────────────┤
│ - _id: ObjectId              │
│ - name: String               │
│ - email: String              │
│ - passwordHash: String       │
│ - role: UserRole             │
│ - mobileNumber: String       │
│ - businessName: String       │
│ - gstNumber: String          │
│ - subscriptionTier: Tier     │
├──────────────────────────────┤
│ + register(): User           │
│ + login(): Token             │
│ + updateProfile(): User      │
│ + getProfile(): User         │
└──────────────┬───────────────┘
               │ 1
               │
        ┌──────┴──────┐
        │             │
        ▼ *           ▼ *
┌──────────────┐  ┌───────────────┐
│  Container   │  │   Shipment    │
├──────────────┤  ├───────────────┤
│- totalCBM    │  │- bookingId    │
│- availableCBM│  │- cargo        │
│- pricePerCBM │  │- status       │
│- departureDate│  │- price        │
│- status      │  │- tracking     │
├──────────────┤  ├───────────────┤
│+ addCapacity │  │+ book()       │
│+ updateCBM() │  │+ updateStatus│
│+ getAvailable│  │+ cancel()    │
└──────────────┘  └──────┬────────┘
                         │ 1
                    ┌────┴────┐
                    │         │
                    ▼ 1       ▼ *
              ┌─────────┐  ┌──────────┐
              │ Payment │  │ Document │
              ├─────────┤  ├──────────┤
              │-amount  │  │- type    │
              │-milestones│ │- fileUrl │
              │-status  │  │- data    │
              ├─────────┤  ├──────────┤
              │+initiate│  │+generate │
              │+release │  │+download │
              │+dispute │  └──────────┘
              └─────────┘
                    
┌─────────────────────┐
│   Verification      │
├─────────────────────┤
│ - vehicleNumber     │
│ - fastagStatus      │
│ - vahanStatus       │
│ - ldbScore          │
│ - overallStatus     │
├─────────────────────┤
│ + verifyVehicle()   │
│ + checkCache()      │
│ + calculateScore()  │
└─────────────────────┘
```

---

## 8. Design Decisions and Rationale

| Decision | Rationale |
|----------|-----------|
| **3-Tier Monolith** over Microservices | Simpler deployment and debugging for a 2-person team; modular internal structure allows future decomposition |
| **MongoDB** over PostgreSQL | Flexible schemas suit varied logistics data; native JSON handling aligns with Node.js ecosystem; MongoDB Atlas offers generous free tier |
| **JWT** over Session-based Auth | Stateless authentication suits REST API design; simpler scaling; no server-side session storage needed |
| **React Context** over Redux | Sufficient for app's state complexity; reduces boilerplate; team familiarity with React hooks |
| **Milestone Escrow** over Direct Payment | Protects both parties; builds trust in marketplace; aligns with logistics industry practice of staged payments |
| **24h Verification Cache** | Balances freshness of ULIP data with API rate limits; vehicle details don't change frequently |
| **Vite** over Create React App | Faster dev server with HMR; better build performance; CRA is officially deprecated |
| **Vercel** deployment | Native React/Node.js support; automatic preview deploys; free tier sufficient for academic project |

---

*Last Updated: April 2026*  
*Authors: BharatLCL Development Team*
