const mongoose = require('mongoose');

const taxDocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalFileName: {
    type: String,
    required: true,
  },
  s3Key: {
    type: String,
    required: true,
  },
  s3Url: {
    type: String,
    required: true,
  },
  documentType: {
    type: String,
    enum: ['W-2', '1099', '1040', 'Other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'error'],
    default: 'uploaded',
  },
  extractedData: {
    type: Map,
    of: {
      value: String,
      confidence: Number,
      field: String,
    },
    default: {},
  },
  aiFeedback: {
    type: String,
    default: '',
  },
  customPrompt: {
    type: String,
    default: '',
  },
  processingTime: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  metadata: {
    fileSize: Number,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    lastProcessed: Date,
  },
}, {
  timestamps: true,
});

// Index for faster queries
taxDocumentSchema.index({ user: 1, createdAt: -1 });
taxDocumentSchema.index({ status: 1 });

// Virtual for full name
taxDocumentSchema.virtual('userFullName', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  get: function() {
    return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
  },
});

module.exports = mongoose.model('TaxDocument', taxDocumentSchema); 