// backend/src/routes/documents.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { prisma } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and DOC files are allowed.'));
    }
  }
});

// @route   POST /api/documents/upload
// @desc    Upload document
// @access  Private
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const {
      documentType,
      category,
      bookingId,
      membershipId,
      isPublic = false
    } = req.body;

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: 'documentType is required'
      });
    }

    const document = await prisma.document.create({
      data: {
        organizationId: req.user.organizationId,
        userId: req.user.id,
        filename: req.file.filename,
        originalFilename: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        documentType,
        category,
        bookingId: bookingId || null,
        membershipId: membershipId || null,
        isPublic: isPublic === 'true'
      }
    });

    logger.info(`Document uploaded: ${document.id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document }
    });

  } catch (error) {
    logger.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
});

// @route   GET /api/documents
// @desc    Get documents
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { documentType, category, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {
      organizationId: req.user.organizationId
    };

    // Role-based filtering
    if (req.user.role === 'MEMBER') {
      whereClause.OR = [
        { userId: req.user.id },
        { isPublic: true }
      ];
    }

    if (documentType) whereClause.documentType = documentType;
    if (category) whereClause.category = category;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.document.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
});

// @route   GET /api/documents/:id/download
// @desc    Download document
// @access  Private
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        organizationId: req.user.organizationId
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access
    const canAccess = 
      document.userId === req.user.id ||
      document.isPublic ||
      ['ADMIN', 'MANAGER'].includes(req.user.role);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.download(document.filePath, document.originalFilename);

  } catch (error) {
    logger.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        organizationId: req.user.organizationId
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access
    const canDelete = 
      document.userId === req.user.id ||
      ['ADMIN'].includes(req.user.role);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file from disk
    try {
      await fs.unlink(document.filePath);
    } catch (err) {
      logger.warn(`Failed to delete file: ${document.filePath}`);
    }

    // Delete from database
    await prisma.document.delete({ where: { id } });

    logger.info(`Document deleted: ${id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

module.exports = router;
