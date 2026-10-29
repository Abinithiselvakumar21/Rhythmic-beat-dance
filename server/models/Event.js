const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    song: {
      type: String,
      default: '', // Name of the song / choreography track
    },
    instructor: {
      type: String,
      default: 'Rhythmic Beat Master Choreographer',
      trim: true,
    },
    level: {
      type: String,
      default: 'Open Level (Beginner & Intermediate)',
      trim: true,
    },
    agenda: {
      type: String,
      default: '', // Detailed workshop flow / what happens in session
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
    },
    slots: {
      type: Number,
      default: 0,
      min: 0,
    },
    prize: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      default: '',
    },
    time: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
