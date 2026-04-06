/**
 * Authentication Middleware — JWT Verification & RBAC
 * 
 * @module server/middleware/auth
 */

const jwt = require('jsonwebtoken');

/**
 * Protects routes — verifies JWT token from Authorization header
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Access denied. No token provided.' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }
    });
  }
};

/**
 * Role-based access control middleware
 * 
 * @param  {...string} roles - Allowed roles (e.g., 'exporter', 'transporter', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role(s): ${roles.join(', ')}`
        }
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
