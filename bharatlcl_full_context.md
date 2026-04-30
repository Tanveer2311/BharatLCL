# BharatLCL — Project Context & Mega-Prompt

**Project Name:** BharatLCL — Digital Logistics Marketplace for Indian MSMEs
**Purpose:** A real-time LCL (Less than Container Load) logistics marketplace solving freight consolidation inefficiencies for small Indian exporters on the Jaipur-Mundra corridor.

This document contains the COMPLETE technical and business context of the BharatLCL project, including detailed requirements, tech stack, system architecture, data models, and core logic. Use this document when starting a new chat to bring the agent fully up to speed.

---

## 1. Project Overview & Problem Statement
India's MSMEs lose 20-35% on dead-freight costs due to FCL (Full Container Load) requirements. Wait times are long, processes are manual. BharatLCL solves this by:
- Creating a real-time capacity discovery marketplace for LCL container space.
- Integrating with government ULIP APIs for trust and verification.
- Enforcing milestone-based escrow payments.

## 2. Tech Stack
- **Frontend:** React 18 + Vite, CSS3, Context API (deployed on Vercel)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens), bcrypt
- **External Integrations:** ULIP APIs (FASTag, VAHAN, LDB), Razorpay, Nodemailer

## 3. System Architecture
**Type:** 3-Tier Monolithic (Modular Services)
- **Presentation Tier:** React SPA (Dashboard, Booking, Tracking, Auth components).
- **Application Tier:** Express APIs divided into Routes -> Services -> Core Business Logic -> Models. Core features isolated logically (`capacityEngine.js`, `ulipVerification.js`, `escrowPayment.js`, `trackingService.js`).
- **Data Tier:** MongoDB Atlas with Mongoose.

---

## 4. Specific Functional Requirements (FR) - Must-Have Features

| FR Code | Feature Name | Description & Rules |
|---------|-------------|---------------------|
| **FR1** | Real-Time Capacity Discovery | Dashboard for LCL slots. Filter by date/cargo/price/CBM. Instant capacity deduction upon booking. Cargo dimensions calculated in CBM. |
| **FR2** | ULIP Verification | Verify transporters via VAHAN (RC/vehicle valid), FASTag (toll routing), and LDB (logistics tracking). Generates an overall credibility score. |
| **FR3** | Escrow Payments | 5 payment milestones: Booked (10%), Picked Up (20%), In-Transit (20%), Port Arrival (25%), Delivered (25%). Funds released automatically based on verification (GPS/FASTag). |
| **FR4** | Automated Documentation | Auto-generation of Shipping Bills, Packing Lists, and Commercial Invoices in PDF based on booking/profile data. |
| **FR5** | Shipment Tracking | GPS-based live tracking integrated with ULIP LDB. SMS/in-app milestone alerts and ETA calculations. |
| **FR6** | Auth & Roles | JWT-based auth. 3 roles: Exporter (book/track), Transporter (list capacity), Admin (monitor). |

---

## 5. Database Schema Structure (MongoDB / Mongoose)

- **User**: `email`, `passwordHash`, `role` (exporter/transporter/admin), `gstNumber`, `subscriptionTier` (aaram/tez).
- **Container (Capacity)**: `transporterId`, `availableCBM`, `totalCBM`, `pricePerCBM`, `origin`/`destination`, `departureDate`, `status`.
- **Shipment (Booking)**: `exporterId`, `transporterId`, `containerId`, `cargo` (dimensions, weight, cbm), `status` (booked/picked_up/in_transit/at_port/delivered), `tracking` metrics.
- **Payment (Escrow)**: `shipmentId`, `milestones` array (percentage, status), `currentMilestone`, `totalAmount`, `razorpayOrderId`.
- **Document**: `shipmentId`, `type`, `fileUrl`.
- **Verification**: `transporterId`, `vehicleNumber`, `fastagStatus`, `vahanStatus`, `overallStatus`.

---

## 6. Core Business Logic Implementation Details

### A. Capacity Matching Engine
When an exporter searches for slots:
1. Query available containers matching origin/port, date windows, and sufficient `availableCBM`.
2. Compute relevance score based on Price (35%), Date proximity (30%), Capacity fit (20%), Transporter Verification Score (15%). 
3. Return ranked slots.

### B. ULIP Validation Engine
Validating a logistics partner:
- Hits `VAHAN API` for RC, Insurance, Fitness.
- Hits `FASTag API` for location and toll history.
- Hits `LDB API` for historical shipping performance.
- Calculation: Total Score = (FASTag ? 30 : 0) + (VAHAN ? 40 : 0) + LDB_Score_Weight(30%). Pass mark is >= 70 (`verified`).

### C. Escrow Milestone Releases
- Milestone progression is strictly sequential.
- Progression triggers: 
  - `picked_up`: Requires GPS lock at exporter address.
  - `in_transit`: Requires FASTag toll checkpoint hit. 
  - `at_port`: Requires destination GPS lock.
  - `delivered`: Requires recipient proof of delivery (POD).
- Funds transferred to transporter via Razorpay Route/Transfers API.

---

## 7. Frontend Structure
- Context Providers state management (No Redux).
- Clean `src/client/pages/` split: `Dashboard`, `CapacityDiscovery`, `ShipmentTracking`, `Payments`, `Documents`.
- Shared UI components: `SlotCard`, `MilestoneTimeline`, `TrackingMap`.

## 8. Development Logistics
- Code resides in `src/client`, `src/server`, and `src/core`.
- REST endpoints map logic (e.g., `POST /api/capacity/book`). 
- **Start command:** `npm run dev` kicks off `nodemon src/main.js` and Vite.
