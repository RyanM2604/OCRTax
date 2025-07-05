// MongoDB initialization script for OCRTax
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('ocrtax');

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('taxdocuments');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });

db.taxdocuments.createIndex({ "user": 1, "createdAt": -1 });
db.taxdocuments.createIndex({ "status": 1 });
db.taxdocuments.createIndex({ "documentType": 1 });

print('MongoDB initialized for OCRTax application'); 