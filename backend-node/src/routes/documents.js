const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  updateDocument,
  reprocessDocument,
  deleteDocument,
  generateResumeFeedback,
} = require('../controllers/documentController');

const router = express.Router();

// Validation middleware
const documentTypeValidation = [
  body('documentType')
    .optional()
    .isIn(['W-2', '1099', '1040', 'Other'])
    .withMessage('Invalid document type'),
  body('customPrompt')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Custom prompt must be less than 1000 characters'),
];

const resumeFeedbackValidation = [
  body('resumeData')
    .notEmpty()
    .withMessage('Resume data is required'),
  body('customPrompt')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Custom prompt must be less than 1000 characters'),
];

// Apply authentication to all routes except upload for testing
// router.use(auth);

// Document routes
router.post('/upload', upload.single('document'), handleUploadError, documentTypeValidation, uploadDocument);
router.get('/', auth, getDocuments);
router.get('/:id', auth, getDocument);
router.put('/:id', auth, documentTypeValidation, updateDocument);
router.post('/:id/reprocess', auth, documentTypeValidation, reprocessDocument);
router.delete('/:id', auth, deleteDocument);

// Resume feedback route (temporarily disabled auth for testing)
router.post('/resume-feedback', resumeFeedbackValidation, generateResumeFeedback);

module.exports = router; 