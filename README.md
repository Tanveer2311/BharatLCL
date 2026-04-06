<div align="center">

# 🚛 BharatLCL — Digital Logistics Marketplace for Indian MSMEs

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/BharatLCL/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/BharatLCL/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deployment](https://img.shields.io/badge/Live-Vercel-black?logo=vercel)](https://bharatlcl.vercel.app)

**A real-time LCL (Less than Container Load) logistics marketplace solving freight consolidation inefficiencies for small Indian exporters.**

🔗 **Live Demo:** [https://bharatlcl.vercel.app](https://bharatlcl.vercel.app)

</div>

---

## 📌 Project Objective

### Real-World Problem Statement

India's 63 million+ MSMEs contribute ~45% of manufacturing output, yet **small exporters lose 20-35% on dead-freight costs** due to inability to fill full containers (FCL). The LCL (Less than Container Load) ecosystem remains fragmented, manual, and broker-dependent — forcing exporters in clusters like Jaipur (textiles, handicrafts, stone) to either:

- **Overpay** for partial container shipments through intermediaries
- **Wait weeks** to accumulate enough cargo, missing market windows
- **Accept opaque pricing** with no visibility into consolidation logistics

### Design Thinking Connection

| Stage | Insight |
|-------|---------|
| **Empathize** | Field interviews with 25+ Jaipur-based MSME exporters revealed 3 core pain points: high dead-freight costs (₹15K-₹40K/shipment wasted), fully manual booking processes (phone/WhatsApp-based), and complete broker dependency with zero price transparency |
| **Define** | MSMEs need a **transparent, real-time platform** to discover available container capacity, verify logistics partners, and pay securely — without intermediary markup |
| **Ideate** | Combine real-time capacity marketplace + government ULIP verification APIs + milestone-based escrow payments into a single unified platform |
| **Prototype** | Built functional MVP covering Jaipur → Mundra corridor with core booking, verification, and payment flows |
| **Test** | Validated with 5 MSME exporters; iterated on dashboard UX and pricing transparency features |

---

## ✨ Features Implemented

| # | Feature | Functional Requirement | Description |
|---|---------|----------------------|-------------|
| 1 | **Real-Time Capacity Discovery** | FR1 | Live dashboard showing available LCL slots across the Jaipur-Mundra corridor with instant price quotes and space visualization |
| 2 | **ULIP-Integrated Verification** | FR2 | Partner verification using FASTag, VAHAN, and Logistics Data Bank (LDB) APIs via India's Unified Logistics Interface Platform |
| 3 | **Milestone-Based Escrow Payments** | FR3 | Secure payment system releasing funds at verified checkpoints (booking → pickup → in-transit → port arrival → delivery) |
| 4 | **Automated Documentation** | FR4 | Auto-generation of shipping bills, packing lists, and customs declarations with pre-filled MSME details |
| 5 | **Shipment Tracking** | FR5 | Real-time GPS-based tracking with milestone notifications via SMS and in-app alerts |
| 6 | **User Auth & Role Management** | FR6 | JWT-based authentication with role-based access (Exporter, Transporter, Admin) |
| 7 | **Analytics Dashboard** | FR7 | Cost savings calculator, shipment history, and corridor performance metrics for exporters |
| 8 | **Subscription Tiers** | FR8 | Aaram (free, limited) and Tez (premium, priority matching) subscription models |

---

## 🛠️ Tech Stack

### Core Technologies (MERN Stack)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Single-page application with responsive UI |
| **Backend** | Node.js + Express.js | RESTful API server with middleware architecture |
| **Database** | MongoDB Atlas | NoSQL document store for flexible logistics data |
| **Authentication** | JSON Web Tokens (JWT) | Stateless auth with role-based access control |
| **State Management** | React Context API | Lightweight global state for auth & app data |
| **Styling** | CSS3 + Responsive Design | Mobile-first, accessible interface design |
| **Deployment** | Vercel (Frontend) | CI/CD with automatic preview deploys |

### CASE & Design Tools

| Tool | Usage |
|------|-------|
| Draw.io | UML diagrams (Class, Sequence, State Charts, Use Case) |
| StarUML | Architecture diagrams and component modeling |
| Figma | UI/UX wireframes and prototypes |
| Postman | API testing and documentation |
| MongoDB Compass | Database visualization and query debugging |

### AI Tools Used

| Tool | Usage |
|------|-------|
| GitHub Copilot | Code autocompletion and boilerplate generation |
| ChatGPT (GPT-4) | Requirements analysis, documentation drafting, debugging assistance |
| Claude AI | Architecture review and code quality feedback |

---

## 🏗️ System Architecture

### Architecture Type: 3-Tier Monolithic (Modular)

BharatLCL follows a **3-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION TIER                      │
│          React 18 + Vite (SPA)                          │
│   ┌──────────┬──────────┬──────────┬──────────┐         │
│   │Dashboard │ Booking  │ Tracking │  Admin   │         │
│   │Component │Component │Component │Component │         │
│   └──────────┴──────────┴──────────┴──────────┘         │
├─────────────────────────────────────────────────────────┤
│                   APPLICATION TIER                       │
│          Node.js + Express.js (REST API)                │
│   ┌──────────┬──────────┬──────────┬──────────┐         │
│   │Auth      │Capacity  │Payment   │Document  │         │
│   │Service   │Service   │Service   │Service   │         │
│   └──────────┴──────────┴──────────┴──────────┘         │
│          ┌──────────────────────────┐                    │
│          │  ULIP Integration Layer  │                    │
│          │  (FASTag/VAHAN/LDB)      │                    │
│          └──────────────────────────┘                    │
├─────────────────────────────────────────────────────────┤
│                     DATA TIER                            │
│          MongoDB Atlas (Cloud)                          │
│   ┌──────────┬──────────┬──────────┬──────────┐         │
│   │Users     │Shipments │Payments  │Documents │         │
│   │Collection│Collection│Collection│Collection│         │
│   └──────────┴──────────┴──────────┴──────────┘         │
└─────────────────────────────────────────────────────────┘
```

> Architecture diagram also available as image: see [`docs/diagrams/architecture.png`](docs/diagrams/)

---

## 👥 Individual Contribution Summary

### Team Members

| # | Name | Role | GitHub Handle |
|---|------|------|---------------|
| 1 | **Tanveer Kanderia** | Full-Stack Lead (Frontend-focused) | [@member1](https://github.com/member1) |
| 2 | **Karan Morya** | Full-Stack Developer (Backend-focused) | [@member2](https://github.com/member2) |

### Module-Wise Breakdown

| Module | Owner | Effort % | Key Files |
|--------|-------|----------|-----------|
| **UI/UX & Frontend Components** | Member 1 | 55% | `src/client/components/`, `src/client/pages/` |
| **Dashboard & Analytics** | Member 1 | 50% | `src/client/pages/Dashboard.jsx`, `src/client/components/Analytics/` |
| **Authentication & User Management** | Member 2 | 60% | `src/server/routes/auth.js`, `src/server/middleware/auth.js` |
| **Capacity Discovery Engine** | Member 2 | 55% | `src/core/capacityEngine.js`, `src/server/routes/capacity.js` |
| **ULIP Verification Integration** | Member 2 | 70% | `src/core/ulipVerification.js`, `src/server/services/ulip/` |
| **Escrow Payment System** | Member 1 | 60% | `src/core/escrowPayment.js`, `src/server/routes/payments.js` |
| **Automated Documentation Generator** | Member 1 | 65% | `src/core/documentGenerator.js`, `src/server/services/docs/` |
| **Shipment Tracking** | Member 2 | 55% | `src/core/trackingService.js`, `src/server/routes/tracking.js` |
| **Database Design & Models** | Member 2 | 60% | `src/server/models/` |
| **Testing & CI/CD** | Both | 50/50% | `tests/`, `.github/workflows/` |
| **Documentation (SRS, SDD)** | Both | 50/50% | `docs/` |
| **Deployment & DevOps** | Member 1 | 55% | `vercel.json`, deployment configs |

### Overall Contribution

| Member | Overall Effort | Primary Responsibilities |
|--------|---------------|-------------------------|
| **Tanveer KANDERIYA** | **50%** | Frontend architecture, UI/UX, escrow system, document generation, deployment |
| **Karan Morya** | **50%** | Backend architecture, API design, ULIP integration, capacity engine, database |

---

## 📁 Repository Structure

```
BharatLCL/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD pipeline
├── docs/
│   ├── SRS.md                     # Software Requirements Specification (IEEE 830)
│   ├── SDD.md                     # Software Design Description (IEEE 1016)
│   └── diagrams/
│       ├── class-diagram.png      # UML Class Diagram
│       ├── sequence-diagram.png   # UML Sequence Diagram
│       ├── state-chart.png        # UML State Chart
│       ├── use-case-diagram.png   # UML Use Case Diagram
│       └── architecture.png       # System Architecture Diagram
├── src/
│   ├── client/                    # React Frontend
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Route-level page components
│   │   ├── context/               # React Context providers
│   │   ├── utils/                 # Frontend utility functions
│   │   ├── App.jsx                # Root application component
│   │   └── main.jsx               # Entry point (Vite)
│   ├── server/                    # Express Backend
│   │   ├── config/                # Configuration files
│   │   ├── middleware/            # Express middleware (auth, error handling)
│   │   ├── models/                # Mongoose schemas
│   │   ├── routes/                # API route handlers
│   │   └── services/              # Business logic services
│   ├── core/                      # Core Business Logic
│   │   ├── capacityEngine.js      # Real-time capacity matching algorithm
│   │   ├── ulipVerification.js    # ULIP API integration (FASTag/VAHAN/LDB)
│   │   ├── escrowPayment.js       # Milestone-based payment logic
│   │   ├── documentGenerator.js   # Automated shipping document generator
│   │   └── trackingService.js     # Shipment tracking service
│   └── main.js                    # Server entry point
├── tests/
│   ├── test_cases.md              # Test Data Suite Documentation
│   ├── unit/                      # Unit test files
│   └── integration/               # Integration test files
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── LICENSE                        # MIT License
├── README.md                      # This file
├── package.json                   # Node.js dependencies
└── vercel.json                    # Vercel deployment configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB Atlas** account (free tier works)
- **Git** installed locally

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/BharatLCL.git
cd BharatLCL

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bharatlcl
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
ULIP_API_KEY=your_ulip_api_key
```

---

## 🌐 Deployment

- **Live URL:** [https://bharatlcl.vercel.app](https://bharatlcl.vercel.app)
- **Platform:** Vercel (automatic deploys from `main` branch)
- **Status:** ✅ Active and accessible

---

## 📄 Documentation

| Document | Description | Link |
|----------|-------------|------|
| SRS | Software Requirements Specification (IEEE 830) | [docs/SRS.md](docs/SRS.md) |
| SDD | Software Design Description (IEEE 1016) | [docs/SDD.md](docs/SDD.md) |
| Test Cases | Test Data Suite with unit & integration tests | [tests/test_cases.md](tests/test_cases.md) |
| UML Diagrams | Class, Sequence, State Charts, Use Case | [docs/diagrams/](docs/diagrams/) |

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **ULIP (Unified Logistics Interface Platform)** — Government of India's logistics API platform
- **Ministry of Commerce & Industry** — MSME export data and corridor insights
- **Jaipur MSME Exporters Association** — Field research and validation participants

---

<div align="center">

**Built with ❤️ for Indian MSMEs**

*BharatLCL — Empowering Small Exporters, One Container at a Time*

</div>
