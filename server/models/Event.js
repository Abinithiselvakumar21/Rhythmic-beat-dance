
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    song: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming'
    },
    slots: {
      type: Number,
      default: 0,
      min: 0
    },
    prize: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      default: ''
    },
    time: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
