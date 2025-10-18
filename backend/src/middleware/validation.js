// ===========================================
// src/middleware/validation.js - Request Validation
// ===========================================

const Joi = require('joi');
const logger = require('../utils/logger');

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation error:', { errors, url: req.originalUrl });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

// Common validation schemas
const schemas = {
  // User registration
  registerUser: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
      }),
    // MODIFICATO: reso .optional() per l'iscrizione libera
    phone: Joi.string().pattern(/^\+?[1-9]\d{6,14}$/).optional(), 
    organizationId: Joi.string().uuid().optional() 
  }),

  // User login
  loginUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    organizationSlug: Joi.string().optional()
  }),

  // Booking creation
  createBooking: Joi.object({
    fieldId: Joi.string().uuid().required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
    participants: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional()
    })).optional(),
    notes: Joi.string().max(500).optional(),
    specialRequests: Joi.string().max(500).optional()
  }),

  // Field creation
  createField: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    fieldType: Joi.string().valid('TENNIS', 'PADEL', 'SQUASH', 'MULTIPURPOSE').required(),
    hourlyRate: Joi.number().min(0).required(),
    peakHourRate: Joi.number().min(Joi.ref('hourlyRate')).optional(),
    memberDiscountPercent: Joi.number().min(0).max(100).optional(),
    availableFrom: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    availableUntil: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    surfaceType: Joi.string().max(50).optional(),
    indoor: Joi.boolean().optional(),
    lighting: Joi.boolean().optional(),
    minBookingDuration: Joi.number().min(15).optional(),
    maxBookingDuration: Joi.number().min(Joi.ref('minBookingDuration')).optional(),
    advanceBookingDays: Joi.number().min(1).max(365).optional(),
    cancellationHours: Joi.number().min(0).max(168).optional()
  }),

  // Organization creation
  createOrganization: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().max(1000).optional(),
    website: Joi.string().uri().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{6,14}$/).optional(),
    email: Joi.string().email().optional(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180)
      }).optional()
    }).optional(),
    timezone: Joi.string().optional(),
    businessHours: Joi.object().pattern(
      Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
      Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        closed: Joi.boolean().optional()
      })
    ).optional()
  })
};

module.exports = {
  validate,
  schemas
};