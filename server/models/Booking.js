const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    eventId: {
      type: String,
      default: '',
    },
    eventTitle: {
      type: String,
      default: '',
    },
    slots: {
      type: Number,
      default: 1,
      min: 1,
    },
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
