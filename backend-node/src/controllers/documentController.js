const { validationResult } = require('express-validator');
const TaxDocument = require('../models/TaxDocument');
const { uploadToS3, deleteFromS3, getSignedUrl } = require('../config/aws');
const aiService = require('../services/aiService');
const path = require('path');
const crypto = require('crypto');

// Upload and process tax document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { documentType = 'W-2', customPrompt } = req.body;
    const file = req.file;

    // For testing without authentication, use a default user ID
    // In production, this should come from req.user._id
    const userId = req.user ? req.user._id : '507f1f77bcf86cd799439011'; // Default MongoDB ObjectId

    // Generate unique S3 key
    const fileExtension = path.extname(file.originalname);
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const s3Key = `documents/${userId}/${uniqueId}${fileExtension}`;

    // Upload to S3
    const s3Url = await uploadToS3(file, s3Key);

    // Create document record
    const document = new TaxDocument({
      user: userId,
      originalFileName: file.originalname,
      s3Key,
      s3Url,
      documentType,
      customPrompt,
      metadata: {
        fileSize: file.size,
      },
    });

    await document.save();

    // Process document asynchronously
    processDocument(document._id);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: {
          id: document._id,
          originalFileName: document.originalFileName,
          documentType: document.documentType,
          status: document.status,
          createdAt: document.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
    });
  }
};

// Process document with AI (async function)
const processDocument = async (documentId) => {
  try {
    const document = await TaxDocument.findById(documentId);
    if (!document) return;

    // Update status to processing
    document.status = 'processing';
    await document.save();

    // Get file from S3
    const { s3 } = require('../config/aws');
    const fileData = await s3.getObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: document.s3Key,
    }).promise();

    // Extract text from PDF
    const extractedText = await aiService.extractTextFromPDF(fileData.Body);

    // Analyze with AI
    const analysis = await aiService.analyzeTaxDocument(
      extractedText,
      document.documentType,
      document.customPrompt
    );

    // Update document with results
    document.extractedData = analysis.extractedData;
    document.aiFeedback = analysis.aiFeedback;
    document.status = 'completed';
    document.processingTime = Date.now() - document.createdAt;
    document.metadata.lastProcessed = new Date();

    await document.save();

    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    
    // Update document status to error
    const document = await TaxDocument.findById(documentId);
    if (document) {
      document.status = 'error';
      document.errorMessage = error.message;
      await document.save();
    }
  }
};

// Get user's documents
const getDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, documentType } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (documentType) filter.documentType = documentType;

    const documents = await TaxDocument.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'firstName lastName email');

    const total = await TaxDocument.countDocuments(filter);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
    });
  }
};

// Get single document
const getDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await TaxDocument.findOne({
      _id: id,
      user: req.user._id,
    }).populate('user', 'firstName lastName email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Generate signed URL for file access
    const signedUrl = await getSignedUrl(document.s3Key);

    res.json({
      success: true,
      data: {
        document: {
          ...document.toObject(),
          signedUrl,
        },
      },
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
    });
  }
};

// Update document data
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { extractedData, customPrompt } = req.body;

    const document = await TaxDocument.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Update fields
    if (extractedData) {
      document.extractedData = { ...document.extractedData, ...extractedData };
    }
    if (customPrompt) {
      document.customPrompt = customPrompt;
    }

    await document.save();

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: { document },
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
    });
  }
};

// Reprocess document
const reprocessDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { customPrompt } = req.body;

    const document = await TaxDocument.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Update custom prompt if provided
    if (customPrompt) {
      document.customPrompt = customPrompt;
    }

    await document.save();

    // Reprocess document
    processDocument(document._id);

    res.json({
      success: true,
      message: 'Document reprocessing started',
      data: {
        document: {
          id: document._id,
          status: 'processing',
        },
      },
    });
  } catch (error) {
    console.error('Reprocess document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reprocess document',
    });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await TaxDocument.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Delete from S3
    await deleteFromS3(document.s3Key);

    // Delete from database
    await TaxDocument.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
    });
  }
};

// Generate tax advice
const generateResumeFeedback = async (req, res) => {
  try {
    const { resumeData, customPrompt } = req.body;

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        message: 'Form data is required',
      });
    }

    const taxAdvice = await aiService.generateTaxAdvice(resumeData, customPrompt);

    res.json({
      success: true,
      data: { feedback: taxAdvice },
    });
  } catch (error) {
    console.error('Generate tax advice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate tax advice',
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocument,
  updateDocument,
  reprocessDocument,
  deleteDocument,
  generateResumeFeedback,
}; 