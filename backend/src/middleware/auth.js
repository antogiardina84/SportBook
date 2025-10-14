// ===========================================
// src/middleware/auth.js - Authentication Middleware
// ===========================================

const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

// JWT Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscriptionStatus: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    // Check if organization is active
    if (user.organization.subscriptionStatus !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Organization subscription is not active'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Organization ownership middleware
const requireOrgAccess = async (req, res, next) => {
  try {
    const orgId = req.params.organizationId || req.body.organizationId;
    
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID required'
      });
    }

    // Super admins can access any organization
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Check if user belongs to the organization
    if (req.user.organizationId !== orgId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    next();
  } catch (error) {
    logger.error('Organization access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization failed'
    });
  }
};

module.exports = {
  authenticateToken,
  authorize,
  requireOrgAccess
};