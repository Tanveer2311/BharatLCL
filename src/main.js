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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
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

// Production Security Middlewares
app.use(helmet());
app.use(mongoSanitize());
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Serverless DB Connection Middleware
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  next();
});

// Serve static frontend files from client/dist
const clientDistPath = path.join(__dirname, 'client', 'dist');
if (require('fs').existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, { maxAge: '1d' }));
}


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

// SPA fallback — any route not starting with /api will serve React index.html
const { existsSync } = require('fs');
const distIndex = path.join(clientDistPath, 'index.html');
if (existsSync(distIndex)) {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(distIndex);
    }
  });
}

// ============================================
// Global Error Handler
// ============================================

app.use(errorHandler);

// ============================================
// Database Connection & Server Start
// ============================================

let dbConnected = false;

let dbConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || dbConnecting) return;
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.log('⚠️  MONGODB_URI not set — running without database');
    console.log('   Set MONGODB_URI in .env to enable database features');
    return;
  }

  try {
    dbConnecting = true;
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    dbConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('⚠️  MongoDB connection failed:', error.message);
  } finally {
    dbConnecting = false;
  }
};

const startServer = async () => {
  // Start the HTTP server first if not in a serverless environment
  if (!process.env.VERCEL) {
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
        process.exit(1);
      } else {
        throw err;
      }
    });
  }

  // Then attempt DB connection
  await connectDB();
};

// Global safety net for unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled Promise Rejection:', reason);
});

startServer();

module.exports = app; // Export for testing
