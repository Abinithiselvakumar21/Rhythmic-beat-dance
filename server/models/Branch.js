const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tag: {
      type: String,
      default: 'Studio Branch & Practice Floor',
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: 'Chennai',
      trim: true,
    },
    phone: {
      type: String,
      default: '+91 99947 16471',
      trim: true,
    },
    specs: {
      type: [String],
      default: [
        '1,800 sq.ft Wooden Spring Floor',
        '4K Stage Lighting & Video Setup',
        'Fully Air Conditioned',
      ],
    },
    status: {
      type: String,
      enum: ['Active', 'Launching Soon', 'Renovating'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Branch', branchSchema);
