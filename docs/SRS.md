# Software Requirements Specification (SRS)

## BharatLCL — Digital Logistics Marketplace for Indian MSMEs

**Document Version:** 1.0  
**Date:** April 2026  
**Standard:** IEEE 830-1998 (IEEE Recommended Practice for Software Requirements Specifications)

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Purpose](#11-purpose)
   - 1.2 [Scope](#12-scope)
   - 1.3 [Definitions, Acronyms, and Abbreviations](#13-definitions-acronyms-and-abbreviations)
   - 1.4 [References](#14-references)
   - 1.5 [Overview](#15-overview)
2. [Overall Description](#2-overall-description)
   - 2.1 [Product Perspective](#21-product-perspective)
   - 2.2 [Product Functions](#22-product-functions)
   - 2.3 [User Characteristics](#23-user-characteristics)
   - 2.4 [Constraints](#24-constraints)
   - 2.5 [Assumptions and Dependencies](#25-assumptions-and-dependencies)
3. [Specific Requirements](#3-specific-requirements)
   - 3.1 [Functional Requirements](#31-functional-requirements)
   - 3.2 [Non-Functional Requirements](#32-non-functional-requirements)
   - 3.3 [External Interface Requirements](#33-external-interface-requirements)
4. [Appendices](#4-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of all requirements for the BharatLCL digital logistics marketplace platform. It is intended for the development team, project stakeholders, academic evaluators, and potential MSME users. This document follows the IEEE 830-1998 standard for software requirements specifications.

### 1.2 Scope

**BharatLCL** is a web-based logistics marketplace that enables small Indian exporters (MSMEs) to discover, book, and manage Less than Container Load (LCL) shipments. The platform targets the Jaipur-Mundra export corridor, focusing on textile, handicraft, and stone product verticals.

The system will:
- Provide real-time visibility into available container capacity
- Integrate with India's ULIP (Unified Logistics Interface Platform) for partner verification
- Implement milestone-based escrow payments for secure transactions
- Auto-generate shipping documentation (bills, packing lists, customs declarations)
- Offer shipment tracking with real-time notifications

The system will **not**:
- Handle physical logistics operations (warehousing, transportation)
- Process customs clearance directly (generates documents only)
- Support international payment currencies in v1.0

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|-----------|
| **LCL** | Less than Container Load — a shipping method where cargo from multiple shippers is consolidated into a single container |
| **FCL** | Full Container Load — a shipping method where one shipper fills an entire container |
| **MSME** | Micro, Small, and Medium Enterprises |
| **ULIP** | Unified Logistics Interface Platform — Government of India's API platform for logistics data exchange |
| **FASTag** | Electronic toll collection system used on Indian highways |
| **VAHAN** | Government vehicle registration database |
| **LDB** | Logistics Data Bank — NICDC's logistics tracking platform |
| **ICD** | Inland Container Depot |
| **CFS** | Container Freight Station |
| **CBM** | Cubic Meter — standard unit for LCL cargo measurement |
| **JWT** | JSON Web Token — standard for secure authentication |
| **MERN** | MongoDB, Express.js, React, Node.js — technology stack |

### 1.4 References

1. IEEE 830-1998: IEEE Recommended Practice for Software Requirements Specifications
2. ULIP API Documentation — https://ulip.gov.in
3. VAHAN API Documentation — Ministry of Road Transport & Highways
4. FASTag Integration Guide — NPCI/NHAI
5. MongoDB Documentation — https://docs.mongodb.com
6. Express.js Documentation — https://expressjs.com

### 1.5 Overview

The remainder of this document is organized as follows: Section 2 provides a general description of the product including its context, functions, user profiles, and constraints. Section 3 details all specific functional and non-functional requirements. Section 4 contains supplementary appendices.

---

## 2. Overall Description

### 2.1 Product Perspective

BharatLCL is a **new, self-contained web application** designed to fill the gap in India's LCL logistics ecosystem. Currently, MSMEs rely on:

- **Manual processes**: Phone calls, WhatsApp messages, and physical visits to freight forwarders
- **Broker intermediaries**: 2-3 layers of middlemen adding 15-30% to shipping costs
- **Fragmented information**: No centralized platform for LCL capacity visibility

BharatLCL sits between exporters and logistics providers as a digital marketplace:

```
MSME Exporters ←→ [BharatLCL Platform] ←→ Logistics Providers
                         ↕
                   [ULIP APIs]
              (FASTag, VAHAN, LDB)
```

**System Context Diagram:**

The platform interfaces with:
- **Users** (via web browser): Exporters, Transporters, Admin
- **ULIP APIs** (external): Vehicle verification, logistics tracking
- **Payment Gateway** (external): Razorpay for escrow transactions
- **MongoDB Atlas** (cloud database): Persistent data storage
- **Notification Services** (external): SMS and email notifications

### 2.2 Product Functions

The major functions of BharatLCL include:

1. **User Registration & Authentication**
   - Role-based signup (Exporter / Transporter)
   - JWT-based session management
   - Profile management with KYC details

2. **Capacity Discovery & Booking**
   - Real-time LCL slot availability dashboard
   - Search and filter by corridor, date, cargo type, and price
   - Instant booking with capacity reservation

3. **Partner Verification (ULIP)**
   - FASTag-based vehicle tracking verification
   - VAHAN-based vehicle registration validation
   - LDB-based logistics partner credibility check

4. **Escrow Payment Management**
   - Milestone-based fund holding and release
   - Payment at 5 checkpoints: Booking → Pickup → In-Transit → Port Arrival → Delivery
   - Dispute resolution workflow

5. **Document Generation**
   - Auto-fill shipping bills from user profile and booking data
   - Generate packing lists, commercial invoices
   - Export documents in PDF format

6. **Shipment Tracking**
   - Real-time GPS-based tracking (via ULIP LDB integration)
   - Milestone notifications (SMS + in-app)
   - Estimated time of arrival (ETA) calculations

7. **Analytics & Reporting**
   - Cost savings dashboard for exporters
   - Shipment history and performance analytics
   - Corridor-level demand/supply metrics (Admin)

### 2.3 User Characteristics

| User Type | Technical Proficiency | Frequency of Use | Primary Goals |
|-----------|----------------------|-------------------|---------------|
| **MSME Exporter** | Low to Medium (smartphone-literate, may not be tech-savvy) | 2-5 times/month | Find affordable LCL slots, track shipments, get documents |
| **Logistics Transporter** | Medium (familiar with logistics software) | Daily | List available capacity, manage bookings, receive payments |
| **Platform Admin** | High (technical staff) | Daily | Monitor platform health, resolve disputes, manage users |

### 2.4 Constraints

1. **Regulatory**: Must comply with Indian IT Act 2000 and data localization norms
2. **Network**: Must function on 3G/4G networks common in Indian MSME clusters
3. **Language**: v1.0 supports English only; Hindi and regional language support planned for v2.0
4. **Integration**: Dependent on ULIP API availability and rate limits
5. **Payment**: Escrow implementation subject to RBI payment aggregator guidelines
6. **Academic**: Project must be completed within the academic semester timeline
7. **Team Size**: Limited to 2 developers affecting scope and feature depth

### 2.5 Assumptions and Dependencies

**Assumptions:**
- Users have access to modern web browsers (Chrome 90+, Firefox 88+, Safari 14+)
- ULIP APIs will remain available and free for educational/startup use
- MongoDB Atlas free tier provides sufficient storage for MVP data
- Vercel free tier supports the expected traffic for academic demonstration

**Dependencies:**
- ULIP API availability for FASTag, VAHAN, and LDB verification
- Razorpay sandbox environment for payment processing demonstration
- MongoDB Atlas cloud service for database hosting
- Vercel platform for frontend deployment

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### FR1: Real-Time Capacity Discovery

| Attribute | Description |
|-----------|-------------|
| **ID** | FR1 |
| **Title** | Real-Time Capacity Discovery |
| **Priority** | High (P1) |
| **Description** | The system shall display a live dashboard showing available LCL container capacity on the Jaipur-Mundra corridor |

**Detailed Requirements:**

- **FR1.1**: The system shall display available container slots with the following details: origin, destination, available CBM, price per CBM, departure date, and transporter name
- **FR1.2**: The system shall allow users to filter slots by date range, cargo type (textile/handicraft/stone), price range, and minimum available CBM
- **FR1.3**: The system shall update capacity availability in real-time (within 30-second refresh cycles)
- **FR1.4**: The system shall allow exporters to book a slot by specifying their cargo dimensions (length × width × height) and weight
- **FR1.5**: Upon booking, the system shall immediately reduce the available capacity for that container slot

#### FR2: ULIP-Integrated Verification

| Attribute | Description |
|-----------|-------------|
| **ID** | FR2 |
| **Title** | ULIP Verification Integration |
| **Priority** | High (P1) |
| **Description** | The system shall verify logistics partners and vehicles through government ULIP APIs |

**Detailed Requirements:**

- **FR2.1**: The system shall verify vehicle registration details via VAHAN API using vehicle registration number
- **FR2.2**: The system shall check FASTag toll history to verify vehicle route compliance
- **FR2.3**: The system shall query LDB for transporter credibility and shipment history
- **FR2.4**: The system shall display a verification badge (Verified/Unverified/Pending) on transporter profiles
- **FR2.5**: The system shall cache verification results for 24 hours to minimize API calls

#### FR3: Milestone-Based Escrow Payments

| Attribute | Description |
|-----------|-------------|
| **ID** | FR3 |
| **Title** | Milestone-Based Escrow Payment System |
| **Priority** | High (P1) |
| **Description** | The system shall hold payment in escrow and release funds at verified milestones |

**Detailed Requirements:**

- **FR3.1**: The system shall collect full payment from the exporter at booking confirmation
- **FR3.2**: The escrow system shall define 5 milestones: Booked (10%), Picked Up (20%), In-Transit (20%), Port Arrival (25%), Delivered (25%)
- **FR3.3**: Milestone completion shall be verified by transporter confirmation + GPS location validation
- **FR3.4**: The system shall automatically release the milestone payment within 2 hours of verification
- **FR3.5**: The system shall provide a dispute mechanism if a milestone is contested, with 48-hour resolution SLA
- **FR3.6**: The system shall send payment receipt notifications at each milestone via email and SMS

#### FR4: Automated Documentation

| Attribute | Description |
|-----------|-------------|
| **ID** | FR4 |
| **Title** | Automated Shipping Documentation Generator |
| **Priority** | Medium (P2) |
| **Description** | The system shall auto-generate export shipping documents from booking and profile data |

**Detailed Requirements:**

- **FR4.1**: The system shall generate shipping bills with pre-filled exporter details (IEC code, GSTIN, address)
- **FR4.2**: The system shall create packing lists based on cargo dimensions and booking details
- **FR4.3**: The system shall produce commercial invoices with item descriptions, quantities, and FOB values
- **FR4.4**: All generated documents shall be downloadable in PDF format
- **FR4.5**: The system shall maintain a document history for each shipment accessible to the exporter

#### FR5: Shipment Tracking

| Attribute | Description |
|-----------|-------------|
| **ID** | FR5 |
| **Title** | Real-Time Shipment Tracking |
| **Priority** | Medium (P2) |
| **Description** | The system shall provide GPS-based shipment tracking with milestone notifications |

**Detailed Requirements:**

- **FR5.1**: The system shall display shipment location on a map interface
- **FR5.2**: The system shall send SMS/in-app notifications at each milestone (pickup, in-transit checkpoints, port arrival, delivery)
- **FR5.3**: The system shall calculate and display estimated time of arrival (ETA)
- **FR5.4**: Tracking data shall be updated every 15 minutes via ULIP LDB integration

#### FR6: User Authentication & Authorization

| Attribute | Description |
|-----------|-------------|
| **ID** | FR6 |
| **Title** | Authentication and Role-Based Access Control |
| **Priority** | High (P1) |
| **Description** | The system shall implement secure JWT authentication with role-based access |

**Detailed Requirements:**

- **FR6.1**: Users shall register with email, mobile number, business name, GST number, and role (Exporter/Transporter)
- **FR6.2**: The system shall authenticate users via email/password with JWT tokens (expiry: 24 hours)
- **FR6.3**: The system shall enforce role-based access: Exporters can book/track, Transporters can list/manage capacity, Admins can manage all entities
- **FR6.4**: The system shall support password reset via email OTP
- **FR6.5**: The system shall hash all passwords using bcrypt with minimum 10 salt rounds

#### FR7: Analytics Dashboard

| Attribute | Description |
|-----------|-------------|
| **ID** | FR7 |
| **Title** | Analytics and Reporting Dashboard |
| **Priority** | Low (P3) |
| **Description** | The system shall provide cost savings and performance analytics |

- **FR7.1**: Exporters shall see a dashboard with: total shipments, average cost per CBM, total savings vs. broker rates
- **FR7.2**: The dashboard shall display shipment history with status, dates, and costs
- **FR7.3**: Admin shall see corridor-level metrics: demand trends, capacity utilization, active users

#### FR8: Subscription Tier Management

| Attribute | Description |
|-----------|-------------|
| **ID** | FR8 |
| **Title** | Subscription Plans (Aaram / Tez) |
| **Priority** | Low (P3) |
| **Description** | The system shall offer tiered subscription plans |

- **FR8.1**: **Aaram (Free)**: 3 bookings/month, standard support, basic analytics
- **FR8.2**: **Tez (Premium — ₹999/month)**: Unlimited bookings, priority matching, advanced analytics, dedicated support
- **FR8.3**: The system shall manage subscription status and enforce tier limits

### 3.2 Non-Functional Requirements

#### NFR1: Performance

- **NFR1.1**: API response time shall be < 500ms for 95th percentile requests
- **NFR1.2**: Dashboard page load time shall be < 3 seconds on 4G networks
- **NFR1.3**: The system shall support at least 100 concurrent users without degradation

#### NFR2: Security

- **NFR2.1**: All data in transit shall be encrypted via HTTPS (TLS 1.2+)
- **NFR2.2**: Passwords shall be hashed using bcrypt (minimum 10 salt rounds)
- **NFR2.3**: JWTs shall expire after 24 hours and support refresh token rotation
- **NFR2.4**: API endpoints shall be protected against SQL injection and XSS via input sanitization
- **NFR2.5**: Sensitive environment variables shall never be committed to version control

#### NFR3: Reliability & Availability

- **NFR3.1**: The system shall target 99% uptime during demonstration period
- **NFR3.2**: Database backups shall be configured via MongoDB Atlas automated backups
- **NFR3.3**: The system shall gracefully handle ULIP API downtime with cached data fallback

#### NFR4: Usability

- **NFR4.1**: The UI shall be responsive and usable on mobile devices (320px to 1920px viewport)
- **NFR4.2**: The system shall provide clear error messages for all user-facing failures
- **NFR4.3**: Key user flows (registration, booking, tracking) shall be completable in ≤ 5 clicks

#### NFR5: Maintainability

- **NFR5.1**: Code shall follow ESLint standard configuration
- **NFR5.2**: All API endpoints shall be documented in-code with JSDoc comments
- **NFR5.3**: Component structure shall follow separation of concerns (routes → services → models)

### 3.3 External Interface Requirements

#### 3.3.1 User Interfaces

- Responsive web application accessible via modern browsers
- Dashboard-centric design with card-based layout
- Navigation: Sidebar menu for authenticated users, top nav for public pages
- Color scheme: Professional blues and whites with accent green for CTA buttons

#### 3.3.2 Hardware Interfaces

- No direct hardware interfaces; the system is fully web-based
- Compatible with standard computing devices (desktop, laptop, tablet, smartphone)

#### 3.3.3 Software Interfaces

| External System | Interface Type | Purpose |
|----------------|---------------|---------|
| MongoDB Atlas | Database Driver (Mongoose) | Data persistence and retrieval |
| ULIP - FASTag API | RESTful API (HTTPS) | Vehicle toll payment verification |
| ULIP - VAHAN API | RESTful API (HTTPS) | Vehicle registration verification |
| ULIP - LDB API | RESTful API (HTTPS) | Logistics tracking and transporter verification |
| Razorpay | Payment Gateway API | Escrow payment processing |
| Nodemailer | SMTP | Email notifications |

#### 3.3.4 Communication Interfaces

- **Protocol**: HTTPS (TLS 1.2+) for all client-server communication
- **API Format**: JSON over REST
- **WebSocket**: For real-time capacity updates (future enhancement)

---

## 4. Appendices

### Appendix A: Use Case Diagram Reference

See [`docs/diagrams/use-case-diagram.png`](diagrams/) for the complete use case diagram.

### Appendix B: Data Dictionary

| Entity | Key Attributes |
|--------|---------------|
| **User** | _id, name, email, passwordHash, role, gstNumber, mobileNumber, subscriptionTier, createdAt |
| **Shipment** | _id, exporterId, transporterId, origin, destination, cargoDimensions, cargoWeight, cargoType, status, price, bookedAt |
| **Container** | _id, transporterId, origin, destination, totalCBM, availableCBM, departureDate, pricePerCBM, status |
| **Payment** | _id, shipmentId, amount, milestones[], currentMilestone, status, razorpayOrderId |
| **Document** | _id, shipmentId, type (shippingBill/packingList/invoice), fileUrl, generatedAt |
| **Verification** | _id, transporterId, vehicleNumber, fastagStatus, vahanStatus, ldbScore, verifiedAt |

### Appendix C: Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | April 2026 | BharatLCL Team | Initial SRS document |
