// src/utils/jwt.js - JWT Utility Functions

const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * Generate access and refresh tokens for a user
 * @param {string} userId - User ID
 * @returns {Object} Object containing accessToken and refreshToken
 */
const generateTokens = (userId) => {
  try {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRE || '15m',
        issuer: 'sportbook-api',
        audience: 'sportbook-client'
      }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { 
        expiresIn: '7d',
        issuer: 'sportbook-api',
        audience: 'sportbook-client'
      }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Token generation error:', error);
    throw new Error('Failed to generate tokens');
  }
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(
      token, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      {
        issuer: 'sportbook-api',
        audience: 'sportbook-client'
      }
    );
  } catch (error) {
    logger.error('Refresh token verification error:', error);
    throw error;
  }
};

/**
 * Verify access token
 * @param {string} token - Access token to verify
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        issuer: 'sportbook-api',
        audience: 'sportbook-client'
      }
    );
  } catch (error) {
    logger.error('Access token verification error:', error);
    throw error;
  }
};

/**
 * Decode token without verification (useful for checking expiration)
 * @param {string} token - Token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Token decode error:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - Token to check
 * @returns {boolean} True if expired, false otherwise
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return decoded.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};

/**
 * Extract user ID from token
 * @param {string} token - Token to extract from
 * @returns {string|null} User ID or null if invalid
 */
const extractUserId = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded?.userId || null;
  } catch (error) {
    logger.error('Extract user ID error:', error);
    return null;
  }
};

module.exports = {
  generateTokens,
  verifyRefreshToken,
  verifyAccessToken,
  decodeToken,
  isTokenExpired,
  extractUserId
};