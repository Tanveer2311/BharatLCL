/**
 * BharatLCL — Server Entry Point
 * 
 * Initializes Express server, connects to MongoDB, and registers all routes.
 * This is the main entry point for the backend application.
 * 
 * @module main
 * @requires express
 * @requires mongoose
 * @requires cors
 * @requires dotenv
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import route handlers
const authRoutes = require('./server/routes/auth');
const capacityRoutes = require('./server/routes/capacity');
const paymentRoutes = require('./server/routes/payments');
const shipmentRoutes = require('./server/routes/shipments');
const documentRoutes = require('./server/routes/documents');
const verificationRoutes = require('./server/routes/verification');

// Import middleware
const { errorHandler } = require('./server/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Middleware Configuration
// ============================================

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Enable CORS for frontend communication
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static frontend files from public/ directory
app.use(express.static(path.join(__dirname, '..', 'public')));


// ============================================
// API Routes
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/capacity', capacityRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/verify', verificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.json({
    success: true,
    message: 'BharatLCL API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStates[dbStatus] || 'unknown'
  });
});

// ============================================
// Serve Static Files (Production)
// ============================================

if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, 'client', 'dist');
  if (require('fs').existsSync(clientPath)) {
    app.use(express.static(clientPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientPath, 'index.html'));
    });
  }
}

// ============================================
// Global Error Handler
// ============================================

app.use(errorHandler);

// ============================================
// Database Connection & Server Start
// ============================================

let dbConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.log('⚠️  MONGODB_URI not set — running without database');
    console.log('   Set MONGODB_URI in .env to enable database features');
    return;
  }

  try {
    await mongoose.connect(mongoURI);
    dbConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.warn('   Server will continue without database — API endpoints return demo data');
  }
};

const startServer = async () => {
  // Start the HTTP server first (don't block on DB)
  const server = app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║                                          ║
    ║   🚛 BharatLCL Server                    ║
    ║   Running on http://localhost:${PORT}        ║
    ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(18)}║
    ║                                          ║
    ╚══════════════════════════════════════════╝
    `);
  });

  // Handle port-in-use error gracefully
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌  Port ${PORT} is already in use.`);
      console.error(`   Run this command to free it, then try again:`);
      console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });

  // Then attempt DB connection (non-blocking)
  await connectDB();
};

// Global safety net for unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled Promise Rejection:', reason);
});

startServer();

module.exports = app; // Export for testing
